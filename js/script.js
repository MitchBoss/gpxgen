// Declare consoleDiv at the top level to make it globally accessible
const consoleDiv = document.getElementById('console');

// Move logToConsole function to top-level so it's accessible globally
function logToConsole(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent += message + "\n\n"; // Ensure each message is on a new line
    messageElement.className = 'console-message';
    consoleDiv.appendChild(messageElement);
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

// ... (rest of the provided code remains unchanged) ...



let debugMode = false; // Set to true to enable debug mode

// Function to toggle debugMode and print its status
function toggleDebugMode() {
    debugMode = !debugMode;
    logToConsole(`Debug mode is now: ${debugMode ? "ON" : "OFF"}`);
}

// Add an event listener to the debug switch (assuming it's a checkbox)
const debugSwitch = document.getElementById('debugSwitch');
debugSwitch.addEventListener('change', toggleDebugMode);

document.getElementById('settingsButton').addEventListener('click', function() {
    var app = document.getElementById('app');
    var settingsMenu = document.getElementById('settingsMenu');
    
    // Check if the settings menu is currently shown
    if (settingsMenu.style.display === 'none') {
        // Fade out the app content
        app.classList.add('fade-out');
        setTimeout(function() {
            app.style.display = 'none'; // Hide app content after fade out
            settingsMenu.style.display = 'block'; // Show settings menu
            settingsMenu.classList.remove('fade-out');
            settingsMenu.classList.add('fade-in'); // Fade in the settings menu
        }, 500); // This timeout duration should match the fade-out animation duration
    } else {
        // Fade out the settings menu
        settingsMenu.classList.remove('fade-in');
        settingsMenu.classList.add('fade-out');
        setTimeout(function() {
            settingsMenu.style.display = 'none'; // Hide settings menu after fade out
            app.style.display = 'block'; // Show app content
            app.classList.remove('fade-out');
            app.classList.add('fade-in'); // Fade in the app content
        }, 500); // This timeout duration should match the fade-out animation duration
    }
});


//More 

// Existing scripts...

document.addEventListener('DOMContentLoaded', function() {
    // Reference to the theme selector dropdown
    const themeSelector = document.getElementById('themeSelector');
    
    // Listen for changes to the theme selector dropdown
    themeSelector.addEventListener('change', function(event) {
        const selectedTheme = event.target.value;
        applyTheme(selectedTheme);
    });

    if (debugMode) {
        // Clear local storage and avoid setting any theme if debugMode is true
        localStorage.clear();
    } else {
        // Apply theme from local storage if it exists
        const savedTheme = localStorage.getItem('selectedTheme');
        if (savedTheme) {
            themeSelector.value = savedTheme;
            applyTheme(savedTheme);
        }
    }
});

// Function to apply the selected theme
function applyTheme(theme) {
    // Reference to the theme stylesheet link in the document head
    let themeLink = document.getElementById('dynamicThemeStyle');
    if (!themeLink) {
        themeLink = document.createElement('link');
        themeLink.rel = 'stylesheet';
        themeLink.id = 'dynamicThemeStyle';
        document.head.appendChild(themeLink);
    }
    // Set the href of the themeLink to the appropriate CSS file based on the selected theme
    if (theme !== 'select_theme') {  // Corrected the typo here
        themeLink.href = `/css/theme/${theme}.css`;
        if (debugMode) {
            logToConsole(`Theme changed to: ${theme}`);
            logToConsole(`Theme href: ${themeLink.href}`);
        }
        localStorage.setItem('selectedTheme', theme); // Save the theme preference to local storage
    } else {
        themeLink.href = ''; // Reset to default if "Select Theme" is chosen
        if (debugMode) {
            logToConsole('Theme reset to default');
        }
        localStorage.removeItem('selectedTheme');
    }
}



// Event listener for the settings button
document.getElementById('settingsButton').addEventListener('click', function() {
    // Toggle the visibility of the settings menu
});

// Event listener for the debug mode switch
document.getElementById('debugSwitch').addEventListener('change', function() {
    // Code to enable/disable debug mode
});

// Event listener for the width slider
document.getElementById('widthSlider').addEventListener('input', function() {
    var app = document.getElementById('app');
    // Adjust the width of the app container based on the slider value
    app.style.width = this.value + 'px';
});

// Event listener for the credits button
document.getElementById('creditsButton').addEventListener('click', function() {
    // Show the credits section
});


// end settings



document.addEventListener('DOMContentLoaded', function () {
    const startLocation = document.getElementById('startLocation');
    const endLocation = document.getElementById('endLocation');
    const sameLocationCheckbox = document.getElementById('sameLocation');
    const validateButton = document.getElementById('validateButton');
    const saveButton = document.getElementById('saveButton');
    const consoleDiv = document.getElementById('console');
    const mapDiv = document.getElementById('map');
    const appDiv = document.getElementById('app');
    const settingsButton = document.getElementById('settingsButton');

    
    // Initialize OpenLayers map
    const map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([0, 0]),
            zoom: 2
        })
    });


    sameLocationCheckbox.addEventListener('change', function () {
        endLocation.disabled = this.checked;
        if (this.checked) {
            endLocation.value = startLocation.value;
        }
    });

    validateButton.addEventListener('click', function () {
        const startAddress = capitalizeWords(startLocation.value.trim());
        const endAddress = sameLocationCheckbox.checked ? startAddress : capitalizeWords(endLocation.value.trim());

        if (!startAddress) {
            logToConsole("No start location specified.");
            return;
        }

        logToConsole("Validating addresses...");

        getCoordinates(startAddress).then(startCoords => {
            logToConsole(`Start location is valid: ${startAddress}`);
        map.getView().setCenter(ol.proj.fromLonLat([startCoords.lon, startCoords.lat]));
        map.getView().setZoom(14);
        mapDiv.classList.add('active');

            if (sameLocationCheckbox.checked || startAddress === endAddress) {
                saveButton.disabled = false;
                logToConsole("End location is the same as the start location. Ready to save GPX.");
            } else if (!endAddress) {
                logToConsole("No end location specified.");
                saveButton.disabled = true;
            } else {
                getCoordinates(endAddress).then(endCoords => {
                    logToConsole(`End location is valid: ${endAddress}`);
                    saveButton.disabled = false;
                    logToConsole("Both start and end locations are valid. Ready to save GPX.");
                }).catch(error => {
                    logToConsole(error.message);
                    saveButton.disabled = true;
                });
            }
        }).catch(error => {
            logToConsole(error.message);
            saveButton.disabled = true;
        });
    });

    saveButton.addEventListener('click', function () {
        const startAddress = capitalizeWords(startLocation.value.trim());
        const endAddress = sameLocationCheckbox.checked ? startAddress : capitalizeWords(endLocation.value.trim());

        Promise.all([getCoordinates(startAddress), sameLocationCheckbox.checked ? Promise.resolve(null) : getCoordinates(endAddress)])
            .then(([startCoords, endCoords]) => {
                endCoords = sameLocationCheckbox.checked ? startCoords : endCoords;
                const gpxData = createGPX(startCoords, endCoords);
                downloadGPX(gpxData, 'route.gpx');
                logToConsole("GPX file has been generated and downloaded.");
            }).catch(error => {
                logToConsole(`Error generating GPX: ${error.message}`);
            });
    });

    function capitalizeWords(str) {
        return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
    }

    function logToConsole(message) {
        const messageElement = document.createElement('div');
        messageElement.textContent += message + "\n\n"; // Ensure each message is on a new line
        messageElement.className = 'console-message';
        consoleDiv.appendChild(messageElement);
        consoleDiv.scrollTop = consoleDiv.scrollHeight;
    }
    

    function getCoordinates(address) {
        if (!address) {
            return Promise.reject(new Error('Address not specified'));
        }
    
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    
        if (debugMode) {
            logToConsole(`Requesting coordinates for address: ${address}`);
        }
    
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data && data.length === 1) {
                    if (debugMode) {
                        logToConsole(`Data received: ${JSON.stringify(data[0], null, 2)}`);
                    }
                    const lat = parseFloat(data[0].lat);
const lon = parseFloat(data[0].lon);
updateMapWithLocation(lat, lon);
return { lat: lat, lon: lon };
                } else if (data.length > 1) {
                    throw new Error("Multiple results for your search. Be more specific.");
                } else {
                    throw new Error(`No results found for the address: ${address}`);
                }
            });
    }

    function createGPX(startCoords, endCoords) {
        const gpxStart = `
            <wpt lat="${startCoords.lat}" lon="${startCoords.lon}">
                <name>Start Location</name>
            </wpt>`;
        const gpxEnd = endCoords ? `
            <wpt lat="${endCoords.lat}" lon="${endCoords.lon}">
                <name>End Location</name>
            </wpt>` : '';

        return `<?xml version="1.0" encoding="UTF-8"?>
<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" creator="Google Maps to GPX Converter">
    <trk>
        <name>Track</name>
        <trkseg>${gpxStart}${gpxEnd}</trkseg>
    </trk>
</gpx>`;
    }

    function downloadGPX(gpxData, filename) {
        const blob = new Blob([gpxData], { type: 'application/gpx+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});

settingsButton.addEventListener('click', function() {
    if (appDiv.classList.contains('flipped')) {
        appDiv.classList.remove('flipped');
    } else {
        appDiv.classList.add('flipped');
    }
});
