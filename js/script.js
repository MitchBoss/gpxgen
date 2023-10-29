const debugMode = false; // Set to true to enable debug mode

document.addEventListener('DOMContentLoaded', function () {
    const startLocation = document.getElementById('startLocation');
    const endLocation = document.getElementById('endLocation');
    const sameLocationCheckbox = document.getElementById('sameLocation');
    const validateButton = document.getElementById('validateButton');
    const saveButton = document.getElementById('saveButton');
    const consoleDiv = document.getElementById('console');

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
                    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
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
