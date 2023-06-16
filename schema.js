// whenever we call a route we are redefining the validation joi schema therefore making file
   // before mongoose valiation joi is validating before saving in db
    // joi schema is not mongoose schema

const joi=require('joi');
const campgroundSchema=joi.object({
    campground: joi.object({
        title:joi.string().required(),
        price:joi.number().required().min(0),
        description:joi.string().required(),
        location:joi.string().required(),
        image:joi.string().required()
    }).required()
})
module.exports=campgroundSchema;