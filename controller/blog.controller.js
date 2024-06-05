const Blog = require("../models/blog.models");
const { getStorage, ref, uploadBytesResumable } = require("firebase/storage")
const storage = getStorage();
const upload = multer({
    dest: path.join(__dirname, 'uploads') // Temporary storage location
});

async function handleAddNewBlog(req, res) {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'Please upload a cover image' });
        }

        const imageUrl = await uploadImage(file); // Get the downloadable URL

        const { title, body } = req.body;
        const blog = await Blog.create({
            body,
            title,
            createdBy: req.user._id, // Assuming you have user authentication
            coverImageURL: imageUrl // Store the downloadable URL
        });

        res.status(200).redirect(`/blog/${blog._id}`); // Redirect to the created blog post
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the blog post' });
    }
}

async function uploadImage(file) {
    const dateTime = Date.now();
    const fileName = `images/${dateTime}`;
    const storageRef = ref(storage, fileName);
    const metadata = {
        contentType: file.mimetype
    };

    await uploadBytesResumable(storageRef, file.buffer, metadata);
    const downloadURL = await getDownloadURL(storageRef); // Get the downloadable URL
    return downloadURL; // Return the downloadable URL
}

module.exports = { HandleAddNewBlog };