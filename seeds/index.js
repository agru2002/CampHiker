const mongoose=require('mongoose');
const Campground=require('../models/campground');
const cities=require('./cities')
const {descriptors, places}=require('./seedHelpers')

mongoose.connect('mongodb://127.0.0.1:27017/Yelp-Camp',
{useNewUrlParser: true, useUnifiedTopology: true} )

const db=mongoose.connection;
db.on('error', console.error.bind(console, 'CONNECTION ERROR'));
db.once('open', ()=> {
  console.log("CONNECTED TO DATABASE");
});

const sample=(array)=>{
     return array[Math.floor(Math.random()* array.length)]
} 

const seedDB=async ()=>{
    await Campground.deleteMany({})
    for(let  i=1; i<=200; i++){
    const price=Math.floor(Math.random()*30)+10;
    const title=`${sample(descriptors)} ${sample(places)}`
    const random1000=Math.floor(Math.random()*1000)
    const author='64d37113de0ec18e2d63a7fc'
    const camp =new Campground({location:`${cities[random1000].city}, ${cities[random1000].state}`,
    author, title: title,
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque sed natus libero Quaerat enim eum earum nostrut',
    price:price,
    images: [
      {
        url: 'https://res.cloudinary.com/dzzdu9nj5/image/upload/v1692094976/YelpCamp/xqfnbqne0bwguvrqruby.jpg',
        filename: 'YelpCamp/xqfnbqne0bwguvrqruby'
      },
      {
        url: 'https://res.cloudinary.com/dzzdu9nj5/image/upload/v1692094979/YelpCamp/kjjzmn3ilswj6ymibqsm.jpg',
        filename: 'YelpCamp/kjjzmn3ilswj6ymibqsm'
      }
    ],
    geometry:{
      type:'Point',
      coordinates:[cities[random1000].longitude, cities[random1000].latitude]
    }
  })
    await camp.save();
    }
    
}

seedDB().then(()=>{
  mongoose.connection.close();
})

