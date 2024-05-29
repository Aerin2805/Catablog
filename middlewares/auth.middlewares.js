const { validateToken } = require("../services/authentication.services");

function CheckForAuthenticationCookie(cookieName) {
    return (req, res, next) => {
        const tokenCookieValue = req.cookies[cookieName];
        if (!tokenCookieValue) return next();

        try {
            const userPayload = validateToken(tokenCookieValue);
            req.user = userPayload;
            return next();
        } catch (error) { return next(); }


    };
}

module.exports = { CheckForAuthenticationCookie };