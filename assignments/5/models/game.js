// models/game.js
const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    // Unique ID used as the "Game Token" sent to the client
    _id: {
        type: String,
        required: true
    },
    // The specific array of 15 question "truths" (for secure server-side checking)
    questionsServed: [{
        qId: { type: String, required: true },        // can be question ID or index, up to you
        answerKey: { type: String, required: true }   // e.g. "A", "B", "C", "D"
    }],
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '2h' // auto-delete after 2 hours
    }
});

const game = mongoose.model('game', gameSchema, 'games');
module.exports = game;
