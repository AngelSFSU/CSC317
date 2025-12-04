let questions = [];
let current = 0;
let score = 0;

async function loadQuestions() {
    const res = await fetch(`/api/questions?category=${CATEGORY}`);
    const data = await res.json();
    questions = data.questions;
    showQuestion();
}

function showQuestion() {
    const q = questions[current];
    const container = document.getElementById("quiz-box");

    container.innerHTML = `
        <h2>${q.question}</h2>
        ${q.choices.map(c => `
            <label class="option">
                <input type="radio" name="answer" value="${c}">
                ${c}
            </label>
        `).join("")}
    `;
}

function nextQuestion() {
    const selected = document.querySelector("input[name='answer']:checked");

    if (!selected) {
        alert("Please choose an answer.");
        return;
    }

    if (selected.value === questions[current].answer) score++;

    current++;

    if (current >= questions.length) {
        window.location.href = `/result?score=${score}&total=${questions.length}&category=${CATEGORY}`;
    } else {
        showQuestion();
    }
}

window.onload = loadQuestions;
