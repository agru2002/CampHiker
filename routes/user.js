const express=require('express');
const User=require('../models/user');
const cacheAsync = require('../Utils/cacheAsync');
const passport = require('passport');
const router=express.Router();
const users=require('../Controller/Users')

//passport uses helper method. It uses the session to be clear and store its own stuff
//helper method is called isAuthenticated. It is automatically added to request object

router.route('/register')
    .get(users.renderRegister )
    .post(cacheAsync (users.register))

// get form for register
// router.get('/register', users.renderRegister )

// we are just registering not logging
// why we need cacheasync if we are using the try& catch?
// router.post('/register', cacheAsync (users.register))

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', {failureRedirect:'/login', failureFlash:true}), users.login)


// router.get('/login', users.renderLogin)

// Passport is used as middleware within a web application to authenticate requests.
// //this line(passport authenticate) will authenticate using local and can be apply to multiple stratagy -its middleware 
    // options {failure..} are added to if authentication failed the flash the message and redirect it giving 302 status code
// router.post('/login', passport.authenticate('local', {failureRedirect:'/login', failureFlash:true}), users.login)

// previous version of req.logout()is synchronus and now it is asynchronus so need callback function
// post or delete should be used insted of get
// Invoking logout() will remove the req.user property and clear the login session (if any).
router.get('/logout', users.logout);

  // router.post('/logout', function(req,res,next){
//     // console.log(req.logout())
//     req.logout(function(err){
//         if(err){return next(err);}
//     });//termiate an existing login session
//     req.flash('success', 'Successfuly logout')
//     res.redirect('/campgrounds')
// })
module.exports=router;
