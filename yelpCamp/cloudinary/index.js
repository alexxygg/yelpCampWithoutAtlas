//Packages need to be installed first, v2 needed in docs
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

//This configuration is based on they names we gave each
//of these values in our .env file, the lowercase names are
//required exactly as shown, we matched them to prevent confusion.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});
//We define a storage variable with our cloudinary module
//also the folder where we will save any files, and we specify
//the allowed formats to be uploaded.
const storage = new CloudinaryStorage({
  cloudinary,
  //Needs to be structured this way for it to work!!!
  params: {
    folder: "YelpCamp",
    allowedFormats: ["jpeg", "png", "jpg"],
  },
});

//We export our module and storage settings
module.exports = {
  cloudinary,
  storage,
};
