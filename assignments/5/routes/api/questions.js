const express = require("express");
const router = express.Router();
const { loadAllQuestions } = require("../../models/questionModel");

router.get("/", (req, res) => {
    const data = loadAllQuestions();
    if (!data) {
        return res.status(500).json({ error: "Could not load questions." });
    }
    res.json(data);
});

module.exports = router;
