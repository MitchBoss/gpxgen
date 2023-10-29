// ui.js

// Function to toggle the visibility of an element
export function toggleVisibility(elementId) {
    const element = document.getElementById(elementId);
    element.style.display = (element.style.display === 'none' ? 'block' : 'none');
}

// Function to toggle settings visibility
export function toggleSettings() {
    toggleVisibility('settingsMenu');
}

// Function to toggle credits visibility
export function toggleCredits() {
    toggleVisibility('creditsSection');
}
