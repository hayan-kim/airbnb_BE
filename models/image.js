const mongoose = require('mongoose');
const imageSchema = mongoose.Schema({    
    imageUrls: {
        type: Array,
        required: true,
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
});
module.exports = mongoose.model('Images', imageSchema);