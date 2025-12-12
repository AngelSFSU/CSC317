// app.js

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require('dotenv'); // Used for securing the MongoDB URI

// Load environment variables from .env file (if running locally) or Render
dotenv.config(); 

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

// --- MONGODB CONNECTION --- 

// The connection string is pulled from the MONGODB_URI environment variable
const MONGODB_URI = process.env.MONGODB_URI; 

// Safety check to ensure the URI is present
if (!MONGODB_URI) {
    console.error("FATAL ERROR: MONGODB_URI is not defined. Please set it in your .env file or Render Environment Variables.");
    // Exit if database connection fails, as the leaderboard will not work
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// --- API ROUTES ---

const questionRoutes = require("./routes/api/questions");
const leaderboardRoutes = require("./routes/api/leaderboard"); // <-- NEW

app.use("/api/questions", questionRoutes);
app.use("/api/leaderboard", leaderboardRoutes); // <-- NEW: Register the leaderboard endpoints

// --- PAGE ROUTES ---

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/quiz", (req, res) => {
    res.render("quiz");
});

app.get("/result", (req, res) => {
    res.render("result", {
        status: req.query.status || "lose",
        earned: req.query.earned || 0
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));