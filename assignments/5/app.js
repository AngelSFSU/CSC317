const express = require("express");
const app = express();
const path = require("path");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());

// API Routes
const questionRoutes = require("./routes/api/questions");
app.use("/api/questions", questionRoutes);

// Views
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/quiz", (req, res) => {
    const category = req.query.category;
    if (!category) return res.redirect("/");
    res.render("quiz", { category });
});

app.get("/result", (req, res) => {
    res.render("result", {
        score: req.query.score || 0,
        total: req.query.total || 0,
        category: req.query.category || "Unknown"
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
