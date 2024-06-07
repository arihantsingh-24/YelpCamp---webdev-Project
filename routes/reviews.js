const express = require('express');
const router = express.Router({mergeParams: true});

const catchAysnc = require('../utils/catchAysnc');
const ExpressError = require('../utils/ExpressError');

const {reviewSchema} = require('../schema.js');

const Review = require('../models/review.js');
const Campground = require('../models/campground');



const validateReview = (req,res,next) => {

    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }else{
        next();
    }
}

router.post('/',validateReview, catchAysnc(async (req,res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'successfully reviewed')
    res.redirect(`/campgrounds/${campground._id}`);
 }));
 
 router.delete('/:reviewId',catchAysnc(async(req,res) => {
     const { id, reviewId } = req.params;
     await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId} })
     await Review.findByIdAndDelete(reviewId);
     req.flash('success', 'successfully deleted review')
     res.redirect(`/campgrounds/${id}`);
 }))

 module.exports = router;