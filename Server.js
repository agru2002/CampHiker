const express=require('express')
const app=express();
const mongoose=require('mongoose');
const ejs= require('ejs');
const path =require('path');
const Campground=require('./models/campground');
const methodOverride=require('method-override')


mongoose.connect('mongodb://127.0.0.1:27017/Yelp-Camp',
{useNewUrlParser: true, useUnifiedTopology: true} )
.then(()=>{
    console.log("connection on")
})
.catch(()=>{
    console.log("connection error")
})

// parsing request for req.body
app.use(express.urlencoded({extended:true}))
app.use(methodOverride("_method"))
// setting template engine
app.set('view engine', 'ejs' );
app.set('views', path.join(__dirname, 'views'))

app.get('/', async (req,res)=>{
    const Camp=new Campground({title:'My Campground', description:'Cheap Campground'})
    await Camp.save()
    res.send(Camp)
    // res.render('home.ejs')
})

// Deleting the campground
app.delete('/campgrounds/:id', async (req, res)=>{
    const {id}=req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

// Edit Existing Campground
app.get('/campgrounds/:id/edit', async (req, res)=>{
    // We need id to prepopulat the form by finding that campground
    const {id}=req.params;
    const campground=await Campground.findById(id);
    console.log(campground)
    res.render('Campgrounds/Edit', {campground})
})
app.put('/campgrounds/:id', async (req, res)=>{
    const {id}= req.params;
    const {campground} = req.body;
    console.log({campground})
    console.log({...campground})
    const camp=await Campground.findByIdAndUpdate(id, campground);
    res.redirect(`/campgrounds/${camp._id}`)
})


// Adding New Campground
app.get('/campgrounds/new', (req, res)=>{
    res.render('Campgrounds/new')
})
app.post('/campgrounds', async (req, res)=>{
    const {campground}=req.body;
    console.log(campground.title, campground.location, campground)
    const newCampground=new Campground(campground)
    await newCampground.save()
    res.redirect(`/campgrounds/${newCampground._id}`)//status code :302
})

// Details of the each campground
app.get('/campgrounds/:id', async (req, res)=>{
    const {id}=req.params;
    const campground=await Campground.findById(id);
    res.render('Campgrounds/show', {campground})
})

// Viewing all campgrounds
app.get('/campgrounds', async (req,res)=>{
    const campgrounds=await Campground.find({});
    res.render('Campgrounds/index.ejs', {campgrounds})
})

app.listen('3000', ()=>{
    console.log("Server up at port no. 3000")
})