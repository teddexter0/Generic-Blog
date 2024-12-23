import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";
import morgan from "morgan";
import session from "express-session";
import pg from "pg";
import bcrypt, { hash } from "bcrypt";
import passport from "passport";
import LocalStrategy from "passport-local";
import reqFlash from "req-flash";
import newsAPI from "./newsAPI.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import crypto from "crypto";
import nodemailer from "nodemailer";

dotenv.config({ path: "../.env" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const saltRounds = 10;
const db = new pg.Client({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD, // Ensure it's a string
  database: process.env.PG_DATABASE,
  port: process.env.PG_PORT, // Ensure port is a number
});

db.connect((err) => {
  if (err) {
    console.error("Database connection error:", err.stack);
  } else {
    console.log("Connected to the database.");
  }
});

const app = express();
const port = 3000;

// Set the view engine to EJS
app.set("view engine", "ejs");
// Explicitly set the path to the views folder
app.set("views", path.join(__dirname, "../views"));

// Serve static files //Add middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Parses JSON body (if needed)
app.use(express.static(path.join(__dirname, "../public")));
app.use(morgan("dev")); // Use 'dev' or another format
// Initialize Passport and restore authentication state, if any, from the session
app.use(
  //session
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
      const result = await db.query(
        "SELECT username FROM users WHERE id = $1",
        [req.user.id]
      );
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

app.use(newsAPI); // Use the newsAPI router for /trends
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await db.query("SELECT * FROM users WHERE email = $1", [
          email,
        ]);
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
    }
  )
);
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    async (token, tokenSecret, profile, done) => {
      try {
        // Check if the Google account already exists in your local DB
        const existingUser = await db.query(
          "SELECT * FROM users WHERE email = $1",
          [profile.emails[0].value]
        );

        if (existingUser.rows.length > 0) {
          // If the user exists, log them in
          return done(null, existingUser.rows[0]);
        } else {
          // If the user doesn't exist, register them with Google details
          const newUser = await db.query(
            "INSERT INTO users (username, email, google_id, picture) VALUES ($1, $2, $3, $4) RETURNING *",
            [
              profile.displayName,
              profile.emails[0].value,
              profile.id,
              profile.photos[0].value,
            ]
          );

          return done(null, newUser.rows[0]);
        }
      } catch (err) {
        console.log("Error during Google login:", err);
        return done(err);
      }
    }
  )
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
// Google login route
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Google OAuth callback route
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    successRedirect: "/posts",
  })
);
// Routes to render the pages
// home, login, register(sign up), generic
app.get("/", (req, res) => {
  res.render("home.ejs"); // Looks for "../views/home.ejs"
});

app.get("/home", (req, res) => {
  res.render("home.ejs"); // Looks for "../views/home.ejs"
});

app.get("/login", (req, res) => {
  // Use '/login' here
  res.render("login.ejs"); // Ensure 'login.ejs' exists in the 'views' folder
});

app.get("/register", (req, res) => {
  // Render register page with GET
  res.render("register.ejs"); // Ensure 'register.ejs' exists in the 'views' folder
});

app.get("/generic", (req, res) => {
  try {
    res.render("generic");
  } catch (err) {
    console.error("Rendering error:", err);
    res.status(500).send("Server Side error");
  }
});

app.get("/scientists", (req, res) => {
  try {
    res.render("Generic articles/scientists");
  } catch (err) {
    console.error("Rendering error:", err);
    res.status(500).send("Server Side error");
  }
});

app.get("/stadiums", (req, res) => {
  try {
    res.render("Generic articles/stadiums");
  } catch (err) {
    console.error("Rendering error:", err);
    res.status(500).send("Server Side error");
  }
});

app.get("/places", (req, res) => {
  try {
    res.render("Generic articles/places");
  } catch (err) {
    console.error("Rendering error:", err);
    res.status(500).send("Server Side error");
  }
});

app.get("/marvel", (req, res) => {
  try {
    res.render("Generic articles/marvel");
  } catch (err) {
    console.error("Rendering error:", err);
    res.status(500).send("Server Side error");
  }
});

