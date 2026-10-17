/**
 * Startup Iceland - Iceland's changing world of work
 * Draws the [iceland_work_trends] page from the public figures the jobs
 * research database publishes daily (balainiceland/iceland-work-trends).
 * Layout follows the "Changing World of Work Redesign" canvas (Oct 2026).
 * Every number comes from the data; headlines are worded to stay true as it changes.
 * Version: 2.2.0
 */
(function () {
    'use strict';

    // GitHub's raw files refresh within 5 minutes of the daily publish. jsDelivr
    // caches which commit @main points to for hours, so it is only the fallback.
    var SOURCES = ['https://raw.githubusercontent.com/balainiceland/iceland-work-trends/main/data/',
                   'https://cdn.jsdelivr.net/gh/balainiceland/iceland-work-trends@main/data/'];

    function load(file) {
        function from(i) {
            return fetch(SOURCES[i] + file + '.json').then(function (r) {
                if (!r.ok) throw new Error(file + ': ' + r.status);
                return r.json();
            }).catch(function (e) {
                if (i + 1 < SOURCES.length) return from(i + 1);
                throw e;
            });
        }
        return from(0);
    }
    // The last ordinary year before generative AI went mainstream: the baseline
    // the latest year's share of AI mentions is compared against.
    var BASELINE_YEAR = 2019;
    var CHATGPT_YEAR = 2022;   // released 30 Nov 2022; the marker sits after this year
    var MIN_ADS_PER_YEAR = 10;

    // Most to least exposed, as the ILO index defines its gradients.
    var GRADIENTS = [
        { key: 'Exposed: Gradient 4', label: 'Highest', color: '#3A1239', exposed: true },
        { key: 'Exposed: Gradient 3', label: 'Significant', color: '#6D2D6C', exposed: true },
        { key: 'Exposed: Gradient 2', label: 'Moderate', color: '#9C5A9A', exposed: true },
        { key: 'Exposed: Gradient 1', label: 'Low, some tasks high', color: '#C99BC7', exposed: true },
        { key: 'Minimal Exposure', label: 'Minimal', color: '#8FA3BC', exposed: false },
        { key: 'Not Exposed', label: 'Not exposed', color: '#CBD5E1', exposed: false },
        { key: 'Not in ILO index', label: 'Not scored', color: '#E5E7EB', exposed: false }
    ];
    var GROUP_SHORT = {
        'Professionals': 'Professionals', 'Service and Sales Workers': 'Service and sales',
        'Technicians and Associate Professionals': 'Technicians', 'Craft and Related Trades Workers': 'Craft and trades',
        'Managers': 'Managers', 'Clerical Support Workers': 'Clerical support', 'Elementary Occupations': 'Elementary occupations',
        'Plant and Machine Operators, and Assemblers': 'Machine operators',
        'Skilled Agricultural, Forestry and Fishery Workers': 'Agriculture and fishing', 'Armed Forces Occupations': 'Armed forces'
    };
    var SOURCE_INFO = {
        alfred: 'Iceland’s largest job board, mostly private-sector jobs',
        starfatorg: 'every public-sector vacancy, on island.is',
        tvinna: 'tech and creative jobs, archive back to 2010',
        hagvangur: 'recruitment agency listings',
        intellecta: 'recruitment agency listings'
    };

    function el(tag, cls, text) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text != null) e.textContent = text;
        return e;
    }
    function pct(x) { return Math.round(x * 100) + '%'; }
    function num(n) { return Number(n).toLocaleString('en-GB'); }
    function sentenceCase(s) { return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); }
    function card(cls) { return el('section', 'siwt-card' + (cls ? ' ' + cls : '')); }
    function eyebrow(parent, text) { parent.appendChild(el('p', 'siwt-eyebrow', text)); }
    function gradientOf(key) {
        for (var i = 0; i < GRADIENTS.length; i++) if (GRADIENTS[i].key === key) return GRADIENTS[i];
        return GRADIENTS[GRADIENTS.length - 1];
    }

    function aiYears(data) {
        return data.years.filter(function (y) { return y.postings >= MIN_ADS_PER_YEAR; });
    }

    // ── Hero ────────────────────────────────────────────────────────────────
    function renderHero(root, summary, market, years) {
        var hero = el('header', 'siwt-hero');
        hero.appendChild(el('p', 'siwt-hero-eyebrow', 'Startup Iceland · Jobs research'));
        hero.appendChild(el('h1', 'siwt-hero-title', 'Iceland’s changing world of work'));
        var count = summary.sources.filter(function (s) { return s.id !== 'startupiceland_board'; }).length;
        hero.appendChild(el('p', 'siwt-hero-lead', 'What today’s job postings say about the work Iceland is hiring for, ' +
            'and how far generative AI is reaching into it. Updated every morning from ' + count + ' Icelandic job sources.'));

        var stats = el('div', 'siwt-stats');
        function stat(value, text, accent) {
            var s = el('div', 'siwt-stat');
            s.appendChild(el('span', 'siwt-stat-value' + (accent ? ' is-accent' : ''), value));
            s.appendChild(el('span', 'siwt-stat-text', text));
            stats.appendChild(s);
        }
        stat(num(market.open_postings), 'open jobs advertised in Iceland today');
        var latest = years[years.length - 1];
        var base = years.filter(function (y) { return y.year === BASELINE_YEAR; })[0];
        if (latest) {
            stat(pct(latest.share), 'of tech and creative job ads mention AI in ' + latest.year +
                (base && latest.year !== BASELINE_YEAR ? ', up from ' + pct(base.share) + ' in ' + BASELINE_YEAR : ''), true);
        }
        var scored = market.by_exposure_gradient;
        var low = 0, all = 0;
        scored.forEach(function (g) {
            all += g.postings;
            if (g.gradient === 'Minimal Exposure' || g.gradient === 'Not Exposed') low += g.postings;
        });
        if (all) stat(pct(low / all), 'of open jobs are ones generative AI barely touches');
        hero.appendChild(stats);
        hero.appendChild(el('p', 'siwt-hero-date', 'Updated ' + new Date(summary.generated_at).toLocaleDateString('en-GB',
            { day: 'numeric', month: 'long', year: 'numeric' })));
        root.appendChild(hero);
    }

    // ── The long view: AI mentions by year ─────────────────────────────────
    function renderLongView(root, years) {
        if (!years.length) return;
        var latest = years[years.length - 1];
        var s = card();
        eyebrow(s, 'The long view');
        s.appendChild(el('h2', 'siwt-h2 is-large', latest.share >= 0.25
            ? 'AI went from a footnote to a requirement in tech job ads'
            : 'AI is showing up in more tech job ads'));
        s.appendChild(el('p', 'siwt-text', 'Share of job ads on Tvinna, Iceland’s tech and creative job board, that mention ' +
            'AI, machine learning or an AI tool.'));

        var max = Math.max.apply(null, years.map(function (y) { return y.share; }).concat([0.05]));
        var chart = el('div', 'siwt-chart');
        chart.setAttribute('role', 'img');
        chart.setAttribute('aria-label', 'Share of tech and creative job ads mentioning AI by year: ' +
            years.map(function (y) { return y.year + ' ' + pct(y.share); }).join(', '));
        var cols = el('div', 'siwt-cols');
        cols.style.gridTemplateColumns = 'repeat(' + years.length + ', minmax(0, 1fr))';
        var markerAt = -1;
        years.forEach(function (y, i) {
            if (y.year > CHATGPT_YEAR && markerAt < 0) markerAt = i;
            var col = el('div', 'siwt-col');
            var strong = y.share >= 0.1;
            if (strong || y.year === BASELINE_YEAR || y.year === CHATGPT_YEAR) {
                col.appendChild(el('span', 'siwt-col-value' + (strong ? ' is-accent' : ''), pct(y.share)));
            }
            var bar = el('div', 'siwt-col-bar');
            // A share of the chart's own height (less room for the value and year
            // labels), so the tallest bar fits whether the chart is 290 or 240px tall.
            bar.style.height = 'max(2px, calc((100% - 48px) * ' + (y.share / max).toFixed(4) + '))';
            bar.style.background = !strong ? (y.year === BASELINE_YEAR || y.year === CHATGPT_YEAR ? '#9FB0C6' : '#C9D3DF')
                : (y.share >= 0.35 ? '#4A1D4A' : y.share >= 0.2 ? '#6D2D6C' : '#9C5A9A');
            col.appendChild(bar);
            col.appendChild(el('span', 'siwt-col-year', '’' + String(y.year).slice(2)));
            cols.appendChild(col);
        });
        if (markerAt > 0) {
            var left = (100 * markerAt / years.length) + '%';
            var line = el('div', 'siwt-marker');
            line.style.left = left;
            var label = el('p', 'siwt-marker-label', 'ChatGPT released, Nov 2022');
            label.style.left = left;
            chart.appendChild(line);
            chart.appendChild(label);
        }
        chart.appendChild(cols);
        s.appendChild(chart);
        var peak = years.reduce(function (a, b) { return b.postings > a.postings ? b : a; });
        s.appendChild(el('p', 'siwt-small', 'Ads per year: ' + num(years[0].postings) + ' in ' + years[0].year + ' · ' +
            num(peak.postings) + ' at the ' + peak.year + ' peak · ' + num(latest.postings) + ' in ' + latest.year +
            '. Years with few ads should be read with care.'));
        root.appendChild(s);
    }

    // ── Exposure and who is hiring ─────────────────────────────────────────
    function renderExposure(parent, market) {
        var s = card();
        eyebrow(s, 'Exposure to generative AI');
        var counts = {}, total = 0, exposed = 0;
        market.by_exposure_gradient.forEach(function (g) { counts[g.gradient] = g.postings; total += g.postings; });
        GRADIENTS.forEach(function (g) { if (g.exposed) exposed += counts[g.key] || 0; });
        s.appendChild(el('h2', 'siwt-h2', exposed / total < 0.5
            ? 'Most open jobs are ones AI can barely do' : 'Many open jobs are ones AI could largely do'));
        s.appendChild(el('p', 'siwt-text', 'Each posting’s occupation, rated by the ILO’s 2025 index of how much of its ' +
            'work generative AI could technically do. Exposure is potential, not job loss.'));
        var bar = el('div', 'siwt-stack');
        bar.setAttribute('role', 'img');
        bar.setAttribute('aria-label', 'Open postings by exposure: ' + GRADIENTS.filter(function (g) { return counts[g.key]; })
            .map(function (g) { return g.label + ' ' + counts[g.key]; }).join(', '));
        var legend = el('div', 'siwt-legend');
        GRADIENTS.forEach(function (g) {
            if (!counts[g.key]) return;
            var seg = el('div');
            seg.style.width = (100 * counts[g.key] / total) + '%';
            seg.style.background = g.color;
            bar.appendChild(seg);
            var item = el('span', 'siwt-legend-item');
            var sw = el('span', 'siwt-swatch');
            sw.style.background = g.color;
            item.appendChild(sw);
            item.appendChild(document.createTextNode(g.label + ' · ' + num(counts[g.key])));
            legend.appendChild(item);
        });
        s.appendChild(bar);
        s.appendChild(legend);
        var call = el('div', 'siwt-callout');
        call.appendChild(el('strong', null, num(exposed) + ' open jobs (' + pct(exposed / total) + ')'));
        call.appendChild(document.createTextNode(' are in occupations where generative AI could do a substantial share of the tasks.'));
        s.appendChild(call);
        parent.appendChild(s);
    }

    function renderGroups(parent, market) {
        var s = card();
        eyebrow(s, 'Who Iceland is hiring');
        s.appendChild(el('h2', 'siwt-h2', 'Open jobs by occupation group'));
        var max = Math.max.apply(null, market.by_major_group.map(function (g) { return g.postings; }).concat([1]));
        var list = el('div', 'siwt-hbars');
        market.by_major_group.forEach(function (g) {
            var row = el('div', 'siwt-hbar');
            row.appendChild(el('span', 'siwt-hbar-label', GROUP_SHORT[g.title] || g.title));
            var track = el('div', 'siwt-hbar-track');
            var fill = el('div', 'siwt-hbar-fill');
            fill.style.width = (100 * g.postings / max) + '%';
            track.appendChild(fill);
            row.appendChild(track);
            row.appendChild(el('span', 'siwt-hbar-value', num(g.postings)));
            list.appendChild(row);
        });
        s.appendChild(list);
        parent.appendChild(s);
    }

    // ── Most advertised occupations ────────────────────────────────────────
    function renderOccupations(root, market) {
        var rows = market.top_occupations.slice(0, 8);
        if (!rows.length) return;
        var top = rows.reduce(function (a, b) { return (b.genai_exposure_2025 || 0) > (a.genai_exposure_2025 || 0) ? b : a; });
        var s = card();
        eyebrow(s, 'Most advertised');
        var lead = rows.slice(0, 3).map(function (o) { return o.title.toLowerCase(); });
        s.appendChild(el('h2', 'siwt-h2', sentenceCase(lead.slice(0, 2).join(', ') + ' and ' + lead[2]) + ' lead. ' +
            sentenceCase(top.title) + ' are the most exposed.'));
        var wrap = el('div', 'siwt-table-wrap');
        var table = el('table', 'siwt-table');
        var head = el('tr');
        ['Occupation', 'Open jobs', 'Exposure to generative AI'].forEach(function (h, i) {
            head.appendChild(el('th', i === 1 ? 'siwt-num' : null, h));
        });
        var thead = el('thead');
        thead.appendChild(head);
        table.appendChild(thead);
        var tbody = el('tbody');
        rows.forEach(function (o) {
            var tr = el('tr', o === top ? 'is-highlight' : null);
            tr.appendChild(el('td', 'siwt-occ', sentenceCase(o.title)));
            tr.appendChild(el('td', 'siwt-num', num(o.postings)));
            var td = el('td');
            var meter = el('div', 'siwt-meter');
            var trackM = el('div', 'siwt-meter-track');
            var fillM = el('div', 'siwt-meter-fill');
            var score = o.genai_exposure_2025;
            fillM.style.width = (100 * (score || 0)) + '%';
            fillM.style.background = gradientOf(o.gradient_2025).color;
            trackM.appendChild(fillM);
            meter.appendChild(trackM);
            meter.appendChild(el('span', 'siwt-meter-value', score == null ? '–' : score.toFixed(2)));
            td.appendChild(meter);
            tr.appendChild(td);
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        wrap.appendChild(table);
        s.appendChild(wrap);
        s.appendChild(el('p', 'siwt-small', 'Exposure runs from 0 (generative AI could do none of the occupation’s tasks) to 1 (all of them).'));
        root.appendChild(s);
    }

    // ── AI in today's ads ──────────────────────────────────────────────────
    function renderAiNow(root, market) {
        var ai = market.ai;
        var s = card('is-dark');
        eyebrow(s, 'AI in today’s job ads');
        s.appendChild(el('h2', 'siwt-h2', num(ai.postings_mentioning_ai) + ' open jobs mention AI, and ' +
            num(ai.ai_roles) + ' are AI roles.' + (ai.top_ai_tools.length ? ' Employers are already naming the tools.' : '')));
        if (ai.top_ai_tools.length) {
            var chips = el('div', 'siwt-chips');
            ai.top_ai_tools.forEach(function (t) { chips.appendChild(el('span', 'siwt-chip', t.tool + ' · ' + num(t.postings))); });
            s.appendChild(chips);
        }
        if (ai.top_ai_skills.length) {
            s.appendChild(el('p', 'siwt-text', 'Skills asked for: ' + ai.top_ai_skills.slice(0, 6)
                .map(function (k) { return k.skill; }).join(' · ')));
        }
        root.appendChild(s);
    }

    // ── About ──────────────────────────────────────────────────────────────
    function renderAbout(root, summary) {
        var s = el('section', 'siwt-about');
        var left = el('div');
        left.appendChild(el('h2', 'siwt-h3', 'Sources'));
        var list = el('ul', 'siwt-sources');
        summary.sources.filter(function (src) { return src.id !== 'startupiceland_board'; }).forEach(function (src) {
            var li = el('li');
            var a = el('a', null, src.name);
            a.href = src.url || '#';
            a.rel = 'noopener';
            li.appendChild(a);
            li.appendChild(document.createTextNode((SOURCE_INFO[src.id] ? ': ' + SOURCE_INFO[src.id] : '') +
                '. ' + num(src.postings) + ' postings.'));
            list.appendChild(li);
        });
        left.appendChild(list);
        var right = el('div');
        right.appendChild(el('h2', 'siwt-h3', 'How it is made'));
        var p = el('p');
        p.appendChild(document.createTextNode('Postings are collected every morning; contact details are removed before anything ' +
            'is stored. Each posting is classified by occupation (ISCO-08) by Claude and matched to the '));
        var ilo = el('a', null, 'ILO’s 2025 index of exposure to generative AI');
        ilo.href = 'https://github.com/pgmyrek/2025_GenAI_scores_ISCO08';
        p.appendChild(ilo);
        p.appendChild(document.createTextNode(' (Gmyrek et al., ILO Working Paper 140, CC BY 4.0).'));
        right.appendChild(p);
        var p2 = el('p', 'siwt-muted');
        p2.appendChild(document.createTextNode('A job advertised on several sites counts once. The figures are '));
        var data = el('a', null, 'open data');
        data.href = 'https://github.com/balainiceland/iceland-work-trends';
        p2.appendChild(data);
        p2.appendChild(document.createTextNode(' (CC BY 4.0).'));
        right.appendChild(p2);
        s.appendChild(left);
        s.appendChild(right);
        root.appendChild(s);
    }

    function init() {
        var root = document.getElementById('siwt-container');
        if (!root) return;
        Promise.all(['summary', 'market_now', 'ai_mentions_by_year'].map(load)).then(function (d) {
            var summary = d[0], market = d[1], years = aiYears(d[2]);
            root.replaceChildren();
            renderHero(root, summary, market, years);
            var main = el('div', 'siwt-main');
            renderLongView(main, years);
            if (market.classified_open_postings) {
                var pair = el('div', 'siwt-pair');
                renderExposure(pair, market);
                renderGroups(pair, market);
                main.appendChild(pair);
                renderOccupations(main, market);
            } else {
                var wait = card();
                wait.appendChild(el('h2', 'siwt-h2', 'Occupations and exposure to AI'));
                wait.appendChild(el('p', 'siwt-text', 'Postings are being classified by occupation. These figures appear here once that is done.'));
                main.appendChild(wait);
            }
            renderAiNow(main, market);
            renderAbout(main, summary);
            root.appendChild(main);
        }).catch(function () {
            root.replaceChildren(el('p', 'siwt-error', 'The figures could not be loaded. Please refresh the page.'));
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
