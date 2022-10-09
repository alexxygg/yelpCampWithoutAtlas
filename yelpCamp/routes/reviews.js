const express = require("express");
//Needed because we have the /:id parameter as a prefix in app.js
const router = express.Router({ mergeParams: true });

const catchAsync = require("../Utilities/catchAsync");
// const expressError = require("../Utilities/expressErrorHandler");

const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");

const Campground = require("../models/campground");
const Review = require("../models/review");

//We destructured in case we create and use additional schemas later.
// const { reviewSchema } = require("../joiServerValidationSchemas");

//ALL OUR LOGIC MOVED TO CONTROLLERS FOLDER
//REFERENCED WITH THE REVIEWS FILE
const reviews = require("../controllers/reviews");

router.post("/", validateReview, isLoggedIn, catchAsync(reviews.createReview));

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
