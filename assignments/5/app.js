const express = require("express");
const path = require("path");
const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

// API
const questionRoutes = require("./routes/api/questions");
app.use("/api/questions", questionRoutes);

const leaderboardRoutes = require("./routes/api/leaderboard");
app.use("/api/leaderboard", leaderboardRoutes);


// Pages
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/quiz", (req, res) => {
    res.render("quiz");
});

app.get("/result", (req, res) => {
    let status = req.query.status || "lose";
    let earned = Number(req.query.earned) || 0;

    res.render("result", { status, earned });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));


