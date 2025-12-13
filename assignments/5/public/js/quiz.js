// Money ladder: 15 levels, Q5 and Q10 are guaranteed
// I changed Q14 to 500,000,000 so it doesn't jump from 500k to 1B.
const MONEY_LADDER = [
    100000,           // Q1
    200000,           // Q2
    300000,           // Q3
    500000,           // Q4
    1000000,          // Q5 - guaranteed
    2000000,          // Q6
    4000000,          // Q7
    8000000,          // Q8
    16000000,         // Q9
    32000000,         // Q10 - guaranteed
    64000000,         // Q11
    125000000,        // Q12
    250000000,        // Q13
    500000000,     // Q14
    1000000000     // Q15
];

const NUM_EASY = 5;
const NUM_MEDIUM = 5;
const NUM_HARD = 4;

const QUESTION_TIME = 60;
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

        currentIndex = 0;
        currentEarnings = 0;
        guaranteedEarnings = 0;
        lifelinesRemaining = 3;
        lifelineUsedThisQuestion = false;

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
    const quizBox = document.getElementById("quiz-box");
    if (!quizBox) return;

    lifelineUsedThisQuestion = false;

    quizBox.classList.add("fade-out");

    setTimeout(() => {
        const qData = questions[currentIndex];

        const qNumEl = document.getElementById("questionNumber");
        if (qNumEl) qNumEl.textContent = currentIndex + 1;

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

function updateTimerDisplay() {
    const timerEl = document.getElementById("timer");
    if (!timerEl) return;
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

    window.location.href = `/result?status=timeout&earned=${guaranteedEarnings}`;
}

async function submitAnswer() {
    const selected = document.querySelector("input[name='answer']:checked");

    if (!selected) {
        alert("Please select an answer.");
        return;
    }

    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    const userChoice = selected.closest(".option");
    const correctAnswer = questions[currentIndex].answer;

    userChoice.classList.add("locked");
    sfx.lock.play();

    await delay(1500);

    const allOptions = document.querySelectorAll(".option");
    allOptions.forEach(opt => {
        const val = opt.querySelector("input").value;
        if (val === correctAnswer) {
            opt.classList.add("correct");
        } else if (opt === userChoice) {
            opt.classList.add("wrong");
        }
    });

    const isCorrect = (userChoice.querySelector("input").value === correctAnswer);

    if (isCorrect) {
        sfx.correct.play();

        const qNumber = currentIndex + 1;
        currentEarnings = MONEY_LADDER[currentIndex];

        if (qNumber === 5 || qNumber === 10) {
            guaranteedEarnings = currentEarnings;
        }

        updateStatusBar();
        updateLadderHighlight();

        await delay(3000);

        if (currentIndex === questions.length - 1) {
            return window.location.href = `/result?status=win&earned=${currentEarnings}`;
        }

        currentIndex++;
        renderQuestion();
    } else {
        sfx.wrong.play();
        await delay(2500);
        return window.location.href = `/result?status=lose&earned=${guaranteedEarnings}`;
    }
}

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
    if (lifelineBtn) {
        lifelineBtn.textContent = `50/50 (x${lifelinesRemaining})`;
        if (lifelinesRemaining === 0) {
            lifelineBtn.disabled = true;
        }
    }

    sfx.lifeline.play();
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}


function updateStatusBar() {
    const currentEl = document.getElementById("currentAmount");
    const guaranteedEl = document.getElementById("guaranteedAmount");
    if (currentEl) currentEl.textContent = `$${currentEarnings.toLocaleString()}`;
    if (guaranteedEl) guaranteedEl.textContent = `$${guaranteedEarnings.toLocaleString()}`;
}

function updateLadderHighlight() {
    const qNumber = currentIndex + 1;
    const items = document.querySelectorAll(".ladder-item");

    items.forEach(li => {
        const level = parseInt(li.dataset.q, 10);
        li.classList.remove("active", "passed");

        if (level === qNumber) {
            li.classList.add("active");

            li.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        } else if (level < qNumber) {
            li.classList.add("passed");
        }
    });
}

window.onload = initGame;
