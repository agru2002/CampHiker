// whenever we call a route we are redefining the validation joi schema therefore making file
   // before mongoose valiation joi is validating before saving in db
    // joi schema is not mongoose schema

const joi=require('joi');
const { deleteCampground } = require('./Controller/Campgrounds');

// Validation Schema for Campground
// We are using two joi object as we have a campground as an array inside it we keys ie campground[title, price]-parse to object in reqbody
// therefore campgorund is required
module.exports.campgroundSchema=joi.object({
    campground: joi.object({
        title:joi.string().required(),
        price:joi.number().required().min(0),
        description:joi.string().required(),
        location:joi.string().required(),
        // image:joi.string().required()
    }).required(),
    //to delete uploded image we have validate it as req.body is validated
    deleteImages:joi.array()
})

// Validation for Review
module.exports.reviewSchema=joi.object({
    Review:joi.object({
        body: joi.string().required(),
        rating:joi.number().required().min(1).max(5)
    }).required()
})