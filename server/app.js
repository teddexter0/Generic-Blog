import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import morgan from "morgan";
import session from "express-session";
import pg from "pg";
import bcrypt, { hash } from "bcrypt";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy } from "passport-local";
dotenv.config();

const saltRounds = 10;
const db = new pg.Client({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_NAME,
    port: process.env.PG_PORT
});
db.connect();

const app = express();
const port = 3000;

// Manually create __dirname using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files //Add middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Parses JSON body (if needed)
app.use(express.static(path.join(__dirname, '../public')));
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

app.post('/register', async (req, res) => {
    
const inputUnhashedPassword = req.body.password;
const email = req.body.email;
const username = req.body.username;

    try {
        const checkIfEmailAlreadyExists = await db.query("SELECT * FROM users WHERE email = $1", [email]);

        if (checkIfEmailAlreadyExists.rows.length > 0) {
            res.redirect("/login");
            //if client email exists in database, client taken to login page
        } else {
    bcrypt.hash(inputUnhashedPassword, saltRounds, async (err, hashedPassword) => {
                    //error handling
                    if(err) {
                        console.log("Error hashing password:", err);
                    } else {
                            const updateDatabase = await db.query(
                                "INSERT INTO users (username, email, password) VALUES ($1, $2) RETURNING *", [username, email, hashedPassword]
                            );
                            const user = updateDatabase.rows[0];
                            res.login(user, (err) => {
                                console.log("success");
                                res.redirect("/posts.ejs");
                            });
                        }
                        });
                    }
    } catch (err) {
        console.log(err);
    }
    console.log(`Received: ${username}, ${inputUnhashedPassword}`);
    res.status(200).send('Registration successful!');
  });

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

