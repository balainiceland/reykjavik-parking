(function() {
    'use strict';

    // Data source - jsDelivr CDN mirrors GitHub with caching
    var DATA_URL = 'https://cdn.jsdelivr.net/gh/balainiceland/reykjavik-parking@master/dev/reykjavik-parking/wordpress-plugin/investor-directory/js/investors-data.json';

    // Cache settings
    var CACHE_KEY = 'iid_investors_cache';
    var CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour

    var filteredInvestors = [];
    var currentFilters = {
        search: '',
        type: 'all',
        stage: 'all',
        sector: 'all'
    };

    // Data arrays (loaded dynamically)
    var icelandInvestors = [];
    var INVESTOR_TYPES = [];
    var INVESTMENT_STAGES = [];
    var SECTOR_FOCUS = [];

    document.addEventListener('DOMContentLoaded', function() {
        loadData();
    });

    function loadData() {
        var container = document.getElementById('iid-directory-container');
        if (!container) return;

        // Show loading state
        var grid = document.getElementById('iid-investor-grid');
        if (grid) {
            grid.innerHTML = '<div class="iid-loading">Loading investors...</div>';
        }

        // Try to load from cache first
        var cached = getFromCache();
        if (cached) {
            console.log('Loaded investor data from cache');
            applyData(cached);
            initInvestorDirectory();
            fetchFreshData(true);
            return;
        }

        // Check if data is already loaded via script tag (fallback)
        if (typeof window.icelandInvestors !== 'undefined' && window.icelandInvestors.length > 0) {
            console.log('Using bundled investor data (fallback)');
            icelandInvestors = window.icelandInvestors;
            INVESTOR_TYPES = window.INVESTOR_TYPES || [];
            INVESTMENT_STAGES = window.INVESTMENT_STAGES || [];
            SECTOR_FOCUS = window.SECTOR_FOCUS || [];
            initInvestorDirectory();
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
                console.log('Fetched fresh investor data from CDN');
                saveToCache(data);
                if (!isBackgroundRefresh) {
                    applyData(data);
                    initInvestorDirectory();
                } else {
                    if (data.investors && data.investors.length !== icelandInvestors.length) {
                        console.log('New investors available, refreshing...');
                        applyData(data);
                        updateStats();
                        filterAndRender();
                    }
                }
            })
            .catch(function(error) {
                console.warn('Failed to fetch from CDN:', error);
                if (typeof window.icelandInvestors !== 'undefined') {
                    console.log('Falling back to bundled data');
                    icelandInvestors = window.icelandInvestors;
                    INVESTOR_TYPES = window.INVESTOR_TYPES || [];
                    INVESTMENT_STAGES = window.INVESTMENT_STAGES || [];
                    SECTOR_FOCUS = window.SECTOR_FOCUS || [];
                    if (!isBackgroundRefresh) {
                        initInvestorDirectory();
                    }
                } else {
                    var grid = document.getElementById('iid-investor-grid');
                    if (grid) {
                        grid.innerHTML = '<div class="iid-error">Unable to load investor data. Please refresh the page.</div>';
                    }
                }
            });
    }

    function applyData(data) {
        icelandInvestors = data.investors || data.icelandInvestors || [];
        INVESTOR_TYPES = data.types || data.INVESTOR_TYPES || [];
        INVESTMENT_STAGES = data.stages || data.INVESTMENT_STAGES || [];
        SECTOR_FOCUS = data.sectors || data.SECTOR_FOCUS || [];
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

    function initInvestorDirectory() {
        populateFilters();
        initEventListeners();
        updateStats();
        filterAndRender();
    }

    function populateFilters() {
        // Populate type filter
        var typeSelect = document.getElementById('iid-type-filter');
        if (typeSelect) {
            typeSelect.innerHTML = '';
            INVESTOR_TYPES.forEach(function(type) {
                var option = document.createElement('option');
                option.value = type.id;
                option.textContent = type.name;
                typeSelect.appendChild(option);
            });
        }

        // Populate stage filter
        var stageSelect = document.getElementById('iid-stage-filter');
        if (stageSelect) {
            stageSelect.innerHTML = '';
            INVESTMENT_STAGES.forEach(function(stage) {
                var option = document.createElement('option');
                option.value = stage.id;
                option.textContent = stage.name;
                stageSelect.appendChild(option);
            });
        }

        // Populate sector filter
        var sectorSelect = document.getElementById('iid-sector-filter');
        if (sectorSelect) {
            sectorSelect.innerHTML = '';
            SECTOR_FOCUS.forEach(function(sector) {
                var option = document.createElement('option');
                option.value = sector.id;
                option.textContent = sector.name;
                sectorSelect.appendChild(option);
            });
        }
    }

    function initEventListeners() {
        // Search input
        var searchInput = document.getElementById('iid-search');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                currentFilters.search = e.target.value.toLowerCase();
                filterAndRender();
            });
        }

        // Type filter
        var typeSelect = document.getElementById('iid-type-filter');
        if (typeSelect) {
            typeSelect.addEventListener('change', function(e) {
                currentFilters.type = e.target.value;
                filterAndRender();
            });
        }

        // Stage filter
        var stageSelect = document.getElementById('iid-stage-filter');
        if (stageSelect) {
            stageSelect.addEventListener('change', function(e) {
                currentFilters.stage = e.target.value;
                filterAndRender();
            });
        }

        // Sector filter
        var sectorSelect = document.getElementById('iid-sector-filter');
        if (sectorSelect) {
            sectorSelect.addEventListener('change', function(e) {
                currentFilters.sector = e.target.value;
                filterAndRender();
            });
        }
    }

    function filterAndRender() {
        filteredInvestors = icelandInvestors.filter(function(investor) {
            // Search filter
            if (currentFilters.search) {
                var searchMatch =
                    investor.name.toLowerCase().includes(currentFilters.search) ||
                    investor.description.toLowerCase().includes(currentFilters.search) ||
                    investor.portfolio.some(function(p) {
                        return p.toLowerCase().includes(currentFilters.search);
                    });
                if (!searchMatch) return false;
            }

            // Type filter
            if (currentFilters.type !== 'all' && investor.type !== currentFilters.type) {
                return false;
            }

            // Stage filter
            if (currentFilters.stage !== 'all') {
                if (!investor.stages.includes(currentFilters.stage)) {
                    return false;
                }
            }

            // Sector filter
            if (currentFilters.sector !== 'all') {
                if (!investor.focus.includes(currentFilters.sector) &&
                    !investor.focus.includes('sector-agnostic')) {
                    return false;
                }
            }

            return true;
        });

        renderInvestors();
        updateShowingCount();
    }

    function renderInvestors() {
        var grid = document.getElementById('iid-investor-grid');
        if (!grid) return;

        if (filteredInvestors.length === 0) {
            grid.innerHTML = '<div class="iid-no-results">No investors found matching your criteria.</div>';
            return;
        }

        var html = filteredInvestors.map(function(investor) {
            return createInvestorCard(investor);
        }).join('');

        grid.innerHTML = html;
    }

    function createInvestorCard(investor) {
        var typeClass = 'iid-type-' + investor.type;
        var typeName = getTypeName(investor.type);

        // Format stages
        var stagesHtml = investor.stages.map(function(stage) {
            return '<span class="iid-stage-tag">' + getStageName(stage) + '</span>';
        }).join('');

        // Format focus areas
        var focusHtml = investor.focus.slice(0, 3).map(function(f) {
            var sector = SECTOR_FOCUS.find(function(s) { return s.id === f; });
            return sector ? sector.name : f;
        }).join(' · ');

        // Format portfolio
        var portfolioHtml = '';
        if (investor.portfolio && investor.portfolio.length > 0) {
            var portfolioItems = investor.portfolio.slice(0, 4).join(', ');
            if (investor.portfolio.length > 4) {
                portfolioItems += ' +' + (investor.portfolio.length - 4) + ' more';
            }
            portfolioHtml = '<div class="iid-portfolio"><strong>Portfolio:</strong> ' + portfolioItems + '</div>';
        }

        // Website link
        var websiteHtml = '';
        if (investor.website) {
            websiteHtml = '<a href="' + investor.website + '" target="_blank" rel="noopener" class="iid-website-link">Visit Website</a>';
        }

        return '<div class="iid-investor-card">' +
            '<div class="iid-card-header">' +
                '<h3 class="iid-investor-name">' + investor.name + '</h3>' +
                '<span class="iid-type-badge ' + typeClass + '">' + typeName + '</span>' +
            '</div>' +
            '<div class="iid-focus-areas">' + focusHtml + '</div>' +
            '<p class="iid-description">' + investor.description + '</p>' +
            '<div class="iid-stages">' + stagesHtml + '</div>' +
            '<div class="iid-details">' +
                '<div class="iid-detail-row">' +
                    '<span class="iid-label">Ticket Size:</span>' +
                    '<span class="iid-value">' + investor.ticketSize + '</span>' +
                '</div>' +
                '<div class="iid-detail-row">' +
                    '<span class="iid-label">Location:</span>' +
                    '<span class="iid-value">' + investor.location + '</span>' +
                '</div>' +
            '</div>' +
            portfolioHtml +
            '<div class="iid-card-footer">' +
                '<span class="iid-founded">Est. ' + investor.foundedYear + '</span>' +
                websiteHtml +
            '</div>' +
        '</div>';
    }

    function getTypeName(typeId) {
        var type = INVESTOR_TYPES.find(function(t) { return t.id === typeId; });
        return type ? type.name : typeId;
    }

    function getStageName(stageId) {
        var stage = INVESTMENT_STAGES.find(function(s) { return s.id === stageId; });
        return stage ? stage.name : stageId;
    }

    function updateStats() {
        var total = icelandInvestors.length;
        var vc = icelandInvestors.filter(function(i) { return i.type === 'vc'; }).length;
        var angel = icelandInvestors.filter(function(i) { return i.type === 'angel'; }).length;
        var government = icelandInvestors.filter(function(i) { return i.type === 'government'; }).length;
        var accelerator = icelandInvestors.filter(function(i) { return i.type === 'accelerator'; }).length;

        var totalEl = document.getElementById('iid-stat-total');
        var vcEl = document.getElementById('iid-stat-vc');
        var angelEl = document.getElementById('iid-stat-angel');
        var govEl = document.getElementById('iid-stat-government');

        if (totalEl) totalEl.textContent = total;
        if (vcEl) vcEl.textContent = vc;
        if (angelEl) angelEl.textContent = angel;
        if (govEl) govEl.textContent = government + accelerator;
    }

    function updateShowingCount() {
        var countEl = document.getElementById('iid-showing-count');
        if (countEl) {
            countEl.textContent = filteredInvestors.length;
        }
    }

})();
