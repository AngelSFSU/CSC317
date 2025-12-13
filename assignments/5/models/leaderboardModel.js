const fs = require("fs");
const path = require("path");

const LEADERBOARD_PATH = path.join(__dirname, "../utils/leaderboard.json");

function loadLeaderboard() {
    try {
        const raw = fs.readFileSync(LEADERBOARD_PATH, "utf8");
        const data = JSON.parse(raw);
        if (Array.isArray(data)) return data;
        return [];
    } catch (err) {
        console.error("Error reading leaderboard.json:", err);
        return [];
    }
}

function saveLeaderboard(entries) {
    try {
        fs.writeFileSync(LEADERBOARD_PATH, JSON.stringify(entries, null, 2), "utf8");
    } catch (err) {
        console.error("Error writing leaderboard.json:", err);
    }
}

/**
 * @param {number} limit -
 */
function getTopEntries(limit = 10) {
    const entries = loadLeaderboard();
    entries.sort((a, b) => {
        if (b.amount !== a.amount) return b.amount - a.amount;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    return entries.slice(0, limit);
}

/**
 * @param {{name: string, amount: number, status: string}} entry
 */
function addEntry(entry) {
    const entries = loadLeaderboard();
    const safeName = String(entry.name || "Anonymous").trim().slice(0, 20);

    const newEntry = {
        name: safeName || "Anonymous",
        amount: Number(entry.amount) || 0,
        status: entry.status === "win" ? "win" : "lose",
        date: new Date().toISOString()
    };

    entries.push(newEntry);
    saveLeaderboard(entries);
}

module.exports = {
    getTopEntries,
    addEntry
};
