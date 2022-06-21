const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userId: {
        type: String,

    },
    password: {
        type: String,

    },
    passwordCheck: {
        type: String,

    },
    salt: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    birth: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
    },
    reservations: {
        type: Array,               
    },
    accommodations: {
        type: Array,        
    },
});



module.exports = mongoose.model('User', UserSchema);
