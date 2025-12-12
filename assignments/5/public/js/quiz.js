// Money ladder: 15 levels, Q5 and Q10 are guaranteed
const MONEY_LADDER = [
    100,           // Q1
    200,           // Q2
    300,           // Q3
    500,           // Q4
    1000,          // Q5 - guaranteed
    2000,          // Q6
    4000,          // Q7
    8000,          // Q8
    16000,         // Q9
    32000,         // Q10 - guaranteed
    64000,         // Q11
    125000,        // Q12
    250000,        // Q13
    500000000,     // Q14
    1000000000     // Q15
];

const NUM_EASY = 5;
const NUM_MEDIUM = 5;
const NUM_HARD = 4;

const QUESTION_TIME = 60;   // seconds per question
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

// ---------- INIT ----------

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

// ---------- RENDER QUESTION ----------

function renderQuestion() {
    const quizBox = document.getElementById("quiz-box");
    if (!quizBox) return;

    lifelineUsedThisQuestion = false;

    // Fade-out before changing question
    quizBox.classList.add("fade-out");

    setTimeout(() => {
        const qData = questions[currentIndex];

        // Update question number text (e.g. "Question 3 of 15")
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

        // Fade-in
        quizBox.classList.remove("fade-out");
        quizBox.classList.add("fade-in");

        setTimeout(() => quizBox.classList.remove("fade-in"), 500);

        // Reset and start timer for this question
        startTimer();

        // Update ladder + bar
        updateLadderHighlight();
        updateStatusBar();

        // Update lifeline button text
        const lifelineBtn = document.getElementById("lifelineBtn");
        if (lifelineBtn) {
            lifelineBtn.disabled = lifelinesRemaining === 0;
            lifelineBtn.textContent = `50/50 (x${lifelinesRemaining})`;
        }
    }, 400);
}

// ---------- TIMER ----------

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

// what happens when time runs out
function handleTimeUp() {
    // Disable all options
    document.querySelectorAll("input[name='answer']").forEach(r => {
        r.disabled = true;
    });

    // Treat timeout as a loss at guaranteed amount
    window.location.href = `/result?status=timeout&earned=${guaranteedEarnings}`;
}

// ---------- ANSWER HANDLING WITH SUSPENSE ----------

async function submitAnswer() {
    const selected = document.querySelector("input[name='answer']:checked");

    if (!selected) {
        alert("Please select an answer.");
        return;
    }

    // stop timer when user locks in
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    const userChoice = selected.closest(".option");
    const correctAnswer = questions[currentIndex].answer;

    // Lock-in animation
    userChoice.classList.add("locked");
    sfx.lock.play();

    // Pause before reveal
    await delay(1500);

    // Reveal correct answer
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
        // correct sound
        sfx.correct.play();

        // ---- UPDATE EARNINGS ----
        const qNumber = currentIndex + 1;
        currentEarnings = MONEY_LADDER[currentIndex];

        if (qNumber === 5 || qNumber === 10) {
            guaranteedEarnings = currentEarnings;
        }

        updateStatusBar();
        updateLadderHighlight();

        // Pause for dramatic effect before moving on
        await delay(3000);

        // Final question?
        if (currentIndex === questions.length - 1) {
            return window.location.href = `/result?status=win&earned=${currentEarnings}`;
        }

        // Go to next question
        currentIndex++;
        renderQuestion();
    } else {
        // wrong answer
        sfx.wrong.play();
        await delay(2500);
        return window.location.href = `/result?status=lose&earned=${guaranteedEarnings}`;
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ---------- 50/50 LIFELINE ----------

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

// ---------- STATUS + LADDER UI ----------

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

            // Optional: scroll the active ladder item into view
            li.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        } else if (level < qNumber) {
            li.classList.add("passed");
        }
    });
}

// ---------- START ----------

window.onload = initGame;
