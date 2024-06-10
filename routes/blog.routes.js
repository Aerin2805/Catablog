const express = require("express");
const methodOverride = require("method-override");
const Blog = require("../models/blog.models");
const Comment = require("../models/comments.models");
const { CheckForAuthenticationCookie } = require("../middlewares/auth.middlewares");
const router = express.Router();

// Middleware to use method-override for handling PUT and DELETE methods in forms
router.use(methodOverride('_method'));

// Route to render the Add Blog page
router.get("/add-new", CheckForAuthenticationCookie('token'), (req, res) => {
    if (!req.user) {
        // Redirect to sign-in page if not authenticated
        return res.redirect("/user/signin");
    }
    return res.render("AddBlog", { user: req.user });
});

// Route to display a single blog
router.get("/:id", CheckForAuthenticationCookie('token'), async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate("createdBy");
        const isAuthor = req.user && req.user._id.toString() === blog.createdBy._id.toString();
        const comments = await Comment.find({ blogId: req.params.id }).populate("createdBy");
        res.status(200).render("blog", { user: req.user, blog: blog, comments: comments, isAuthor: isAuthor });
    } catch (error) {
        res.status(404).json({ Error: "Blog not found", error });
    }
});

// Route to render the edit blog page
router.get('/edit/:id', CheckForAuthenticationCookie('token'), async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (req.user._id.toString() !== blog.createdBy.toString()) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        res.render('editblog', { blog: blog, user: req.user });
    } catch (error) {
        res.status(404).json({ error: "Blog not found" });
    }
});

// Route to handle blog update
router.post('/edit/:id', CheckForAuthenticationCookie('token'), async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (req.user._id.toString() !== blog.createdBy.toString()) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        blog.title = req.body.title;
        blog.body = req.body.body;
        blog.coverImageURL = req.body.coverImageURL;
        await blog.save();
        res.redirect(`/blog/${blog._id}`);
    } catch (error) {
        res.status(500).json({ error: "Error updating blog" });
    }
});

// Route to handle comments
router.post("/comment/:blogId", CheckForAuthenticationCookie('token'), async (req, res) => {
    try {
        const { content } = req.body;
        const trimmedContent = content.trim();

        if (trimmedContent.length < 1) {
            return res.status(400).json({ error: "Please write at least one character." });
        }

        await Comment.create({
            content: trimmedContent,
            blogId: req.params.blogId,
            createdBy: req.user._id,
        });

        res.status(200).redirect(`/blog/${req.params.blogId}`);
    } catch (error) {
        res.status(404).json({ Error: "Please fill all fields correctly" });
    }
});

// Route to handle blog deletion
router.post('/delete/:id', CheckForAuthenticationCookie('token'), async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (req.user._id.toString() !== blog.createdBy.toString()) {
            return res.status(403).json({ error: "Unauthorized" });
        }
        await Blog.findByIdAndDelete(req.params.id);
        res.redirect('/');
    } catch (error) {
        res.status(500).json({ error: "Error deleting blog" });
    }
});

module.exports = router;
