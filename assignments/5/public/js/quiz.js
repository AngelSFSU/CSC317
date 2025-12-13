<<<<<<< HEAD
<<<<<<< HEAD
// public/js/game.js
=======
// Money ladder: 15 levels, Q5 and Q10 are guaranteed
// I changed Q14 to 500,000,000 so it doesn't jump from 500k to 1B.
=======
>>>>>>> parent of 215d163 (Update quiz.js)
const MONEY_LADDER = [
    100,
    200,
    300,
    500,
    1000,      // Q5 - guaranteed
    2000,
    4000,
    8000,
    16000,
    32000,     // Q10 - guaranteed
    64000,
    125000,
    250000,
    500000,
    1000000000 // Q15
];
>>>>>>> parent of ffac580 (changes)

const MONEY_LADDER = [
    100000, 200000, 300000, 500000,
    1000000,      // Q5 guaranteed
    2000000, 4000000, 8000000, 16000000,
    32000000,     // Q10 guaranteed
    64000000, 125000000, 250000000, 500000000, 1000000000
];

const QUESTION_TIME = 60;   // seconds per question
let timerInterval = null;
let timeLeft = QUESTION_TIME;

let questions = [];          // [{ question, choices, answer }]
let currentIndex = 0;
let currentEarnings = 0;
let guaranteedEarnings = 0;
let playerAnswers = [];      // [{ key: "A" }, ...]
let gameToken = null;

const sfx = {
    lock: new Audio("/sounds/lock-in.mp3"),
    correct: new Audio("/sounds/correct.mp3"),
    wrong: new Audio("/sounds/wrong.mp3"),
    lifeline: new Audio("/sounds/lifeline.mp3")
};

let lifelinesRemaining = 3;
let lifelineUsedThisQuestion = false;

<<<<<<< HEAD
// --------- INIT ---------

=======
>>>>>>> parent of 215d163 (Update quiz.js)
async function initGame() {
    try {
        const res = await fetch("/api/questions");
        const data = await res.json();

        // Expect { gameToken, questions }
        gameToken = data.gameToken;
        questions = data.questions;

<<<<<<< HEAD
        currentIndex = 0;
        currentEarnings = 0;
        guaranteedEarnings = 0;
        playerAnswers = [];
        lifelinesRemaining = 3;
        lifelineUsedThisQuestion = false;

=======
>>>>>>> parent of 215d163 (Update quiz.js)
        renderQuestion();
        updateStatusBar();
        updateLadderHighlight();
    } catch (err) {
        console.error("Error loading questions:", err);
    }
}

<<<<<<< HEAD
// --------- RENDER QUESTION ---------

function renderQuestion() {
    const quizBox = document.getElementById("quiz-box");
    if (!quizBox) return;

=======
function pickRandom(array, count) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, count);
}

function renderQuestion() {
    const quizBox = document.getElementById("quiz-box");

    // Fade-out before changing question
>>>>>>> parent of 215d163 (Update quiz.js)
    quizBox.classList.add("fade-out");

    setTimeout(() => {
        const qData = questions[currentIndex];

<<<<<<< HEAD
        // update question number if you have that span
        const qNumEl = document.getElementById("questionNumber");
        if (qNumEl) qNumEl.textContent = currentIndex + 1;

=======
>>>>>>> parent of 215d163 (Update quiz.js)
        quizBox.innerHTML = `
            <h2>${qData.question}</h2>
            ${qData.choices.map((choice, i) => `
                <label class="option">
                    <input type="radio" name="answer" value="${choice}">
                    ${String.fromCharCode(65 + i)}. ${choice}
                </label>
            `).join("")}
        `;

        quizBox.classList.remove("fade-out");
        quizBox.classList.add("fade-in");
        setTimeout(() => quizBox.classList.remove("fade-in"), 500);

<<<<<<< HEAD
        startTimer();
        updateLadderHighlight();
        updateStatusBar();

        const lifelineBtn = document.getElementById("lifelineBtn");
        if (lifelineBtn) {
            lifelineBtn.disabled = lifelinesRemaining === 0;
            lifelineBtn.textContent = `50/50 (x${lifelinesRemaining})`;
        }
    }, 400);
}

// --------- TIMER ---------

=======
        updateLadderHighlight();
        updateStatusBar();
        startTimer();
    }, 400);
}

>>>>>>> parent of 215d163 (Update quiz.js)
function updateTimerDisplay() {
    const timerEl = document.getElementById("timer");
    if (!timerEl) return; // in case element isn't on this page

    timerEl.textContent = timeLeft;
    timerEl.classList.toggle("low-time", timeLeft <= 5);
}

function resetTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    timeLeft = QUESTION_TIME;
    updateTimerDisplay();
}

function startTimer() {
    resetTimer();

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            handleTimeUp();
        }
    }, 1000);
}

function handleTimeUp() {
    document.querySelectorAll("input[name='answer']").forEach(r => {
        r.disabled = true;
    });
<<<<<<< HEAD
    submitGameData("timeout", guaranteedEarnings);
}

// --------- ANSWER SUBMISSION ---------

=======

    // You can treat this as a loss or as a special "timeout" status.
    // If your /result page only knows "win" and "lose", use status=lose.
    window.location.href = `/result?status=timeout&earned=${guaranteedEarnings}`;
}

