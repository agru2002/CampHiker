// import and configure dotenv:
if(process.env.NODE_ENV!=="production"){
    require('dotenv').config();
}


const express=require('express')
const app=express();
const mongoose=require('mongoose');
const joi=require('joi') //use joi for server side validation
const {campgroundSchema, reviewSchema}=require('./joischema')
const ejs= require('ejs');
const ejsMate=require('ejs-mate');
const path =require('path');
const Campground=require('./models/campground');
const Review=require('./models/review')
const methodOverride=require('method-override');
const session=require('express-session')
const flash=require('connect-flash')
const passport=require('passport')
const LocalStrategy=require('passport-local')
const User=require('./models/user')

// requiring routes
const campgroundrouter=require('./routes/campgrounds')
const reviewrouter=require('./routes/review')
const userrouter=require('./routes/user')


const cacheAsync=require('./Utils/cacheAsync') //function to catch async error
const ExpressError=require('./Utils/ExpressError');  //class for error


mongoose.connect('mongodb://127.0.0.1:27017/Yelp-Camp',
{useNewUrlParser: true, useUnifiedTopology: true} )
.then(()=>{
    console.log("connection on")
})
.catch(()=>{
    console.log("connection error")
})

// configurations-arrangment
// setting template engine
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs' );
app.set('views', path.join(__dirname, 'views'))


// using before setting router
// Setting session and sending cookie back
sessionConfig={
    secret:"thisismysecret",
    saveUninitialized:true,  //do you want to save empty value in session
    resave:false, //do you want to resave session variable without changes
    cookie:{
        expires:Date.now() + 1000 * 60 * 60 * 24 * 7, //form now date to 7 day in millisecond- 1sec-1000 millisecond * 1 min * 60min * 24 hour * days
        maxAge:1000 * 60 * 60 * 24 * 7,
        httpOnly:true //Used for Security XSS(Cross-Site - Scripting)
    }

}
app.use(session(sessionConfig))
// middleware for flash requiring at all pagesItemplates)
app.use(flash());


// Should be after the session() to ensure that login session is restored in correct order
app.use(passport.initialize()) // middleware to intialize passport
app.use(passport.session()) // middleware if application uses persistent login session vs having to login in every single request
passport.use(new LocalStrategy(User.authenticate())) //passport is using the local strategy for which the authentication method is lcoated on user model-coming form passportlocalMngoose

passport.serializeUser(User.serializeUser())//how to store the user in session
passport.deserializeUser(User.deserializeUser())//how to get user form session

// flashing messages in all templates comes from mongoose
// now we access of success in all templates
// (success -variable, req.flash('success')-value to that variable)
app.use((req,res,next)=>{
    // console.log(req.session)
    res.locals.currentUser=req.user; //access of currentUser in all template
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next();
})

const myMiddleware=(req,res,next)=>{
    // console.log(req.session.returnTo)
    req.redirectUrl=req.session.returnTo ||'/campgrounds'
    next();
}
app.use('*', myMiddleware)


// parsing request for req.body
app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname, 'public')))  //serving static folder-file public thats why we don't do /public/..- we are seeing inside it

// login on every single request which is you often do with API's? 

//Setting to use router inn server page  app.use('common prefix path', router file)
app.use('/campgrounds', campgroundrouter);
app.use('/campgrounds/:id/reviews', reviewrouter);
app.use('/', userrouter );



app.get('/', async (req,res)=>{
    const Camp=new Campground({title:'My Campground', description:'Cheap Campground'})
    await Camp.save()
    res.send(Camp)
    // res.render('home.ejs')
})



// If you pass anything to the next() function (except the string 'route' or 'router' ),
// Express regards the current request as being an error and will skip any remaining non-error handling routing and middleware functions.
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

