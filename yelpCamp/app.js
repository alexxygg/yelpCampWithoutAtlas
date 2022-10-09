//For our.env file, require module AFTER npm i dotenv
//An environment variable, if in development, require package
//access keys value pairs of .env file
//We are in development environment by default, so it will
//always run, looks for a file called .env ONLY, parses and
//makes them available in process.env

//We also need to npm i cloudinary AND multer-storage--cloudinary
//We made a folder to require both.

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

//TO BE USED WHEN IN PRODUCTION ONLY, NOT DEVELOPMENT
// require("dotenv").config();

//How we access the keys and values:
// console.log(process.env.SECRET);
// console.log(process.env.API_KEY);

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const morgan = require("morgan");
const session = require("express-session");
const app = express();

//Will prevent a user to use $ and periods in a query,
//helpful regarding Mongo injection/hacking/extraction methods
//for particular database syntax. '(${gt:""}), etc.
const mongoSanitize = require("express-mongo-sanitize");

const expressError = require("./Utilities/expressErrorHandler");

const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

//LINE NO LONGER
// const helmet = require("helmet");

// //RESTRICTION OF LOCATIONS WHERE WE FETCH DATA FROM, PREVENTING
// //ANY INJECTIONS FROM USERS
// const scriptSrcUrls = [
//   "https://stackpath.bootstrapcdn.com/",
//   "https://api.tiles.mapbox.com/",
//   "https://api.mapbox.com/",
//   "https://kit.fontawesome.com/",
//   "https://cdnjs.cloudflare.com/",
//   "https://cdn.jsdelivr.net/",
// ];
// const styleSrcUrls = [
//   "https://kit-free.fontawesome.com/",
//   "https://stackpath.bootstrapcdn.com/",
//   "https://api.mapbox.com/",
//   "https://api.tiles.mapbox.com/",
//   "https://fonts.googleapis.com/",
//   "https://use.fontawesome.com/",
//   "https://cdn.jsdelivr.net/", // I had to add this item to the array
// ];
// const connectSrcUrls = [
//   "https://api.mapbox.com/",
//   "https://a.tiles.mapbox.com/",
//   "https://b.tiles.mapbox.com/",
//   "https://events.mapbox.com/",
// ];
// const fontSrcUrls = [];
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: [],
//       connectSrc: ["'self'", ...connectSrcUrls],
//       scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//       styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//       workerSrc: ["'self'", "blob:"],
//       objectSrc: [],
//       imgSrc: [
//         "'self'",
//         "blob:",
//         "data:",
//         "https://res.cloudinary.com/du2tr4b17/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
//         "https://images.unsplash.com/",
//       ],
//       fontSrc: ["'self'", ...fontSrcUrls],
//     },
//   })
// );

app.get("/fakeuser", async (req, res) => {
  const user = new User({
    email: "alex@gmail.com",
    username: "alexxygg",
  });
  //Passport will take new user object and password, hash it with salt
  //and returns it to user object.
  const newUser = await User.register(user, "password");
  //Adds a salt and hash key value pair to object
  res.send(newUser);
});

//Here we import the specific routes
const campgroundsRoutes = require("./routes/campgrounds");
const reviewsRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

const { nextTick } = require("process");
//Here we use the path, we must remove the prefix from all routes
//--on routes file for campgrounds
//We also changed app. to router.
// We also moved catch async to each routes fileLoader, since it
//will not work from this file.
//Same with expressError
//Also the Campground model

//Changed all require file paths since we saved the routes in a folder

//Moved validateCampground too

const User = require("./models/user");

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

app.use(morgan("tiny"));

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//To return object defined
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));

//for Mongo injection prevention
app.use(
  mongoSanitize()
  //Optional, inside method, _gt instead of $gt
  //{replaceWith:"_"}
);

//Enables all 11 middleware that come with package
//Some of which cause map, images not to load
//Our false resolves this
//LINE NO LONGER
// app.use(helmet());

//Our session id cookie
const sessionConfig = {
  name: "session",
  secret: "thisisabettersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    //The milliseconds in a week
    expires: Date.now() + 604800000,
    maxAge: 604800000,
    //Extra security
    httpOnly: true,
    // secure: true,
  },
};
app.use(session(sessionConfig));

app.use(flash());

app.use(passport.initialize());
//This allows to not have to log in each time,
//needs to go after app.use session
app.use(passport.session());
//To use our strategy, which we required.
passport.use(new LocalStrategy(User.authenticate()));
//Store user in session   store,un store
passport.serializeUser(User.serializeUser());
//Get user out of session
passport.deserializeUser(User.deserializeUser());

//Our flash alert middleware, runs on every request
//We will have access to it locally
app.use((req, res, next) => {
  console.log(req.session);
  //All templates should have access to these locals
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//Our router prefixes
app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/reviews", reviewsRoutes);
app.use("/", userRoutes);

app.get("/", (req, res) => {
  //   res.send("OUR YELP CAMP");
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new expressError("Page not found.", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong";
  res.status(statusCode).render("error", { err });
  // res.send("SOMETHING WENT WRONG :c");
});

app.listen(3700, () => {
  console.log("port 3500 active");
});
