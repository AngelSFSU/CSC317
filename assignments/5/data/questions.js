// data/questions.js

// Prize amounts (server truth – MUST match client ladder)
const MONEY_LADDER = [
    100000,
    200000,
    300000,
    500000,
    1000000,      // Q5 - guaranteed (index 4)
    2000000,
    4000000,
    8000000,
    16000000,
    32000000,     // Q10 - guaranteed (index 9)
    64000000,
    125000000,
    250000000,
    500000000,
    1000000000    // Q15
];

// Given number of correctly answered questions (correctCount),
// return the last guaranteed amount reached so far.
const getGuaranteedWinnings = (correctCount) => {
    let guaranteed = 0;

    // indices 4 and 9 are guaranteed thresholds
    const guaranteedIndices = [4, 9];

    for (let i = 0; i < correctCount; i++) {
        if (guaranteedIndices.includes(i)) {
            guaranteed = MONEY_LADDER[i];
        }
    }

    return guaranteed;
};

module.exports = {
    MONEY_LADDER,
    getGuaranteedWinnings
};
