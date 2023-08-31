// whenever we call a route we are redefining the validation joi schema therefore making file
   // before mongoose valiation joi is validating before saving in db
    // joi schema is not mongoose schema

const Basejoi=require('joi');
const sanitizeHtml=require('sanitize-html');
// adding extension escapeHtml to joi.string as base for preventing form XSS that is passing any script or html
// tag from the form 
const extension=(Basejoi)=>({
    type:'string',
    base:Basejoi.string(),
    messages:{
        'string.escapeHTML': '{{#label}} must not include HTML'
    },
    rules:{
        escapeHTML:{
            validate(value, helpers)
            {
                const clean=sanitizeHtml(value, {
                    allowedTags:[],
                    allowedAttributes:{},
                });
                if(clean!=value){return helpers.error('string.escapeHTML', {value});}
                return clean;
            }
        }
    }
})

const joi = Basejoi.extend(extension)

// Validation Schema for Campground
// We are using two joi object as we have a campground as an array inside it we keys ie campground[title, price]-parse to object in reqbody
// therefore campgorund is required
module.exports.campgroundSchema=joi.object({
    campground: joi.object({
        title:joi.string().required().escapeHTML(),
        price:joi.number().required().min(0),
        description:joi.string().required().escapeHTML(),
        location:joi.string().required().escapeHTML(),
        // image:joi.string().required()
    }).required(),
    //to delete uploded image we have validate it as req.body is validated
    deleteImages:joi.array()
})

// Validation for Review
module.exports.reviewSchema=joi.object({
    Review:joi.object({
        body: joi.string().required().escapeHTML(),
        rating:joi.number().required().min(1).max(5)
    }).required()
})