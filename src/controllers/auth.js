const bcrypt = require('bcrypt');
const UserModel = require("../models/user.js");
const CustomError = require("../error-handling/customError.js");
const { signAccessToken, signRefreshToken } = require("../utils/helpers/jwt.js");
const { 
    findUserByQuery, 
    bcryptCompare, 
    generateOTP, 
    verifyOTP, 
    trackOTPLimit } = require("../utils/helpers/auth.js");
const sendEmail = require("../utils/mailjet.js");
const RedisService = require("../utils/classes/redisService.js");
const mongoose = require("mongoose");
const sendApiResponse = require("../utils/apiResponse.js");
const CartModel = require("../models/cart.js");
const passport = require("passport");
const { deleteCachedData } = require("../utils/helpers/cache.js");
const cacheKeyBuilders = require("../constants/cacheKeyBuilders.js");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

// signup user after OTP validation
const signUp = async (req, res, next) => {
    const {email, OTP: enteredOTP} = {
        ...req.body,
        email: req.body.email.toLowerCase()
    }

    if(await findUserByQuery({email}, false))
        return next(new CustomError('ConflictError', 'Email is already taken!', 409));

    // a unique key is generated with the combination of 'purpose' and 'email' for Redis)
    const otpStore = new RedisService(email, 'SIGN_UP_OTP')
    
    // key stored in Redis 
    const userOTPKey = otpStore.getKey();

    //throws error if the request limit is exceeded or data is not found
    const OTPData = await trackOTPLimit({
        OTPKey: userOTPKey,
        countType: 'attemptCount',
        limit: 5,
        errMessage: 'OTP attempts limit reached, try again later'
    })

    // update OTPData (updated attempts, continuing ttl)
    await otpStore.setShortLivedData({
        ...OTPData.user,
        attemptCount: OTPData.user?.attemptCount + 1 //updated attempts
    }, OTPData.ttl, true)
    
    // verifies OTP and returns verified user, throws error for expiration and wrong attempts
    const verifiedUser = await verifyOTP(userOTPKey, enteredOTP)
    
    
    // OTP was correct, create user
    const newUser = new UserModel(verifiedUser);
    
    //save user document, pre-save hook will hash the password
    await newUser.save() 
    
    // clear temporary user from redis
    await otpStore.deleteData(userOTPKey)

    
// tokens properties AT = Access Token, RT = Refresh Token
    const tokens = {
        AT: signAccessToken({
            id: newUser._id, 
            roles: newUser.roles
        }),
        RT: signRefreshToken({
            id: newUser._id, 
            roles: newUser.roles
        }),

    // parseInt stops parsing when 'd'(stands for days) is triggered,
    // and returns numbers of days in Number datatype
        AT_AGE: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN), //in minutes
        RT_AGE: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN) //in days
    } 

    // store tokens in the browser cookies
    res.cookie('AT', tokens.AT, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        expires: new Date(Date.now() + tokens.AT_AGE * 60 * 1000), // minutes 
    });

    res.cookie('RT', tokens.RT, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        expires: new Date(Date.now() + tokens.RT_AGE * 24 * 60 * 60 * 1000), // days
    });

    // delete password before responding
    newUser.password = undefined

    
    // send response
    sendApiResponse(res, 201, {
        message: 'Account created successfully',
        data: newUser,
    })

    // send welcome email after sign-up
   sendEmail(newUser.email, 'Welcome to FreshGo', 
        "Welcome to FreshGo! Your account has been created successfully. Start exploring fresh groceries today. – The FreshGo Team"
    )
    .catch(err => console.log(err)) //silently catch the error (reason: req/res cycle is ended at this point)

}

