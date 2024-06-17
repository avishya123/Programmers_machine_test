const mongoose = require('mongoose')

const videoschema = new mongoose.Schema({
   
    video: String ,
    disp:String
    
})

const videomodel = mongoose.model('galleryvideo',videoschema)

module.exports = videomodel;