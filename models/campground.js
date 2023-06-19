const mongoose=require('mongoose');
const Review = require('./review');
// const { campgroundSchema } = require('../schema');
const Schema=mongoose.Schema;

const campgroundSchema=new Schema({
    title: String,
    price:Number,
    location:String,
    image : String,
    description:String,
    reviews:[{
        type:Schema.Types.ObjectId,
        ref:'Review'
    }]
})

// To delete a Campground with all of its review in its Database and reference 
// we have to use mongoose query  middleware in which middle. fuc. is trigger by perfoming that query in route 
// post middleware so that we can access that deleted doc
// findByIdAndDelete trigger the findOneAndDelete middleware
// mongoose middleware applies in Schema
campgroundSchema.post('findOneAndDelete', async function(doc){
    if(doc.reviews){
        await Review.deleteMany( {_id : {$in: doc.reviews }})
    }
})

module.exports=mongoose.model('Campground', campgroundSchema);