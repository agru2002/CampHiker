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
    for(let  i=1; i<=50; i++){
    const price=Math.floor(Math.random()*30)+10;
    const title=`${sample(descriptors)} ${sample(places)}`
    const random1000=Math.floor(Math.random()*1000)
    const camp =new Campground({location:`${cities[random1000].city}, ${cities[random1000].state}`,
    title: title, image:'http://source.unsplash.com/collection/484351',
    description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque sed natus libero Quaerat enim eum earum nostrut',
    price:price})
    await camp.save();
    }
    
}

seedDB().then(()=>{
  mongoose.connection.close();
})

