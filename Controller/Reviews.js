const Review=require('../models/review')
const { model } = require('mongoose')
const Campground=require('../models/campground')
const flash=require('connect-flash')

module.exports.createReview=async(req,res)=>{
    const campground=await Campground.findById(req.params.id);
    console.log(req.body)
    const review= new Review(req.body.Review)
    review.reviewAuthor=req.user._id
    campground.reviews.push(review) //adding objectID in the campground review section
    review.save();
    campground.save(); 
    req.flash('success', 'Successfuly created review')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteReview=async(req,res)=>{
    const {id, reviewId}=req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
    const del=await Review.findByIdAndDelete(reviewId)
    req.flash('success', 'Successfuly deleted review')
    res.redirect(`/campgrounds/${id}`)
}