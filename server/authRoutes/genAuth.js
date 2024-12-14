// import express from "express";
// import session from "express-session";
// import bodyParser from "body-parser";
// import pg from "pg";
// import { Client } from "pg";
// import bcrypt, { hash } from "bcrypt";
// import dotenv from "dotenv";
// dotenv.config();

// const app = express();
// const port = 3000;
// const saltRounds = 10;
// const { username, email, password  } = req.body;

// const db = new Client({
//     host: process.env.PG_HOST,
//     user: process.env.PG_USER,
//     password: process.env.PG_PASSWORD,
//     database: process.env.PG_NAME,
//     port: process.env.PG_PORT
// });
// db.connect();

//             //Password Hashing, if email input does not exist in database
// const hashInputPassword = function (username, email, password) { 
//     bcrypt.hash(password, saltRounds, async (err, hash) => {
//         //error handling
//         if(err) {
//             console.log("Error hashing password:", err);
//         } else {
//                 const updateDatabase = await db.query(
//                     "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)", [username, email, hash]
//                 );
//                 console.log(updateDatabase);
//                 res.render("posts.ejs")
//             }
//             });
//         };
    
// app.post("/register", async (req, res) => {
//     try {
//         const checkIfEmailAlreadyExists = await db.query("SELECT * FROM users WHERE email = $1", [email]);

//         if (checkIfEmailAlreadyExists.rows.length > 0) {
//             res.send("Email already exists, try logging in");
//         } else {
//             hashInputPassword();
// }
//     } catch (err) {
        
//     }

// });

// app.post("/login", async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [email])
//     } catch (err) {
        
//     }

// });