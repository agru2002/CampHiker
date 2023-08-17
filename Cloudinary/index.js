const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Setting Cloudinary Configuration for secure api calls to cloudinary
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_KEY,
    api_secret:process.env.CLOUDINARY_SECRET
})

// Setting up instance of cloudinary storage in this file
const storage=new CloudinaryStorage({
    cloudinary,
    params:{
        folder:'YelpCamp',
        allowedFormate:['jpeg', 'png', 'jpg']
    }
})

module.exports={
    cloudinary,
    storage
}