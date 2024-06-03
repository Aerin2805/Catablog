const { validateToken } = require("../services/authentication.services");

function CheckForAuthenticationCookie(cookieName) {
    return (req, res, next) => {
        const tokenCookieValue = req.cookies[cookieName];
        if (!tokenCookieValue) return next();

        try {
            const userPayload = validateToken(tokenCookieValue);
            req.user = userPayload;
            // console.log(req.user)
        } catch (error) {
            // Optionally handle the error, such as clearing the invalid cookie
            res.clearCookie(cookieName);
        }

        return next();
    };
}

module.exports = { CheckForAuthenticationCookie };
