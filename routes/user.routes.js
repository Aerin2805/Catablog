const express = require("express");
const router = express.Router();
const User = require("../models/user.models");
const { HandlerUserSignup, HandlerUserSignin } = require("../controller/user.controller");

router.get('/signin', (req, res) => {
    return res.render("signin");
});
router.get('/signup', (req, res) => {
    return res.render("signup");
});
router.get('/logout', (req, res) => {
    return res.clearCookie("token").redirect("/user/signin");
});

router.post('/signup', HandlerUserSignup);
router.post('/signin', HandlerUserSignin);

module.exports = router;