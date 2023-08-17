const express=require('express');
const router=express.Router();
const cacheAsync=require('../Utils/cacheAsync')
// const ExpressError=require('../Utils/ExpressError')
// const Campground=require('../models/campground')
const methodOverride=require('method-override')
const {isLoggedIn, isAuthor, validateSchemaCampground}=require('../middleware')
// const {campgroundSchema, reviewSchema}=require('../joischema')
// const flash=require('connect-flash')
const campgrounds=require('../Controller/Campgrounds')
const multer=require('multer')
const {storage}=require('../Cloudinary/index') //indwx written is not neccessary as node looking for index firstly
const upload=multer({storage})

//linking same path having multiple verbs
router.route('/')
    .get(cacheAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateSchemaCampground, cacheAsync(campgrounds.newCampground))
    //upload.array('fieldname -name attribute of inpute') is neccessary for populating the req.body and req.files


// Form for New Campground
router.get('/new', isLoggedIn,  campgrounds.renderNewForm) //middleware isn post used for server side validation //should be before /:id


router.route('/:id')
    .get(cacheAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateSchemaCampground, cacheAsync(campgrounds.editCampground))
    .delete(isLoggedIn, isAuthor, cacheAsync(campgrounds.deleteCampground))

// Viewing all campgrounds
// router.get('/',cacheAsync(campgrounds.index))

// Details of the each campground
// router.get('/:id', cacheAsync(campgrounds.showCampground))


// Adding new Campground
// router.post('/', isLoggedIn, validateSchemaCampground, cacheAsync(campgrounds.newCampground))

// Edit Existing Campground
router.get('/:id/edit', isLoggedIn, isAuthor, cacheAsync(campgrounds.renderEditForm))

// Save Changes
// router.put('/:id', isLoggedIn, isAuthor, validateSchemaCampground, cacheAsync(campgrounds.editCampground))

// Deleting the campground
// Ctrl+D->editing cursor more then one
// router.delete('/:id', isLoggedIn, isAuthor, cacheAsync(campgrounds.deleteCampground))











module.exports=router