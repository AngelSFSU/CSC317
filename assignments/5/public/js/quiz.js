const MONEY_LADDER = [
    100000, 200000, 300000, 500000, 1000000, 2000000, 4000000, 8000000, 16000000, 32000000, 64000000, 125000000, 250000000, 500000000, 1000000000
];

const QUESTION_TIME = 60;   
let timerInterval = null;
let timeLeft = QUESTION_TIME;

let questions = [];
let currentIndex = 0;
let currentEarnings = 0;
let guaranteedEarnings = 0;
let playerAnswers = [];
let gameToken = null; // <-- NEW: Store unique game identifier

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
        
        // NEW: Store the game token and the randomized questions array from the server
        gameToken = data.gameToken; 
        questions = data.questions; 

        // NOTE: pickRandom and array assembly logic is now removed/handled on the server

        renderQuestion();
        updateStatusBar();
        updateLadderHighlight();
    } catch (err) {
        console.error("Error loading questions:", err);
    }
}

// NOTE: The pickRandom function is removed from here

function renderQuestion() {
    const quizBox = document.getElementById("quiz-box");

    quizBox.classList.add("fade-out");

    setTimeout(() => {
        const qData = questions[currentIndex];

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

        updateLadderHighlight();
        updateStatusBar();
        startTimer();
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

    submitGameData("lose", guaranteedEarnings); 
}

async function submitAnswer() {
    const selected = document.querySelector("input[name='answer']:checked");
    const currentQ = questions[currentIndex];

    if (!selected) {
        alert("Please select an answer.");
        return;
    }

    const allOptions = Array.from(document.querySelectorAll(".option"));
    const selectedIndex = allOptions.findIndex(opt => opt.querySelector("input") === selected);
    const userAnswerKey = String.fromCharCode(65 + selectedIndex);

    // Record the user's answer for server validation
    playerAnswers.push({
        q: currentIndex + 1, // Question number
        key: userAnswerKey
    });

    const userChoice = selected.closest(".option");
    const correctAnswer = currentQ.answer;

    userChoice.classList.add("locked");
    sfx.lock.play();

    await delay(1500);

    const allOptionsNodes = document.querySelectorAll(".option");
    allOptionsNodes.forEach(opt => {
        const val = opt.querySelector("input").value;
        if (val === correctAnswer) {
            opt.classList.add("correct");
        } else if (opt === userChoice) {
            opt.classList.add("wrong");
        }
    });

    if (selected.value === correctAnswer) {
        sfx.correct.play();
        
        currentEarnings = MONEY_LADDER[currentIndex]; 
        
        await delay(3000);

        if (currentIndex === questions.length - 1) {
            return await submitGameData("win", currentEarnings);
        }

        currentIndex++;
        if (currentIndex === 5) guaranteedEarnings = MONEY_LADDER[4];
        if (currentIndex === 10) guaranteedEarnings = MONEY_LADDER[9];
        
        lifelineUsedThisQuestion = false;
        
        renderQuestion(); 
    } else {
        sfx.wrong.play();
        await delay(2500); 
        
        return await submitGameData("lose", guaranteedEarnings);
    }
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
        gameToken: gameToken // <-- CRUCIAL: Send the token back
    };

    try {
        const res = await fetch('/api/leaderboard', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(submissionBody),
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
    document.getElementById("currentAmount").textContent = `$${currentEarnings.toLocaleString()}`;
    document.getElementById("guaranteedAmount").textContent = `$${guaranteedEarnings.toLocaleString()}`;
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