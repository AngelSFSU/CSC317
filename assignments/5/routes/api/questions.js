const express = require("express");
const router = express.Router();
const { loadAllQuestions } = require("../../models/questionModel"); // loads questions.json
const Game = require("../../../models/Game"); // Corrected path to Game model
const crypto = require('crypto');

// Constants from your quiz logic
const NUM_EASY = 5;
const NUM_MEDIUM = 5;
const NUM_HARD = 4;
const GUARANTEED_INDICES = [4, 9]; // Q5 and Q10 indices

// Helper to randomize an array
function pickRandom(array, count) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, count);
}

// Helper function to map answer text to key (A, B, C, D)
function mapAnswerToKey(choices, answerText) {
    const index = choices.indexOf(answerText);
    return index !== -1 ? String.fromCharCode(65 + index) : null;
}

router.get("/", async (req, res) => {
    const data = loadAllQuestions();
    if (!data) {
        return res.status(500).json({ error: "Could not load questions." });
    }
    
    // --- 1. RANDOMIZE AND ASSEMBLE QUESTIONS ---
    const easy = pickRandom(data.easy, NUM_EASY);
    const medium = pickRandom(data.medium, NUM_MEDIUM);
    const hard = pickRandom(data.hard, NUM_HARD);
    const billionaire = data.billionaire;

    const randomizedQuestions = [...easy, ...medium, ...hard, billionaire];

    // --- 2. CREATE SECURE SERVER TRUTH ---
    const serverTruth = [];
    const clientQuestions = []; 

    for (let i = 0; i < randomizedQuestions.length; i++) {
        const q = randomizedQuestions[i];
        
        // Record the secure data for the backend
        const correctKey = mapAnswerToKey(q.choices, q.answer);
        serverTruth.push({
            qId: (i + 1).toString(), 
            answerKey: correctKey
        });

        // Prepare the data for the client (DO NOT send the answer)
        // Destructure to safely remove the 'answer' property
        const { answer, ...clientQ } = q;
        clientQuestions.push({
            ...clientQ,
            qIndex: i + 1,
            isGuaranteed: GUARANTEED_INDICES.includes(i)
        });
    }

    // --- 3. SAVE TRUTH AND GENERATE TOKEN ---
    const gameId = crypto.randomBytes(16).toString('hex'); // Generate unique token
    
    try {
        const newGameTruth = new Game({ 
            _id: gameId, 
            questionsServed: serverTruth 
        });
        await newGameTruth.save();
        
        // --- 4. SEND RESPONSE ---
        res.json({
            questions: clientQuestions,
            gameToken: gameId // Send the unique token to the client
        });
    } catch (error) {
        console.error("Error saving game state:", error);
        res.status(500).json({ error: "Failed to initialize game state." });
    }
});

module.exports = router;