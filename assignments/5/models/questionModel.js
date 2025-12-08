const fs = require("fs");
const path = require("path");

function loadAllQuestions() {
    try {
        const filePath = path.join(__dirname, "../utils/questions.json");
        const raw = fs.readFileSync(filePath, "utf8");
        return JSON.parse(raw);
    } catch (err) {
        console.error("Error loading questions.json:", err);
        return null;
    }
}

module.exports = { loadAllQuestions };
