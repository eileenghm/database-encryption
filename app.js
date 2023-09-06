//jshint esversion:6"
require("dotenv").config(); //define env var
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encryt = require("mongoose-encryption");

const app = express();

console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded( {
    extended: true
}))

mongoose.connect("mongodb://localhost:27017/userDB");

//object created from mongoose schema class 
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//encrypt only password
userSchema.plugin(encryt, {secret: secret, encryptedFields: ["pasword"]});

//create in mongo
const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res) {
    res.render("home");
}); 

app.get("/login", function(req, res) {
    res.render("login");
}); 

app.get("/register", function(req, res) {
    res.render("register");
}); 

app.post("/register", function(req, res) {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    newUser.save()
    .then(() => {
        // Render secrets only if the user is registered and logged in
        res.render("secrets");
    })
    .catch((err) => {
        console.log(err);
    });
});

app.post("/login", function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    //look through collection of user
    User.findOne({email: username})
    .then((foundUser) => {
        if (foundUser) {
            if (foundUser.password === password) {
                res.render("secrets");
            }
        }
    })
    .catch((err) => {
        console.log(err);
    })
})

app.listen(3000, function() {
    console.log("Server start on port 3000.");
})