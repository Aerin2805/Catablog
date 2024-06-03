const express = require("express");
const multer = require("multer");
const path = require("path");
const { HandleAddNewBlog } = require("../controller/blog.controller");
const Blog = require("../models/blog.models");
const Comment = require("../models/comments.models");
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
        const comments = await Comment.find({ blogId: req.params.id }).populate("createdBy")
        //console.log("comments", comments)
        res.status(200).render("blog", {
            user: req.user,
            blog: blog,
            comments: comments
        });

    } catch (error) {
        res.json({ Error: "Blog not found", error });
    }

})

router.post("/comment/:blogId", async (req, res) => {

    try {
        const { content } = req.body;
        const trimmedContent = content.trim();

        if (trimmedContent.length < 1) {
            return res.status(400).redirect(`/blog/${req.params.blogId}`, {
                error: "Please write at least one character."
            });
        }

        await Comment.create({
            content: req.body.content,
            blogId: req.params.blogId,
            createdBy: req.user._id,
        });

        res.status(200).redirect(`/blog/${req.params.blogId}`);
    } catch (error) {
        res.status(404).json({ Error: "Please filled all field correctly" });
    }


});

router.post("/", upload.single("coverImage"), HandleAddNewBlog);

module.exports = router;