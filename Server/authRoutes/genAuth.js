import express from 'express';
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import passport from "passport";
dotenv.config();

const router = express.Router();
const saltRounds = 10;

// Configure LocalStrategy for Passport
passport.use(new LocalStrategy({
    usernameField: 'email',  // Specifies that the username will be the email
    passwordField: 'password'  // Specifies that the password field is 'password'
}, async (email, password, done) => {
    try {
        // Find user by email
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return done(null, false, { message: 'No user found with that email' });
        }

        const user = result.rows[0];

        // Check if the passwords match
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return done(null, false, { message: 'Incorrect password' });
        }

        return done(null, user);  // User is authenticated
    } catch (err) {
        return done(err);
    }
}));

router.post('/register', async (req, res) => {
    const { email, password, username } = req.body;

    try {
        // Check if email already exists
        const checkResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (checkResult.rows.length > 0) {
            return res.status(400).send("Email already exists. Try logging in.");
        }

        // Hash the password before saving to the database
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user into the database
        await pool.query(
            "INSERT INTO users (email, password, username) VALUES ($1, $2, $3)",
            [email, hashedPassword, username]
        );

        // Redirect or render the home page after successful registration
        res.redirect('/login');  // Or redirect to another page
    } catch (err) {
        console.error("Error during registration:", err);
        res.status(500).send("Internal Server Error. Please try again later.");
    }
});

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',  // Redirect to login if authentication fails
    successRedirect: '/home'   // Redirect to home page if authentication succeeds
}));

export default router;
