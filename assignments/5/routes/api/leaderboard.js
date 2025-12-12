// ./routes/api/leaderboard.js (UPDATED)
const express = require("express");
const router = express.Router();
const score = require("../../models/score"); 
const game = require("../../models/game"); // Corrected path to game model
const { MONEY_LADDER, getGuaranteedWinnings } = require("../../data/questions"); // Get constants

// Create prize ladder structure for easy lookups
const prizeLadder = MONEY_LADDER.map((amount, i) => ({
    q: i + 1, 
    amount, 
    guaranteed: [4, 9].includes(i) // Q5 and Q10 indices
}));

// POST /api/leaderboard - Handle secure score submission
router.post("/", async (req, res) => {
    const { username, answers, gameToken } = req.body; 

    // --- 1. Input Validation & Token Check ---
    if (!username || !answers || !gameToken) {
        return res.status(400).json({ error: 'Invalid submission data or missing game token.' });
    }
    
    // --- 2. FETCH SECURE SERVER TRUTH ---
    const gameTruth = await Game.findById(gameToken);

    if (!gameTruth) {
        // Reject if token is invalid or expired (due to 'expires' index in Game.js)
        return res.status(403).json({ error: 'Invalid or expired game token. Score rejected.' });
    }

    const correctAnswers = gameTruth.questionsServed;

    // --- 3. DYNAMIC SCORE RE-CALCULATION & VALIDATION ---
    let correctCount = 0;
    let finalWinnings = 0;
    let gameEnded = false;
    
    // answers is the client submission. correctAnswers is the server's truth for this game.
    for (let i = 0; i < answers.length; i++) {
        const submittedAnswer = answers[i];
        
        // Find the correct answer record using the question number (q)
        const truth = correctAnswers.find(q => q.qId == submittedAnswer.q); 

        if (!truth) {
             return res.status(400).json({ error: 'Question sequence mismatch.' });
        }
        
        // Check submitted key against the DYNAMIC truth
        if (submittedAnswer.key === truth.answerKey) { 
            correctCount++;
            finalWinnings = prizeLadder[i].amount; 
        } else {
            // Loss: The final prize is the guaranteed amount *before* this failed question (i)
            finalWinnings = getGuaranteedWinnings(i); 
            gameEnded = true;
            break;
        }
    }
    
    // Final check for a full win
    if (!gameEnded && correctCount === prizeLadder.length) {
        finalWinnings = prizeLadder[prizeLadder.length - 1].amount;
    }

    // --- 4. Clean up Game Token ---
    await game.deleteOne({ _id: gameToken });
    
    // --- 5. Save the Verified Score ---
    try {
        const newscore = new score({ username, score: finalWinnings }); 
        await newscore.save();
        
        res.status(201).json({ 
            message: "Score submitted and verified!",
            finalWinnings: finalWinnings
        });

    } catch (error) {
        console.error("Error saving score to database:", error);
        res.status(500).json({ error: 'Failed to save score after verification.' });
    }
});

// GET /api/leaderboard - Fetch top scores (Unchanged)
router.get("/", async (req, res) => {
    try {
        const topscores = await score.find({})
            .sort({ score: -1, dateAchieved: 1 }) 
            .limit(100)
            .select('username score dateAchieved -_id');

        res.json(topscores);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ error: 'Failed to retrieve leaderboard.' });
    }
});

module.exports = router;