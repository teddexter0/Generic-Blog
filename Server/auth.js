import express from express;
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import path from "path";
import axios from "axios";
import nodemon from "nodemon";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();

const app = express()
const port = 3000;
const saltRounds = 10;

// Parse JSON data
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
    res.status(500).send('Something broke!');
  });
  
const db = new pg.Client({
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
  });
db.connect();

app.post('/register', async (req, res) => { // Render register page with GET
    const email = req.body.email;
    const password = req.body.password;

//Nuance handling
try {
    const checkResult = await db.query("SELECT * FROM user WHERE email = $1", [email]);
    
   if (checkResult.rows.length > 0){
        res.send("Email already exists. Try logging in.")
    }  else {

        //hash password and save in database
        bcrypt.hash(password, saltRounds, async (err, hash) => {
            if (err) {
                console.log("Error hashing password:", err);
            } else {
                console.log("Hashed Password:", hash);
                await db.query(
                    " INSERT INTO users (email, password) VALUES ($1, $2)"
                    [email, hash]
                );
                res.render("home.ejs"); 
            }
        });
    }
} catch (err) {
    console.error(err);
    res.status(500).send("An error occured. Please try again later.");
}

});

app.post("/login", async (req, res) => {
    const email = req.body.username;
    const loginPassword = req.body.password;
    
//Nuance handling
try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
        email,
    ]); 
    if (result.rows.length > 0) {
        const user  = result.rows[0];
        const storedHashedPassword = user.password;

        //verifying the password
        bcrypt.compare(loginPassword, storedHashedPassword, (err, result) => {
            if  (err) {
                console.error("Error comparing passwords:", err);
            } else {
                if (result) {
                    res.render("home.ejs");
                } else {
                    res.send("Incorrect Password");
                }
            }
        });
    } else {
        res.send("User not found");
    }
} catch (err) {
    console.log(err);
}
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});