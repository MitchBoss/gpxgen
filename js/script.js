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

        logToConsole("Validating addresses...");

        Promise.all([getCoordinates(startAddress), getCoordinates(endAddress)]).then(([startCoords, endCoords]) => {
            logToConsole(`Start location is valid: ${startAddress}`);
            logToConsole(`End location is valid: ${endAddress}`);
            saveButton.disabled = false;
            startLocation.value = startAddress;
            endLocation.value = endAddress;
            logToConsole("Both start and end locations are valid. Ready to save GPX.");
        }).catch(error => {
            logToConsole(`Error: ${error.message}`);
            saveButton.disabled = true;
        });
    });

    saveButton.addEventListener('click', function () {
        const startAddress = capitalizeWords(startLocation.value.trim());
        const endAddress = sameLocationCheckbox.checked ? startAddress : capitalizeWords(endLocation.value.trim());

        Promise.all([getCoordinates(startAddress), getCoordinates(endAddress)]).then(([startCoords, endCoords]) => {
            const gpxData = createGPX(startCoords, endCoords);
            downloadGPX(gpxData, 'route.gpx');
            logToConsole("GPX file has been generated and downloaded.");
        }).catch(error => {
            logToConsole(`Error generating GPX: ${error.message}`);
        });
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
});

function getCoordinates(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
            } else {
                throw new Error(`No results found for the address: ${address}`);
            }
        });
}

function createGPX(startCoords, endCoords) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" version="1.1" creator="Google Maps to GPX Converter">
  <trk>
    <name>Track</name>
    <trkseg>
      <trkpt lat="${startCoords.lat}" lon="${startCoords.lon}">
        <name>Start Location</name>
      </trkpt>
      <trkpt lat="${endCoords.lat}" lon="${endCoords.lon}">
        <name>End Location</name>
      </trkpt>
    </trkseg>
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
