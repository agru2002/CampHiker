const { model } = require('mongoose')
const Campground=require('../models/campground')
const flash=require('connect-flash')

// in some framework there are strict contventional nemes for router function  and folder name should be controller
module.exports.index=async (req,res)=>{
    const campgrounds=await Campground.find({});
    res.render('Campgrounds/index.ejs', {campgrounds})
}

module.exports.showCampground=async (req, res)=>{
    const {id}=req.params;
    const campground=await Campground.findById(id).populate({path:'reviews',populate:{path:'reviewAuthor'}}).populate('author') //populating the reviews- we can  full review
    // eg - if someone bookmark than show page and got deleted in server then campground didn't exist
    const author=campground.author
    // console.log(campground)
    if(!campground){
        req.flash('error', 'Campground not found')
        return res.redirect('/campgrounds')
    }
    res.render('Campgrounds/show', {campground, author})
}

module.exports.renderNewForm=(req, res)=>{
    // if(!req.isAuthenticated()){
    //     console.log(req.isAuthenticated())
    //     req.flash('error', 'User must be login')
    //     return res.redirect('/login')
    // }
    res.render('Campgrounds/new')
}

module.exports.newCampground=async (req, res)=>{ 
    // if(!req.body.campground) {throw new ExpressError(400, "Invalid Data")}
    const {campground}=req.body;
    campground.author=req.user._id
    // console.log(campground.title, campground.location, campground)
    const newCampground=new Campground(campground)
    await newCampground.save()
    console.log(flash)
    req.flash('success', 'Successfuly created new Campground')
    res.redirect(`/campgrounds/${newCampground._id}`)//status code :302
}

module.exports.renderEditForm=async (req, res)=>{
    // We need id to prepopulat the form by finding that campground
    const {id}=req.params;
    const campground=await Campground.findById(id);
    // console.log(campground)
    if(!campground){
        req.flash('error', 'Campground not found')
        return res.redirect('/campgrounds')
    }
    res.render('Campgrounds/Edit', {campground})
}

module.exports.editCampground=async (req, res)=>{
    const {id}= req.params;
    // const campground=await Campground.findById(id);
    // if(!campground.author.equals(req.user._id))
    // {
    //     req.flash('error', 'Update can done by author of campground')
    //     return res.redirect(`/campgrounds/${id}`)
    // }
    const {campgroundUpdated} = req.body;
    // console.log({campgroundUpdated})
    // console.log({...campgroundUpdated})
    const camp=await Campground.findByIdAndUpdate(id, campgroundUpdated);
    console.log(camp)
    req.flash('success', 'Successfuly Updated Campground')
    res.redirect(`/campgrounds/${camp._id}`)
}

module.exports.deleteCampground=async (req, res)=>{
    const {id}=req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfuly deleted Campground')
    res.redirect('/campgrounds');
}

