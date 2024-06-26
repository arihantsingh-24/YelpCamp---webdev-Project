const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const catchAsync = require('../utils/catchAysnc');
const { storeReturnTo } = require('../middleware');

router.get('/register', (req,res)=>{
    res.render('users/register');
})
router.post('/register',catchAsync(async(req,res)=>{
    try{
    const{email, username, password} = req.body;
    const user = new User({ email, username});
    const registeredUser = await User.register( user, password);
    req.login(registeredUser, err => {
        if(err) return next(err);
        req.flash('success','welcome to YelpCamp');
        res.redirect('/campgrounds');
    })
    }catch(e){
        req.flash('error', 'Error');
        res.redirect('register')
    }
}));

router.get('/login', (req,res)=>{
    res.render('users/login');
})

router.post('/login',storeReturnTo, passport.authenticate('local',{failureFlash: true, failureRedirect: '/login'}), (req,res)=>{
    req.flash('success','Welcome back!!')
    const redirecturl = res.locals.returnTo || '/campgrounds'
    res.redirect(redirecturl);
})

router.get('/logout', (req,res,next)=>{
    req.logout(function(err){
        if(err){
            return next(err);
        }
        req.flash('success','comeback to YelpCamp again!!');
        res.redirect('/campgrounds');
    });  
})

module.exports = router;