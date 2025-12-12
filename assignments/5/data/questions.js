// ./data/questions.js (Server Constants)

// Prize amounts (The server uses this fixed ladder to calculate the winnings)
const MONEY_LADDER = [
    100,
    200,
    300,
    500,
    1000,      // Q5 - guaranteed (Index 4)
    2000,
    4000,
    8000,
    16000,
    32000,     // Q10 - guaranteed (Index 9)
    64000,
    125000,
    250000,
    500000,
    1000000000 // Q15
];

// Helper function to calculate the guaranteed amount for a given number of correct answers
const getGuaranteedWinnings = (correctCount) => {
    let guaranteed = 0;
    const prizeLadder = MONEY_LADDER.map((amount, i) => ({
        amount, 
        guaranteed: [4, 9].includes(i) // Indices 4 (Q5) and 9 (Q10) are guaranteed
    }));
    
    // Iterate through all questions answered correctly (index < correctCount)
    for (let i = 0; i < correctCount; i++) {
        const question = prizeLadder[i];
        if (question && question.guaranteed) {
            guaranteed = question.amount;
        }
    }
    return guaranteed;
};

module.exports = {
    MONEY_LADDER,
    getGuaranteedWinnings
};