>>>>>>> parent of 215d163 (Update quiz.js)
async function submitAnswer() {
    const selected = document.querySelector("input[name='answer']:checked");
    if (!selected) {
        alert("Please select an answer.");
        return;
    }

<<<<<<< HEAD
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    const currentQ = questions[currentIndex];
    const options = Array.from(document.querySelectorAll(".option"));
=======
    const userChoice = selected.closest(".option");
    const correctAnswer = questions[currentIndex].answer;
>>>>>>> parent of 215d163 (Update quiz.js)

    const selectedIndex = options.findIndex(opt => opt.querySelector("input") === selected);
    const userAnswerKey = String.fromCharCode(65 + selectedIndex);

    // determine correct index and key from choices + currentQ.answer
    const correctIndex = currentQ.choices.indexOf(currentQ.answer);
    const correctKey = String.fromCharCode(65 + correctIndex);

    // store answer by key, in order
    playerAnswers.push({ key: userAnswerKey });

    const userChoice = selected.closest(".option");

    // lock in
    userChoice.classList.add("locked");
    sfx.lock.play();

    await delay(1500);

    // Reveal correct/wrong options
    options.forEach((opt, idx) => {
        if (idx === correctIndex) {
            opt.classList.add("correct");
        } else if (opt === userChoice) {
            opt.classList.add("wrong");
        }
    });

<<<<<<< HEAD
    const isCorrect = (userAnswerKey === correctKey);

    if (isCorrect) {
        sfx.correct.play();

        currentEarnings = MONEY_LADDER[currentIndex];
        const qNumber = currentIndex + 1;

        if (qNumber === 5) guaranteedEarnings = MONEY_LADDER[4];
        if (qNumber === 10) guaranteedEarnings = MONEY_LADDER[9];

        updateStatusBar();
        updateLadderHighlight();

        await delay(3000);

        if (currentIndex === questions.length - 1) {
            return await submitGameData("win", currentEarnings);
        }

        currentIndex++;
        lifelineUsedThisQuestion = false;
        renderQuestion();
    } else {
        sfx.wrong.play();
        await delay(2500);
        return await submitGameData("lose", guaranteedEarnings);
=======
    // Play correct/wrong sound
    if (userChoice.querySelector("input").value === correctAnswer) {
        sfx.correct.play();
    } else {
        sfx.wrong.play();
        await delay(2500); // dramatic pause
        return window.location.href = `/result?status=lose&earned=${guaranteedEarnings}`;
>>>>>>> parent of 215d163 (Update quiz.js)
    }

    // Pause for dramatic effect
    await delay(3000);

    // Move to next question
    if (currentIndex === questions.length - 1) {
        return window.location.href = `/result?status=win&earned=${currentEarnings}`;
    }

    currentIndex++;
    renderQuestion();
}

async function submitGameData(status, finalEarned) {
    resetTimer();

    const earnedFormatted = finalEarned.toLocaleString();

    let username = prompt(`Game Over. You earned $${earnedFormatted}. Enter your name for the leaderboard:`);
    if (!username || username.trim() === "") {
        console.warn("No username provided. Skipping leaderboard submission.");
        return window.location.href = `/result?status=${status}&earned=${earnedFormatted}`;
    }

    const submissionBody = {
        username: username.trim(),
        answers: playerAnswers,
        gameToken
    };

    try {
        const res = await fetch('/api/leaderboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submissionBody)
        });
        const data = await res.json();

        if (!res.ok) {
            console.error("Leaderboard submission failed:", data.error);
        } else {
            console.log("Score submitted and verified:", data.finalWinnings);
        }
    } catch (error) {
        console.error("Network error during score submission:", error);
    }

    window.location.href = `/result?status=${status}&earned=${earnedFormatted}`;
}

// --------- HELPERS ---------

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function useFiftyFifty() {
    if (lifelinesRemaining <= 0) return;
    if (lifelineUsedThisQuestion) return;

    const currentQ = questions[currentIndex];
    const options = Array.from(document.querySelectorAll(".option"));

    const incorrectOptions = options.filter(opt => {
        const input = opt.querySelector("input");
        return input.value !== currentQ.answer;
    });

    shuffleArray(incorrectOptions);
    const toRemove = incorrectOptions.slice(0, 2);

    toRemove.forEach(opt => {
        const input = opt.querySelector("input");
        opt.classList.add("disabled-option");
        input.disabled = true;
    });

    lifelinesRemaining--;
    lifelineUsedThisQuestion = true;

    const lifelineBtn = document.getElementById("lifelineBtn");
<<<<<<< HEAD
    if (lifelineBtn) {
        lifelineBtn.textContent = `50/50 (x${lifelinesRemaining})`;
        if (lifelinesRemaining === 0) lifelineBtn.disabled = true;
=======
    lifelineBtn.textContent = `50/50 (x${lifelinesRemaining})`;
    if (lifelinesRemaining === 0) {
        lifelineBtn.disabled = true;
>>>>>>> parent of 215d163 (Update quiz.js)
    }
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function updateStatusBar() {
    document.getElementById("currentAmount").textContent = `$${currentEarnings}`;
    document.getElementById("guaranteedAmount").textContent = `$${guaranteedEarnings}`;
}

function updateLadderHighlight() {
    const qNumber = currentIndex + 1;
    const items = document.querySelectorAll(".ladder-item");
    items.forEach(li => {
        const level = parseInt(li.dataset.q, 10);
        li.classList.remove("active", "passed");
        if (level === qNumber) {
            li.classList.add("active");
        } else if (level < qNumber) {
            li.classList.add("passed");
        }
    });
}

window.onload = initGame;
