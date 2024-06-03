const express = require("express");
const multer = require("multer");
const path = require("path");
const { HandleAddNewBlog } = require("../controller/blog.controller");
const Blog = require("../models/blog.models");
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
});

router.get("/:id", async (req, res) => {

    try {
        const blog = await Blog.findById(req.params.id).populate("createdBy");
        //  console.log("Blog", blog)
        res.status(200).render("blog", {
            user: req.user,
            blog: blog
        });

    } catch (error) {
        res.json({ Error: "Blog not found", error });
    }

})

router.post("/", upload.single("coverImage"), HandleAddNewBlog);

module.exports = router;