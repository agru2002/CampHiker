const express=require('express')
const router=express.Router({ mergeParams:true });  //mergeParams- cannot acces id -Preserve the req.params values from the parent router if false(default).
const cacheAsync=require('../Utils/cacheAsync')
const ExpressError=require('../Utils/ExpressError')
const Review=require('../models/review')
const Campground=require('../models/campground')
const methodOverride=require('method-override')
// const {campgroundSchema, reviewSchema}=require('../joischema')
const {isLoggedIn, isreviewAuthor, validateSchemaReviews, isReviewAuthor}=require('../middleware')
const reviews=require('../Controller/Reviews')


// Posting Reviews for Campground
// Review post request for specific Campground
// catcheAsync is  used to catch error and pass it to error handler
// not executing the validateSchemaReviews-here
router.post('/', isLoggedIn, validateSchemaReviews, cacheAsync(reviews.createReview))

// Deleting single review of a specific campground 
// path-/campgrounds/:id/reviews/:reviewId- we need both id- What review has to be deleted of which campground
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, cacheAsync(reviews.deleteReview))

module.exports=router