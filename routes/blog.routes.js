const express = require("express");
const multer = require("multer");
const path = require("path");
const Blog = require("../models/blog.models");
const Comment = require("../models/comments.models");
const router = express.Router();

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

module.exports = router;