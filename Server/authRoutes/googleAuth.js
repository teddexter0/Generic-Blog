import express from express;
import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
dotenv.config();

const router = express.Router();

//Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user exists in database
        const result = await pool.query("SELECT * FROM users WHERE google_id = $1", [profile.id]);

        if (result.rows.length > 0) {
            // User exists, log them in
            return done(null, result.rows[0]);
        } else {
            // Insert new user
            const newUser = await pool.query(
                "INSERT INTO users (google_id, email, name) VALUES ($1, $2, $3) RETURNING *",
                [profile.id, profile.emails[0].value, profile.displayName]
            );
            return done(null, newUser.rows[0]);
        }
    } catch (err) {
        console.error(err);
        return done(err, null);
    }
}));


router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/home');
});

export default router;