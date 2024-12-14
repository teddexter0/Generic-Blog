import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import morgan from "morgan";

const app = express();
const port = 3000;

// Manually create __dirname using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files //Add middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev')); // Use 'dev' or another format

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Explicitly set the path to the views folder
app.set('views', path.join(__dirname, '../views'));

// Routes to render the pages
// home, login, register(sign up), generic
app.get("/", (req, res) => {
    res.render('home.ejs'); // Looks for "../views/home.ejs"
});

app.get("/home", (req, res) => {
    res.render('home.ejs'); // Looks for "../views/home.ejs"
});

app.get('/login', (req, res) => { // Use '/login' here
    res.render('login.ejs');  // Ensure 'login.ejs' exists in the 'views' folder
});

app.get('/register', (req, res) => { // Render register page with GET
    res.render('register.ejs'); // Ensure 'register.ejs' exists in the 'views' folder
});

app.get('/generic', (req, res) => {
    try {
        res.render('generic');
    } catch (err) {
        console.error("Rendering error:", err);
        res.status(500).send("Server Side error");
    }
});

app.get('/trends', (req, res) => {
    try {
        res.render('trends');
    } catch (err) {
        console.err("Rendering error:", err);
        res.status(500).send("Server side error") ;  
    }
});

app.get('/posts', (req, res) => {
    try {
        res.render('posts');
    } catch (err) {
        console.err("Rendering error:", err);
        res.status(500).send("Server side error") ;  
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