// sign-up controller
const validateForSignUp = async (req, res, next) => {
    const body = {...req.body, email: req.body.email.toLowerCase()};

    // if password is not confirmed correctly
    if(body.password !== body.confirmPassword)
        return next(
    new CustomError('BadRequestError', 'Please confirm your password correctly', 400));

    const user = await findUserByQuery({email: body.email}, false)

    // if the email is already registered with another account
    if(user){
        return next(
    new CustomError('ConflictError', 'Email is already taken!', 409));
    }

   
    // a unique key is generated with the combination of 'purpose' and 'email' for Redis
    const otpStore = new RedisService(body.email, 'SIGN_UP_OTP')
    
    // OTP key
    const userOTPKey = otpStore.getKey();

    //throws custom error if the request limit is exceeded
    const OTPData = await trackOTPLimit({
        OTPKey: userOTPKey, //key stored in Redis
        countType: 'reqCount',
        limit: 7,
        errMessage: 'OTP requests limit reached, try again later'
    })

    // create a new mongoose document (not saved)
    const newUser = new UserModel({
        ...body, 
        roles: ['user'], //force role to 'user'
        auth: ['local']
    })

    // validate user fields, throws error if any field is invalid
    await newUser.validate()

    const OTP = generateOTP(6)
    const hashedOTP = await bcrypt.hash(OTP, 10)

    
    // sending user an OTP via email
    await sendEmail(body.email, 'Verification for sign up', `Verification code: ${OTP}`)

    const isFirstReq = OTPData.user.reqCount === 0;

    // temporarily (ttl example: 300 -> 5 minutes) store the user in Redis for OTP data for verification 
    await otpStore.setShortLivedData({
        name: body.name,
        email: body.email,
        password: body.password,
        auth: ['local'],
        OTP: hashedOTP,
        reqCount: ++OTPData.user.reqCount, // update request count
        attemptCount: 0,
    }, 300, !isFirstReq)

    // OTP successfully sent
    sendApiResponse(res, 201, {
        message: 'OTP sent to your email',
        data: {
            email: body.email //attach email so the frontend can reuse it in the sign-up flow
        } 
    })
}

// login controller
const login = async (req, res, next) => {
    const {email, password} = {
        ...req.body,
        email: req.body.email.toLowerCase()
    };

   // check if user exists in DB with the given email
    const user = await findUserByQuery({email}, true, 'Email is not registered with us!');

    if (user.auth.length === 1 && user.auth.includes('google')) {
        return next(new CustomError
            ('ForbiddenError',
                'This account is linked with Google. Please login using your Google account.',
                403
            ))
    }

    // validate password, throws custom error if incorrect
    await bcryptCompare({
        plain: password, 
        hashed: user.password
    }, 'Incorrect password!');

    // password was correct, sign tokens
    // tokens properties AT = Access Token, RT = Refresh Token
    const tokens = {
        AT: signAccessToken({
            id: user._id, 
            roles: user.roles
        }),
        RT: signRefreshToken({
            id: user._id, 
            roles: user.roles
        }),

    // parseInt stops parsing when 'd'(stands for days) is triggered,
    // and returns numbers of days in Number datatype
        AT_AGE: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN), //in minutes
        RT_AGE: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN) //in days
    } 

    // store tokens in the browser cookies
    res.cookie('AT', tokens.AT, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        expires: new Date(Date.now() + tokens.AT_AGE * 60 * 1000), // minutes 
    });

    res.cookie('RT', tokens.RT, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        expires: new Date(Date.now() + tokens.RT_AGE * 24 * 60 * 60 * 1000), // days
    });

    // delete password before responding
    user.password = undefined

    //logged in successfully, send response
    sendApiResponse(res, 200, {
        message: 'Logged in successfully',
        data: user,
    })

}

const logout = async (req, res, next) => {

    // clear all tokens
    res.clearCookie('AT', { httpOnly: true, sameSite: "none", secure: true})
    res.clearCookie('RT', { httpOnly: true, sameSite: "none", secure: true})

    // user logged out successfully
    sendApiResponse(res, 201, {
        message: 'Logged out successfully'
    })
}

const changePassword = async (req, res, next) => {
    const {currentPassword, newPassword, confirmNewPassword} = req.body;

    const user = req.user; // get user from request object

    if (user.auth.length === 1 && user.auth.includes('google')) {
        return next(new CustomError
            ('ForbiddenError',
                'This account is linked to Google. To set a password, please verify via OTP.',
                403
            ))
    }

    // if new password is not confirmed correctly
    if(newPassword !== confirmNewPassword) {
        return next(
    new CustomError('BadRequestError', 'Please confirm your new password correctly', 400));
    }

    
    // validate current password, throws custom error if incorrect
    await bcryptCompare({
        plain: currentPassword, 
        hashed: user.password
    }, 'Incorrect current password!');

    // if new password is same as the current password
    const isNewPasswordSame = await bcrypt.compare(newPassword, user.password);
    
    if(isNewPasswordSame) {
        return next(
    new CustomError('BadRequestError', 'Password must be different from the previous one', 400));
    }
    
    // assigning new password
    user.password = newPassword;

    // save user document, pre-save hook will hash the password and save the updated user
    await user.save();

    // delete the user in cache
    await deleteCachedData(cacheKeyBuilders.pvtResources(user._id), 'profile')

    user.password = undefined; // remove password from the response

    // change password successfully

    sendApiResponse(res, 201, {
        message: 'Password changed successfully',
        data: user
    })
}

