const fs = require("fs");
const path = require("path");

function loadQuestionsByCategory(category) {
    try {
        const filePath = path.join(__dirname, "../utils/questions.json");
        const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

        return data[category] || null;
    } catch (error) {
        console.error("Error loading questions:", error);
        return null;
    }
}

module.exports = { loadQuestionsByCategory };
