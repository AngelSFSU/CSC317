const express = require("express");
const router = express.Router();
const { getTopEntries, addEntry } = require("../../models/leaderboardModel");

// GET /api/leaderboard - return top scores
router.get("/", (req, res) => {
    const limit = Number(req.query.limit) || 10;
    const entries = getTopEntries(limit);
    res.json({ entries });
});

// POST /api/leaderboard - add a new score
router.post("/", (req, res) => {
    const { name, amount, status } = req.body || {};

    if (amount == null) {
        return res.status(400).json({ error: "amount is required" });
    }

    addEntry({ name, amount, status });
    const entries = getTopEntries(10);
    res.status(201).json({ message: "Entry added", entries });
});

module.exports = router;