// request OTP to change the password
const resetPassword = async (req, res, next) => {

    // get email from body
    let {email} = req.body || {}
    email = email.toLowerCase()

    // finds user in DB, throws error if not found 
    await findUserByQuery({email}, true, 'Email is not registered with us!')

    const OTP = generateOTP(6)
    const hashedOTP = await bcrypt.hash(OTP, 10)


    // a unique key is generated with the combination of 'purpose' and 'email' for Redis
    const otpStore = new RedisService(email, 'RESET_PASSWORD_OTP')
    // OTP key
    const userOTPKey = otpStore.getKey()

    //throws custom error if the request limit is exceeded
    const OTPData = await trackOTPLimit({
        OTPKey: userOTPKey, //key stored in Redis
        countType: 'reqCount', //limit for requests
        limit: 7, //only 7 requests can be made for OTP request
        errMessage: 'OTP requests limit reached, try again later' //err message (if occurs)
    })

    // sending user an OTP via email
    await sendEmail(email, 'Reset password', `Use this code to reset password: ${OTP}`)

    let reqCount = OTPData.user.reqCount || 0;
    const isFirstReq = reqCount === 0;
    
    //temporarily (ttl example: 300 -> 5 minutes) store the user in Redis for OTP data for verification 
    await otpStore.setShortLivedData({
        email,
        OTP: hashedOTP,
        reqCount: ++reqCount, // update request count
        attemptCount: 0,
    }, 300, !isFirstReq)
    

    // OTP successfully sent
sendApiResponse(res, 201, {
    message: 'OTP sent to your email', 
    data: {email} //attach email so the frontend can reuse it in the sign-up flow

})
}

// verifies the OTP and change password
const verifyPasswordResetOTP = async (req, res, next) => {

    const { OTP: enteredOTP, email } = {
        ...req.body,
        email: req.body.email.toLowerCase()
    }

    // a unique key is generated with the combination of 'purpose' and 'email' for Redis
    const otpStore = new RedisService(email, 'RESET_PASSWORD_OTP')
    const userOTPKey = otpStore.getKey()    

    //throws custom error if the request limit is exceeded or data is not found
    const OTPData = await trackOTPLimit({
        OTPKey: userOTPKey, //key stored in Redis
        countType: 'attemptCount',
        limit: 5, 
        errMessage: 'OTP attempts limit reached, try again later'
    })

    //update attempts...
    await otpStore.setShortLivedData({
        ...OTPData.user, 
        attemptCount: OTPData.user.attemptCount + 1 //updated attempts
    }, OTPData.ttl, true)
    

    //verifies OTP and returns verified user, throws error for expiration and wrong attempts
    await verifyOTP(userOTPKey, enteredOTP)

    // OTP was correct delete the user from Redis
    await otpStore.deleteData(userOTPKey)
    
    // a unique key is generated with the combination of 'purpose' and 'email' for Redis
    const tokenStore = new RedisService(email, 'RESET_PASSWORD_TOKEN')

    // token to store
    const token = {email, purpose: 'RESET_PASSWORD_TOKEN', verified: true}
    
    // storing token for changing the password (allows user to change the password)
    await tokenStore.setShortLivedData(token, 300)
    
    // sign and store a jwt in cookies
    const passwordJWT = jwt.sign({
        email, 
        purpose: 'RESET_PASSWORD_TOKEN'
    }, process.env.JWT_SECRET, {expiresIn: '5m'})

    res.cookie('PRT', passwordJWT, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes 
    });

    // user is now allowed to modify their password
    sendApiResponse(res, 201, {
        message: 'Verification successful, Please enter a new password',
        data: {email}
    })
}

