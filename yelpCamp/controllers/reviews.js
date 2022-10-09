const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  // res.send("REVIEW SUBMITTED");
  const campground = await Campground.findById(req.params.id);
  //This gives us access to all values stored in review[]
  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash("success", "New review created successfully!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });
  // (req.params.reviewId) if NOT DESTRUCTURED
  const review = await Review.findByIdAndDelete(reviewId);
  // res.send("DELETE ME");
  req.flash("success", "Review deleted successfully!");
  res.redirect(`/campgrounds/${id}`);
};
