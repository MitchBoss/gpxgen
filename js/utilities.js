// utilities.js

// Function to log a message to the console element
export function logToConsole(message) {
    const consoleDiv = document.getElementById('console');
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    consoleDiv.appendChild(messageElement);
    // Scroll to the bottom of the console
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}
