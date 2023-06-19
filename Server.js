const express=require('express')
const app=express();
const mongoose=require('mongoose');
const joi=require('joi') //use joi for server side validation
const {campgroundSchema, reviewSchema}=require('./schema')
const ejs= require('ejs');
const ejsMate=require('ejs-mate');
const cacheAsync=require('./Utils/cacheAsync') //function to catch async error
const ExpressError=require('./Utils/ExpressError');  //class for error
const path =require('path');
const Campground=require('./models/campground');
const Review=require('./models/review')
const methodOverride=require('method-override');


mongoose.connect('mongodb://127.0.0.1:27017/Yelp-Camp',
{useNewUrlParser: true, useUnifiedTopology: true} )
.then(()=>{
    console.log("connection on")
})
.catch(()=>{
    console.log("connection error")
})

// parsing request for req.body
app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"))


// setting template engine
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs' );
app.set('views', path.join(__dirname, 'views'))

// middle ware for joi so that we are not defining on every route
const validateSchemaCampground=(req, res, next)=>{
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

const validateSchemaReviews=(req,res,next)=>{
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
app.get('/', async (req,res)=>{
    const Camp=new Campground({title:'My Campground', description:'Cheap Campground'})
    await Camp.save()
    res.send(Camp)
    // res.render('home.ejs')
})

// Deleting the campground
app.delete('/campgrounds/:id', cacheAsync(async (req, res)=>{
    const {id}=req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

// Edit Existing Campground
app.get('/campgrounds/:id/edit', cacheAsync(async (req, res)=>{
    // We need id to prepopulat the form by finding that campground
    const {id}=req.params;
    const campground=await Campground.findById(id);
    console.log(campground)
    res.render('Campgrounds/Edit', {campground})
}))
app.put('/campgrounds/:id', validateSchemaCampground, cacheAsync(async (req, res)=>{
    const {id}= req.params;
    const {campground} = req.body;
    console.log({campground})
    console.log({...campground})
    const camp=await Campground.findByIdAndUpdate(id, campground);
    res.redirect(`/campgrounds/${camp._id}`)
}))


// Adding New Campground
app.get('/campgrounds/new', (req, res)=>{
    res.render('Campgrounds/new')
})
app.post('/campgrounds', validateSchemaCampground, cacheAsync(async (req, res)=>{ 
    // if(!req.body.campground) {throw new ExpressError(400, "Invalid Data")}
    const {campground}=req.body;
    // console.log(campground.title, campground.location, campground)
    const newCampground=new Campground(campground)
    await newCampground.save()
    res.redirect(`/campgrounds/${newCampground._id}`)//status code :302
}))

// Details of the each campground
app.get('/campgrounds/:id', cacheAsync(async (req, res)=>{
    const {id}=req.params;
    const campground=await Campground.findById(id).populate('reviews') //populating the reviews- we can  full review
    console.log(campground)
    res.render('Campgrounds/show', {campground})
}))

// Viewing all campgrounds
app.get('/campgrounds',cacheAsync(async (req,res)=>{
    const campgrounds=await Campground.find({});
    res.render('Campgrounds/index.ejs', {campgrounds})
}))

// Posting Reviews for Campground
// Review post request for specific Campground
// catcheAsync is  used to catch error and pass it to error handler
// not executing the validateSchemaReviews-here
app.post('/campgrounds/:id/reviews', validateSchemaReviews, cacheAsync(async(req,res)=>{
    const campground=await Campground.findById(req.params.id);
    const review= new Review(req.body.Review)
    campground.reviews.push(review)
    review.save();
    campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

// Deleting single review of a specific campground 
// path-/campgrounds/:id/reviews/:reviewId- we need both id- What review has to be deleted of which campground
app.delete('/campgrounds/:id/reviews/:reviewId', cacheAsync(async(req,res)=>{
    const {id, reviewId}=req.params;
    await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewId}})
    const del=await Review.findByIdAndDelete(reviewId)
    res.redirect(`/campgrounds/${id}`)
}))


app.all('*', (req, res, next)=>{
   next(new ExpressError(404, "Campground Not found"))
})

app.use((err, req, res, next)=>{
    // console.log(cache)
    // by defau;t message cannot pass through the render as
    // it first extracting and then giving default message 
    // we have to make object's message by default
    const {message='Page Not Found', status=500, }=err; //object destructuring key name should be same
    err.message=message                                  //Array destructuring order should be same
    res.status(status).render('error.ejs', {err});
})

app.listen('3000', ()=>{
    console.log("Server up at port no. 3000")
})