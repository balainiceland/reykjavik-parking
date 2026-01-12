(function() {
    'use strict';

    var filteredInvestors = [];
    var currentFilters = {
        search: '',
        type: 'all',
        stage: 'all',
        sector: 'all'
    };

    document.addEventListener('DOMContentLoaded', function() {
        initInvestorDirectory();
    });

    function initInvestorDirectory() {
        var container = document.getElementById('iid-directory-container');
        if (!container) return;

        populateFilters();
        initEventListeners();
        updateStats();
        filterAndRender();
    }

    function populateFilters() {
        // Populate type filter
        var typeSelect = document.getElementById('iid-type-filter');
        if (typeSelect) {
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

    function updateStats() {
        var stats = getInvestorStats();

        var totalEl = document.getElementById('iid-stat-total');
        var vcEl = document.getElementById('iid-stat-vc');
        var angelEl = document.getElementById('iid-stat-angel');
        var govEl = document.getElementById('iid-stat-government');

        if (totalEl) totalEl.textContent = stats.total;
        if (vcEl) vcEl.textContent = stats.vc;
        if (angelEl) angelEl.textContent = stats.angel;
        if (govEl) govEl.textContent = stats.government + stats.accelerator;
    }

    function updateShowingCount() {
        var countEl = document.getElementById('iid-showing-count');
        if (countEl) {
            countEl.textContent = filteredInvestors.length;
        }
    }

})();
