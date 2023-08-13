const mongoose =require('mongoose');
const passportLocalMongoose=require('passport-local-mongoose')

const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true //i don't exact waht it is but it makes email unique of each document
    }
})

// also add methods, plugin- means adding somethings
userSchema.plugin(passportLocalMongoose) //it will add hash, salt, username field to store the username and hashed password and salt value

module.exports=mongoose.model('User', userSchema);