const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const Review = require("./review");

const { cloudinary } = require("../cloudinary");

//We moved all image schema data to its own Schema
const imageSchema = new Schema({ url: String, filename: String });

//A virtual property for each image for thumbnail when editing camp
//Only the original image is in our images db, not the thumbnail version
//We now have access to img.thumbnail in our edit views
imageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

//The option for virtuals being part of the resulting object
//We pass it in to the schema at the end!!
const options = { toJSON: { virtuals: true } };

const campgroundSchema = new Schema(
  {
    title: String,
    price: Number,
    //The way MapBox does it is with location instead of geometry
    //But we already have location in use.
    geometry: {
      type: {
        type: String,
        //This has to be Point, a part of the geometry object.
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    description: String,
    location: String,
    // image: String,
    //Changes after working uploading of files
    //Each file object has:
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    author: { type: Schema.Types.ObjectId, ref: "User" },

    // images: [{ url: String, filename: String }],
    //Images now takes an array of imageSchema images instead
    images: [imageSchema],
    //Our options, now stringified object includes properties(virtual)
  },
  options
);

//For the virtual data in the result object
campgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `<a href="/campgrounds/${this._id}">` + `${this.title}` + `</a>`;
});

//Our mongoose middleware to delete all specific campground reviews
//upon campground deletion

//We must check what Mongoose method is triggered based on the method we use
//ourselves in the app paths
campgroundSchema.post("findOneAndDelete", async (doc) => {
  // console.log(doc);
  if (doc) {
    await Review.deleteMany({
      _id: { $in: doc.reviews },
    });
  }
});

//TO delete any images from cloudinary hosting when a camp
//is deleted, except if they are one of our seeds images
campgroundSchema.post("findOneAndDelete", async function (campground) {
  console.log("deleted");
  if (campground.reviews) {
    await Review.deleteMany({ _id: { $in: campground.reviews } });
  }
  if (campground.images) {
    const seeds = [
      "yelpCamp/ug1ifbdmsik216qm41um.jpg",
      "yelpCamp/atgqz3aw6ud30mcd2jvu.jpg",
      "yelpCamp/skb8dlfrewnqfz41820g.jpg",
    ];

    for (const img of campground.images) {
      if (!(img.filename in seeds)) {
        await cloudinary.uploader.destroy(img.filename);
      }
    }
  }
});

module.exports = mongoose.model("Campground", campgroundSchema);
