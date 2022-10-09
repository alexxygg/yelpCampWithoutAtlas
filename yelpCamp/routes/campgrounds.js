const express = require("express");
const router = express.Router();

const catchAsync = require("../Utilities/catchAsync");
// const expressError = require("../Utilities/expressErrorHandler");

const Campground = require("../models/campground");

//We destructured in case we create and use additional schemas later.
// const { campgroundSchema } = require("../joiServerValidationSchemas");

//Our middleware to check if user is logged
const { isLoggedIn, validateCampground, isAuthor } = require("../middleware");
const { populate } = require("../models/review");

const campgrounds = require("../controllers/campgrounds");

//For image uploading, dest = destination to save at
const multer = require("multer");
//The variable for storage settings we made in our cloudinary
//folder at index.js, no need to specify file name since
//index.js is the default place where it will look.
const { storage } = require("../cloudinary");

//Our req.file/files for our image will include a link, which
//takes us directly to the image in the web at the cloudinary
//website. A unique name is given to each to prevent conflicts.
//All uploads can be seen in the website in our collection.
//We can make use of filename and path key values.
/////////////////////////////////////////////////////////

//This is for a local save of files
// const upload = multer({ dest: "uploads/" });

//And this is for our storage settings instead
const upload = multer({ storage });

//Put logic in controllers folder, imported and used

//WITH ROUTER.ROUTE() WE CAN GROUP ALL ROUTES WITH SAME VERB
//IN A SAME PLACE, WE CAN REMOVE THE PREFIX/VERB FROM
//EACH INDIVIDUAL ROUTE, AND ONLY USE IT AT THE BEGINNING

//BEFORE
// router.get("/", catchAsync(campgrounds.index));

// router.post(
//   "/",
//   isLoggedIn,
//   validateCampground,
//   catchAsync(campgrounds.createCampground)
// );

//AFTER
router
  .route("/")
  .get(catchAsync(campgrounds.index))
  //ORIGINAAAAAAAAAAAAAAAAAAL
  // .post(
  //   isLoggedIn,
  //   validateCampground,
  //   catchAsync(campgrounds.createCampground)
  // );

  //Image uploading needs npm i molter, empty object sent otherwise
  //Gives us req.body/file/files to use
  //We require it, then execute it with a path to save to
  //(local or other)
  //we use the methods available, upload, with .single/.array etc.
  //.array would need the attribute "multiple" in our input element
  //also, it can only be accesses with req.files
  //the name in quotes is the name we gave our input with type of file.

  //NEWEEEEEEEEEEEEEEEER
  // .post(upload.single("image"), (req, res) => {
  //   // res.send(req.body)
  //   console.log(req.body, req.file);
  //   res.send("IT WORKED");
  // });

  //NEWEEEEEEEEEEESSSSTTTTTTT
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.createCampground)
  );

//This path goes BEFORE :id, SINCE "new" IS CONFUSED with an ID
//STAND-ALONE, ONLY ONE ROUTE WITH THIS PREFIX
router.get("/new", isLoggedIn, catchAsync(campgrounds.renderNewForm));

router
  .route("/:id")
  //SHOW campground details
  .get(catchAsync(campgrounds.showCampground))
  //REMEMBER, we need to npm i method.override
  //to override when we need a put/patch request!!!
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  )
  //DELETE CAMPGROUND
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

//STAND-ALONE, ONLY ONE ROUTE WITH THIS PREFIX
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
