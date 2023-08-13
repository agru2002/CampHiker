const ExpressError=require('./Utils/ExpressError')
const Campground=require('./models/campground')
const Review=require('./models/review')
const {campgroundSchema, reviewSchema}=require('./joischema')


// from this middleware we know user is logged in but which user -comes form passport
// access to particular user is done by the req.user-contain the information about the user- we don't have to look in session
// req.user is automatically filled with the deserialized information for session whereas session stored serialize user
module.exports.isLoggedIn=(req,res,next)=>{
    // console.log("REQ.USER...", req.user)
    // console.log(req.path, req.originalUrl) //gives the relativ path and absolute path of url 
    if(!req.isAuthenticated()){
        req.session.returnTo=req.originalUrl;
        req.flash('error', 'User must be sigined in')
        return res.redirect('/login')
    }
    next()
}

// change Password?
//// console.log("REQ.USER...", req.user)--currentuser helper - important in hiding  when login , logut and register to show
// REQ.USER... {
//     _id: new ObjectId("64d37113de0ec18e2d63a7fc"),
//     email: 'ankit1@gmail.com',
//     username: 'Ankit',
//     __v: 0
//   }

// middleware for the campground authorization
module.exports.isAuthor=async (req,res,next)=>{
    const {id}= req.params;
    const campground=await Campground.findById(id);
    if(!campground.author.equals(req.user._id)) //if logged in user is not equal to owner user
    {
        req.flash('error', 'Access denied, authorized user can access ')
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

//middleware for review authorization means only author can delete its reviews
module.exports.isReviewAuthor=async (req,res,next)=>{
    const {id, reviewId}= req.params;
    const review=await Review.findById(reviewId);
    if(!review.reviewAuthor.equals(req.user._id)) //if logged in user is not equal to owner user
    {
        req.flash('error', 'Access denied, authorized user can access ')
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

// middle ware for joi so that we are not defining on every route
module.exports.validateSchemaCampground=(req, res, next)=>{
    // console.log(campgroundSchema)
    // we are just looking at if there is error or not , not handling it
    const result=campgroundSchema.validate(req.body)
    // console.log(result.error.details) //array of objects,if not error- it give just object of result-log(result)

    if(result.error){
        // el=>el.mssg === el=>{return el.mssg}
        const mssg=result.error.details.map(el=>{return el.message}).join(',')
        console.log(mssg)
        throw new ExpressError(400, mssg)
    }else{
        next()
    }
}

module.exports.validateSchemaReviews=(req,res,next)=>{
    // console.log(reviewSchema)
    const result = reviewSchema.validate(req.body);
    if(result.error){
        // el=>el.mssg === el=>{return el.mssg}
        const mssg=result.error.details.map(el=>{return el.message}).join(',')
        console.log(mssg)
        throw new ExpressError(400, mssg)
    }else{
        next()
    }
}

