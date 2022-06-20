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
    createdAt: {
        type: Date,
        default: new Date(),
    },
});


module.exports = mongoose.model("review", ReviewSchema);