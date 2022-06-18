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
        type: Date,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    reservations: {
        type: Array,
        required: true,
    },
    accommodations: {
        type: Array,
        required: true,
    },
});



module.exports = mongoose.model('User', UserSchema);