// resets password using a valid password reset token
const submitNewPassword = async (req, res, next) => {

    const { email, newPassword, confirmNewPassword } = {
        ...req.body,
        email: req.body.email.toLowerCase()
    }

    const throwInvalidSessionError = () => 
        next(new CustomError('UnauthorizedError', 'Session has been expired or not valid!', 401));

    if(!req.cookies.PRT)
        return throwInvalidSessionError();


    // verify JWT from cookies
     await promisify(jwt.verify)(req.cookies.PRT, process.env.JWT_SECRET)


     // a unique key is generated with the combination of 'purpose' and 'email' for Redis
    const tokenStore = new RedisService(email, 'RESET_PASSWORD_TOKEN')
    const TOKEN_KEY = tokenStore.getKey()


    const tokenData = await tokenStore.getData(TOKEN_KEY);

    //if user has not a valid token 
    if(!tokenData || 
        !tokenData.verified ||  
        tokenData.email !== email || 
        tokenData.purpose !== 'RESET_PASSWORD_TOKEN'){
        return throwInvalidSessionError();
    }

    // if these fields does not match
    if(newPassword !== confirmNewPassword){
        return next(
    new CustomError('BadRequestError', 'Please confirm your password correctly', 400));
    }

    //query DB for user, throws error if not found
    const user = await findUserByQuery({email}, true, 'Account may have been deleted')


    // if new password is same as the current password
    const isNewPasswordSame = await bcrypt.compare(newPassword, user.password);
    
    if(isNewPasswordSame) {
        return next(
    new CustomError('BadRequestError', 'Password must be different from the previous one', 400));
    }

    // assign new password
    user.password = newPassword 
    
    // add 'local' auth to array after password reset
    if(!user.auth.includes('local')) {
        user.auth.push('local')
    }

    //save user document, pre-save hook will hash the password
    await user.save()

    // delete token from Redis
    await tokenStore.deleteData(TOKEN_KEY)
    // delete the user in cache
    await deleteCachedData(cacheKeyBuilders.pvtResources(user._id), 'profile')

    // password changed successfully
    sendApiResponse(res, 201, {
        message: 'Password changed successfully'
    })
}

const requestEmailChange = async (req, res, next) => {
    const user = req.user; //ensure user is authenticated
    let { newEmail } = req.body;
    newEmail = newEmail.toLowerCase();

    // Check if email already exists
    const existing = await UserModel.findOne({ email: newEmail });
    if (existing) {
      return next(new CustomError("ConflictError", "Email already in use", 409));
    }

    // validating new email
    await new UserModel({email: newEmail}).validate(['email'])

    const otpStore = new RedisService(user.email, "EMAIL_CHANGE_OTP");
    const userOTPKey = otpStore.getKey()

    //throws error if the request limit is exceeded
    const OTPData = await trackOTPLimit({
        OTPKey: userOTPKey, //key stored in Redis
        countType: 'reqCount',
        limit: 7,
        errMessage: 'OTP requests limit reached, try again later' 
    })

    // Create Redis key
    const OTP = generateOTP(6) // 6 digit OTP
    const hashedOTP = await bcrypt.hash(OTP, 10)

    const isFirstReq = OTPData.user.reqCount === 0;

    // Store OTP, userID and newEmail
    await otpStore.setShortLivedData({ 
        OTP: hashedOTP, 
        newEmail, 
        reqCount: ++OTPData.user.reqCount, //updated count
        attemptCount: 0,
    }, 300, !isFirstReq); // 5 min TTL

    // Send OTP to new email
    await sendEmail(newEmail, 'Change email', `Use this OTP to change email: ${OTP}`);

    // OTP sent
    sendApiResponse(res, 201, {
        message: 'OTP sent to your new email', 
    })
}


