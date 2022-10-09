const Campground = require("../models/campground");

//For Mapbox geocoding, after installing the node client
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
//We reference our .env token for MapBox and save to variable
const mapBoxToken = process.env.MAPBOX_TOKEN;
//We can now use it under the default name accessToken in our
//geocoding node client, and save it to a variable
//It will give us access to methods forward and reverse geocode
//We can now continue to our createCampground controller here
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

//To delete from cloudinary hosting site
const { cloudinary } = require("../cloudinary");

//ALL LOGIC FOR CAMPGROUNDS ROUTES

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  // res.send(req.body);
  // if (!req.body.campground)
  //   throw new expressError("INVALID CAMPGROUND DATA", 400);

  //Regarding mapbox geocoding, query and limit(default:5)
  //We save it to a variable too, await for results to be returned.
  const geoData = await geocoder
    .forwardGeocode({
      // query: "Yosemite, CA",
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  //WE HARDCODED THIS LOCATION ABOVE FIRST, THEN WE OBTAINED IT
  //FROM THE REQUEST INFO FOR LOCATION

  const campground = new Campground(req.body.campground);

  //We can see specifics for the object by specifying more.
  // console.log(geoData);
  //This gives us [longitude,latitude], (Opposite of Google Maps)
  // console.log(geoData.body.features[0].geometry.coordinates);
  // res.send("DONE, COORDINATES:", geoData.body.features[0].geometry.coordinates);
  //We continue at our schema, making it match the object returned
  //from geoData.body.features[0].geometry (WITHOUT coordinates)

  //We save it to shorten future code, and have access to the
  //object's keys from our schema, including coordinates
  campground.geometry = geoData.body.features[0].geometry;
  ///////////////////

  //FOR IMAGE UPLOADING TO WEBPAGE
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));

  campground.author = req.user._id;
  await campground.save();
  //Our flash alert, AFTER making sure it is saved.
  req.flash("success", "New campground created successfully!");
  res.redirect(`/campgrounds/${campground._id}`);
  // res.redirect("/campgrounds");
};

module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");
  if (!campground) {
    req.flash("danger", "Could not find requested campground!");
    return res.redirect("/campgrounds");
  }
  console.log(campground);
  //Here we include our flash alert.
  res.render("campgrounds/show", { campground });
  // { campground, msg: req.flash("success") }
};

module.exports.renderEditForm = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  //No campground found
  if (!campground) {
    req.flash("danger", "Could not find requested campground!");
    return res.redirect("/campgrounds");
  }

  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  //Instead of finding and updating, we check if logged in user
  //is the author first, if so we continue
  //WE MADE MIDDLEWARE FOR IT
  // const campground = await Campground.findById(id);
  // if (!campground.author.equals(req.user._id)) {
  //   req.flash("error", "You do not have permission to do that.");
  //   return res.redirect(`/campgrounds/${campground._id}`);
  // }
  //TO SEE IMAGES WE ARE DELETING WHEN EDITING CAMP
  console.log(req.body);
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  //FOR IMAGE UPLOADING TO WEBPAGE
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.images.push(...imgs);
  await campground.save();
  ///////////////////////////
  //To delete the images we checked when editing camp
  if (req.body.deleteImages) {
    // At this point they are deleted from cloudinary,
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    } // At this point they are deleted from MongoDB,
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
    console.log(campground);
  }
  ////////////////////////////////
  req.flash("success", "Campground updated successfully!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Campground deleted successfully!");
  res.redirect("/campgrounds");
};
