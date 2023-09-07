//jshint esversion:6"
require("dotenv").config(); //define env var
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//add cookies using passport
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

//const encryt = require("mongoose-encryption");
//hash
const md5 = require("md5"); 
const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded( {
    extended: true
}))

//cookies setup session
app.use(session({
    secret: "asdfasdfalsdfjaskdfjaldsf",
    resave: false,
    saveUninitialized: false
}));

//set passport
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

//object created from mongoose schema class 
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//hash psw and save users to mongodb
userSchema.plugin(passportLocalMongoose);

//encrypt only password
//userSchema.plugin(encryt, {secret: process.env.SECRET, encryptedFields: ["pasword"]});

//create in mongo
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res) {
    res.render("home");
}); 

app.get("/login", function(req, res) {
    res.render("login");
}); 

app.get("/register", function(req, res) {
    res.render("register");
}); 

app.get("/secrets", function(req, res) {
    //login first before secret page
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.post("/register", function(req, res){
    User.register({username: req.body.username}, req.body.password, function(err, user){
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("/secrets");
        });
      }
    });
  
});

app.post("/login", function(req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user, function(err){
        if (err) {
          console.log(err);
        } else {
          passport.authenticate("local")(req, res, function(){
            res.redirect("/secrets");
          });
        }
      });
});

/*
app.post("/register", function(req, res) {
    const newUser = new User({
        email: req.body.username,
        password: md5(req.body.password)
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
    const password = md5(req.body.password);

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
*/

app.listen(3000, function() {
    console.log("Server start on port 3000.");
})