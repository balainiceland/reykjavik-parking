// Iceland Investor Directory Data v1.0.0
// Curated list of Icelandic investors, VCs, and funding sources

var INVESTOR_TYPES = [
    { id: 'all', name: 'All Types' },
    { id: 'vc', name: 'Venture Capital' },
    { id: 'angel', name: 'Angel Investor' },
    { id: 'government', name: 'Government Fund' },
    { id: 'accelerator', name: 'Accelerator' },
    { id: 'corporate', name: 'Corporate Investor' },
    { id: 'family-office', name: 'Family Office' }
];

var INVESTMENT_STAGES = [
    { id: 'all', name: 'All Stages' },
    { id: 'pre-seed', name: 'Pre-Seed' },
    { id: 'seed', name: 'Seed' },
    { id: 'series-a', name: 'Series A' },
    { id: 'series-b', name: 'Series B+' },
    { id: 'growth', name: 'Growth' }
];

var SECTOR_FOCUS = [
    { id: 'all', name: 'All Sectors' },
    { id: 'sector-agnostic', name: 'Sector Agnostic' },
    { id: 'tech', name: 'Technology' },
    { id: 'fintech', name: 'Fintech' },
    { id: 'healthtech', name: 'Healthtech / Biotech' },
    { id: 'cleantech', name: 'Cleantech / Energy' },
    { id: 'travel', name: 'Travel / Tourism' },
    { id: 'gaming', name: 'Gaming' },
    { id: 'maritime', name: 'Maritime / Blue Economy' },
    { id: 'food', name: 'Food / AgTech' },
    { id: 'saas', name: 'SaaS / Software' }
];

