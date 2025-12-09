const CustomError = require("../error-handling/customError");

// identifies whether the image input is a URL or Image (attaches the image data to req)
const validateImageInput = (req, res, next) => {

    const contentType = req.headers['content-type'];

    // validates URLs
    function validateURL(imageURL){
        const urlRegex = /^https?:\/\/[^\s]+$/i;
        return urlRegex.test(imageURL);
    }

    //reusable for throwing bad request errors
    function invalidInputErr(message) {
        return next(new CustomError(
            'BadRequestError', message || 'Image is required for identification.', 400));
    }

    if (req.file && req.body.imageURL)
        return invalidInputErr('Cannot provide both image file and imageURL.');


    // Form-data
    if (contentType?.includes('multipart/form-data')) {
        
        if (!req.file && !req.body.imageURL)
            return invalidInputErr('Image input is required');
        
        // input may contain JSON data as a URL
        if(!req.file && !validateURL(req.body.imageURL))
            return invalidInputErr('Invalid image URL.');
        
    }
    
    // is JSON data
    else if (contentType?.includes('application/json')) {
        const imageURL = req.body.imageURL;

        if (!validateURL(imageURL)) { 
            return invalidInputErr('Invalid image URL.');
        }
    }

    // invalid content-type
    else{
        return invalidInputErr('Content-Type should be application/json or multipart/form-data.');
    }

    const image = req.file || req.body.imageURL;

    // attach the image data
    req.imageData = {
        image,
        isURL: !req.file
    };

    next()
}

module.exports = validateImageInput;