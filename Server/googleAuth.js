import express from express;
import session from "express-session";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import path from "path";
import axios from "axios";
import nodemon from "nodemon";
import morgan from "morgan";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
dotenv.config();

const app = express()
const port = 3000;

// Parse JSON data
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session());
app.use(morgan('dev')); 

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {
    //Handle user data
    console.log(profile);
    done(null, profile);
}))

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email']}));
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        try {
            res.redirect('/dashboard'); // Redirect after login
        } catch (err) {
            res.status(500).send('Authentication Error!');
        }
    });


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});