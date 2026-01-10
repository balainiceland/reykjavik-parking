(function() {
    'use strict';

    var currentLang = 'en';
    var selectedParking = null;
    var map = null;

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        initRvkParkingMap();
    });

    function t(key) {
        return rvkTranslations[currentLang][key] || key;
    }

    function initRvkParkingMap() {
        var mapContainer = document.getElementById('rvk-parking-map');
        if (!mapContainer) {
            return;
        }

        // Initialize the map
        map = L.map('rvk-parking-map').setView(RVK_PARKING_CENTER, 15);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
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

        // Add parking zones as polygons
        var zoneOrder = ['p3', 'p2', 'p1'];

        zoneOrder.forEach(function(zoneKey) {
            var zone = rvkParkingZones[zoneKey];
            var polygon = L.polygon(zone.bounds, {
                color: zone.color,
                fillColor: zone.color,
                fillOpacity: 0.15,
                weight: 2
            }).addTo(map);

            polygon.on('click', function() {
                var name = currentLang === 'is' ? zone.nameIs : zone.name;
                var rate = currentLang === 'is' ? zone.rateTextIs : zone.rateText;
                var hours = currentLang === 'is' ? zone.hoursIs : zone.hours;

                polygon.bindPopup(
                    '<div class="rvk-popup-title">' + name + '</div>' +
                    '<div class="rvk-popup-detail"><strong>' + t('rates') + ':</strong> ' + rate + '</div>' +
                    '<div class="rvk-popup-detail"><strong>' + t('hours') + ':</strong> ' + hours + '</div>' +
                    '<div class="rvk-popup-detail" style="margin-top: 8px; color: #28a745;"><strong>' + t('tip1') + '</strong></div>'
                ).openPopup();
            });
        });

        // Add parking markers
        rvkParkingGarages.forEach(function(parking) {
            var icon = parking.type === 'garage' ? garageIcon : lotIcon;

            var marker = L.marker([parking.lat, parking.lng], { icon: icon })
                .addTo(map);

            marker.on('click', function() {
                selectedParking = parking;
                updateSidebar(parking);
                showPopup(marker, parking);
            });
        });

        // Fit map to show all markers
        var bounds = L.latLngBounds(rvkParkingGarages.map(function(p) {
            return [p.lat, p.lng];
        }));
        map.fitBounds(bounds.pad(0.2));

        // Add scale control
        L.control.scale({ metric: true, imperial: false }).addTo(map);

        // Initialize language toggle
        initLanguageToggle();

        // Initialize free parking indicator
        updateFreeIndicator();
        setInterval(updateFreeIndicator, 60000); // Update every minute

        // Initialize calculator
        initCalculator();

        // Update UI text
        updateUIText();
    }

    function showPopup(marker, parking) {
        var name = currentLang === 'is' ? parking.nameIs : parking.name;
        var hours = currentLang === 'is' ? parking.hoursIs : parking.hours;
        var rates = currentLang === 'is' ? parking.ratesIs : parking.rates;

        var directionsUrl = 'https://www.google.com/maps/dir/?api=1&destination=' + parking.lat + ',' + parking.lng;

        var popupContent =
            '<div class="rvk-popup-title">' + name + '</div>' +
            '<div class="rvk-popup-detail"><strong>' + t('address') + ':</strong> ' + parking.address + '</div>' +
            '<div class="rvk-popup-detail"><strong>' + t('capacity') + ':</strong> ' + parking.capacity + ' ' + t('spaces') + '</div>' +
            '<div class="rvk-popup-detail"><strong>' + t('hours') + ':</strong> ' + hours + '</div>' +
            '<div class="rvk-popup-detail"><strong>' + t('rates') + ':</strong> ' + rates + '</div>' +
            '<a href="' + directionsUrl + '" target="_blank" class="rvk-directions-btn">' + t('directions') + ' →</a>';

        marker.bindPopup(popupContent).openPopup();
    }

    function updateSidebar(parking) {
        var panel = document.getElementById('rvk-selected-parking');
        var hint = document.querySelector('.rvk-hint');

        if (!panel) return;

        var name = currentLang === 'is' ? parking.nameIs : parking.name;
        var hours = currentLang === 'is' ? parking.hoursIs : parking.hours;
        var rates = currentLang === 'is' ? parking.ratesIs : parking.rates;

        var nameEl = document.getElementById('rvk-parking-name');
        var addressEl = document.getElementById('rvk-parking-address');
        var capacityEl = document.getElementById('rvk-parking-capacity');
        var hoursEl = document.getElementById('rvk-parking-hours');
        var ratesEl = document.getElementById('rvk-parking-rates');
        var directionsEl = document.getElementById('rvk-directions-link');

        if (nameEl) nameEl.textContent = name;
        if (addressEl) addressEl.textContent = parking.address;
        if (capacityEl) capacityEl.textContent = parking.capacity + ' ' + t('spaces');
        if (hoursEl) hoursEl.textContent = hours;
        if (ratesEl) ratesEl.textContent = rates;

        if (directionsEl) {
            directionsEl.href = 'https://www.google.com/maps/dir/?api=1&destination=' + parking.lat + ',' + parking.lng;
            directionsEl.textContent = t('directions') + ' →';
        }

        panel.classList.remove('rvk-hidden');
        if (hint) hint.style.display = 'none';

        // Update calculator result if hours are set
        var hoursInput = document.getElementById('rvk-calc-hours');
        if (hoursInput && hoursInput.value) {
            calculateAndDisplay();
        }
    }

    function initLanguageToggle() {
        var toggle = document.getElementById('rvk-lang-toggle');
        if (!toggle) return;

        toggle.addEventListener('click', function() {
            currentLang = currentLang === 'en' ? 'is' : 'en';
            toggle.textContent = currentLang === 'en' ? 'IS' : 'EN';
            updateUIText();

            // Update sidebar if parking is selected
            if (selectedParking) {
                updateSidebar(selectedParking);
            }
        });
    }

    function updateUIText() {
        // Update all translatable elements
        var elements = {
            'rvk-title': t('title'),
            'rvk-hint-text': t('hint'),
            'rvk-stats-title': t('statsTitle'),
            'rvk-stat-garage-label': t('garageSpaces'),
            'rvk-stat-paid-label': t('paidStreet'),
            'rvk-stat-free-label': t('freeStreet'),
            'rvk-legend-title': t('legend'),
            'rvk-legend-garage': t('garage'),
            'rvk-legend-lot': t('lot'),
            'rvk-tips-title': t('tips'),
            'rvk-tip1': t('tip1'),
            'rvk-tip2': t('tip2'),
            'rvk-tip3': t('tip3'),
            'rvk-tip4': t('tip4'),
            'rvk-calc-title': t('calculator'),
            'rvk-calc-duration-label': t('duration'),
            'rvk-calc-button': t('calculate')
        };

        for (var id in elements) {
            var el = document.getElementById(id);
            if (el) el.textContent = elements[id];
        }

        // Update labels
        var labelMappings = {
            'rvk-label-address': t('address') + ':',
            'rvk-label-capacity': t('capacity') + ':',
            'rvk-label-hours': t('hours') + ':',
            'rvk-label-rates': t('rates') + ':'
        };

        for (var labelId in labelMappings) {
            var labelEl = document.getElementById(labelId);
            if (labelEl) labelEl.textContent = labelMappings[labelId];
        }

        // Update zone legend
        ['p1', 'p2', 'p3'].forEach(function(zoneKey) {
            var zone = rvkParkingZones[zoneKey];
            var el = document.getElementById('rvk-legend-' + zoneKey);
            if (el) {
                var name = currentLang === 'is' ? zone.nameIs : zone.name;
                var rate = currentLang === 'is' ? zone.rateTextIs : zone.rateText;
                el.textContent = name + ' (' + rate + ')';
            }
        });

        // Update free indicator
        updateFreeIndicator();

        // Update directions link text
        var directionsEl = document.getElementById('rvk-directions-link');
        if (directionsEl && selectedParking) {
            directionsEl.textContent = t('directions') + ' →';
        }
    }

    function updateFreeIndicator() {
        var indicator = document.getElementById('rvk-free-indicator');
        if (!indicator) return;

        var status = isStreetParkingFree();

        if (status.free) {
            indicator.className = 'rvk-free-indicator rvk-free';
            indicator.innerHTML = '<span class="rvk-indicator-icon">✓</span> ' + t('freeNow');
        } else {
            indicator.className = 'rvk-free-indicator rvk-paid';
            indicator.innerHTML = '<span class="rvk-indicator-icon">$</span> ' + t('paidNow') + ' ' + status.until;
        }
    }

    function initCalculator() {
        var button = document.getElementById('rvk-calc-button');
        var input = document.getElementById('rvk-calc-hours');

        if (!button || !input) return;

        button.addEventListener('click', calculateAndDisplay);

        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                calculateAndDisplay();
            }
        });
    }

    function calculateAndDisplay() {
        var input = document.getElementById('rvk-calc-hours');
        var result = document.getElementById('rvk-calc-result');

        if (!input || !result) return;

        var hours = parseFloat(input.value);

        if (!selectedParking) {
            result.textContent = t('selectParking');
            result.className = 'rvk-calc-result rvk-calc-error';
            return;
        }

        if (isNaN(hours) || hours <= 0) {
            result.textContent = '';
            return;
        }

        var cost = calculateParkingCost(selectedParking, hours);
        result.textContent = t('estimatedCost') + ': ' + cost.toLocaleString() + ' ISK';
        result.className = 'rvk-calc-result';
    }

})();
