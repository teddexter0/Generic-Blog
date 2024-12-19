import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import pg from "pg";
import { Client } from "pg";
import bcrypt, { hash } from "bcrypt";
import dotenv from "dotenv";
import passport from "passport";
dotenv.config();
import { Strategy } from "passport-local";
import { Router } from 'express';

const router = Router();
const app = express();
const port = 3000;
const saltRounds = 10;

const db = new Client({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_NAME,
    port: process.env.PG_PORT
});
db.connect();

// Serve static files //Add middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Parses JSON body (if needed)
app.use(express.static(path.join(__dirname, '../public')));
app.use(morgan('dev')); // Use 'dev' or another format

router.post('/register', async (req, res) => {
    
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
  

export default router;