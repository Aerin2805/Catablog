const User = require("../models/user.models")

async function HandlerUserSignup(req, res) {
    const { fullname, email, password } = req.body;
    try {
        await User.create({
            fullname, email, password,
        });
        console.log("User save successfully");
        return res.status(200).redirect("/user/signin");
    } catch (error) {
        return res.render("signup", {
            error: "Email ID already exists, please use a unique email ID",
        });
    }
}


async function HandlerUserSignin(req, res) {
    const { email, password } = req.body;
    try {
        const token = await User.matchPasswordAndCreateToken(email, password);
        res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        return res.redirect("/");
    } catch (error) {
        return res.render("signin", {
            error: "Incorrect Email or Password",
        });
    }
}

module.exports = { HandlerUserSignup, HandlerUserSignin };