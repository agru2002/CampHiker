// import and configure dotenv:
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const joi = require("joi"); //use joi for server side validation
const { campgroundSchema, reviewSchema } = require("./joischema");
const ejs = require("ejs");
const ejsMate = require("ejs-mate");
const path = require("path");
const Campground = require("./models/campground");
const Review = require("./models/review");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet"); //security purpose setting http headers
const mongoStore = require("connect-mongo");

// requiring routes
const campgroundrouter = require("./routes/campgrounds");
const reviewrouter = require("./routes/review");
const userrouter = require("./routes/user");

const cacheAsync = require("./Utils/cacheAsync"); //function to catch async error
const ExpressError = require("./Utils/ExpressError"); //class for error
const sanitize = require("sanitize-html");

const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/Yelp-Camp"; //url for connecting with cloud database
mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database Connected");
  })
  .catch(() => {
    console.log("Database Connection Error");
  });

// configurations-arrangment
// setting template engine
app.engine("ejs", ejsMate); //layout, partial and block template functions for the EJS template engine important
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// parsing request for req.body
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public"))); //serving static folder-file public thats why we don't do /public/..- we are seeing inside it
//By default, $ and . characters are removed completely from user-supplied input in the following places:
// - req.body,req.params,req.headers,req.query
// app.use(mongoSanitize());
app.use(
  // Or, to replace these prohibited characters with _, use:
  mongoSanitize({
    replaceWith: "_",
  })
);

// using before setting router
// Setting session and sending cookie back
const secret = process.env.SECRET || "thisshouldbemysecret";
sessionConfig = {
  store: mongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
      secret,
    },
    touchAfter: 24 * 3600, //time period in second every 24 hours update // don't want to resave all the session on database every single time that the user refreshes the page, you can lazy update the session, by limiting a period of time.
    //14 days //if session had expiration date it will use otherwise we can set ttl to 14 as default
  }), //store the session config in store
  name: "session", //we can come up with different name insted of deflault name(connect.sid) in browsing so we can prevent attackers form stealing cookie using default name
  secret,
  saveUninitialized: true, //do you want to save empty value in session
  resave: false, //do you want to resave session variable without changes
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //form now date to 7 day in millisecond- 1sec-1000 millisecond * 1 min * 60min * 24 hour * days
    maxAge: 1000 * 60 * 60 * 24 * 7,
    // secure: true, //cookie can only be configured over secure connecition (i.e Https) though our localhost is not secure(https not) therfore we can't login
    httpOnly: true, //Used for Security XSS(Cross-Site - Scripting) //cookie is not accessible via javascript eg. console.log(document.cookie)
  },
};
app.use(session(sessionConfig));
// middleware for flash requiring at all pagesItemplates)
app.use(flash());

// Should be after the session() to ensure that login session is restored in correct order
app.use(passport.initialize()); // middleware to intialize passport
app.use(passport.session()); // middleware if application uses persistent login session vs having to login in every single request
passport.use(new LocalStrategy(User.authenticate())); //passport is using the local strategy for which the authentication method is lcoated on user model-coming form passportlocalMngoose

passport.serializeUser(User.serializeUser()); //how to store the user in session
passport.deserializeUser(User.deserializeUser()); //how to get user form session


// flashing messages in all templates comes from mongoose
// now we access of success in all templates
// (success -variable, req.flash('success')-value to that variable)
app.use((req, res, next) => {
  // console.log(req.session.passport)
  res.locals.currentUser = req.user; //access of currentUser in all template
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

const myMiddleware = (req, res, next) => {
  // console.log(req.session.returnTo)
  req.redirectUrl = req.session.returnTo || "/campgrounds";
  next();
};
app.use("*", myMiddleware);

// login on every single request which is you often do with API's?

//Setting to use router in server page  app.use('common prefix path', router file)
app.use("/campgrounds", campgroundrouter);
app.use("/campgrounds/:id/reviews", reviewrouter);
app.use("/", userrouter);

app.get("/", async (req, res) => {
  res.render("home");
});

// If you pass anything to the next() function (except the string 'route' or 'router' ),
// Express regards the current request as being an error and will skip any remaining non-error handling routing and middleware functions.
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Campground Not found"));
});

app.use((err, req, res, next) => {
  // console.log(cache)
  // by defau;t message cannot pass through the render as
  // it first extracting and then giving default message
  // we have to make object's message by default
  const { message = "Page Not Found", status = 500 } = err; //object destructuring key name should be same
  err.message = message; //Array destructuring order should be same
  res.status(status).render("error.ejs", { err });
});

const port = process.env.PORT || "3000";
app.listen(port, () => {
  console.log(`Server up at port no. ${port}`);
});
