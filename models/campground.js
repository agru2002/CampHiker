const mongoose=require('mongoose');
const Review = require('./review');
// const { campgroundSchema } = require('../schema');
const Schema=mongoose.Schema;

const imageSchema=new Schema({
    url:String,
    filename:String
})
// thisschema is used for applying virtual
imageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_200');
});
const opt={toJSON:{virtuals : true}}
const campgroundSchema=new Schema({
    title: String,
    price:Number,
    geometry: {
        type: {
          type: String, // Don't do `{ geometry: { type: String } }`
          enum: ['Point'], // 'geometry.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number], //array of no.(coordinates)
          required: true
        }
      },
    location:String,
    images:[imageSchema],   //nested schema
    description:String,
    // one to one relationship therfore do not use array like review
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[{
        type:Schema.Types.ObjectId,
        ref:'Review'
    }]

},opt)
campgroundSchema.virtual('properties.popUp').get(function(){
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></Strong>`  //this refer to the document(campground) we are find via api call
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