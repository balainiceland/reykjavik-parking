(function() {
    'use strict';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        initRvkParkingMap();
    });

    function initRvkParkingMap() {
        var mapContainer = document.getElementById('rvk-parking-map');
        if (!mapContainer) {
            return;
        }

        // Initialize the map
        var map = L.map('rvk-parking-map').setView(RVK_PARKING_CENTER, 15);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);

        // Custom icons
        var garageIcon = L.divIcon({
            className: 'rvk-garage-marker',
            html: 'P',
            iconSize: [28, 28],
            iconAnchor: [14, 14]
        });

        var lotIcon = L.divIcon({
            className: 'rvk-lot-marker',
            iconSize: [22, 22],
            iconAnchor: [11, 11]
        });

        // Add parking zones as polygons (render P3 first, then P2, then P1 so P1 is on top)
        var zoneOrder = ['p3', 'p2', 'p1'];

        zoneOrder.forEach(function(zoneKey) {
            var zone = rvkParkingZones[zoneKey];
            var polygon = L.polygon(zone.bounds, {
                color: zone.color,
                fillColor: zone.color,
                fillOpacity: 0.15,
                weight: 2
            }).addTo(map);

            polygon.bindPopup(
                '<div class="rvk-popup-title">' + zone.name + '</div>' +
                '<div class="rvk-popup-detail"><strong>Rate:</strong> ' + zone.rate + '</div>' +
                '<div class="rvk-popup-detail"><strong>Hours:</strong> ' + zone.hours + '</div>' +
                '<div class="rvk-popup-detail" style="margin-top: 8px; color: #28a745;"><strong>Free after 18:00 & Sundays</strong></div>'
            );
        });

        // Add parking markers
        rvkParkingGarages.forEach(function(parking) {
            var icon = parking.type === 'garage' ? garageIcon : lotIcon;

            var marker = L.marker([parking.lat, parking.lng], { icon: icon })
                .addTo(map);

            // Create popup content
            var popupContent =
                '<div class="rvk-popup-title">' + parking.name + '</div>' +
                '<div class="rvk-popup-detail"><strong>Address:</strong> ' + parking.address + '</div>' +
                '<div class="rvk-popup-detail"><strong>Capacity:</strong> ' + parking.capacity + ' spaces</div>' +
                '<div class="rvk-popup-detail"><strong>Hours:</strong> ' + parking.hours + '</div>' +
                '<div class="rvk-popup-detail"><strong>Rates:</strong> ' + parking.rates + '</div>';

            marker.bindPopup(popupContent);

            // Update sidebar on click
            marker.on('click', function() {
                updateSidebar(parking);
            });
        });

        // Fit map to show all markers
        var bounds = L.latLngBounds(rvkParkingGarages.map(function(p) {
            return [p.lat, p.lng];
        }));
        map.fitBounds(bounds.pad(0.2));

        // Add a scale control
        L.control.scale({ metric: true, imperial: false }).addTo(map);
    }

    function updateSidebar(parking) {
        var panel = document.getElementById('rvk-selected-parking');
        var hint = document.querySelector('.rvk-hint');

        if (!panel) return;

        var nameEl = document.getElementById('rvk-parking-name');
        var addressEl = document.getElementById('rvk-parking-address');
        var capacityEl = document.getElementById('rvk-parking-capacity');
        var hoursEl = document.getElementById('rvk-parking-hours');
        var ratesEl = document.getElementById('rvk-parking-rates');

        if (nameEl) nameEl.textContent = parking.name;
        if (addressEl) addressEl.textContent = parking.address;
        if (capacityEl) capacityEl.textContent = parking.capacity + ' spaces';
        if (hoursEl) hoursEl.textContent = parking.hours;
        if (ratesEl) ratesEl.textContent = parking.rates;

        panel.classList.remove('rvk-hidden');
        if (hint) hint.style.display = 'none';
    }

})();
