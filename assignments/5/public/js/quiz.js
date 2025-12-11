const MONEY_LADDER = [
    100000,
    200000,
    300000,
    500000,
    1000000,      // Q5 - guaranteed
    2000000,
    4000000,
    8000000,
    16000000,
    32000000,     // Q10 - guaranteed
    64000000,
    125000000,
    250000000,
    500000000,
    1000000000 // Q15
];

const NUM_EASY = 5;
const NUM_MEDIUM = 5;
const NUM_HARD = 4;

const QUESTION_TIME = 30;   // seconds per question
let timerInterval = null;
let timeLeft = QUESTION_TIME;

let questions = [];
let currentIndex = 0;
let currentEarnings = 0;
let guaranteedEarnings = 0;

const sfx = {
    lock: new Audio("/sounds/lock-in.mp3"),
    correct: new Audio("/sounds/correct.mp3"),
    wrong: new Audio("/sounds/wrong.mp3"),
    lifeline: new Audio("/sounds/lifeline.mp3")
};

let lifelinesRemaining = 3;
let lifelineUsedThisQuestion = false;

async function initGame() {
    try {
        const res = await fetch("/api/questions");
        const data = await res.json();

        const easy = pickRandom(data.easy, NUM_EASY);
        const medium = pickRandom(data.medium, NUM_MEDIUM);
        const hard = pickRandom(data.hard, NUM_HARD);
        const billionaire = data.billionaire;

        questions = [...easy, ...medium, ...hard, billionaire];

        renderQuestion();
        updateStatusBar();
        updateLadderHighlight();
    } catch (err) {
        console.error("Error loading questions:", err);
    }
}

function pickRandom(array, count) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, count);
}

function renderQuestion() {
    lifelineUsedThisQuestion = false;

    const qData = questions[currentIndex];
    const quizBox = document.getElementById("quiz-box");
    const qNumber = currentIndex + 1;

    document.getElementById("questionNumber").textContent = qNumber;

    quizBox.innerHTML = `
        <h2>${qData.question}</h2>
        ${qData.choices.map((choice, idx) => `
            <label class="option">
                <input type="radio" name="answer" value="${choice}">
                <span>${String.fromCharCode(65 + idx)}. ${choice}</span>
            </label>
        `).join("")}
    `;

    // reset disabled visual from any previous question
    const lifelineBtn = document.getElementById("lifelineBtn");
    lifelineBtn.disabled = lifelinesRemaining === 0;
    lifelineBtn.textContent = `50/50 (x${lifelinesRemaining})`;

    updateLadderHighlight();
    updateStatusBar();
    startTimer();
}


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

// what happens when time runs out
function handleTimeUp() {
    // Disable all options
    document.querySelectorAll("input[name='answer']").forEach(r => {
        r.disabled = true;
    });

    // You can treat this as a loss or as a special "timeout" status.
    // If your /result page only knows "win" and "lose", use status=lose.
    window.location.href = `/result?status=timeout&earned=${guaranteedEarnings}`;
}

function submitAnswer() {
    const selected = document.querySelector("input[name='answer']:checked");
    if (!selected) {
        alert("You must select an answer before locking it in.");
        return;
    }

    const userAnswer = selected.value;
    const correctAnswer = questions[currentIndex].answer;

    if (userAnswer === correctAnswer) {
        // correct
        currentEarnings = MONEY_LADDER[currentIndex];

        const qNumber = currentIndex + 1;
        if (qNumber === 5 || qNumber === 10) {
            guaranteedEarnings = currentEarnings;
        }

        if (currentIndex === questions.length - 1) {
            // won the whole thing
            window.location.href = `/result?status=win&earned=${currentEarnings}`;
            return;
        }

        currentIndex++;
        renderQuestion();
    } else {
        // wrong – fall back to guaranteed amount
        window.location.href = `/result?status=lose&earned=${guaranteedEarnings}`;
    }
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

    // pick two incorrect to disable
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
    lifelineBtn.textContent = `50/50 (x${lifelinesRemaining})`;
    if (lifelinesRemaining === 0) {
        lifelineBtn.disabled = true;
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
