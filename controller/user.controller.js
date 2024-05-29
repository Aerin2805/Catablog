const User = require("../models/user.models")

async function HandlerUserSignup(req, res) {
    const { fullname, email, password } = req.body;
    try {
        await User.create({
            fullname, email, password,
        });
        console.log("User save successfully");
        return res.status(200).redirect("/");
    } catch (error) {
        return res.status(401).json({ Error: `Please fill all Field Correctly : ${error}` })
    }
}


async function HandlerUserSignin(req, res) {
    const { email, password } = req.body;
    try {
        const token = await User.matchPasswordAndCreateToken(email, password);
        //console.log("token", token);
        return res.cookie("token", token).status(200).redirect("/");
    } catch (error) {
        return res.render("signin", {
            error: "Incorrect Email or Password",
        });
    }

}

module.exports = { HandlerUserSignup, HandlerUserSignin };