app.get("/about", (req, res) => {
  try {
    res.render("about");
  } catch (err) {
    console.error("Rendering error:", err);
    res.status(500).send("Server Side error");
  }
});

// Protected route (only accessible to authenticated users)
app.get("/posts", ensureAuthenticated, async (req, res) => {
  try {
    const result = await db.query("SELECT username FROM users WHERE id = $1", [
      req.user.id,
    ]);
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
    .split(" ") // Split by spaces into an array of words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(" "); // Join the words back into a single string
}

app.post("/register", async (req, res) => {
  const inputUnhashedPassword = req.body.password;
  const email = req.body.email.toLowerCase();
  const username = capitalizeName(req.body.username);

  try {
    const existingUser = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      req.flash("error", "Email already exists. Try logging in");
      res.redirect("/login");
    } else {
      bcrypt.hash(
        inputUnhashedPassword,
        saltRounds,
        async (err, hashedPassword) => {
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
                console.log(
                  "Automatic login successful after registration for:",
                  newUser
                );
                res.redirect("/posts");
              }
            });
          }
        }
      );
    }
  } catch (err) {
    console.log("Error during registration:", err);
    res.status(500).send("Internal server error");
  }
});

//login
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/posts", // Redirect to the posts page if login is successful
    failureRedirect: "/login", // Redirect to login page if login fails
    failureFlash: true, // Display error messages using connect-flash
  })
);

// Middleware to ensure authentication
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

// Define the sendEmail function
const sendEmail = async (recipientEmail, message) => {
  try {
    // Configure the transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail", // Use Gmail or your email provider
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password
      },
    });

    // Configure email options
    const mailOptions = {
      from: `"Your Blog Name" <${process.env.EMAIL_USER}>`, // Sender address
      to: recipientEmail, // List of recipients
      subject: "Password Reset Request", // Subject line
      text: message, // Plain text body
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Serve the forgot password form
app.get("/forgot-password", (req, res) => {
  res.render("forgot-password"); // Make sure you have a `forgot-password.ejs` file in your views folder
});

// Forgot password - request reset
app.post("/reset-password-request", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const userResult = await db.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (userResult.rows.length === 0) {
      req.flash("error", "No user found with that email address.");
      return res.redirect("/forgot-password");
    }

    const userId = userResult.rows[0].id;

    // Generate reset token and expiration
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expirationTime = Date.now() + 3600000; // 1 hour

    // Update the users table
    await db.query(
      "UPDATE users SET reset_token = $1, reset_token_expiration = $2 WHERE id = $3",
      [resetToken, expirationTime, userId]
    );

    // Send email with the reset link
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
    console.log(`Reset link: ${resetLink}`); // Debug log
    sendEmail(email, `Your password reset link: ${resetLink}`);

    req.flash("success", "Password reset email sent!");
    res.redirect("/login");
  } catch (error) {
    console.error("Error in /reset-password-request:", error);
    res.status(500).send("Internal server error");
  }
});

// Reset password form route
app.get("/reset-password/:token", async (req, res) => {
  const { token } = req.params;

  try {
    // Find user with the matching token and check expiration
    const userResult = await db.query(
      "SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiration > $2",
      [token, Date.now()]
    );

    if (userResult.rows.length === 0) {
      req.flash("error", "Invalid or expired token.");
      return res.redirect("/forgot-password");
    }

    // Render the reset password form
    res.render("reset-password", { token });
  } catch (error) {
    console.error("Error in /reset-password/:token:", error);
    res.status(500).send("Internal server error");
  }
});

// Process password reset
app.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Find user with the matching token
    const userResult = await db.query(
      "SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiration > $2",
      [token, Date.now()]
    );

    if (userResult.rows.length === 0) {
      req.flash("error", "Invalid or expired token.");
      return res.redirect("/forgot-password");
    }

    const userId = userResult.rows[0].id;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password and clear the reset token
    await db.query(
      "UPDATE users SET password = $1, reset_token = NULL, reset_token_expiration = NULL WHERE id = $2",
      [hashedPassword, userId]
    );

    req.flash("success", "Password reset successfully!");
    res.redirect("/login");
  } catch (error) {
    console.error("Error in /reset-password:", error);
    res.status(500).send("Internal server error");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
