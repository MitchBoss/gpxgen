// map.js

// Map initialization function
export function initMap() {
    const map = new ol.Map({
        target: 'map', // The HTML element ID for the map container
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([0, 0]), // Center on the Atlantic Ocean
            zoom: 2 // Initial zoom level
        })
    });

    return map;
}

// Function to update the map view to a new location
export function updateMapWithLocation(map, lat, lon) {
    const view = map.getView();
    const newCenter = ol.proj.fromLonLat([lon, lat]);
    view.animate({
        center: newCenter, // New center
        duration: 2000  // Two seconds
    });
}
