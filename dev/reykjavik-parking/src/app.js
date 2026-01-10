// Initialize the map
const map = L.map('map').setView(REYKJAVIK_CENTER, 15);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
}).addTo(map);

// Custom icons
const garageIcon = L.divIcon({
    className: 'garage-marker',
    html: 'P',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

const lotIcon = L.divIcon({
    className: 'street-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

// Add parking zones as polygons (render P3 first, then P2, then P1 so P1 is on top)
const zoneOrder = ['p3', 'p2', 'p1'];
const zoneLayers = {};

zoneOrder.forEach(zoneKey => {
    const zone = parkingZones[zoneKey];
    const polygon = L.polygon(zone.bounds, {
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: 0.15,
        weight: 2
    }).addTo(map);

    polygon.bindPopup(`
        <div class="popup-title">${zone.name}</div>
        <div class="popup-detail"><strong>Rate:</strong> ${zone.rate}</div>
        <div class="popup-detail"><strong>Hours:</strong> ${zone.hours}</div>
        <div class="popup-detail" style="margin-top: 8px; color: #4ecca3;">Free after 18:00 & Sundays</div>
    `);

    zoneLayers[zoneKey] = polygon;
});

// Add parking markers
const markers = [];

parkingGarages.forEach(parking => {
    const icon = parking.type === 'garage' ? garageIcon : lotIcon;

    const marker = L.marker([parking.lat, parking.lng], { icon: icon })
        .addTo(map);

    // Create popup content
    const popupContent = `
        <div class="popup-title">${parking.name}</div>
        <div class="popup-detail"><strong>Address:</strong> ${parking.address}</div>
        <div class="popup-detail"><strong>Capacity:</strong> ${parking.capacity} spaces</div>
        <div class="popup-detail"><strong>Hours:</strong> ${parking.hours}</div>
        <div class="popup-detail"><strong>Rates:</strong> ${parking.rates}</div>
    `;

    marker.bindPopup(popupContent);

    // Update sidebar on click
    marker.on('click', () => {
        updateSidebar(parking);
    });

    markers.push({ marker, data: parking });
});

// Update sidebar with parking details
function updateSidebar(parking) {
    const panel = document.getElementById('selected-parking');
    const hint = document.querySelector('.hint');

    document.getElementById('parking-name').textContent = parking.name;
    document.getElementById('parking-address').textContent = parking.address;
    document.getElementById('parking-capacity').textContent = `${parking.capacity} spaces`;
    document.getElementById('parking-hours').textContent = parking.hours;
    document.getElementById('parking-rates').textContent = parking.rates;

    panel.classList.remove('hidden');
    hint.style.display = 'none';
}

// Fit map to show all markers
const bounds = L.latLngBounds(parkingGarages.map(p => [p.lat, p.lng]));
map.fitBounds(bounds.pad(0.2));

// Add a scale control
L.control.scale({ metric: true, imperial: false }).addTo(map);

console.log('Reykjavik Parking App loaded successfully');
