const {PASSPORT_SECRET} = require("../secrets");
const middleware = require("../middleware");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const bcrypt = require("bcrypt");

const MAX_BOOKS_PER_SHELF = 5;
const saltRounds = 10;

router.use(session({
  secret: PASSPORT_SECRET,
  resave: false,
  saveUninitialized: false
}));
router.use(passport.initialize());
router.use(passport.session());


let connectToDb = function(booksdbConnection, usersdbConnection){

  //PASSPORT AUTHENTICATION
  // passport.use(new LocalStrategy(
  //   function(username, password, done){
  //     usersdbConnection.findOne({username: username},
  //       async function(err, user){
  //         if(err) {return done(err);}
  //         if(!user){
  //             return done(null, false, {message: "Incorrect username"});
  //         }
  //         let match = await bcrypt.compare(password, user.password);
  //         if(!match){
  //             return done(null, false, {message: "Incorrect password"});
  //         }
  //         return done(null, user);
  //       });
  //     }
  // ));
  passport.use(new LocalStrategy(
    async function(username, password, done){
      await usersdbConnection.findOne({username: username},
        async function(err, user){
          console.log("passport userfind: ", user);
          if(err) {return done(err);}
          if(!user){
              return done(null, false, {message: "Incorrect username"});
          }
          let match = await bcrypt.compare(password, user.password);
          if(!match){
              return done(null, false, {message: "Incorrect password"});
          }
          return done(null, user.username);
        });
      }
  ));

  // passport.serializeUser( function(user, callback){
  //   //passport saves this in the session
  //   callback(null, user.username);
  // });

  // passport.deserializeUser( function(username, callback){
  //   //uses what is saved in the session earlier to access user
  //   usersdbConnection.findOne({username: username}, (err, user) => {
  //     if(err){
  //         return callback(err);
  //     }
  //     callback(null, user.username);
  //   });
  // });
  passport.serializeUser( function(user, callback){
    //passport saves this in the session
    console.log("Serialize called, user: ", user);
    callback(null, user);
  });

  passport.deserializeUser( function(username, callback){
    //uses what is saved in the session earlier to access user
    console.log("DEserialize called, user: ", username);
    usersdbConnection.findOne({username: username}, (err, user) => {
      if(err){
          return callback(err);
      }
      callback(null, user.username);
    });
  });

  router.use((req, res, next) => {
    console.log("req.user value:", req.user);
    res.locals.currentUser = req.user;
    //res.locals.error = req.flash("error");  //error refers to ejs code
    //res.locals.success = req.flash("success");  //success refers to ejs code
    next();
  });

  /////////////////////////
  //ROUTES
  ///////////////

  //index
  router.get("/", (req, res) => {
    req.flash("info", "welcome");
    booksdbConnection.findMany({},
      function renderLibraryPage(data){
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
    let pw = req.body.password;
    username = username.trim();
    
    usersdbConnection.findOne({username: username},
      function checkForNoMatch(err, data){
        if(data.username !== undefined){
          res.redirect("/login");
        } else {
          bcrypt.hash(pw, saltRounds, (err, hash)=>{
            if(err){
              return res.redirect("/login");
            }

            //ERROR IN THIS AREA
            usersdbConnection.insert({username: username, password: hash}, (userData) => {
              let user = userData.ops[0].username;
              console.log("user to login", user);

              req.login(user, (err)=>{
                console.log("login err: ", err);
                if(err){

                  return next(err);
                  //return callback(err);
                }
                return res.redirect("/");
              });
            });
          });
        }
      });
  });

  router.get("/login", (req, res) => {
    res.render("login");
  });

  router.post("/login", passport.authenticate("local",
    {
      successRedirect: "/",
      failureRedirect: "/login"
    }));

  router.get("/logout", middleware.isLoggedIn, (req, res) => {
    req.logOut();
    req.flash("You logged out");
    res.redirect("/");
  });

  return router;
}

module.exports = connectToDb;