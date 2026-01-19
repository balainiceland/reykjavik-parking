/**
 * Startup Iceland Jobs Board - Main JavaScript
 * Version: 1.0.0
 */

(function() {
    'use strict';

    // State
    var state = {
        jobs: [],
        filteredJobs: [],
        filters: {
            search: '',
            category: 'all',
            type: 'all',
            level: 'all',
            remote: 'all'
        }
    };

    // DOM Elements
    var elements = {};

    /**
     * Initialize the jobs board
     */
    function init() {
        // Check if we're on a page with the jobs board
        var container = document.getElementById('sjb-container');
        if (!container) return;

        // Cache DOM elements
        elements = {
            container: container,
            search: document.getElementById('sjb-search'),
            categoryFilter: document.getElementById('sjb-category-filter'),
            typeFilter: document.getElementById('sjb-type-filter'),
            levelFilter: document.getElementById('sjb-level-filter'),
            remoteFilter: document.getElementById('sjb-remote-filter'),
            jobsList: document.getElementById('sjb-jobs-list'),
            showingCount: document.getElementById('sjb-showing-count'),
            noJobs: document.getElementById('sjb-no-jobs')
        };

        // Load jobs data
        if (typeof StartupIcelandJobsData !== 'undefined') {
            state.jobs = StartupIcelandJobsData.jobs || [];
            state.filteredJobs = state.jobs.slice();
        }

        // Populate category filter
        populateCategoryFilter();

        // Bind events
        bindEvents();

        // Initial render
        applyFilters();
    }

    /**
     * Populate the category filter dropdown
     */
    function populateCategoryFilter() {
        if (!elements.categoryFilter || typeof StartupIcelandJobsData === 'undefined') return;

        var categories = StartupIcelandJobsData.categories || {};

        Object.keys(categories).forEach(function(key) {
            var option = document.createElement('option');
            option.value = key;
            option.textContent = categories[key];
            elements.categoryFilter.appendChild(option);
        });
    }

    /**
     * Bind event listeners
     */
    function bindEvents() {
        // Search input
        if (elements.search) {
            elements.search.addEventListener('input', debounce(function(e) {
                state.filters.search = e.target.value.toLowerCase().trim();
                applyFilters();
            }, 200));
        }

        // Category filter
        if (elements.categoryFilter) {
            elements.categoryFilter.addEventListener('change', function(e) {
                state.filters.category = e.target.value;
                applyFilters();
            });
        }

        // Type filter
        if (elements.typeFilter) {
            elements.typeFilter.addEventListener('change', function(e) {
                state.filters.type = e.target.value;
                applyFilters();
            });
        }

        // Level filter
        if (elements.levelFilter) {
            elements.levelFilter.addEventListener('change', function(e) {
                state.filters.level = e.target.value;
                applyFilters();
            });
        }

        // Remote filter
        if (elements.remoteFilter) {
            elements.remoteFilter.addEventListener('change', function(e) {
                state.filters.remote = e.target.value;
                applyFilters();
            });
        }
    }

    /**
     * Apply all filters and render
     */
    function applyFilters() {
        var filtered = state.jobs.filter(function(job) {
            // Search filter
            if (state.filters.search) {
                var searchText = state.filters.search;
                var matchesSearch =
                    job.title.toLowerCase().includes(searchText) ||
                    job.company.toLowerCase().includes(searchText) ||
                    job.description.toLowerCase().includes(searchText) ||
                    job.location.toLowerCase().includes(searchText);

                if (!matchesSearch) return false;
            }

            // Category filter
            if (state.filters.category !== 'all' && job.category !== state.filters.category) {
                return false;
            }

            // Type filter
            if (state.filters.type !== 'all' && job.type !== state.filters.type) {
                return false;
            }

            // Level filter
            if (state.filters.level !== 'all' && job.experienceLevel !== state.filters.level) {
                return false;
            }

            // Remote filter
            if (state.filters.remote !== 'all' && job.remote !== state.filters.remote) {
                return false;
            }

            return true;
        });

        // Sort: featured first, then by date (newest first)
        filtered.sort(function(a, b) {
            // Featured jobs first
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;

            // Then by date (newest first)
            return new Date(b.postedDate) - new Date(a.postedDate);
        });

        state.filteredJobs = filtered;
        renderJobs();
    }

    /**
     * Render jobs list
     */
    function renderJobs() {
        if (!elements.jobsList) return;

        // Update count
        if (elements.showingCount) {
            elements.showingCount.textContent = state.filteredJobs.length;
        }

        // Show/hide no jobs message
        if (elements.noJobs) {
            elements.noJobs.style.display = state.filteredJobs.length === 0 ? 'block' : 'none';
        }

        // Clear and render jobs
        elements.jobsList.innerHTML = '';

        state.filteredJobs.forEach(function(job) {
            var card = createJobCard(job);
            elements.jobsList.appendChild(card);
        });
    }

    /**
     * Create a job card element
     */
    function createJobCard(job) {
        var card = document.createElement('div');
        card.className = 'sjb-job-card' + (job.featured ? ' sjb-featured' : '');

        var html = '';

        // Featured badge
        if (job.featured) {
            html += '<div class="sjb-featured-badge">Featured</div>';
        }

        // Job title
        html += '<h3 class="sjb-job-title">' + escapeHtml(job.title) + '</h3>';

        // Meta info (company, location, remote)
        html += '<div class="sjb-job-meta">';
        html += '<span class="sjb-company">' + escapeHtml(job.company) + '</span>';
        html += '<span class="sjb-separator">&middot;</span>';
        html += '<span class="sjb-location">' + escapeHtml(job.location) + '</span>';
        html += '<span class="sjb-separator">&middot;</span>';
        html += '<span class="sjb-remote">' + getRemoteLabel(job.remote) + '</span>';
        html += '</div>';

        // Tags
        html += '<div class="sjb-job-tags">';
        html += '<span class="sjb-tag sjb-tag-' + job.category + '">' + getCategoryLabel(job.category) + '</span>';
        html += '<span class="sjb-tag sjb-tag-type">' + getTypeLabel(job.type) + '</span>';
        html += '<span class="sjb-tag sjb-tag-level">' + getLevelLabel(job.experienceLevel) + '</span>';
        html += '</div>';

        // Footer with date and apply button
        html += '<div class="sjb-job-footer">';
        html += '<span class="sjb-posted-date">Posted: ' + formatDate(job.postedDate) + '</span>';
        html += '<a href="' + escapeHtml(job.applicationUrl) + '" target="_blank" rel="noopener noreferrer" class="sjb-apply-btn">Apply</a>';
        html += '</div>';

        card.innerHTML = html;
        return card;
    }

    /**
     * Get category label
     */
    function getCategoryLabel(category) {
        if (typeof StartupIcelandJobsData !== 'undefined' && StartupIcelandJobsData.categories) {
            return StartupIcelandJobsData.categories[category] || category;
        }
        return category;
    }

    /**
     * Get type label
     */
    function getTypeLabel(type) {
        if (typeof StartupIcelandJobsData !== 'undefined' && StartupIcelandJobsData.types) {
            return StartupIcelandJobsData.types[type] || type;
        }
        return type;
    }

    /**
     * Get level label
     */
    function getLevelLabel(level) {
        if (typeof StartupIcelandJobsData !== 'undefined' && StartupIcelandJobsData.levels) {
            return StartupIcelandJobsData.levels[level] || level;
        }
        return level;
    }

    /**
     * Get remote label
     */
    function getRemoteLabel(remote) {
        if (typeof StartupIcelandJobsData !== 'undefined' && StartupIcelandJobsData.remoteOptions) {
            return StartupIcelandJobsData.remoteOptions[remote] || remote;
        }
        return remote;
    }

    /**
     * Format date for display
     */
    function formatDate(dateString) {
        var date = new Date(dateString);
        var options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Debounce function for search input
     */
    function debounce(func, wait) {
        var timeout;
        return function executedFunction() {
            var context = this;
            var args = arguments;
            var later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
