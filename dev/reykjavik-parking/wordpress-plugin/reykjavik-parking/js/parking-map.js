(function() {
    'use strict';

    var currentLang = 'en';
    var selectedParking = null;
    var map = null;

    document.addEventListener('DOMContentLoaded', function() {
        initRvkParkingMap();
    });

    function t(key) {
        return rvkTranslations[currentLang][key] || key;
    }

    function getMarkerClass(type) {
        switch(type) {
            case 'mall': return 'rvk-mall-marker';
            case 'transit': return 'rvk-transit-marker';
            case 'university': return 'rvk-university-marker';
            default: return 'rvk-garage-marker';
        }
    }

    function getMarkerLabel(type) {
        switch(type) {
            case 'mall': return 'M';
            case 'transit': return 'B';
            case 'university': return 'U';
            default: return 'P';
        }
    }

    function initRvkParkingMap() {
        var mapContainer = document.getElementById('rvk-parking-map');
        if (!mapContainer) return;

        // Initialize map - zoom out to show all locations
        map = L.map('rvk-parking-map').setView([64.13, -21.92], 12);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(map);

        // Add parking zones
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
                    '<div class="rvk-popup-detail rvk-free-note">' + t('tip1') + '</div>'
                ).openPopup();
            });
        });

        // Add parking markers
        rvkParkingGarages.forEach(function(parking) {
            var markerClass = getMarkerClass(parking.type);
            var markerLabel = getMarkerLabel(parking.type);

            // Add EV indicator to class if has charging
            if (parking.evCharging) {
                markerClass += ' rvk-has-ev';
            }

            var icon = L.divIcon({
                className: markerClass,
                html: markerLabel,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });

            var marker = L.marker([parking.lat, parking.lng], { icon: icon }).addTo(map);

            marker.on('click', function() {
                selectedParking = parking;
                updateSidebar(parking);
                showPopup(marker, parking);
            });
        });

        // Fit to show all markers
        var bounds = L.latLngBounds(rvkParkingGarages.map(function(p) {
            return [p.lat, p.lng];
        }));
        map.fitBounds(bounds.pad(0.1));

        L.control.scale({ metric: true, imperial: false }).addTo(map);

        initLanguageToggle();
        updateFreeIndicator();
        setInterval(updateFreeIndicator, 60000);
        initCalculator();
        updateUIText();
    }

    function showPopup(marker, parking) {
        var name = currentLang === 'is' ? parking.nameIs : parking.name;
        var hours = currentLang === 'is' ? parking.hoursIs : parking.hours;
        var rates = currentLang === 'is' ? parking.ratesIs : parking.rates;
        var directionsUrl = 'https://www.google.com/maps/dir/?api=1&destination=' + parking.lat + ',' + parking.lng;

        var evHtml = '';
        if (parking.evCharging) {
            evHtml = '<div class="rvk-popup-ev">⚡ ' + parking.evStations + ' ' + t('evStations') + '</div>';
        }

        var freeHtml = '';
        if (parking.isFree) {
            freeHtml = '<div class="rvk-popup-free">✓ ' + t('freeParking') + '</div>';
        }

        var popupContent =
            '<div class="rvk-popup-title">' + name + '</div>' +
            '<div class="rvk-popup-detail"><strong>' + t('address') + ':</strong> ' + parking.address + '</div>' +
            '<div class="rvk-popup-detail"><strong>' + t('capacity') + ':</strong> ' + parking.capacity + ' ' + t('spaces') + '</div>' +
            '<div class="rvk-popup-detail"><strong>' + t('hours') + ':</strong> ' + hours + '</div>' +
            '<div class="rvk-popup-detail"><strong>' + t('rates') + ':</strong> ' + rates + '</div>' +
            evHtml + freeHtml +
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
        var evEl = document.getElementById('rvk-ev-info');

        if (nameEl) nameEl.textContent = name;
        if (addressEl) addressEl.textContent = parking.address;
        if (capacityEl) capacityEl.textContent = parking.capacity + ' ' + t('spaces');
        if (hoursEl) hoursEl.textContent = hours;
        if (ratesEl) ratesEl.textContent = rates;

        if (directionsEl) {
            directionsEl.href = 'https://www.google.com/maps/dir/?api=1&destination=' + parking.lat + ',' + parking.lng;
            directionsEl.textContent = t('directions') + ' →';
        }

        if (evEl) {
            if (parking.evCharging) {
                evEl.innerHTML = '⚡ ' + parking.evStations + ' ' + t('evStations');
                evEl.style.display = 'block';
            } else {
                evEl.style.display = 'none';
            }
        }

        panel.classList.remove('rvk-hidden');
        if (hint) hint.style.display = 'none';

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
            if (selectedParking) {
                updateSidebar(selectedParking);
            }
        });
    }

    function updateUIText() {
        var elements = {
            'rvk-title': t('title'),
            'rvk-hint-text': t('hint'),
            'rvk-stats-title': t('statsTitle'),
            'rvk-stat-garage-label': t('garageSpaces'),
            'rvk-stat-paid-label': t('paidStreet'),
            'rvk-stat-free-label': t('freeStreet'),
            'rvk-legend-title': t('legend'),
            'rvk-legend-garage': t('garage'),
            'rvk-legend-mall': t('mall'),
            'rvk-legend-ev': t('evCharging'),
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

        ['p1', 'p2', 'p3'].forEach(function(zoneKey) {
            var zone = rvkParkingZones[zoneKey];
            var el = document.getElementById('rvk-legend-' + zoneKey);
            if (el) {
                var name = currentLang === 'is' ? zone.nameIs : zone.name;
                var rate = currentLang === 'is' ? zone.rateTextIs : zone.rateText;
                el.textContent = name + ' (' + rate + ')';
            }
        });

        updateFreeIndicator();

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
            if (e.key === 'Enter') calculateAndDisplay();
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
        if (cost === 0 && selectedParking.isFree) {
            result.textContent = t('free') + '!';
        } else {
            result.textContent = t('estimatedCost') + ': ' + cost.toLocaleString() + ' ISK';
        }
        result.className = 'rvk-calc-result';
    }

})();
