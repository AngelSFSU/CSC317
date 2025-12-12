
const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    // Unique ID used as the "Game Token" sent to the client
    _id: {
        type: String,
        required: true
    },
    // The specific array of 15 question IDs and their correct answer keys (for security)
    questionsServed: [{
        qId: { type: String, required: true },
        answerKey: { type: String, required: true }
    }],
    // Timestamp for expiration (to clean up old games)
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '2h' // Documents expire after 2 hours (optional, but good practice)
    }
});

const game = mongoose.model('game', gameSchema, 'games');
module.exports = game;