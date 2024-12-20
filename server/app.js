import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import morgan from "morgan";
import session from "express-session";
import pg from "pg";
import bcrypt, { hash } from "bcrypt";
import passport from "passport";
import LocalStrategy from 'passport-local';
import dotenv from 'dotenv';
import reqFlash from "req-flash";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '../.env' });

const saltRounds = 10;
const db = new pg.Client({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD, // Ensure it's a string
    database: process.env.PG_DATABASE,
    port: process.env.PG_PORT, // Ensure port is a number
});

console.log('PG_PASSWORD:', process.env.PG_PASSWORD);
console.log(`Connecting to database with password: ${process.env.PG_PASSWORD}`);

db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err.stack);
    } else {
        console.log('Connected to the database.');
    }
});

const app = express();
const port = 3000;

// Set the view engine to EJS
app.set('view engine', 'ejs');
// Explicitly set the path to the views folder
app.set('views', path.join(__dirname, '../views'));

// Serve static files //Add middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Parses JSON body (if needed)
app.use(express.static(path.join(__dirname, '../public')));
app.use(morgan('dev')); // Use 'dev' or another format
// Initialize Passport and restore authentication state, if any, from the session
app.use(//session
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(reqFlash());
app.use(async (req, res, next) => {
    if (req.isAuthenticated()) {
        try {
            const result = await db.query("SELECT username FROM users WHERE id = $1", [req.user.id]);
            res.locals.registeredName = result.rows[0]?.username || "User"; // Default to "User" if no username is found
        } catch (err) {
            console.log("Error fetching registeredName:", err);
            res.locals.registeredName = null; // Fallback if an error occurs
        }
    } else {
        res.locals.registeredName = null; // Not logged in
    }
    next();
});

app.use((req, res, next) => {
    res.locals.successMessage = req.flash("success");
    res.locals.errorMessage = req.flash("error");
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

passport.use(
    new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
        try {
            const user = await db.query("SELECT * FROM users WHERE email = $1", [email]);
            if (!user.rows.length) {
                console.log("Login attempt with email:", email);
                return done(null, false, { message: "Incorrect email." });
            }

            const isMatch = await bcrypt.compare(password, user.rows[0].password);
            if (!isMatch) {
                console.log("Password mismatch for email:", email);
                return done(null, false, { message: "Incorrect password." });
            }

            console.log("Login successful for user:", user.rows[0]);
            return done(null, user.rows[0]);
        } catch (err) {
            
            console.error("Error in LocalStrategy:", err);
            return done(err);
        }
    })
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await db.query("SELECT * FROM users WHERE id = $1", [id]);
        done(null, user.rows[0]);
    } catch (err) {
        done(err);
    }
});

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

  // Protected route (only accessible to authenticated users)
app.get('/posts', ensureAuthenticated, async (req, res) => {
    try {
        const result = await db.query("SELECT username FROM users WHERE id = $1", [req.user.id]);
        const registeredName = result.rows[0]?.username || "User"; // Default to "User" if no username found
        res.render("posts", { registeredName }); // Pass it as an object
    } catch (error) {
        console.log(error);
        res.status(500).send("Server-side error, please try again later");
    }
});

// Logout Route
app.get("/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.log(err);
        return res.send("Logout failed. Please try again.");
      }
      res.redirect("/home");
    });
  });

function capitalizeName(name) {
    return name
      .toLowerCase() // Convert all characters to lowercase
      .split(' ') // Split by spaces into an array of words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
      .join(' '); // Join the words back into a single string
  }

app.post('/register', async (req, res) => {
    const inputUnhashedPassword = req.body.password;
    const email = req.body.email.toLowerCase();
    const username = capitalizeName(req.body.username);
    
    try {
        const existingUser = await db.query("SELECT * FROM users WHERE email = $1", [email]);

        if (existingUser.rows.length > 0) {
            req.flash("error", "Email already exists. Try logging in");
            res.redirect("/login");
        } else {
          bcrypt.hash(inputUnhashedPassword, saltRounds, async (err, hashedPassword) => {
                if (err) {
                    console.log("Error hashing password:", err);
                    res.status(500).send("Internal server error");
                } else {
                    const updateDatabase = await db.query(
                        "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
                        [username, email, hashedPassword]
                    );

                    const newUser = updateDatabase.rows[0];

                    req.login(newUser, (err) => {
                        if (err) {
                            console.log("Error during login after registration:", err);
                            res.status(500).send("Internal server error");
                        } else {
                            console.log("Automatic login successful after registration for:", newUser);
                            res.redirect("/posts");
                        }
                    });
                }
            });
        }
    } catch (err) {
        console.log("Error during registration:", err);
        res.status(500).send("Internal server error");
    }
});

//login
app.post(
    '/login',
    passport.authenticate('local', {
      successRedirect: '/posts', // Redirect to the posts page if login is successful
      failureRedirect: '/login', // Redirect to login page if login fails
      failureFlash: true, // Display error messages using connect-flash
    })
  );
  
  // Middleware to ensure authentication
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  }

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

