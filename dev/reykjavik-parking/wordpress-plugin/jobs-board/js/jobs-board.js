/**
 * Startup Iceland Jobs Board - Main JavaScript
 * Version: 1.5.0
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
            remote: 'all',
            employer: 'all'
        },
        sort: 'newest',
        trends: { measure: 'postings', status: 'all', employers: 'all', showAll: false }
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
            employerFilter: document.getElementById('sjb-employer-filter'),
            startupNote: document.getElementById('sjb-startup-note'),
            typeFilter: document.getElementById('sjb-type-filter'),
            levelFilter: document.getElementById('sjb-level-filter'),
            remoteFilter: document.getElementById('sjb-remote-filter'),
            sortSelect: document.getElementById('sjb-sort'),
            jobsList: document.getElementById('sjb-jobs-list'),
            showingCount: document.getElementById('sjb-showing-count'),
            companyCount: document.getElementById('sjb-company-count'),
            noJobs: document.getElementById('sjb-no-jobs'),
            trendsGrid: document.getElementById('sjb-trends-grid'),
            trendsMore: document.getElementById('sjb-trends-more'),
            heroOpen: document.getElementById('sjb-hero-open'),
            heroCompanies: document.getElementById('sjb-hero-companies'),
            heroStartups: document.getElementById('sjb-hero-startups'),
            trendsLead: document.getElementById('sjb-trends-lead')
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
     * Hiring trends: job categories by the month jobs were first posted, drawn
     * from the same data as the list so it is always current. Darker cells mean
     * more postings (or more companies hiring); selecting a row filters the list.
     */
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var TREND_MONTHS = 12;

    function monthLabel(ym) {
        var m = parseInt(ym.slice(5, 7), 10) - 1;
        return (m === 0 || m === 11) ? MONTHS[m] + ' \u2019' + ym.slice(2, 4) : MONTHS[m];
    }

    function trendValue(jobs) {
        if (state.trends.measure === 'postings') return jobs.length;
        var seen = {};
        jobs.forEach(function(j) { seen[j.company] = true; });
        return Object.keys(seen).length;
    }

    function shade(t) {
        // From a pale plum (#f7f0f7) to the brand's dark plum (#3a1239).
        var a = [247, 240, 247], b = [58, 18, 57];
        var k = 0.12 + 0.88 * Math.sqrt(t);
        return 'rgb(' + a.map(function(v, i) { return Math.round(v + (b[i] - v) * k); }).join(',') + ')';
    }

    function selectCategory(cat) {
        state.filters.category = (state.filters.category === cat) ? 'all' : cat;
        if (elements.categoryFilter) elements.categoryFilter.value = state.filters.category;
        applyFilters();
        if (state.filters.category !== 'all' && elements.jobsList) {
            elements.jobsList.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function trendCell(cls, text) {
        var div = document.createElement('div');
        div.className = cls;
        if (text != null) div.textContent = text;
        return div;
    }

    function renderTrends() {
        var grid = elements.trendsGrid;
        if (!grid) return;

        var jobs = state.jobs.filter(function(j) {
            return /^\d{4}-\d{2}/.test(j.postedDate || '') &&
                (state.trends.status === 'all' || j.status !== 'filled') &&
                (state.trends.employers === 'all' || j.startup);
        });
        var months = {};
        state.jobs.forEach(function(j) {
            if (/^\d{4}-\d{2}/.test(j.postedDate || '')) months[j.postedDate.slice(0, 7)] = true;
        });
        months = Object.keys(months).sort().slice(-TREND_MONTHS);

        var byCat = {};
        jobs.forEach(function(j) {
            if (months.indexOf(j.postedDate.slice(0, 7)) === -1) return;
            (byCat[j.category] = byCat[j.category] || []).push(j);
        });
        var cats = Object.keys(byCat).sort(function(a, b) {
            if ((a === 'other') !== (b === 'other')) return a === 'other' ? 1 : -1;
            return trendValue(byCat[b]) - trendValue(byCat[a]);
        });

        // The five largest categories by default (plus a selected one), all on request.
        var allCount = cats.length;
        if (!state.trends.showAll && cats.length > 5) {
            cats = cats.filter(function(c, i) { return i < 5 || c === state.filters.category; });
        }
        if (elements.trendsMore) {
            elements.trendsMore.hidden = allCount <= 5;
            elements.trendsMore.textContent = state.trends.showAll ? 'Show fewer categories' : 'Show all ' + allCount + ' categories';
        }

        var cells = {}, max = 0;
        cats.forEach(function(c) {
            months.forEach(function(m) {
                var list = byCat[c].filter(function(j) { return j.postedDate.slice(0, 7) === m; });
                var v = trendValue(list);
                cells[c + '|' + m] = { v: v, list: list };
                if (v > max) max = v;
            });
        });

        var unit = state.trends.measure === 'postings' ? 'postings' : 'companies hiring';
        if (elements.trendsLead) {
            var top = cats.filter(function(c) { return c !== 'other'; }).slice(0, 3).map(function(c) {
                return getCategoryLabel(c) + ' (' + trendValue(byCat[c]) + ')';
            });
            elements.trendsLead.textContent = top.length
                ? 'Most ' + unit + ' over the last ' + months.length + ' months: ' + top.join(', ') + '.'
                : 'No jobs to show yet.';
        }

        grid.style.gridTemplateColumns = 'minmax(9rem, max-content) repeat(' + months.length + ', minmax(2.1rem, 1fr)) minmax(2.5rem, max-content)';
        var kids = [trendCell('sjb-trends-colhead', '')];
        months.forEach(function(m) { kids.push(trendCell('sjb-trends-colhead', monthLabel(m))); });
        kids.push(trendCell('sjb-trends-colhead', 'Total'));

        cats.forEach(function(c) {
            var selected = state.filters.category === c;
            var label = document.createElement('button');
            label.type = 'button';
            label.className = 'sjb-trends-rowhead' + (selected ? ' is-selected' : '');
            label.textContent = getCategoryLabel(c);
            label.setAttribute('aria-pressed', String(selected));
            label.addEventListener('click', function() { selectCategory(c); });
            kids.push(label);

            months.forEach(function(m) {
                var cell = cells[c + '|' + m];
                var div = trendCell('sjb-trends-cell' + (selected ? ' is-selected' : ''), cell.v ? String(cell.v) : '');
                var t = max ? cell.v / max : 0;
                div.style.background = cell.v ? shade(t) : '#f7f8fa';
                div.style.color = t > 0.45 ? '#fff' : '#3a1239';
                var counts = {};
                cell.list.forEach(function(j) { counts[j.company] = (counts[j.company] || 0) + 1; });
                var topCos = Object.keys(counts).sort(function(a, b) { return counts[b] - counts[a]; }).slice(0, 4)
                    .map(function(co) { return co + ' (' + counts[co] + ')'; });
                div.title = getCategoryLabel(c) + ', ' + monthLabel(m) + ': ' + cell.v + ' ' + unit +
                    (topCos.length ? '\n' + topCos.join('\n') : '');
                div.addEventListener('click', function() { selectCategory(c); });
                kids.push(div);
            });
            kids.push(trendCell('sjb-trends-total', String(trendValue(byCat[c]))));
        });

        grid.replaceChildren.apply(grid, kids);
    }

    function bindTrendControls() {
        if (elements.trendsMore) {
            elements.trendsMore.addEventListener('click', function() {
                state.trends.showAll = !state.trends.showAll;
                renderTrends();
            });
        }
        var buttons = document.querySelectorAll('.sjb-trends [data-trend]');
        Array.prototype.forEach.call(buttons, function(btn) {
            btn.addEventListener('click', function() {
                var group = btn.getAttribute('data-trend');
                state.trends[group] = btn.getAttribute('data-value');
                Array.prototype.forEach.call(buttons, function(b) {
                    if (b.getAttribute('data-trend') === group) b.setAttribute('aria-pressed', String(b === btn));
                });
                renderTrends();
            });
        });
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
        bindTrendControls();

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

        // Employer filter: all employers, or Startup Directory companies only
        if (elements.employerFilter) {
            elements.employerFilter.addEventListener('change', function(e) {
                state.filters.employer = e.target.value;
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
    function updateHero() {
        var open = state.jobs.filter(function(j) { return j.status !== 'filled'; });
        var companies = {};
        open.forEach(function(j) { companies[(j.company || '').toLowerCase()] = true; });
        if (elements.heroOpen) elements.heroOpen.textContent = open.length;
        if (elements.heroCompanies) elements.heroCompanies.textContent = Object.keys(companies).length;
        if (elements.heroStartups) elements.heroStartups.textContent = open.filter(function(j) { return j.startup; }).length;
    }

    function applyFilters() {
        updateHero();
        renderTrends();

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

            // Employer filter
            if (state.filters.employer === 'startups' && !job.startup) {
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
        if (elements.startupNote) {
            var atStartups = state.filteredJobs.filter(function(job) { return job.startup; }).length;
            elements.startupNote.textContent = (state.filters.employer === 'startups' || !state.filteredJobs.length)
                ? '' : ', ' + atStartups + ' at startups';
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
    var ARROW = '<svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    var LEVEL_LABELS = { entry: 'Entry level', mid: 'Mid level', senior: 'Senior', lead: 'Lead', executive: 'Executive' };

    function escapeRegExp(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * The description without what some sources repeat at its start: the title,
     * the company, a date ("7. Aug 2026") and a job type ("Fullt starf").
     */
    function cleanDescription(job) {
        var d = (job.description || '').replace(/[\u00a0\u202f\u2007]/g, ' ').replace(/\s+/g, ' ').trim();
        function strip(text) {
            var rx = new RegExp('^' + escapeRegExp(text.trim()) + '[\\s,:\u2013-]*', 'i');
            var out = d.replace(rx, '');
            var hit = out !== d;
            d = out;
            return hit;
        }
        var DATE = /^\d{1,2}\.\s*[A-Za-z\u00C0-\u017F]{3,}\.?\s*\d{4}\s*/;
        var TYPE = /^(Fullt starf|Hlutastarf|Sumarstarf|Tímabundið starf|Verktaka|Starfsnám|Full[- ]time|Part[- ]time|Contract|Internship)\s*/i;
        var companies = [job.company, (job.company || '').split('|')[0]].filter(Boolean);
        // The repeated block is title, company, date, type, sometimes the title
        // again. The company is only stripped inside that block: a description
        // may well open with the company as its subject ("Alvotech is looking…").
        var startsWithTitle = job.title && strip(job.title);
        var companyBeforeDate = companies.some(function(c) {
            return new RegExp('^' + escapeRegExp(c.trim()) + '\\s+\\d{1,2}\\.', 'i').test(d);
        });
        if (startsWithTitle || companyBeforeDate) {
            companies.some(strip);
            d = d.replace(DATE, '').replace(TYPE, '');
            if (job.title) strip(job.title);
        }
        return d;
    }

    function formatPosted(dateString) {
        var date = new Date(dateString);
        if (isNaN(date)) return '';
        var opts = { day: 'numeric', month: 'short' };
        if (date.getFullYear() !== new Date().getFullYear()) opts.year = 'numeric';
        return 'Posted ' + date.toLocaleDateString('en-GB', opts);
    }

    /**
     * Create a job card element
     */
    function createJobCard(job) {
        var isFilled = job.status === 'filled';
        var card = document.createElement('article');
        card.className = 'sjb-job-card'
            + (job.featured && !isFilled ? ' sjb-featured' : '')
            + (isFilled ? ' sjb-filled' : '');

        var html = '';
        if (isFilled) {
            html += '<span class="sjb-flag is-filled">No longer available</span>';
        } else if (job.featured) {
            html += '<span class="sjb-flag">Featured</span>';
        }

        html += '<h3 class="sjb-job-title">' + escapeHtml(job.title) + '</h3>';

        var location = (job.location || '').replace(/,\s*Iceland$/i, '');
        html += '<div class="sjb-job-meta">';
        html += '<strong class="sjb-company">' + escapeHtml(job.company) + '</strong>';
        if (job.startup && !isFilled) {
            html += '<span class="sjb-startup-badge" title="In the Startup Iceland directory">Startup</span>';
        }
        if (location) html += '<span class="sjb-separator" aria-hidden="true">&middot;</span><span class="sjb-location">' + escapeHtml(location) + '</span>';
        if (!isFilled) {
            html += '<span class="sjb-separator" aria-hidden="true">&middot;</span><span class="sjb-remote' +
                (job.remote === 'remote' ? ' is-remote' : '') + '">' + getRemoteLabel(job.remote) + '</span>';
        }
        html += '</div>';

        if (!isFilled) {
            var description = cleanDescription(job);
            if (description) {
                var excerpt = description.length > 170
                    ? description.substring(0, 170).replace(/\s+\S*$/, '') + '\u2026'
                    : description;
                html += '<p class="sjb-job-excerpt">' + escapeHtml(excerpt) + '</p>';
            }

            html += '<div class="sjb-job-bottom">';
            html += '<div class="sjb-job-tags">';
            html += '<span class="sjb-tag sjb-tag-' + escapeHtml(job.category) + '">' + escapeHtml(getCategoryLabel(job.category)) + '</span>';
            if (job.type) html += '<span class="sjb-tag is-outline">' + escapeHtml(getTypeLabel(job.type)) + '</span>';
            if (LEVEL_LABELS[job.experienceLevel]) html += '<span class="sjb-tag is-outline">' + LEVEL_LABELS[job.experienceLevel] + '</span>';
            html += '</div>';
            html += '<div class="sjb-job-action">';
            html += '<span class="sjb-posted-date">' + formatPosted(job.postedDate) + '</span>';
            html += '<a href="' + escapeHtml(job.applicationUrl) + '" target="_blank" rel="noopener noreferrer" class="sjb-apply-btn">Apply ' + ARROW + '</a>';
            html += '</div></div>';
        }

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
