import express from "express";
import path from "path";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";

// Set up ES module directory handling
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Explicitly set the path to the views folder
app.set('views', path.join(__dirname, '../views'));

// Debug to confirm the views directory
console.log("Views directory:", app.get('views'));

// Routes to render the pages
// home, login, register(sign up), generic
app.get("/", (req, res) => {
    res.render('home.ejs'); // Looks for "../views/home.ejs"
});

app.get('/login', (req, res) => { // Use '/login' here
    res.render('login.ejs');  // Ensure 'login.ejs' exists in the 'views' folder
});

app.get('/register', (req, res) => { // Render register page with GET
    res.render('register.ejs'); // Ensure 'register.ejs' exists in the 'views' folder
});

app.post('/sign-up', (req, res) => {
    // Handle the form submission for sign-up here
    res.send("Sign-up form submitted!"); // Replace with actual handling logic
});

app.get('/generic', (req, res) => {
    try {
        res.render('generic');
    } catch (err) {
        console.error("Rendering error:", err);
        res.status(500).send("There was an error rendering generic.ejs");
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

