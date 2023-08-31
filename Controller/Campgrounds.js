const { model } = require("mongoose");
const Campground = require("../models/campground");
const flash = require("connect-flash");
const campground = require("../models/campground");
const { cloudinary } = require("../Cloudinary");

// The service client exposes methods that create requests.
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding"); //this path comes form github from package of mapbox
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken }); //instantiate geocoding

// in some framework there are strict contventional nemes for router function  and folder name should be controller
module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("Campgrounds/index.ejs", { campgrounds });
};

module.exports.showCampground = async (req, res) => {
  const { id } = req.params;

  const campground = await Campground.findById(id)
    .populate({ path: "reviews", populate: { path: "reviewAuthor" } })
    .populate("author"); //populating the reviews- we can  full review
  // eg - if someone bookmark than show page and got deleted in server then campground didn't exist
  const author = campground.author;

  if (!campground) {
    req.flash("error", "Campground not found");
    return res.redirect("/campgrounds");
  }
  res.render("Campgrounds/show", { campground, author });
};

module.exports.renderNewForm = (req, res) => {
  // if(!req.isAuthenticated()){
  //     console.log(req.isAuthenticated())
  //     req.flash('error', 'User must be login')
  //     return res.redirect('/login')
  // }
  res.render("Campgrounds/new");
};

module.exports.newCampground = async (req, res) => {
  // if(!req.body.campground) {throw new ExpressError(400, "Invalid Data")}
  // console.log(campground.title, campground.location, campground)
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1, //limit is much more useful in reverse geocoding, limit means no. of result of that query
    })
    .send();
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry;
  campground.author = req.user._id;
  campground.images = req.files.map((obj) => {
    return { url: obj.path, filename: obj.filename };
  }); //looping and creating an array of object in images having url and filename of image file
  await campground.save();
  //   console.log(campground);
  req.flash("success", "Successfuly created new Campground");
  res.redirect(`/campgrounds/${campground._id}`); //status code :302
};

module.exports.renderEditForm = async (req, res) => {
  // We need id to prepopulat the form by finding that campground
  const { id } = req.params;
  const campground = await Campground.findById(id);
  console.log(campground.images);
  if (!campground) {
    req.flash("error", "Campground not found");
    return res.redirect("/campgrounds");
  }
  res.render("Campgrounds/Edit", { campground });
};

module.exports.editCampground = async (req, res) => {
  const { id } = req.params;
  // const campground=await Campground.findById(id);
  // if(!campground.author.equals(req.user._id))
  // {
  //     req.flash('error', 'Update can done by author of campground')
  //     return res.redirect(`/campgrounds/${id}`)
  // }
  const { campgroundUpdated } = req.body;
  console.log(req.body);
  // console.log({...campgroundUpdated})
  const campground = await Campground.findByIdAndUpdate(id, campgroundUpdated);
  const imageObject = req.files.map((obj) => {
    return { url: obj.path, filename: obj.filename };
  });
  campground.images.push(...imageObject);
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename); //this will delete the file form cloudinary
    }
    campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    }); //this remove campground image from mongo server //pull or remove images having filename is in req.body.deleteCampground array
  }
  await campground.save();
  req.flash("success", "Successfuly Updated Campground");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfuly deleted Campground");
  res.redirect("/campgrounds");
};
