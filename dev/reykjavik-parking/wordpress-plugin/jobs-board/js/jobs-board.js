/**
 * Startup Iceland Jobs Board - Main JavaScript
 * Version: 1.1.0
 */

(function() {
    'use strict';

    // Data source - jsDelivr CDN mirrors GitHub with caching
    var DATA_URL = 'https://cdn.jsdelivr.net/gh/balainiceland/reykjavik-parking@master/dev/reykjavik-parking/wordpress-plugin/jobs-board/js/jobs-data.json';

    // Cache settings
    var CACHE_KEY = 'sjb_jobs_cache';
    var CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour

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
        },
        sort: 'newest'
    };

    // DOM Elements
    var elements = {};

    // Cached reference to bundled data (categories, types, levels, remoteOptions)
    var dataLabels = {};

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
            sortSelect: document.getElementById('sjb-sort'),
            jobsList: document.getElementById('sjb-jobs-list'),
            showingCount: document.getElementById('sjb-showing-count'),
            companyCount: document.getElementById('sjb-company-count'),
            noJobs: document.getElementById('sjb-no-jobs')
        };

        // Load data via CDN with cache and fallback
        loadData();
    }

    /**
     * Load jobs data: cache → CDN → bundled fallback
     */
    function loadData() {
        // Show loading state
        if (elements.jobsList) {
            elements.jobsList.innerHTML = '<div class="sjb-loading">Loading jobs...</div>';
        }

        // Try localStorage cache first
        var cached = getFromCache();
        if (cached) {
            console.log('Loaded jobs data from cache');
            applyData(cached);
            initBoard();
            // Background refresh even when cache is valid
            fetchFreshData(true);
            return;
        }

        // Try bundled data as immediate fallback while fetching
        if (typeof StartupIcelandJobsData !== 'undefined' && StartupIcelandJobsData.jobs && StartupIcelandJobsData.jobs.length > 0) {
            console.log('Using bundled jobs data while fetching from CDN');
            applyBundledData();
            initBoard();
            // Fetch fresh data in background
            fetchFreshData(true);
            return;
        }

        // No cache, no bundled data - fetch from CDN
        fetchFreshData(false);
    }

    /**
     * Fetch fresh data from CDN
     */
    function fetchFreshData(isBackgroundRefresh) {
        fetch(DATA_URL)
            .then(function(response) {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(function(data) {
                console.log('Fetched fresh jobs data from CDN');
                saveToCache(data);
                if (!isBackgroundRefresh) {
                    applyData(data);
                    initBoard();
                } else {
                    // Check if data changed
                    if (data.jobs && data.jobs.length !== state.jobs.length) {
                        console.log('New jobs available (' + data.jobs.length + '), refreshing...');
                        applyData(data);
                        applyFilters();
                    }
                }
            })
            .catch(function(error) {
                console.warn('Failed to fetch from CDN:', error);
                if (!isBackgroundRefresh) {
                    // Fall back to bundled data
                    if (typeof StartupIcelandJobsData !== 'undefined' && StartupIcelandJobsData.jobs) {
                        console.log('Falling back to bundled jobs data');
                        applyBundledData();
                        initBoard();
                    } else if (elements.jobsList) {
                        elements.jobsList.innerHTML = '<div class="sjb-error">Unable to load jobs data. Please refresh the page.</div>';
                    }
                }
            });
    }

    /**
     * Apply data from CDN/cache (JSON format)
     */
    function applyData(data) {
        state.jobs = data.jobs || [];
        state.filteredJobs = state.jobs.slice();
        dataLabels.categories = data.categories || {};
        dataLabels.types = data.types || {};
        dataLabels.levels = data.levels || {};
        dataLabels.remoteOptions = data.remoteOptions || {};
    }

    /**
     * Apply bundled StartupIcelandJobsData
     */
    function applyBundledData() {
        state.jobs = StartupIcelandJobsData.jobs || [];
        state.filteredJobs = state.jobs.slice();
        dataLabels.categories = StartupIcelandJobsData.categories || {};
        dataLabels.types = StartupIcelandJobsData.types || {};
        dataLabels.levels = StartupIcelandJobsData.levels || {};
        dataLabels.remoteOptions = StartupIcelandJobsData.remoteOptions || {};
    }

    /**
     * Get data from localStorage cache
     */
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

    /**
     * Save data to localStorage cache
     */
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

    /**
     * Initialize board UI after data is loaded
     */
    function initBoard() {
        populateCategoryFilter();
        bindEvents();
        applyFilters();
    }

    /**
     * Populate the category filter dropdown
     */
    function populateCategoryFilter() {
        if (!elements.categoryFilter || !dataLabels.categories) return;

        var categories = dataLabels.categories;

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

        // Sort select
        if (elements.sortSelect) {
            elements.sortSelect.addEventListener('change', function(e) {
                state.sort = e.target.value;
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

        // Sort: active before filled, featured first, then by selected sort option
        filtered.sort(function(a, b) {
            // Filled jobs always last
            var aFilled = a.status === 'filled' ? 1 : 0;
            var bFilled = b.status === 'filled' ? 1 : 0;
            if (aFilled !== bFilled) return aFilled - bFilled;

            // Featured jobs first (among active)
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;

            // Then by selected sort option
            switch (state.sort) {
                case 'oldest':
                    return new Date(a.postedDate) - new Date(b.postedDate);
                case 'company-az':
                    return a.company.localeCompare(b.company);
                case 'company-za':
                    return b.company.localeCompare(a.company);
                case 'newest':
                default:
                    return new Date(b.postedDate) - new Date(a.postedDate);
            }
        });

        state.filteredJobs = filtered;
        renderJobs();
    }

    /**
     * Render jobs list
     */
    function renderJobs() {
        if (!elements.jobsList) return;

        // Update job count
        if (elements.showingCount) {
            elements.showingCount.textContent = state.filteredJobs.length;
        }

        // Count unique companies
        if (elements.companyCount) {
            var uniqueCompanies = {};
            state.filteredJobs.forEach(function(job) {
                if (job.company) {
                    uniqueCompanies[job.company.toLowerCase()] = true;
                }
            });
            elements.companyCount.textContent = Object.keys(uniqueCompanies).length;
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
        var isFilled = job.status === 'filled';
        var card = document.createElement('div');
        card.className = 'sjb-job-card'
            + (job.featured && !isFilled ? ' sjb-featured' : '')
            + (isFilled ? ' sjb-filled' : '');

        var html = '';

        // Filled badge
        if (isFilled) {
            html += '<div class="sjb-filled-badge">No Longer Available</div>';
        }

        // Featured badge
        if (job.featured && !isFilled) {
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

        // Description excerpt
        if (job.description) {
            var excerpt = job.description.length > 150
                ? job.description.substring(0, 150).replace(/\s+\S*$/, '') + '...'
                : job.description;
            html += '<p class="sjb-job-excerpt">' + escapeHtml(excerpt) + '</p>';
        }

        // Tags
        html += '<div class="sjb-job-tags">';
        html += '<span class="sjb-tag sjb-tag-' + job.category + '">' + getCategoryLabel(job.category) + '</span>';
        html += '<span class="sjb-tag sjb-tag-type">' + getTypeLabel(job.type) + '</span>';
        html += '<span class="sjb-tag sjb-tag-level">' + getLevelLabel(job.experienceLevel) + '</span>';
        html += '</div>';

        // Footer with date and apply button
        html += '<div class="sjb-job-footer">';
        html += '<span class="sjb-posted-date">Posted: ' + formatDate(job.postedDate) + '</span>';
        if (isFilled) {
            html += '<span class="sjb-apply-btn sjb-apply-btn-disabled">Closed</span>';
        } else {
            html += '<a href="' + escapeHtml(job.applicationUrl) + '" target="_blank" rel="noopener noreferrer" class="sjb-apply-btn">Apply</a>';
        }
        html += '</div>';

        card.innerHTML = html;
        return card;
    }

    /**
     * Get category label
     */
    function getCategoryLabel(category) {
        return (dataLabels.categories && dataLabels.categories[category]) || category;
    }

    /**
     * Get type label
     */
    function getTypeLabel(type) {
        return (dataLabels.types && dataLabels.types[type]) || type;
    }

    /**
     * Get level label
     */
    function getLevelLabel(level) {
        return (dataLabels.levels && dataLabels.levels[level]) || level;
    }

    /**
     * Get remote label
     */
    function getRemoteLabel(remote) {
        return (dataLabels.remoteOptions && dataLabels.remoteOptions[remote]) || remote;
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
