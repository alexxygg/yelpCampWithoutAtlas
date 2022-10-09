const {
  campgroundSchema,
  reviewSchema,
} = require("./joiServerValidationSchemas");
const expressError = require("./Utilities/expressErrorHandler");
const Campground = require("./models/campground");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
  //A passport data , user and email
  console.log("REQ.USER----", req.user);
  if (!req.isAuthenticated()) {
    //Store their request to take them there once logged in
    //We had to downgrade passport version to passport@0.5.0
    console.log(
      "Visitor not logged in tried to access: ",
      req.path,
      req.originalUrl
    );
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in.");
    return res.redirect("/login");
  }
  next();
};

module.exports.validateCampground = (req, res, next) => {
  // const result = campgroundSchema.validate(req.body);
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const message = error.details.map((el) => el.message).join(",");
    console.log(message);
    throw new expressError(message, 400);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that.");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    console.log(msg);
    throw new expressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that.");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};
