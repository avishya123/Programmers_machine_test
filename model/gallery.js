const mongoose = require('mongoose')

const imageschema = new mongoose.Schema({
   
    image: String ,
    disp:String
    
})

const imagemodel = mongoose.model('galleryimage',imageschema)

module.exports = imagemodel;