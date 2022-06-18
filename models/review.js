const mongoose = require("mongoose")

const ReviewSchema = mongoose.Schema({
    accId: {
        type: String,
    },
    userId: {
        type: String,
    },
    reviewId: {
        type: String,
    },
    photos: {
        type: Array,
    },
    content: {
        type: String,
    },
    stars: {
        type: Number,
    },
});


module.exports = mongoose.model("review", ReviewSchema);