// verifies the OTP and change password
const changeEmailWithOTP = async (req, res, next) => {

    const user = req.user; //ensure user is authenticated

    const {OTP: enteredOTP} = req.body;

    // a unique key is generated with the combination of 'purpose' and 'email' for Redis
    const otpStore = new RedisService(user.email, 'EMAIL_CHANGE_OTP')
    const userOTPKey = otpStore.getKey()

    //throws custom error if the request limit is exceeded or data is not found
    const OTPData = await trackOTPLimit({
        OTPKey: userOTPKey, //key stored in Redis
        countType: 'attemptCount',
        limit: 5,
        errMessage: 'OTP attempts limit reached, try again later'
    })
    
    //update attempts...
    await otpStore.setShortLivedData({
        ...OTPData.user, 
        attemptCount: ++OTPData.user.attemptCount //update attempts
    }, OTPData.ttl, true)
    

    //verifies OTP and returns verified user, throws error for expiration and wrong attempts
    await verifyOTP(userOTPKey, enteredOTP)

    // OTP was correct, update the email
    user.email = OTPData.user.newEmail

    // save updated user to DB
    await user.save()

    // delete the user in cache
    await deleteCachedData(cacheKeyBuilders.pvtResources(user._id), 'profile')

    // delete OTPData from Redis
    await otpStore.deleteData(userOTPKey)

    // email updated
    sendApiResponse(res, 201, {
        message: 'Email changed successfully', 
        data: {email: user.email}
    })
}

// delete my account (current user)
const deleteMyAccount = async (req, res, next) => {

    // not verified via password checker middleware
    if(!req.verified){
        return next(new CustomError('ForbiddenError', 'Cannot delete account without password verification!', 403))
    }

    const userID = req.user.id; //get user ID from authorized user;

    let session;

    try {

        // create a session for deletion
        session = await mongoose.startSession()

        // run transaction (mongoDB commits or aborts the transaction automatically)
        await session.withTransaction(async () => {

            // deleting user...
            const user = await UserModel.findByIdAndDelete(userID).session(session)


            // extra check to avoid sending an invalid response
            if (!user) {

                // throwing makes mongoDB to abort the transaction 
                throw new CustomError('NotFoundError', `User not found for deletion`, 404)
            }

            // delete user's cart
            await CartModel.findOneAndDelete({user: userID}).session(session)
        })

    // clear all tokens
    res.clearCookie('AT', { httpOnly: true, sameSite: "none"})
    res.clearCookie('RT', { httpOnly: true, sameSite: "none"})

    // delete the user in cache
    await deleteCachedData(cacheKeyBuilders.pvtResources(userID), 'profile')


        sendApiResponse(res, 200, {
            message: 'Account deleted successfully'
        })
    }
    catch (err) {

        // error occured 
        next(err)

    } finally {

        if (session)
            await session.endSession() // end transaction session
    }
}

// google OAUTH2 callback (the user is redirected to this callback
// after clicking 'Allow access', then passport handles the auth flow)
const googleAuthCallback = (req, res, next) => {
     passport.authenticate('google', { session: false }, (err, user, info) => {

        // (db error, passport error, unauthorized error)
        if(err)
            return next(err)

        // user denied the permission
        if(!user){
            return next(
                new CustomError('UnauthorizedError', 'Google authentication failed!', 401))
        }
     
    // auth successful:

    // tokens properties AT = Access Token, RT = Refresh Token
    const tokens = {
        AT: signAccessToken({
            id: user._id, 
            roles: user.roles
        }),
        RT: signRefreshToken({
            id: user._id, 
            roles: user.roles
        }),

    // parseInt stops parsing when 'd'(stands for days) is triggered,
    // and returns numbers of days in Number datatype
        AT_AGE: parseInt(process.env.ACCESS_TOKEN_EXPIRES_IN), //in minutes
        RT_AGE: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN) //in days
    } 

    // store tokens in the browser cookies
    res.cookie('AT', tokens.AT, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        expires: new Date(Date.now() + tokens.AT_AGE * 60 * 1000), // minutes 
    });

    res.cookie('RT', tokens.RT, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        expires: new Date(Date.now() + tokens.RT_AGE * 24 * 60 * 60 * 1000), // days
    });
    
    user.password = undefined; //remove password before responding

    // sucessful logged in via google account
        sendApiResponse(res, 200, {
            message: 'Logged in successfully',
            data: user,
        })

     })(req, res, next)
}

module.exports = { signUp, validateForSignUp, login, logout, changePassword, resetPassword, verifyPasswordResetOTP, submitNewPassword, requestEmailChange, changeEmailWithOTP, deleteMyAccount, googleAuthCallback }