/**
 * Startup Iceland - Iceland's changing world of work
 * Draws the [iceland_work_trends] page from the public figures the jobs
 * research database publishes daily (balainiceland/iceland-work-trends).
 * Version: 1.1.0
 */
(function () {
    'use strict';

    var BASE = 'https://cdn.jsdelivr.net/gh/balainiceland/iceland-work-trends@main/data/';
    // Most to least exposed, as the ILO index defines its gradients.
    var GRADIENT_ORDER = ['Exposed: Gradient 4', 'Exposed: Gradient 3', 'Exposed: Gradient 2',
        'Exposed: Gradient 1', 'Minimal Exposure', 'Not Exposed', 'Not in ILO index'];
    var GRADIENT_LABEL = {
        'Exposed: Gradient 4': 'Highest exposure', 'Exposed: Gradient 3': 'Significant exposure',
        'Exposed: Gradient 2': 'Moderate exposure', 'Exposed: Gradient 1': 'Low exposure, some tasks high',
        'Minimal Exposure': 'Minimal exposure', 'Not Exposed': 'Not exposed', 'Not in ILO index': 'Not scored by the ILO'
    };

    // What each source covers; used in the source list under "About these figures".
    var SOURCE_INFO = {
        alfred: { url: 'https://alfred.is', about: 'Iceland\u2019s largest job board, mostly private-sector jobs' },
        starfatorg: { url: 'https://island.is/starfatorg', about: 'every public-sector vacancy, published on island.is' },
        tvinna: { url: 'https://www.tvinna.is', about: 'tech and creative jobs, with an archive back to 2010' },
        hagvangur: { url: 'https://www.hagvangur.is/jobs/', about: 'recruitment agency listings' },
        intellecta: { url: 'https://intellecta.is/storf/', about: 'recruitment agency listings' }
    };

    function el(tag, cls, text) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text != null) e.textContent = text;
        return e;
    }

    function pct(x) { return Math.round(x * 100) + '%'; }
    function num(n) { return Number(n).toLocaleString('en-GB'); }

    function section(root, id, title, note) {
        var s = el('section', 'siwt-section');
        s.id = id;
        s.appendChild(el('h2', 'siwt-h2', title));
        if (note) s.appendChild(el('p', 'siwt-note', note));
        root.appendChild(s);
        return s;
    }

    // Horizontal bars: rows of {label, value, detail}, scaled to the largest value.
    function bars(parent, rows, format) {
        var max = Math.max.apply(null, rows.map(function (r) { return r.value; }).concat([0])) || 1;
        var list = el('div', 'siwt-bars');
        rows.forEach(function (r) {
            var row = el('div', 'siwt-bar-row');
            row.appendChild(el('div', 'siwt-bar-label', r.label));
            var track = el('div', 'siwt-bar-track');
            var fill = el('div', 'siwt-bar-fill');
            fill.style.width = (100 * r.value / max) + '%';
            track.appendChild(fill);
            row.appendChild(track);
            row.appendChild(el('div', 'siwt-bar-value', format(r)));
            list.appendChild(row);
        });
        parent.appendChild(list);
    }

    // The Startup Iceland board's history is a subset of these, not a source of its own.
    function marketSources(summary) {
        return summary.sources.filter(function (s) { return s.id !== 'startupiceland_board'; });
    }

    function renderHeadline(root, summary, market) {
        var head = el('header', 'siwt-head');
        head.appendChild(el('p', 'siwt-kicker', 'Iceland’s changing world of work'));
        head.appendChild(el('h1', 'siwt-h1', num(market.open_postings) + ' open job postings in Iceland today'));
        var count = marketSources(summary).length;
        head.appendChild(el('p', 'siwt-lead', 'Collected daily from ' + count +
            ' Icelandic job sources, listed at the end. Updated ' +
            new Date(summary.generated_at).toLocaleDateString('en-GB',
                { day: 'numeric', month: 'long', year: 'numeric' }) + '.'));
        root.appendChild(head);
    }

    function renderAiByYear(root, data) {
        var years = data.years.filter(function (y) { return y.postings >= 10; });
        var s = section(root, 'siwt-ai-years', 'Tech and creative job ads mentioning AI, by year',
            'Share of ads on Tvinna, Iceland’s tech and creative job board, that mention AI, ' +
            'machine learning or an AI tool. Years with fewer than 10 ads are left out; counts are shown ' +
            'so small years can be read with care.');
        bars(s, years.map(function (y) {
            return { label: String(y.year), value: y.share, detail: y };
        }), function (r) { return pct(r.value) + '  (' + r.detail.mentioning_ai + ' of ' + num(r.detail.postings) + ')'; });
    }

    function renderClassified(root, market, summary) {
        var share = summary.classified_share || 0;
        if (!market.classified_open_postings) {
            var s = section(root, 'siwt-pending', 'Occupations and exposure to AI',
                'Each posting is being classified by occupation (ISCO-08) and matched to the ILO’s ' +
                'index of exposure to generative AI. These figures appear here once that is done (' +
                pct(share) + ' so far).');
            return s;
        }
        var g = section(root, 'siwt-exposure', 'Open postings by exposure to generative AI',
            'Each posting’s occupation, rated by the ILO’s 2025 index of how much of its work ' +
            'generative AI could technically do. Exposure is potential, not job loss.' +
            (market.classified_open_postings < market.open_postings
                ? ' Based on the ' + num(market.classified_open_postings) + ' postings classified so far.' : ''));
        var byGrad = {};
        market.by_exposure_gradient.forEach(function (r) { byGrad[r.gradient] = r.postings; });
        bars(g, GRADIENT_ORDER.filter(function (k) { return byGrad[k]; }).map(function (k) {
            return { label: GRADIENT_LABEL[k] || k, value: byGrad[k] };
        }), function (r) { return num(r.value); });

        var m = section(root, 'siwt-groups', 'Open postings by occupation group', 'ISCO-08 major groups.');
        bars(m, market.by_major_group.map(function (r) {
            return { label: r.title, value: r.postings };
        }), function (r) { return num(r.value); });

        var t = section(root, 'siwt-occupations', 'Most advertised occupations',
            'With each occupation’s ILO exposure score: 0 means generative AI could do none of its ' +
            'tasks, 1 all of them.');
        var wrap = el('div', 'siwt-table-wrap');
        var table = el('table', 'siwt-table');
        var thead = el('thead');
        var hr = el('tr');
        ['Occupation', 'Open postings', 'AI exposure'].forEach(function (h) { hr.appendChild(el('th', null, h)); });
        thead.appendChild(hr);
        table.appendChild(thead);
        var tbody = el('tbody');
        market.top_occupations.forEach(function (o) {
            var tr = el('tr');
            tr.appendChild(el('td', null, o.title));
            tr.appendChild(el('td', 'siwt-num', num(o.postings)));
            tr.appendChild(el('td', 'siwt-num', o.genai_exposure_2025 == null ? '–' : o.genai_exposure_2025.toFixed(2)));
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        wrap.appendChild(table);
        t.appendChild(wrap);
    }

    function renderAiNow(root, market) {
        var s = section(root, 'siwt-ai-now', 'AI in today’s job ads',
            pct(market.ai.share_mentioning_ai) + ' of open postings mention AI (' +
            num(market.ai.postings_mentioning_ai) + ' of ' + num(market.open_postings) + ').');
        if (market.ai.top_ai_skills.length) {
            bars(s, market.ai.top_ai_skills.map(function (r) { return { label: r.skill, value: r.postings }; }),
                function (r) { return num(r.value); });
        }
    }

    function renderMethods(root, summary) {
        var s = section(root, 'siwt-methods', 'About these figures');
        var dl = el('dl', 'siwt-methods');
        dl.appendChild(el('dt', null, 'Sources'));
        var dd = el('dd');
        var list = el('ul', 'siwt-sources');
        marketSources(summary).forEach(function (src) {
            var info = SOURCE_INFO[src.id] || {};
            var li = el('li');
            var a = el('a', null, src.name);
            a.href = src.url || info.url || '#';
            a.rel = 'noopener';
            li.appendChild(a);
            li.appendChild(document.createTextNode(
                (info.about ? ': ' + info.about : '') + '. ' + num(src.postings) + ' postings collected.'));
            list.appendChild(li);
        });
        dd.appendChild(list);
        dd.appendChild(el('p', 'siwt-note', 'Collected daily since 17 October 2026. Contact details are ' +
            'removed from every posting before it is stored.'));
        dl.appendChild(dd);
        [['Occupations', summary.methods.occupations],
         ['Exposure to AI', summary.methods.exposure], ['Caveats', summary.methods.caveats]].forEach(function (p) {
            dl.appendChild(el('dt', null, p[0]));
            dl.appendChild(el('dd', null, p[1]));
        });
        s.appendChild(dl);
        var link = el('p', 'siwt-note');
        link.appendChild(document.createTextNode('The figures are open data: '));
        var a = el('a', null, 'github.com/balainiceland/iceland-work-trends');
        a.href = 'https://github.com/balainiceland/iceland-work-trends';
        link.appendChild(a);
        link.appendChild(document.createTextNode(' (CC BY 4.0).'));
        s.appendChild(link);
    }

    function init() {
        var root = document.getElementById('siwt-container');
        if (!root) return;
        Promise.all(['summary', 'market_now', 'ai_mentions_by_year'].map(function (f) {
            return fetch(BASE + f + '.json').then(function (r) {
                if (!r.ok) throw new Error(f + ': ' + r.status);
                return r.json();
            });
        })).then(function (d) {
            root.replaceChildren();
            renderHeadline(root, d[0], d[1]);
            renderAiByYear(root, d[2]);
            renderAiNow(root, d[1]);
            renderClassified(root, d[1], d[0]);
            renderMethods(root, d[0]);
        }).catch(function () {
            root.replaceChildren(el('p', 'siwt-error', 'The figures could not be loaded. Please refresh the page.'));
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
