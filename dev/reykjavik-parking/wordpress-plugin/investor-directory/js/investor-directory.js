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
        sector: 'all',
        sort: 'name-asc'
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

    function fillSelect(id, items, allLabel) {
        var select = document.getElementById(id);
        if (!select) return;
        var current = select.value || 'all';
        select.innerHTML = '';
        var hasAll = items.some(function(item) { return item.id === 'all'; });
        if (!hasAll) {
            items = [{ id: 'all', name: allLabel }].concat(items);
        }
        items.forEach(function(item) {
            var option = document.createElement('option');
            option.value = item.id;
            option.textContent = item.id === 'all' ? allLabel : item.name;
            select.appendChild(option);
        });
        select.value = current;
        if (select.value !== current) select.value = 'all';
    }

    function populateFilters() {
        fillSelect('iid-type-filter', INVESTOR_TYPES, 'All types');
        fillSelect('iid-stage-filter', INVESTMENT_STAGES, 'All stages');
        fillSelect('iid-sector-filter', SECTOR_FOCUS, 'All sectors');
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

        // Sort
        var sortSelect = document.getElementById('iid-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', function(e) {
                currentFilters.sort = e.target.value;
                filterAndRender();
            });
        }
    }

    function sortInvestors(list) {
        var sorted = list.slice();
        switch (currentFilters.sort) {
            case 'name-desc':
                sorted.sort(function(a, b) { return b.name.localeCompare(a.name); });
                break;
            case 'year-desc':
                sorted.sort(function(a, b) { return (b.foundedYear || 0) - (a.foundedYear || 0) || a.name.localeCompare(b.name); });
                break;
            case 'year-asc':
                sorted.sort(function(a, b) { return (a.foundedYear || 9999) - (b.foundedYear || 9999) || a.name.localeCompare(b.name); });
                break;
            default:
                sorted.sort(function(a, b) { return a.name.localeCompare(b.name); });
        }
        return sorted;
    }

    function filterAndRender() {
        filteredInvestors = sortInvestors(icelandInvestors).filter(function(investor) {
            // Search filter
            if (currentFilters.search) {
                var searchMatch =
                    investor.name.toLowerCase().includes(currentFilters.search) ||
                    (investor.description || '').toLowerCase().includes(currentFilters.search) ||
                    (investor.portfolio || []).some(function(p) {
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
                if (!(investor.stages || []).includes(currentFilters.stage)) {
                    return false;
                }
            }

            // Sector filter
            if (currentFilters.sector !== 'all') {
                var focus = investor.focus || [];
                if (!focus.includes(currentFilters.sector) &&
                    !focus.includes('sector-agnostic')) {
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
            grid.innerHTML = '<div class="iid-no-results"><p>No investors match your search. Try a different word or clear the filters.</p></div>';
            return;
        }

        var html = filteredInvestors.map(function(investor) {
            return createInvestorCard(investor);
        }).join('');

        grid.innerHTML = html;
    }

    var ARROW_SVG = '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>';

    function escapeHtml(text) {
        if (text === null || text === undefined) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function detailHtml(label, value) {
        if (value === null || value === undefined || value === '') return '';
        return '<div class="iid-detail"><dt class="iid-label">' + label + '</dt><dd class="iid-value">' + escapeHtml(value) + '</dd></div>';
    }

    function createInvestorCard(investor) {
        var typeClass = 'iid-type-' + escapeHtml(investor.type);
        var typeName = getTypeName(investor.type);

        // Sectors
        var focusHtml = '';
        if (investor.focus && investor.focus.length > 0) {
            focusHtml = '<p class="iid-focus-areas">' + investor.focus.map(function(f) {
                var sector = SECTOR_FOCUS.find(function(s) { return s.id === f; });
                return escapeHtml(sector ? sector.name : f);
            }).join('<span class="iid-dot" aria-hidden="true"> · </span>') + '</p>';
        }

        // Stages
        var stagesHtml = '';
        if (investor.stages && investor.stages.length > 0) {
            stagesHtml = '<div class="iid-stages" aria-label="Stages">' + investor.stages.map(function(stage) {
                return '<span class="iid-tag iid-stage-tag">' + escapeHtml(getStageName(stage)) + '</span>';
            }).join('') + '</div>';
        }

        // Portfolio
        var portfolioHtml = '';
        if (investor.portfolio && investor.portfolio.length > 0) {
            var portfolioItems = investor.portfolio.slice(0, 4).map(escapeHtml).join(', ');
            if (investor.portfolio.length > 4) {
                portfolioItems += ' +' + (investor.portfolio.length - 4) + ' more';
            }
            portfolioHtml = '<p class="iid-portfolio"><strong>Portfolio</strong> ' + portfolioItems + '</p>';
        }

        // Website link
        var websiteHtml = '';
        if (investor.website && /^https?:\/\//i.test(investor.website)) {
            websiteHtml = '<div class="iid-card-footer"><a href="' + escapeHtml(investor.website) + '" target="_blank" rel="noopener" class="iid-website-link"' +
                ' aria-label="Visit the ' + escapeHtml(investor.name) + ' website (opens in a new tab)">Visit website ' + ARROW_SVG + '</a></div>';
        }

        return '<article class="iid-investor-card">' +
            '<div class="iid-card-top">' +
                '<h3 class="iid-investor-name">' + escapeHtml(investor.name) + '</h3>' +
                '<span class="iid-type-badge ' + typeClass + '">' + escapeHtml(typeName) + '</span>' +
            '</div>' +
            focusHtml +
            '<p class="iid-description">' + escapeHtml(investor.description) + '</p>' +
            stagesHtml +
            '<dl class="iid-details">' +
                detailHtml('Ticket size', investor.ticketSize) +
                detailHtml('Location', investor.location) +
                detailHtml('Founded', investor.foundedYear) +
            '</dl>' +
            portfolioHtml +
            websiteHtml +
        '</article>';
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
