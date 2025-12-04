const express = require("express");
const router = express.Router();
const { loadQuestionsByCategory } = require("../../models/questionModel");

// GET /api/questions?category=Math
router.get("/", async (req, res) => {
    const category = req.query.category;

    if (!category) {
        return res.status(400).json({ error: "Category is required." });
    }

    const questions = await loadQuestionsByCategory(category);

    if (!questions) {
        return res.status(404).json({ error: "Category not found." });
    }

    res.json({ questions });
});

module.exports = router;
