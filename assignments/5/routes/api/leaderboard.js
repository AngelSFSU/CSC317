// routes/api/leaderboard.js
const express = require("express");
const router = express.Router();

const score = require("../../models/score");
const game = require("../../models/game");
const { MONEY_LADDER, getGuaranteedWinnings } = require("../../data/questions");

// Create prize ladder structure for easy lookups (q = 1..15)
const prizeLadder = MONEY_LADDER.map((amount, i) => ({
    q: i + 1,
    amount,
    guaranteed: [4, 9].includes(i) // indices 4 (Q5) and 9 (Q10)
}));

// POST /api/leaderboard - Handle secure score submission
router.post("/", async (req, res) => {
    const { username, answers, gameToken } = req.body;

    // 1. Basic validation
    if (!username || !Array.isArray(answers) || !gameToken) {
        return res.status(400).json({ error: "Invalid submission data or missing game token." });
    }

    try {
        // 2. Fetch server-side game truth by token
        const gameTruth = await game.findById(gameToken);

        if (!gameTruth) {
            // Token invalid or expired (due to TTL index)
            return res.status(403).json({ error: "Invalid or expired game token. Score rejected." });
        }

        const correctAnswers = gameTruth.questionsServed; // [{ qId, answerKey }, ...]

        // 3. Recalculate and validate score
        let correctCount = 0;
        let finalWinnings = 0;
        let gameEnded = false;

        // We assume answers are in the same order as questionsServed
        const totalQuestions = Math.min(answers.length, correctAnswers.length);

        for (let i = 0; i < totalQuestions; i++) {
            const submittedAnswer = answers[i];   // { key: "A", ... }
            const truth = correctAnswers[i];      // { qId, answerKey }

            if (!truth) {
                return res.status(400).json({ error: "Question sequence mismatch." });
            }

            if (submittedAnswer.key === truth.answerKey) {
                // Correct answer
                correctCount++;
                finalWinnings = prizeLadder[i].amount;
            } else {
                // Wrong answer – fallback to last guaranteed amount
                finalWinnings = getGuaranteedWinnings(correctCount);
                gameEnded = true;
                break;
            }
        }

        // If they got through all questions without a wrong answer, full prize
        if (!gameEnded && correctCount === prizeLadder.length) {
            finalWinnings = prizeLadder[prizeLadder.length - 1].amount;
        }

        // 4. Clean up used game token (one-time use)
        await game.deleteOne({ _id: gameToken });

        // 5. Save verified score
        const newscore = new score({
            username: username.trim(),
            score: finalWinnings
        });

        await newscore.save();

        res.status(201).json({
            message: "Score submitted and verified!",
            finalWinnings
        });

    } catch (error) {
        console.error("Error during leaderboard submission:", error);
        return res.status(500).json({ error: "Internal server error while processing score." });
    }
});

// GET /api/leaderboard - Fetch top scores
router.get("/", async (req, res) => {
    try {
        const topscores = await score.find({})
            .sort({ score: -1, dateAchieved: 1 })
            .limit(100)
            .select("username score dateAchieved -_id");

        res.json(topscores);
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ error: "Failed to retrieve leaderboard." });
    }
});

module.exports = router;
