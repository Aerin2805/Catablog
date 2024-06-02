const express = require("express");
const multer = require("multer");
const path = require("path");
const { HandleAddNewBlog } = require("../controller/blog.controller");
const router = express.Router();


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(`./public/uploads/`));
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()} - ${file.originalname}`;
        cb(null, fileName);
    }
})

const upload = multer({ storage: storage });

router.get("/add-new", (req, res) => {
    return res.render("AddBlog", {
        user: req.user
    })
})
router.post("/", upload.single("coverImage"), HandleAddNewBlog);

module.exports = router;