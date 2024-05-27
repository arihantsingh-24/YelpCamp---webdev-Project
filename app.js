const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const catchAysnc = require('./utils/catchAysnc');
const ExpressError = require('./utils/ExpressError');
const { descriptors } = require('./seeds/seedHelpers');


mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"))
db.once("open", ()=>{
    console.log("database connected app")
});

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname,'views'))

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.get('/',(req,res)=>{
    res.render('home')
})

app.get('/campgrounds', catchAysnc(async(req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}))

app.get('/campgrounds/new', catchAysnc(async(req,res)=>{
    res.render('campgrounds/new')
}))

app.post('/campgrounds', catchAysnc(async(req,res,next)=>{
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 404);
    const campgroundSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),
            price: Joi.number().required().min(0),
            image: Joi.string().required(),
            location: Joi.string().required(),
            description: Joi.string().required()             
        }).required()
    })
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    console.log(result);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.get('/campgrounds/:id', catchAysnc(async(req,res,)=>{
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', {campground});
}))

app.get('/campgrounds/:id/edit', catchAysnc(async(req,res,)=>{
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground});
}))

app.put('/campgrounds/:id', catchAysnc(async(req,res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}, { new: true })
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id', catchAysnc(async(req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

app.all('*', (req,res,next) => {
    next(new ExpressError('page not found', 404))
})

app.use((err, req, res, next) => {
    const {statusCode=500, message='error'} = err;
    if(!err.message) err.message = 'Oh No, something went Wrong!'
    res.status(statusCode).render('error', { err });
})

app.listen('3000', () => {
    console.log("server listening on port 3000");
})