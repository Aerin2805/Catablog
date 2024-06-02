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
app.use("/user", UserRoutes);
app.use("/blog", BlogRoutes);

app.listen(PORT, () => {
    console.log(`Server Running on PORT : ${PORT}`);
}) 