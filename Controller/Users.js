const Review=require('../models/review')
const { model } = require('mongoose')
const Campground=require('../models/campground')
const flash=require('connect-flash')
const User=require('../models/user');
const passport = require('passport');


module.exports.renderRegister=(req,res)=>{
    res.render('Users/register.ejs')
}

module.exports.register=async (req, res)=>{
    try{
    console.log(req.body)
    const {username, password, email}=req.body;
    const user= new User({email: email, username:username })
    const registeredUser=await User.register(user, password) //save at database automatically having salt and hash, user and email
    console.log(registeredUser);

    // used for automatically sign in after sign up- establish the login session-fixing register route
    req.login(registeredUser, function(err){
        if(err){return next(err);}
        req.flash('success', 'Welcome to Yelp-camp')
        res.redirect('/campgrounds')
    })

    }
    catch(e)
    {
        req.flash('error', e.message)
        res.redirect('/register')
    }
}

module.exports.renderLogin=(req,res)=>{
    res.render('Users/login.ejs')
}

module.exports.login=(req,res)=>{
    // console.log(redirectUrl)
    // const redirectUrl=req.session.returnTo
    res.redirect(req.redirectUrl)
    // console.log(req.redirectUrl)
}

module.exports.logout=function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash('success', 'Successfuly logout')
      res.redirect('/campgrounds');
    });
  }