var icelandInvestors = [
    // === VENTURE CAPITAL ===
    {
        id: 1,
        name: "Frumtak Ventures",
        type: "vc",
        description: "Iceland's largest venture capital firm, investing in ambitious Nordic tech companies with global potential. Four funds totaling over €150M under management.",
        website: "https://www.frumtak.is",
        focus: ["sector-agnostic", "tech", "saas", "fintech"],
        stages: ["seed", "series-a", "series-b"],
        ticketSize: "€500K - €5M",
        portfolio: ["Controlant", "Meniga", "Treble", "Sidekick Health", "Lucinity"],
        foundedYear: 2008,
        location: "Reykjavik"
    },
    {
        id: 2,
        name: "Brunnur Ventures",
        type: "vc",
        description: "Early-stage venture capital firm backing exceptional founders building transformative companies. Focus on Nordic startups with global ambitions.",
        website: "https://www.brunnur.is",
        focus: ["tech", "saas", "fintech", "healthtech"],
        stages: ["pre-seed", "seed", "series-a"],
        ticketSize: "€200K - €2M",
        portfolio: ["Lucinity", "PaxFlow", "Alda", "Tempo"],
        foundedYear: 2015,
        location: "Reykjavik"
    },
    {
        id: 3,
        name: "Crowberry Capital",
        type: "vc",
        description: "Nordic seed-stage venture fund investing in B2B software, fintech, and deep tech companies across the Nordics.",
        website: "https://www.crowberrycapital.com",
        focus: ["saas", "fintech", "tech"],
        stages: ["seed", "series-a"],
        ticketSize: "€300K - €2M",
        portfolio: ["Lucinity", "Treble", "Authenteq"],
        foundedYear: 2017,
        location: "Reykjavik"
    },
    {
        id: 4,
        name: "Eyrir Ventures",
        type: "vc",
        description: "Icelandic investment firm with focus on technology and innovation-driven companies across various sectors.",
        website: "https://www.eyrir.is",
        focus: ["tech", "sector-agnostic"],
        stages: ["seed", "series-a", "series-b", "growth"],
        ticketSize: "€1M - €10M",
        portfolio: ["Kerecis", "Marel"],
        foundedYear: 2005,
        location: "Reykjavik"
    },
    {
        id: 5,
        name: "Thule Investments",
        type: "vc",
        description: "Venture capital firm focused on early and growth-stage technology investments in Iceland and the Nordics.",
        website: "https://www.thuleinvestments.com",
        focus: ["tech", "saas"],
        stages: ["seed", "series-a", "series-b"],
        ticketSize: "€500K - €5M",
        portfolio: ["CCP Games", "Solid Clouds"],
        foundedYear: 2010,
        location: "Reykjavik"
    },
    {
        id: 6,
        name: "Nova Ventures",
        type: "vc",
        description: "Corporate venture arm of Nova, Iceland's leading telecom company, investing in innovative tech startups.",
        website: "https://www.nova.is",
        focus: ["tech", "saas"],
        stages: ["seed", "series-a"],
        ticketSize: "€100K - €1M",
        portfolio: [],
        foundedYear: 2018,
        location: "Reykjavik"
    },
    {
        id: 7,
        name: "Blue Nova Ventures",
        type: "vc",
        description: "Blue economy venture fund launched by Iceland Ocean Cluster, investing in sustainable ocean and marine technology startups.",
        website: "https://www.sjavarklasinn.is",
        focus: ["maritime", "cleantech", "food"],
        stages: ["pre-seed", "seed"],
        ticketSize: "€50K - €500K",
        portfolio: ["Marea", "Hefring Marine"],
        foundedYear: 2023,
        location: "Reykjavik"
    },
    {
        id: 8,
        name: "Silfurberg",
        type: "vc",
        description: "International venture capital firm specializing in early-stage healthcare, biotech, and life science companies.",
        website: "https://www.silfurberg.is",
        focus: ["healthtech"],
        stages: ["seed", "series-a"],
        ticketSize: "€200K - €2M",
        portfolio: ["Kerecis", "Alvotech"],
        foundedYear: 2002,
        location: "Reykjavik"
    },

    // === GOVERNMENT FUNDS ===
    {
        id: 9,
        name: "NSA Ventures",
        type: "government",
        description: "New Business Venture Fund (Nýsköpunarsjóður atvinnulífsins) - Iceland's state-owned venture capital fund supporting innovative Icelandic companies.",
        website: "https://www.nsa.is",
        focus: ["sector-agnostic", "tech"],
        stages: ["seed", "series-a", "series-b"],
        ticketSize: "€100K - €3M",
        portfolio: ["CCP Games", "Controlant", "Meniga", "Össur"],
        foundedYear: 1998,
        location: "Reykjavik"
    },
    {
        id: 10,
        name: "Technology Development Fund",
        type: "government",
        description: "Rannís Technology Development Fund provides grants and funding for R&D projects and technology development in Iceland.",
        website: "https://www.rannis.is",
        focus: ["tech", "sector-agnostic"],
        stages: ["pre-seed", "seed"],
        ticketSize: "€50K - €500K (grants)",
        portfolio: [],
        foundedYear: 2003,
        location: "Reykjavik"
    },
    {
        id: 11,
        name: "Kría Seed Fund",
        type: "government",
        description: "Early-stage fund supporting innovative startups in Iceland, often co-investing with private investors.",
        website: "https://www.kria.is",
        focus: ["sector-agnostic"],
        stages: ["pre-seed", "seed"],
        ticketSize: "€25K - €200K",
        portfolio: [],
        foundedYear: 2020,
        location: "Reykjavik"
    },
    {
        id: 12,
        name: "Fruman Biotechnology Fund",
        type: "government",
        description: "Investment fund focused on biotechnology companies and projects, supporting Iceland's growing biotech sector.",
        website: "https://www.fruman.is",
        focus: ["healthtech"],
        stages: ["seed", "series-a"],
        ticketSize: "€100K - €1M",
        portfolio: [],
        foundedYear: 2023,
        location: "Reykjavik"
    },

    // === ACCELERATORS ===
    {
        id: 13,
        name: "Startup Reykjavik",
        type: "accelerator",
        description: "Iceland's premier seed-stage accelerator, 10-week summer program providing funding, mentorship, and investor access. Owned by Arion Bank.",
        website: "https://www.startupreykjavik.is",
        focus: ["sector-agnostic"],
        stages: ["pre-seed"],
        ticketSize: "€22K for 6%",
        portfolio: ["Activity Stream", "DataMarket"],
        foundedYear: 2012,
        location: "Reykjavik"
    },
    {
        id: 14,
        name: "Startup Energy Reykjavik",
        type: "accelerator",
        description: "Energy-focused accelerator program backed by Landsvirkjun, supporting startups in energy, cleantech, and sustainability.",
        website: "https://www.startupenergyreykjavik.com",
        focus: ["cleantech"],
        stages: ["pre-seed", "seed"],
        ticketSize: "€40K",
        portfolio: ["GEG", "IceWind"],
        foundedYear: 2014,
        location: "Reykjavik"
    },
    {
        id: 15,
        name: "KLAK - Icelandic Startups",
        type: "accelerator",
        description: "Non-profit organization running multiple accelerator programs including Startup Supernova, Gulleggið, and Startup Tourism.",
        website: "https://www.klak.is",
        focus: ["sector-agnostic"],
        stages: ["pre-seed"],
        ticketSize: "Equity-free programs",
        portfolio: ["Controlant", "Plaio", "Sundra"],
        foundedYear: 2007,
        location: "Reykjavik"
    },
    {
        id: 16,
        name: "Iceland Venture Studio",
        type: "accelerator",
        description: "Venture studio and early-stage investor building and funding startups from idea to scale.",
        website: "https://www.icelandventurestudio.com",
        focus: ["tech", "saas"],
        stages: ["pre-seed", "seed"],
        ticketSize: "€50K - €200K",
        portfolio: ["Bara Tala", "LearnCove", "Spesia"],
        foundedYear: 2020,
        location: "Reykjavik"
    },

    // === CORPORATE INVESTORS ===
    {
        id: 17,
        name: "Arion Bank",
        type: "corporate",
        description: "One of Iceland's largest banks with active startup investment through Startup Reykjavik accelerator and direct investments.",
        website: "https://www.arionbanki.is",
        focus: ["fintech", "tech"],
        stages: ["pre-seed", "seed", "series-a"],
        ticketSize: "€22K - €1M",
        portfolio: [],
        foundedYear: 2008,
        location: "Reykjavik"
    },
    {
        id: 18,
        name: "Íslandsbanki Startup Fund",
        type: "corporate",
        description: "Iceland's oldest bank's venture arm, supporting innovative Icelandic startups and the entrepreneurial ecosystem.",
        website: "https://www.islandsbanki.is",
        focus: ["sector-agnostic"],
        stages: ["seed", "series-a"],
        ticketSize: "€100K - €500K",
        portfolio: [],
        foundedYear: 2018,
        location: "Reykjavik"
    },
    {
        id: 19,
        name: "Landsvirkjun",
        type: "corporate",
        description: "Iceland's National Power Company investing in energy innovation and cleantech through Startup Energy Reykjavik and direct investments.",
        website: "https://www.landsvirkjun.com",
        focus: ["cleantech"],
        stages: ["seed", "series-a"],
        ticketSize: "€100K - €2M",
        portfolio: ["GeoSilica", "Carbon Recycling International"],
        foundedYear: 1965,
        location: "Reykjavik"
    },

    // === ANGEL INVESTORS & NETWORKS ===
    {
        id: 20,
        name: "Icelandic Angel Network",
        type: "angel",
        description: "Network of experienced Icelandic angel investors pooling resources to invest in early-stage startups.",
        website: null,
        focus: ["sector-agnostic"],
        stages: ["pre-seed", "seed"],
        ticketSize: "€25K - €250K",
        portfolio: [],
        foundedYear: 2015,
        location: "Reykjavik"
    },
    {
        id: 21,
        name: "Bala Kamallakharan",
        type: "angel",
        description: "Founder of Startup Iceland, angel investor, and ecosystem builder supporting early-stage Icelandic startups.",
        website: "https://www.startupiceland.com",
        focus: ["sector-agnostic", "tech"],
        stages: ["pre-seed", "seed"],
        ticketSize: "€10K - €50K",
        portfolio: [],
        foundedYear: 2012,
        location: "Reykjavik"
    },
    {
        id: 22,
        name: "Haukur Skúlason",
        type: "angel",
        description: "Serial entrepreneur and angel investor, co-founder of DataMarket (acquired by Qlik). Active investor in Icelandic startups.",
        website: null,
        focus: ["tech", "saas"],
        stages: ["pre-seed", "seed"],
        ticketSize: "€25K - €100K",
        portfolio: ["DataMarket", "Various"],
        foundedYear: 2010,
        location: "Reykjavik"
    },
    {
        id: 23,
        name: "Kristján Freyr Kristjánsson",
        type: "angel",
        description: "Entrepreneur and investor, co-founder of Controlant. Angel investor in Icelandic tech startups.",
        website: null,
        focus: ["tech", "saas"],
        stages: ["seed"],
        ticketSize: "€25K - €100K",
        portfolio: ["Controlant"],
        foundedYear: 2015,
        location: "Reykjavik"
    },
    {
        id: 24,
        name: "Hilmar Veigar Pétursson",
        type: "angel",
        description: "CEO of CCP Games, angel investor supporting gaming and tech startups in Iceland.",
        website: null,
        focus: ["gaming", "tech"],
        stages: ["seed", "series-a"],
        ticketSize: "€50K - €200K",
        portfolio: [],
        foundedYear: 2010,
        location: "Reykjavik"
    },

    // === FAMILY OFFICES ===
    {
        id: 25,
        name: "Stoðir",
        type: "family-office",
        description: "Icelandic investment company and family office with investments across technology, real estate, and financial services.",
        website: "https://www.stodir.is",
        focus: ["sector-agnostic"],
        stages: ["series-a", "series-b", "growth"],
        ticketSize: "€1M - €10M",
        portfolio: [],
        foundedYear: 2005,
        location: "Reykjavik"
    },
    {
        id: 26,
        name: "Kaldbakur",
        type: "family-office",
        description: "Private investment firm focusing on growth-stage companies with strong fundamentals and international potential.",
        website: null,
        focus: ["sector-agnostic"],
        stages: ["series-a", "series-b"],
        ticketSize: "€500K - €5M",
        portfolio: [],
        foundedYear: 2000,
        location: "Reykjavik"
    }
];

// Helper functions
function getInvestorStats() {
    var total = icelandInvestors.length;
    var vc = icelandInvestors.filter(function(i) { return i.type === 'vc'; }).length;
    var angel = icelandInvestors.filter(function(i) { return i.type === 'angel'; }).length;
    var government = icelandInvestors.filter(function(i) { return i.type === 'government'; }).length;
    var accelerator = icelandInvestors.filter(function(i) { return i.type === 'accelerator'; }).length;
    return { total: total, vc: vc, angel: angel, government: government, accelerator: accelerator };
}

function getTypeName(typeId) {
    var type = INVESTOR_TYPES.find(function(t) { return t.id === typeId; });
    return type ? type.name : typeId;
}

function getStageName(stageId) {
    var stage = INVESTMENT_STAGES.find(function(s) { return s.id === stageId; });
    return stage ? stage.name : stageId;
}
