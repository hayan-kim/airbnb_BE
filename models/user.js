const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userId: String,
    password: String,
    passwordCheck: String,
    salt: String,
    name: String,
    birth: Date,
    gender: String,
    reservations: Array,
    accommodations: Array,
});

module.exports = mongoose.model('User', UserSchema);
