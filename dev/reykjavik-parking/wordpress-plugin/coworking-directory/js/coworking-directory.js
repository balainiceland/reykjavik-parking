(function() {
    'use strict';

    // Data source - jsDelivr CDN mirrors GitHub with caching
    var DATA_URL = 'https://cdn.jsdelivr.net/gh/balainiceland/reykjavik-parking@master/dev/reykjavik-parking/wordpress-plugin/coworking-directory/js/coworking-data.json';

    // Cache settings
    var CACHE_KEY = 'icd_coworking_cache';
    var CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour

    var filteredSpaces = [];
    var currentFilters = {
        search: '',
        type: 'all',
        city: 'all',
        audience: 'all'
    };

    // Data arrays (loaded dynamically)
    var coworkingSpaces = [];
    var SPACE_TYPES = [];
    var CITIES = [];
    var TARGET_AUDIENCES = [];
    var AMENITIES = [];

    // Map variables
    var map = null;
    var markers = [];
    var currentView = 'map'; // 'map' or 'list'

    document.addEventListener('DOMContentLoaded', function() {
        loadData();
    });

    function loadData() {
        var container = document.getElementById('icd-directory-container');
        if (!container) return;

        // Show loading state
        var grid = document.getElementById('icd-space-grid');
        if (grid) {
            grid.innerHTML = '<div class="icd-loading">Loading co-working spaces...</div>';
        }

        // Try to load from cache first
        var cached = getFromCache();
        if (cached) {
            console.log('Loaded coworking data from cache');
            applyData(cached);
            initDirectory();
            fetchFreshData(true);
            return;
        }

        // Check if data is already loaded via script tag (fallback)
        if (typeof window.icelandCoworkingSpaces !== 'undefined' && window.icelandCoworkingSpaces.length > 0) {
            console.log('Using bundled coworking data (fallback)');
            coworkingSpaces = window.icelandCoworkingSpaces;
            SPACE_TYPES = window.SPACE_TYPES || [];
            CITIES = window.CITIES || [];
            TARGET_AUDIENCES = window.TARGET_AUDIENCES || [];
            AMENITIES = window.AMENITIES || [];
            initDirectory();
            return;
        }

        // Fetch from CDN
        fetchFreshData(false);
    }

    function fetchFreshData(isBackgroundRefresh) {
        fetch(DATA_URL)
            .then(function(response) {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(function(data) {
                console.log('Fetched fresh coworking data from CDN');
                saveToCache(data);
                if (!isBackgroundRefresh) {
                    applyData(data);
                    initDirectory();
                } else {
                    if (data.spaces && data.spaces.length !== coworkingSpaces.length) {
                        console.log('New spaces available, refreshing...');
                        applyData(data);
                        updateStats();
                        filterAndRender();
                    }
                }
            })
            .catch(function(error) {
                console.warn('Failed to fetch from CDN:', error);
                if (typeof window.icelandCoworkingSpaces !== 'undefined') {
                    console.log('Falling back to bundled data');
                    coworkingSpaces = window.icelandCoworkingSpaces;
                    SPACE_TYPES = window.SPACE_TYPES || [];
                    CITIES = window.CITIES || [];
                    TARGET_AUDIENCES = window.TARGET_AUDIENCES || [];
                    AMENITIES = window.AMENITIES || [];
                    if (!isBackgroundRefresh) {
                        initDirectory();
                    }
                } else {
                    var grid = document.getElementById('icd-space-grid');
                    if (grid) {
                        grid.innerHTML = '<div class="icd-error">Unable to load coworking data. Please refresh the page.</div>';
                    }
                }
            });
    }

    function applyData(data) {
        coworkingSpaces = data.spaces || data.icelandCoworkingSpaces || [];
        SPACE_TYPES = data.types || data.SPACE_TYPES || [];
        CITIES = data.cities || data.CITIES || [];
        TARGET_AUDIENCES = data.audiences || data.TARGET_AUDIENCES || [];
        AMENITIES = data.amenities || data.AMENITIES || [];
    }

    function getFromCache() {
        try {
            var cached = localStorage.getItem(CACHE_KEY);
            if (!cached) return null;

            var parsed = JSON.parse(cached);
            if (Date.now() - parsed.timestamp > CACHE_EXPIRY) {
                localStorage.removeItem(CACHE_KEY);
                return null;
            }
            return parsed.data;
        } catch (e) {
            return null;
        }
    }

    function saveToCache(data) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                data: data
            }));
        } catch (e) {
            // localStorage not available or full
        }
    }

    function initDirectory() {
        populateFilters();
        initEventListeners();
        initMap();
        initViewToggle();
        updateStats();
        filterAndRender();
    }

    function initMap() {
        var mapContainer = document.getElementById('icd-map');
        if (!mapContainer || typeof L === 'undefined') return;

        // Initialize map centered on Iceland
        map = L.map('icd-map').setView([64.9, -19.0], 6);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(map);

        L.control.scale({ metric: true, imperial: false }).addTo(map);

        // Add markers for all spaces
        updateMapMarkers();
    }

    function updateMapMarkers() {
        if (!map) return;

        // Clear existing markers
        markers.forEach(function(marker) {
            map.removeLayer(marker);
        });
        markers = [];

        // Add markers for filtered spaces
        filteredSpaces.forEach(function(space) {
            if (!space.lat || !space.lng) return;

            var markerClass = getMarkerClass(space.type);
            var markerLabel = getMarkerLabel(space.type);

            var icon = L.divIcon({
                className: 'icd-marker ' + markerClass,
                html: markerLabel,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });

            var marker = L.marker([space.lat, space.lng], { icon: icon }).addTo(map);

            marker.on('click', function() {
                showPopup(marker, space);
            });

            markers.push(marker);
        });

        // Fit bounds if we have markers
        if (markers.length > 0) {
            var group = L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    function getMarkerClass(type) {
        return 'icd-marker-' + type;
    }

    function getMarkerLabel(type) {
        switch(type) {
            case 'innovation-hub': return 'I';
            case 'coworking': return 'C';
            case 'creative-community': return 'A';
            case 'business-center': return 'B';
            case 'youth-center': return 'Y';
            case 'accelerator': return 'K';
            case 'hotel-workspace': return 'H';
            default: return 'W';
        }
    }

    function showPopup(marker, space) {
        var typeName = getTypeName(space.type);
        var directionsUrl = 'https://www.google.com/maps/dir/?api=1&destination=' + space.lat + ',' + space.lng;

        var websiteHtml = '';
        if (space.website) {
            websiteHtml = '<a href="' + space.website + '" target="_blank" class="icd-popup-link">Website</a>';
        }

        var popupContent =
            '<div class="icd-popup">' +
                '<div class="icd-popup-title">' + space.name + '</div>' +
                '<div class="icd-popup-type">' + typeName + '</div>' +
                '<div class="icd-popup-address">' + space.address + ', ' + space.city + '</div>' +
                '<div class="icd-popup-pricing">' + space.pricing + '</div>' +
                '<div class="icd-popup-actions">' +
                    websiteHtml +
                    '<a href="' + directionsUrl + '" target="_blank" class="icd-popup-directions">Get Directions</a>' +
                '</div>' +
            '</div>';

        marker.bindPopup(popupContent).openPopup();
    }

    function initViewToggle() {
        var mapBtn = document.getElementById('icd-view-map');
        var listBtn = document.getElementById('icd-view-list');
        var mapEl = document.getElementById('icd-map');
        var gridEl = document.getElementById('icd-space-grid');

        if (!mapBtn || !listBtn) return;

        mapBtn.addEventListener('click', function() {
            currentView = 'map';
            mapBtn.classList.add('active');
            listBtn.classList.remove('active');
            if (mapEl) mapEl.style.display = 'block';
            if (gridEl) gridEl.style.display = 'none';
            if (map) {
                setTimeout(function() {
                    map.invalidateSize();
                }, 100);
            }
        });

        listBtn.addEventListener('click', function() {
            currentView = 'list';
            listBtn.classList.add('active');
            mapBtn.classList.remove('active');
            if (mapEl) mapEl.style.display = 'none';
            if (gridEl) gridEl.style.display = 'grid';
        });
    }

    function populateFilters() {
        // Populate type filter
        var typeSelect = document.getElementById('icd-type-filter');
        if (typeSelect) {
            typeSelect.innerHTML = '';
            SPACE_TYPES.forEach(function(type) {
                var option = document.createElement('option');
                option.value = type.id;
                option.textContent = type.name;
                typeSelect.appendChild(option);
            });
        }

        // Populate city filter
        var citySelect = document.getElementById('icd-city-filter');
        if (citySelect) {
            citySelect.innerHTML = '';
            CITIES.forEach(function(city) {
                var option = document.createElement('option');
                option.value = city.id;
                option.textContent = city.name;
                citySelect.appendChild(option);
            });
        }

        // Populate audience filter
        var audienceSelect = document.getElementById('icd-audience-filter');
        if (audienceSelect) {
            audienceSelect.innerHTML = '';
            TARGET_AUDIENCES.forEach(function(audience) {
                var option = document.createElement('option');
                option.value = audience.id;
                option.textContent = audience.name;
                audienceSelect.appendChild(option);
            });
        }
    }

    function initEventListeners() {
        // Search input
        var searchInput = document.getElementById('icd-search');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                currentFilters.search = e.target.value.toLowerCase();
                filterAndRender();
            });
        }

        // Type filter
        var typeSelect = document.getElementById('icd-type-filter');
        if (typeSelect) {
            typeSelect.addEventListener('change', function(e) {
                currentFilters.type = e.target.value;
                filterAndRender();
            });
        }

        // City filter
        var citySelect = document.getElementById('icd-city-filter');
        if (citySelect) {
            citySelect.addEventListener('change', function(e) {
                currentFilters.city = e.target.value;
                filterAndRender();
            });
        }

        // Audience filter
        var audienceSelect = document.getElementById('icd-audience-filter');
        if (audienceSelect) {
            audienceSelect.addEventListener('change', function(e) {
                currentFilters.audience = e.target.value;
                filterAndRender();
            });
        }
    }

    function filterAndRender() {
        filteredSpaces = coworkingSpaces.slice().sort(function(a, b) {
            return a.name.localeCompare(b.name);
        }).filter(function(space) {
            // Search filter
            if (currentFilters.search) {
                var searchMatch =
                    space.name.toLowerCase().includes(currentFilters.search) ||
                    space.description.toLowerCase().includes(currentFilters.search) ||
                    space.city.toLowerCase().includes(currentFilters.search) ||
                    space.address.toLowerCase().includes(currentFilters.search);
                if (!searchMatch) return false;
            }

            // Type filter
            if (currentFilters.type !== 'all' && space.type !== currentFilters.type) {
                return false;
            }

            // City filter
            if (currentFilters.city !== 'all' && space.city !== currentFilters.city) {
                return false;
            }

            // Audience filter
            if (currentFilters.audience !== 'all') {
                if (!space.targetAudience.includes(currentFilters.audience)) {
                    return false;
                }
            }

            return true;
        });

        renderSpaces();
        updateMapMarkers();
        updateShowingCount();
    }

    function renderSpaces() {
        var grid = document.getElementById('icd-space-grid');
        if (!grid) return;

        if (filteredSpaces.length === 0) {
            grid.innerHTML = '<div class="icd-no-results">No co-working spaces found matching your criteria.</div>';
            return;
        }

        var html = filteredSpaces.map(function(space) {
            return createSpaceCard(space);
        }).join('');

        grid.innerHTML = html;
    }

    function createSpaceCard(space) {
        var typeClass = 'icd-type-' + space.type;
        var typeName = getTypeName(space.type);

        // Format amenities
        var amenitiesHtml = space.amenities.slice(0, 5).map(function(amenityId) {
            var amenity = AMENITIES.find(function(a) { return a.id === amenityId; });
            return amenity ? '<span class="icd-amenity-tag">' + amenity.name + '</span>' : '';
        }).join('');

        // Format audience
        var audienceHtml = space.targetAudience.slice(0, 3).map(function(audienceId) {
            var audience = TARGET_AUDIENCES.find(function(a) { return a.id === audienceId; });
            return audience ? audience.name : audienceId;
        }).join(' · ');

        // Website link
        var websiteHtml = '';
        if (space.website) {
            websiteHtml = '<a href="' + space.website + '" target="_blank" rel="noopener" class="icd-website-link">Website</a>';
        }

        // Directions link
        var directionsUrl = 'https://www.google.com/maps/dir/?api=1&destination=' + space.lat + ',' + space.lng;
        var directionsHtml = '<a href="' + directionsUrl + '" target="_blank" rel="noopener" class="icd-directions-link">Directions</a>';

        // Phone
        var phoneHtml = '';
        if (space.phone) {
            phoneHtml = '<div class="icd-detail-row">' +
                '<span class="icd-label">Phone:</span>' +
                '<span class="icd-value"><a href="tel:' + space.phone + '">' + space.phone + '</a></span>' +
            '</div>';
        }

        return '<div class="icd-space-card">' +
            '<div class="icd-card-header">' +
                '<h3 class="icd-space-name">' + space.name + '</h3>' +
                '<span class="icd-type-badge ' + typeClass + '">' + typeName + '</span>' +
            '</div>' +
            '<div class="icd-location">' +
                '<span class="icd-address">' + space.address + '</span>' +
                '<span class="icd-city">' + space.city + '</span>' +
            '</div>' +
            '<p class="icd-description">' + space.description + '</p>' +
            '<div class="icd-amenities">' + amenitiesHtml + '</div>' +
            '<div class="icd-details">' +
                '<div class="icd-detail-row">' +
                    '<span class="icd-label">Best for:</span>' +
                    '<span class="icd-value">' + audienceHtml + '</span>' +
                '</div>' +
                '<div class="icd-detail-row">' +
                    '<span class="icd-label">Pricing:</span>' +
                    '<span class="icd-value">' + space.pricing + '</span>' +
                '</div>' +
                '<div class="icd-detail-row">' +
                    '<span class="icd-label">Size:</span>' +
                    '<span class="icd-value">' + space.capacity + '</span>' +
                '</div>' +
                phoneHtml +
            '</div>' +
            '<div class="icd-card-footer">' +
                directionsHtml +
                websiteHtml +
            '</div>' +
        '</div>';
    }

    function getTypeName(typeId) {
        var type = SPACE_TYPES.find(function(t) { return t.id === typeId; });
        return type ? type.name : typeId;
    }

    function updateStats() {
        var total = coworkingSpaces.length;
        var reykjavik = coworkingSpaces.filter(function(s) { return s.city === 'Reykjavik'; }).length;
        var innovationHubs = coworkingSpaces.filter(function(s) { return s.type === 'innovation-hub'; }).length;
        var creative = coworkingSpaces.filter(function(s) { return s.type === 'creative-community'; }).length;

        var totalEl = document.getElementById('icd-stat-total');
        var reykjavikEl = document.getElementById('icd-stat-reykjavik');
        var innovationEl = document.getElementById('icd-stat-innovation');
        var creativeEl = document.getElementById('icd-stat-creative');

        if (totalEl) totalEl.textContent = total;
        if (reykjavikEl) reykjavikEl.textContent = reykjavik;
        if (innovationEl) innovationEl.textContent = innovationHubs;
        if (creativeEl) creativeEl.textContent = creative;
    }

    function updateShowingCount() {
        var countEl = document.getElementById('icd-showing-count');
        if (countEl) {
            countEl.textContent = filteredSpaces.length;
        }
    }

})();
