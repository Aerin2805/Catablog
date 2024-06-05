const express = require("express");
const dotenv = require("dotenv");
const path = require('path');
const hbs = require('hbs');
const ConnectDB = require("./connection");
const UserRoutes = require("./routes/user.routes");
const BlogRoutes = require("./routes/blog.routes");
const Blog = require("./models/blog.models");
const cookieParser = require("cookie-parser");
const { CheckForAuthenticationCookie } = require("./middlewares/auth.middlewares");
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const multer = require('multer');
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytesResumable, getDownloadURL } = require('firebase/storage');

const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId
};
initializeApp(firebaseConfig);
const storage = getStorage();
const upload = multer({ storage: multer.memoryStorage() });


//view engine
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Register partials directory
hbs.registerPartials(path.join(__dirname, 'views/partials'));

// database Connection
ConnectDB();

//middleware 
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(CheckForAuthenticationCookie("token"));
//Routes
app.get("/", async (req, res) => {
    try {
        const allBlogs = await Blog.find({});
        res.render("home", {
            user: req.user,
            blogs: allBlogs,
        });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post('/blog', upload.single('coverImage'), handleAddNewBlog);
app.use("/user", UserRoutes);
app.use("/blog", BlogRoutes);

app.listen(PORT, () => {
    console.log(`Server Running on PORT : ${PORT}`);
})


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

async function handleAddNewBlog(req, res) {
    try {
        const dateTime = giveCurrentDateTime();

        const storageRef = ref(storage, `uploads/${req.file.originalname + "       " + dateTime}`);

        const metadata = {
            contentType: req.file.mimetype,
        };
        const snapshot = await uploadBytesResumable(storageRef, req.file.buffer, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);
        const { title, body } = req.body;
        const blog = await Blog.create({
            body,
            title,
            createdBy: req.user._id, // Assuming you have user authentication
            coverImageURL: downloadURL // Store the downloadable URL
        });

        res.status(200).redirect(`/blog/${blog._id}`); // Redirect to the created blog post
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the blog post' });
    }
}

const giveCurrentDateTime = () => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date + ' ' + time;
    return dateTime;
}
