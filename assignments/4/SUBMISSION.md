CSC 317 Assignment 4 Implementation choices

1. Architecture and State Management

The core of the calculator is managed by four simple global variables:

Current Input: Shows the current integer on the screen/calculator.

Previous Input: The first operand is stored when an operator is pressed.

Operation: Stores the arithmetic function (+, -, *, /).

Should Reset Display: This is a crucial boolean flag set to true after an operator or the equals sign is pressed, ensuring the next number input clears the screen instead of appending to the current number.

2. Core Functionality and Edge Cases

Error Handling (Division by Zero): When inputting zero as the second operand during any division problem, the result is an Error, which is displayed to the user. All state variables are reset to null to lock the calculator until AC is pressed.

Input Validation: The input number function prevents multiple decimal points from being allowed in the input of the calculator.

3. Technical Requirements

Keyboard Support: Keyboard support is enabled for the purposes of the assignment requirements. All common inputs are present, i.e., numbers, operators, enter, and escape.