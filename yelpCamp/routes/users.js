const express = require("express");
const router = express.Router();

const catchAsync = require("../Utilities/catchAsync");
const expressError = require("../Utilities/expressErrorHandler");

const User = require("../models/user");
const passport = require("passport");
const { func } = require("joi");

const users = require("../controllers/users");

//BEFORE
// router.get("/register", users.renderRegisterForm);
// router.post("/register", catchAsync(users.register));

//AFTER

router
  .route("/register")
  //REGISTER
  .get(users.renderRegisterForm)
  //This is to create a user, not keep him logged in.
  .post(catchAsync(users.register));

router
  .route("/login")
  //LOGIN
  .get(users.renderLogin)
  //Here Passport uses our strategy/ies to validate the data
  //We can include multiple in the same place,
  //If there's an error, we'll flash a message and redirect
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
      //Due to upgrades and changes, needed for the redirect to returnTo in session
      keepSessionInfo: true,
    }),
    users.login
  );

//DUE TO PASSPORT PROBLEMS
// router.get("/logout", (req, res, next) => {
//   req.logout(function (err) {
//     if (err) {
//       return next(err);
//     }
//     req.flash("success", "Logged out successfully.");
//     res.redirect("/campgrounds");
//   });
// });

//STAND-ALONE, ONLY ONE ROUTE WITH THIS PREFIX
router.get("/logout", users.logout);

module.exports = router;
