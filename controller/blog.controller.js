const Blog = require("../models/blog.models");


async function HandleAddNewBlog(req, res) {
    const { title, body } = req.body;
    try {
        const blog = await Blog.create({
            body: body,
            title: title,
            createdBy: req.user._id,
            coverImageURL: `/uploads/${req.file.filename}`,
        });
        return res.status(200).redirect(`/blog/${blog._id}`);
    } catch (error) {
        res.status(404).json({ Error: "You fill incoreect value", error });
    }

}


module.exports = { HandleAddNewBlog };