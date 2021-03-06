const mongoose = require("mongoose");

const reservationSchema = mongoose.Schema({
  reserveId: {
    type: String,    
  },
  
  accId:{
    type: String,
  },

  userId: {
    type: String,
  },

  accName:{
    type: String,
  },

  checkIn: {
    type: Date,
    required: true,
    trim: true,
  },

  checkOut: {
    type: Date,
    required: true,
  },

  guests: {
    type: Number,
    required: true,
  },

  charge: {
    type: Number,
    required: true,
  },

  totalCharge: {
    type: Number,
    required: true,
  }  
});


module.exports = mongoose.model("Reservation", reservationSchema);
