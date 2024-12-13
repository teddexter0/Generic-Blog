import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { Pool } from 'pg'; 
import bodyParser from "body-parser";
import morgan from "morgan";
import passport from "passport";
import googleAuth from './authRoutes/googleAuth.js';
import genAuth from './authRoutes/genAuth.js';

const app = express();
const port = 3000;

// Set up ES module directory handling
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up the connection pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
  });
  
  // Test the connection pool
  pool.connect()
    .then(client => {
      console.log('Connected to the database');
      client.release();  // Release the client back to the pool after use
    })
    .catch(err => {
      console.error('Database connection error', err);
    });

// Serve static files //Add middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev')); // Use 'dev' or another format
app.use(googleAuth);
app.use(genAuth);

//Initialize passport
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// Passport.js middleware
app.use(passport.initialize());
app.use(passport.session()); // Use session after passport.initialize()

passport.serializeUser((user, done) => {
    done(null, user.id); // Store user ID in session
});

passport.deserializeUser(async (id, done) => {
    try {
        const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
        done(null, result.rows[0]);
    } catch (err) {
        done(err, null);
    }
});

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

app.use((err, req, res, next) => {
    res.status(500).send('Something broke!');
  });
  
// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

