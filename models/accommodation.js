const mongoose = require("mongoose");

const accomodationSchema = mongoose.Schema({
  accId: {
    type: String,    
  },
  
  userId:{
    type:String,
  },

  photos: {
    type: Array,    
  },

  openAt: {
    type: Date,
    required: true,    
  },

  closeAt: {
    type: Date,
    required: true,
  },

  address: {
    type: String,
    required: true,
  },

  desc1_hanmadi: {
    type: String,
    required: true,
  },

  desc2_surroundings:{
    type: String
  },

  desc3_notice: {
    type: String,
  },

  desc4_basics: {
    type: String,
  },

  facilities: {
    type: Array
  },
  
  charge: {
    type: Number
  }
});


module.exports = mongoose.model("Accomodation", accomodationSchema);
