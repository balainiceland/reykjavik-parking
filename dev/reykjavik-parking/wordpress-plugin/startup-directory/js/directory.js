(function() {
    'use strict';

    var currentSearch = '';
    var currentSector = 'all';
    var currentStatus = 'all';
    var currentSort = 'name-asc';

    document.addEventListener('DOMContentLoaded', function() {
        initDirectory();
    });

    function initDirectory() {
        var container = document.getElementById('sid-directory-container');
        if (!container) return;

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

    function updateStats() {
        var stats = getStartupStats();

        var totalEl = document.getElementById('sid-stat-total');
        var activeEl = document.getElementById('sid-stat-active');
        var acquiredEl = document.getElementById('sid-stat-acquired');

        if (totalEl) totalEl.textContent = stats.total;
        if (activeEl) activeEl.textContent = stats.active;
        if (acquiredEl) acquiredEl.textContent = stats.acquired;
    }

    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

})();
