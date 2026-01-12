(function() {
    'use strict';

    // Data source - jsDelivr CDN mirrors GitHub with caching
    // Change @master to @v1.0.0 etc for versioned releases
    var DATA_URL = 'https://cdn.jsdelivr.net/gh/balainiceland/reykjavik-parking@master/dev/reykjavik-parking/wordpress-plugin/startup-directory/js/startups-data.json';

    // Cache settings
    var CACHE_KEY = 'sid_startups_cache';
    var CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour

    var currentSearch = '';
    var currentSector = 'all';
    var currentStatus = 'all';
    var currentSort = 'name-asc';

    // Data arrays (loaded dynamically or from fallback)
    var icelandStartups = [];
    var STARTUP_SECTORS = [];
    var STARTUP_STATUSES = [];

    document.addEventListener('DOMContentLoaded', function() {
        loadData();
    });

    function loadData() {
        var container = document.getElementById('sid-directory-container');
        if (!container) return;

        // Show loading state
        var grid = document.getElementById('sid-startup-grid');
        if (grid) {
            grid.innerHTML = '<div class="sid-loading">Loading startups...</div>';
        }

        // Try to load from cache first
        var cached = getFromCache();
        if (cached) {
            console.log('Loaded startup data from cache');
            applyData(cached);
            initDirectory();
            // Still fetch fresh data in background
            fetchFreshData(true);
            return;
        }

        // Check if data is already loaded via script tag (fallback)
        if (typeof window.icelandStartups !== 'undefined' && window.icelandStartups.length > 0) {
            console.log('Using bundled startup data (fallback)');
            icelandStartups = window.icelandStartups;
            STARTUP_SECTORS = window.STARTUP_SECTORS || [];
            STARTUP_STATUSES = window.STARTUP_STATUSES || [];
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
                console.log('Fetched fresh startup data from CDN');
                saveToCache(data);
                if (!isBackgroundRefresh) {
                    applyData(data);
                    initDirectory();
                } else {
                    // Check if data changed
                    if (data.startups && data.startups.length !== icelandStartups.length) {
                        console.log('New startups available, refreshing...');
                        applyData(data);
                        updateStats();
                        renderStartups();
                    }
                }
            })
            .catch(function(error) {
                console.warn('Failed to fetch from CDN:', error);
                // Try fallback to bundled data
                if (typeof window.icelandStartups !== 'undefined') {
                    console.log('Falling back to bundled data');
                    icelandStartups = window.icelandStartups;
                    STARTUP_SECTORS = window.STARTUP_SECTORS || [];
                    STARTUP_STATUSES = window.STARTUP_STATUSES || [];
                    if (!isBackgroundRefresh) {
                        initDirectory();
                    }
                } else {
                    var grid = document.getElementById('sid-startup-grid');
                    if (grid) {
                        grid.innerHTML = '<div class="sid-error">Unable to load startup data. Please refresh the page.</div>';
                    }
                }
            });
    }

    function applyData(data) {
        icelandStartups = data.startups || data.icelandStartups || [];
        STARTUP_SECTORS = data.sectors || data.STARTUP_SECTORS || [];
        STARTUP_STATUSES = data.statuses || data.STARTUP_STATUSES || [];
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
        initSectorFilter();
        initStatusFilter();
        initSearch();
        initSort();
        updateStats();
        renderStartups();
    }

    function initSectorFilter() {
        var select = document.getElementById('sid-sector-filter');
        if (!select) return;

        // Clear existing options
        select.innerHTML = '';

        STARTUP_SECTORS.forEach(function(sector) {
            var option = document.createElement('option');
            option.value = sector.id;
            option.textContent = sector.name;
            select.appendChild(option);
        });

        select.addEventListener('change', function() {
            currentSector = this.value;
            renderStartups();
        });
    }

    function initStatusFilter() {
        var buttons = document.querySelectorAll('.sid-status-btn');
        buttons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                buttons.forEach(function(b) { b.classList.remove('sid-active'); });
                this.classList.add('sid-active');
                currentStatus = this.dataset.status;
                renderStartups();
            });
        });
    }

    function initSearch() {
        var input = document.getElementById('sid-search');
        if (!input) return;

        var debounceTimer;
        input.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            var value = this.value;
            debounceTimer = setTimeout(function() {
                currentSearch = value.toLowerCase();
                renderStartups();
            }, 200);
        });
    }

    function initSort() {
        var select = document.getElementById('sid-sort');
        if (!select) return;

        select.addEventListener('change', function() {
            currentSort = this.value;
            renderStartups();
        });
    }

    function filterStartups() {
        return icelandStartups.filter(function(startup) {
            // Search filter
            if (currentSearch) {
                var searchMatch = startup.name.toLowerCase().includes(currentSearch) ||
                    (startup.description && startup.description.toLowerCase().includes(currentSearch));
                if (!searchMatch) return false;
            }

            // Sector filter
            if (currentSector !== 'all' && startup.sector !== currentSector) {
                return false;
            }

            // Status filter
            if (currentStatus !== 'all' && startup.status !== currentStatus) {
                return false;
            }

            return true;
        });
    }

    function sortStartups(startups) {
        var sorted = startups.slice();

        switch (currentSort) {
            case 'name-asc':
                sorted.sort(function(a, b) { return a.name.localeCompare(b.name); });
                break;
            case 'name-desc':
                sorted.sort(function(a, b) { return b.name.localeCompare(a.name); });
                break;
            case 'year-desc':
                sorted.sort(function(a, b) { return (b.foundedYear || 0) - (a.foundedYear || 0); });
                break;
            case 'year-asc':
                sorted.sort(function(a, b) { return (a.foundedYear || 9999) - (b.foundedYear || 9999); });
                break;
        }

        return sorted;
    }

    function renderStartups() {
        var grid = document.getElementById('sid-startup-grid');
        if (!grid) return;

        var filtered = filterStartups();
        var sorted = sortStartups(filtered);

        // Update count
        var countEl = document.getElementById('sid-showing-count');
        if (countEl) {
            countEl.textContent = sorted.length;
        }

        // Clear and render
        grid.innerHTML = '';

        if (sorted.length === 0) {
            grid.innerHTML = '<div class="sid-no-results">No startups found matching your criteria.</div>';
            return;
        }

        sorted.forEach(function(startup) {
            var card = createStartupCard(startup);
            grid.appendChild(card);
        });
    }

    function createStartupCard(startup) {
        var card = document.createElement('div');
        card.className = 'sid-startup-card';

        var statusClass = 'sid-status-' + startup.status;
        var statusLabel = startup.status.charAt(0).toUpperCase() + startup.status.slice(1);

        var acquiredHtml = '';
        if (startup.status === 'acquired' && startup.acquiredBy) {
            acquiredHtml = '<div class="sid-acquired-by">by ' + escapeHtml(startup.acquiredBy) + '</div>';
        }

        var websiteHtml = '';
        if (startup.website) {
            websiteHtml = '<a href="' + escapeHtml(startup.website) + '" target="_blank" rel="noopener" class="sid-website-link">Visit Website</a>';
        }

        var yearHtml = '';
        if (startup.foundedYear) {
            yearHtml = '<span class="sid-founded">Est. ' + startup.foundedYear + '</span>';
        }

        card.innerHTML =
            '<div class="sid-card-header">' +
                '<h3 class="sid-startup-name">' + escapeHtml(startup.name) + '</h3>' +
                '<span class="sid-status-badge ' + statusClass + '">' + statusLabel + '</span>' +
            '</div>' +
            '<div class="sid-sector-tag">' + escapeHtml(getSectorName(startup.sector)) + '</div>' +
            '<p class="sid-description">' + escapeHtml(startup.description || 'No description available') + '</p>' +
            acquiredHtml +
            '<div class="sid-card-footer">' +
                yearHtml +
                websiteHtml +
            '</div>';

        return card;
    }

    function getSectorName(sectorId) {
        var sector = STARTUP_SECTORS.find(function(s) { return s.id === sectorId; });
        return sector ? sector.name : sectorId;
    }

    function updateStats() {
        var total = icelandStartups.length;
        var active = icelandStartups.filter(function(s) { return s.status === 'active'; }).length;
        var acquired = icelandStartups.filter(function(s) { return s.status === 'acquired'; }).length;

        var totalEl = document.getElementById('sid-stat-total');
        var activeEl = document.getElementById('sid-stat-active');
        var acquiredEl = document.getElementById('sid-stat-acquired');

        if (totalEl) totalEl.textContent = total;
        if (activeEl) activeEl.textContent = active;
        if (acquiredEl) acquiredEl.textContent = acquired;
    }

    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

})();
