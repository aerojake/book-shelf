//const {createMongoAPI, insert, findById, findMany, deleteOne} = require("../database.js");
const {createMongoAPI} = require("../database.js");

const express = require("express");
const router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const BOOKS_DATABASE = "books";
const USERS_DATABASE = "users";
const PASSWORD_DATABASE = "passwords";

const DATABASE = "jReads";
const BOOKS_COLLECTION = "books";
const USERS_COLLECTION = "users";
const PASSWORD_COLLECTION = "passwords";

let MAX_BOOKS_PER_SHELF = 5;
let booksDB = createMongoAPI(DATABASE, BOOKS_COLLECTION);  //need to mock
let userDB = createMongoAPI(DATABASE, USERS_COLLECTION);
let passwordDB = createMongoAPI(DATABASE, PASSWORD_COLLECTION);

passport.use(new LocalStrategy(
    function(username, password, done){
        userDB.findOne({username: username},
            function(err, user){
                console.log("user: ", user);
                //console.log("err: ", err);
                if(err) {return done(err);}
                if(!user){
                    return done(null, false, {message: "Incorrect username"});
                }
                if(user.password != password){
                    return done(null, false, {message: "Incorrect password"});
                }

                return done(null, user);
            });
    }
));

passport.serializeUser( function(user, callback){
    //passport saves this in the session
    callback(null, user.username);
});

passport.deserializeUser( function(username, callback){
    //uses what is saved in the session earlier to access user
    usersDB.findOne({username: username}, (err, user) => {
        if(err){
            return callback(err);
        }
        callback(null, user.username);
    });
});

//index
router.get("/", (req, res) => {
    req.flash("info", "welcome");
    booksDB.findMany({},
        function renderLibraryPage(data)
        {
            res.render("home", {
                myLibrary: data,
                maxBooksPerShelf: MAX_BOOKS_PER_SHELF,
                message: req.flash("info")
            });
        });
});

router.get("/register", (req, res) => {
    res.render("register");
})

router.post("/register", (req, res) => {
    if(!req.body.username){
        res.redirect("/");
    }

    let username = req.body.username;
    username = username.trim();
    
    userDB.findOne({username: username},
        function checkForNoMatch(data){
            if(data.length === 0){
                console.log("user not found");
            } else {
                console.log("user found");
            }
        });
    //check username is available
    //add username to database
    //add password to database

    res.redirect("/");
});

router.get("/login", (req, res) => {
    res.render("login");
});

router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/",
        failureRedirect: "/login",
        successFlash: "You have logge in!",
        failureFlash: true
    }),
    (req, res) => {

    }
);

router.get("/logout", (req, res) => {
    req.logOut();
    console.log("You have logged out.");
    req.flash("You logged out");
    res.redirect("/");
});

module.exports = router;