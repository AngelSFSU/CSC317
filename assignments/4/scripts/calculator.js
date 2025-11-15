const display = document.getElementById('display');
const calculator = document.getElementById('calculator-container');

let currentInput = '0';
let previousInput = null;
let operation = null;
let shouldResetDisplay = false;


function updateDisplay() {
    const formattedInput = currentInput.length > 9 ? parseFloat(currentInput).toPrecision(8) : currentInput;
    display.textContent = formattedInput;
}

function inputNumber(number) {
    if (shouldResetDisplay) {
        currentInput = number === '.' ? '0.' : number;
        shouldResetDisplay = false;
    } else if (currentInput === '0' && number !== '.') {
        currentInput = number;
    } else if (number === '.' && currentInput.includes('.')) {
        return;
    } else {
        currentInput += number;
    }
    updateDisplay();
}

function clearAll() {
    currentInput = '0';
    previousInput = null;
    operation = null;
    shouldResetDisplay = false;
    updateDisplay();

    const acButton = document.querySelector('[data-value="clear"]');
    if (acButton) {
        acButton.textContent = 'AC';
    }
}


function negate() {
    if (currentInput !== '0') {
        currentInput = String(parseFloat(currentInput) * -1);
        updateDisplay();
    }
}
 
function percent() {
    const value = parseFloat(currentInput);
    currentInput = String(value / 100);
    updateDisplay();
}

function handleOperator(nextOperation) {
    const inputValue = parseFloat(currentInput);

    if (previousInput === null) {
        previousInput = inputValue;
    } else if (operation) {
        const result = calculate(previousInput, operation, inputValue);
        currentInput = String(result);
        previousInput = result;
    }

    operation = nextOperation;
    shouldResetDisplay = true;
    updateDisplay();
}

function calculate(firstNum, operator, secondNum) {
    const a = parseFloat(firstNum);
    const b = parseFloat(secondNum);

    if (isNaN(a) || isNaN(b)) return 0;

    switch (operator) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/':
            if (b === 0) {
                return 'Error';
            }
            return a / b;
        default: return b;
    }
}

function handleEquals() {
    if (previousInput === null || operation === null) {
        return;
    }

    const result = calculate(previousInput, operation, parseFloat(currentInput));

    if (result === 'Error') {
        currentInput = 'Error';
        previousInput = null;
        operation = null;
        shouldResetDisplay = true;
    } else {
        currentInput = String(result);
        previousInput = parseFloat(currentInput);
        operation = null;
        shouldResetDisplay = true;
    }

    updateDisplay();
}

calculator.addEventListener('click', (event) => {
    const target = event.target;
    if (!target.classList.contains('calc-button')) {
        return;
    }

    const value = target.dataset.value;

    if (target.classList.contains('number')) {
        inputNumber(value);
    } else if (target.classList.contains('operator')) {
        handleOperator(value);
    } else {
        switch (value) {
            case 'clear':
                clearAll();
                break;
            case 'negate':
                negate();
                break;
            case 'percent':
                percent();
                break;
            case 'equals':
                handleEquals();
                break;
        }
    }

    const acButton = document.querySelector('[data-value="clear"]');
    if (currentInput === '0' && previousInput === null && operation === null) {
        acButton.textContent = 'AC';
    } else {
        acButton.textContent = 'C';
    }
});

document.addEventListener('keydown', (event) => {
    const key = event.key;
    
    if (['/', '*', '-', '+', 'Enter', 'Escape', '.'].includes(key)) {
        event.preventDefault();
    }

    if (key >= '0' && key <= '9') {
        inputNumber(key);
    } else if (key === '.') {
        inputNumber('.');
    } else if (key === '+') {
        handleOperator('+');
    } else if (key === '-') {
        handleOperator('-');
    } else if (key === '*' || key === 'x') {
        handleOperator('*');
    } else if (key === '/') {
        handleOperator('/');
    } else if (key === 'Enter' || key === '=') {
        handleEquals();
    } else if (key === 'Escape' || key === 'c') {
        clearAll();
    } else if (key === '%') {
        percent();
    }

    const acButton = document.querySelector('[data-value="clear"]');
    if (acButton) {
        if (currentInput === '0' && previousInput === null && operation === null) {
            acButton.textContent = 'AC';
        } else {
            acButton.textContent = 'C';
        }
    }
    
    updateDisplay(); 
});

window.onload = updateDisplay;