const express = require('express');
const router = express.Router();
const catchAysnc = require('../utils/catchAysnc');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review.js');
const {campgroundSchema} = require('../schema.js');
const {isLoggedIn} = require('../middleware.js');

const validateCampground = (req,res,next) => {

    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }else{
        next();
    }
}

router.get('/', catchAysnc(async(req,res)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}))

router.get('/new', isLoggedIn ,(req,res)=>{
    res.render('campgrounds/new')
})

router.post('/', isLoggedIn ,validateCampground,catchAysnc(async(req,res,next)=>{
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 404);
    console.log(req.body);
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'successfully made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.get('/:id', catchAysnc(async(req,res,)=>{
    const campground = await Campground.findById(req.params.id).populate('reviews')
    // console.log(campground)
    if(!campground){
        req.flash('error', 'Cannot find the campground!')
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {campground });
}))

router.get('/:id/edit',isLoggedIn , catchAysnc(async(req,res,)=>{
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground});
}))

router.put('/:id',isLoggedIn , catchAysnc(async(req,res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}, { new: true })
    req.flash('success', 'successfully updated')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:id',isLoggedIn , catchAysnc(async(req,res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'successfully deleted campground')
    res.redirect('/campgrounds');
}));

module.exports = router;