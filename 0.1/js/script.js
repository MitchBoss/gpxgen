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
        let startAddress = startLocation.value.trim();
        let endAddress = sameLocationCheckbox.checked ? startAddress : endLocation.value.trim();

        startAddress = capitalizeWords(startAddress);
        endAddress = capitalizeWords(endAddress);

        logToConsole("Validating addresses...");

        validateAddress(startAddress, function (isValidStart) {
            if (isValidStart) {
                logToConsole(`Start location is valid: ${startAddress}`);
                startLocation.value = startAddress; // Update field with capitalized words

                if (sameLocationCheckbox.checked) {
                    saveButton.disabled = false;
                    logToConsole("End location is the same as the start location. Ready to save GPX.");
                    endLocation.value = startAddress; // Update field with capitalized words
                } else {
                    validateAddress(endAddress, function (isValidEnd) {
                        if (isValidEnd) {
                            logToConsole(`End location is valid: ${endAddress}`);
                            endLocation.value = endAddress; // Update field with capitalized words
                            saveButton.disabled = false;
                            logToConsole("Both start and end locations are valid. Ready to save GPX.");
                        } else {
                            logToConsole(`End location is invalid: ${endAddress}`);
                        }
                    });
                }
            } else {
                logToConsole(`Start location is invalid: ${startAddress}`);
            }
        });
    });

    saveButton.addEventListener('click', function () {
        const startCoords = getCoordinates(startLocation.value);
        const endCoords = getCoordinates(endLocation.value);
        const gpxData = createGPX(startCoords, endCoords);
        downloadGPX(gpxData, 'route.gpx');
        logToConsole("GPX file has been generated and downloaded.");
    });

    function capitalizeWords(str) {
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    function logToConsole(message) {
        consoleDiv.textContent += message + "\n";
        consoleDiv.scrollTop = consoleDiv.scrollHeight;
    }

    // The rest of your existing functions...
});














function getCoordinates(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                return { lat: data[0].lat, lon: data[0].lon };
            } else {
                throw new Error(`No results found for the address: ${address}`);
            }
        });
}

// ...


function createGPX(startCoords, endCoords) {
    return `
<?xml version="1.0"?>
<gpx version="1.1" creator="Google Maps to GPX Converter">
  <wpt lat="${startCoords.lat}" lon="${startCoords.lon}">
    <name>Start Location</name>
  </wpt>
  <wpt lat="${endCoords.lat}" lon="${endCoords.lon}">
    <name>End Location</name>
  </wpt>
</gpx>
`;
}

function downloadGPX(gpxData, filename) {
    const blob = new Blob([gpxData], {type: 'application/gpx+xml'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ... rest of the script ...

    validateButton.addEventListener('click', function () {
        const startAddress = startLocation.value.trim();
        const endAddress = sameLocationCheckbox.checked ? startAddress : endLocation.value.trim();

        if (!startAddress) {
            logToConsole("Please enter a start location.");
            return;
        }
        if (!sameLocationCheckbox.checked && !endAddress) {
            logToConsole("Please enter an end location.");
            return;
        }

        validateAddress(startAddress, function (isValidStart) {
            if (isValidStart) {
                logToConsole(`Start location is valid: ${startAddress}`);
                if (sameLocationCheckbox.checked || endAddress === startAddress) {
                    saveButton.disabled = false;
                    logToConsole("End location is the same as the start location. Ready to save GPX.");
                } else {
                    validateAddress(endAddress, function (isValidEnd) {
                        if (isValidEnd) {
                            logToConsole(`End location is valid: ${endAddress}`);
                            saveButton.disabled = false;
                            logToConsole("Both start and end locations are valid. Ready to save GPX.");
                        } else {
                            logToConsole(`End location is invalid: ${endAddress}`);
                        }
                    });
                }
            } else {
                logToConsole(`Start location is invalid: ${startAddress}`);
            }
        });
    });

    function validateAddress(address, callback) {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    callback(true);
                } else {
                    callback(false);
                }
            })
            .catch(error => {
                logToConsole(`Error validating address: ${error}`);
                callback(false);
            });
    }

    

