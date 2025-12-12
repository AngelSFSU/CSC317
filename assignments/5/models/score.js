const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20
    },
    score: {
        type: Number,
        required: true,
        min: 0
    },
    dateAchieved: {
        type: Date,
        default: Date.now
    }
});

const Score = mongoose.model('score', scoreSchema);
module.exports = score;