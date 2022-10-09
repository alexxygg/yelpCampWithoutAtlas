const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelper");
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  //NO LONGER NEEDED WITH MONGOOSE 6
  //   useCreateIndex: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});

//Used to return a random element from an array
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDb = async () => {
  await Campground.deleteMany({});
  //   const c = new Campground({ title: "Purple Field" });
  //   await c.save();
  for (let i = 0; i < 400; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const camp = new Campground({
      //YOUR USER ID
      author: "633780426b645b86cb777e08",
      title: `${sample(descriptors)} ${sample(places)}`,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      //Hardcoded Tijuana for all maps
      // geometry: { type: "Point", coordinates: [-116.964662, 32.501019] },

      //Changed to use the long and lat of each city in our seeds file
      //Complying with X and Y axis default for JSON, opposite og Gmaps
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      images: [
        {
          url: "https://res.cloudinary.com/du2tr4b17/image/upload/v1665178287/YelpCamp/ug1ifbdmsik216qm41um.jpg",
          filename: "YelpCamp/bvukydvivalyby0n5ryx",
        },
        {
          url: "https://res.cloudinary.com/du2tr4b17/image/upload/v1665035680/YelpCamp/msmczeyk7mkxxoc3khqs.jpg",
          filename: "YelpCamp/msmczeyk7mkxxoc3khqs",
        },
        {
          url: "https://res.cloudinary.com/du2tr4b17/image/upload/v1665035682/YelpCamp/uhi4s6cttvxteb0ft1lt.jpg",
          filename: "YelpCamp/uhi4s6cttvxteb0ft1lt",
        },
      ],
      description:
        "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Magni alias quo illo. Doloribus vero rem, animi rerum consectetur hic sequi quia nobis, iure laborum odit. Maxime aliquid cupiditate asperiores laudantium.",
      price: Math.floor(Math.random() * 20) + 10,
    });
    await camp.save();
  }
};
seedDb().then(() => mongoose.connection.close());
