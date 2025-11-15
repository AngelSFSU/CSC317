const nameToGreet = "World"; 

const createMessage = (name) => {

    const message = `Hello, ${name}! The button was clicked at ${new Date().toLocaleTimeString()}.`;
    
    return message;
};

console.log(createMessage("JavaScript"));