const mongoose = require('mongoose')

const bannerschema = new mongoose.Schema({
   
    banner: String 
    
})

const bannermodel = mongoose.model('banner',bannerschema)

module.exports = bannermodel;