// set cookie
const setCookie = (res, key, value, maxAge=15*60*1000) =>
    res.cookie(key, value, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge,
    })

// clear cookie
const clearCookie = (res, key) =>
    res.clearCookie(key, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
    })

module.exports = { setCookie, clearCookie };