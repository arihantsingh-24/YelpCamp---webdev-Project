const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const {places, descriptors} = require('./seedHelpers');
const cities = require('./cities');
const campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"))
db.once("open", ()=>{
    console.log("database connected index")
});

const sample = array => array[Math.floor(Math.random() *array.length)];

const seedDB = async () => {
    await campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 100);
        const camp = new campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://images.pexels.com/photos/2422265/pexels-photo-2422265.jpeg',
            description: ' beautifull campgrounds',
            price
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});