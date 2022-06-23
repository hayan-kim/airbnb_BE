const mongoose = require("mongoose");

const accommodationSchema = mongoose.Schema({
  accId: {
    type: String,    
  },
  
  userId:{
    type:String,
  },

  category:{
    type:String,
  },

  photos: {
    type: Array,    
  },

  
  accName: {
    type: String,       
  },

  openAt: {
    type: Date,
    required: true,    
  },

  closeAt: {
    type: Date,
    required: true,
  },

  Vacancy: {
    type: Object,    
    required: true,
    default: {},
  },

  address: {
    type: String,
    required: true,
  },

  zonecode : {
    type: String,
  },

  detailAddress: {
    type: String,
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


module.exports = mongoose.model("Accommodation", accommodationSchema);
