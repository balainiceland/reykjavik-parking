// Iceland Investor Directory Data v1.1.0
// Curated list of Icelandic investors, VCs, and funding sources
// Sources: OpenVC, Tracxn, Shizune, Northstack, Crunchbase

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
        description: "Iceland's largest venture capital firm, investing in ambitious Nordic tech companies with global potential. Four funds; Frumtak IV closed at about $87M in 2024.",
        website: "https://frumtak.is",
        focus: ["sector-agnostic", "tech", "saas", "fintech"],
        stages: ["seed", "series-a", "series-b"],
        ticketSize: "€500K - €5M",
        portfolio: ["Controlant", "Meniga", "Treble", "Sidekick Health", "Lucinity", "50skills", "Optise", "Euler"],
        foundedYear: 2008,
        location: "Reykjavik"
    },
    {
        id: 2,
        name: "Brunnur Ventures",
        type: "vc",
        description: "Early-stage venture capital firm backing exceptional founders building transformative companies. Brunnur III launched in 2026 at USD 56M (ISK 7.2B), backed by Icelandic pension funds.",
        website: "https://www.brunnurventures.com",
        focus: ["tech", "saas", "fintech", "healthtech"],
        stages: ["pre-seed", "seed", "series-a"],
        ticketSize: "€200K - €2M",
        portfolio: ["Avo", "Oculis", "Axelyf", "Laki Power", "Taktikal", "Nanitor", "Trip to Japan", "Smitten"],
        foundedYear: 2014,
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
        portfolio: ["Lucinity", "Treble", "Authenteq", "Jónsbók", "SnerpaPower"],
        foundedYear: 2017,
        location: "Reykjavik"
    },
    {
        id: 4,
        name: "ReykVC (formerly Eyrir Ventures)",
        type: "vc",
        description: "Icelandic venture capital firm, formerly Eyrir Ventures, investing in technology and innovation-driven companies. Runs the fund REY III – Vöxtur.",
        website: "https://reykvc.is",
        focus: ["tech", "sector-agnostic"],
        stages: ["seed", "series-a", "series-b", "growth"],
        ticketSize: "€1M - €10M",
        portfolio: ["DTE", "Hedera Dx", "Laki Power", "Varist", "Atmonia", "Florealis", "AwareGo"],
        foundedYear: null,
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
        website: "https://bluenova.vc",
        focus: ["maritime", "cleantech", "food"],
        stages: ["pre-seed", "seed"],
        ticketSize: "€50K - €500K",
        portfolio: [],
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
    {
        id: 9,
        name: "Iceland Venture Studio",
        type: "vc",
        description: "Venture studio and early-stage VC building and funding startups from idea to scale. Combines hands-on company building with seed investment, through IVS Fund I and Founders Ventures (Fund II).",
        website: "https://icelandventurestudio.com",
        focus: ["tech", "saas"],
        stages: ["pre-seed", "seed"],
        ticketSize: "€50K - €200K",
        portfolio: ["Bara Tala", "LearnCove", "Spesia", "Indo", "Humble", "Marea", "Sundra", "Aldin Biodome"],
        foundedYear: 2020,
        location: "Reykjavik"
    },

    // === GOVERNMENT FUNDS ===
    {
        id: 10,
        name: "Nýsköpunarsjóðurinn Kría",
        type: "government",
        description: "Iceland's state innovation fund, formed on 1 January 2025 by merging NSA Ventures (Nýsköpunarsjóður atvinnulífsins) and Kría. Invests in early-stage startups through its Frumsjóður seed programme and Heilsu-Kría (health tech), and as a limited partner in Icelandic venture funds.",
        website: "https://www.nyskopun.is",
        focus: ["sector-agnostic", "tech"],
        stages: ["pre-seed", "seed", "series-a"],
        ticketSize: null,
        portfolio: ["CCP Games", "Controlant", "Meniga", "Össur"],
        foundedYear: 1998,
        location: "Reykjavik"
    },
    {
        id: 11,
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
        id: 13,
        name: "Fruman Biotech Centre",
        type: "accelerator",
        description: "Biotech lab and incubator (Fruman Líftæknisetur). Its Fruman Fræ programme gives early biotech teams lab space and support in exchange for equity.",
        website: "https://www.fruman.is",
        focus: ["healthtech"],
        stages: ["pre-seed", "seed"],
        ticketSize: null,
        portfolio: [],
        foundedYear: 2023,
        location: "Reykjavik"
    },

    // === ACCELERATORS ===
    {
        id: 16,
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
        name: "Íslandsbanki Entrepreneurship Fund",
        type: "corporate",
        description: "Íslandsbanki's entrepreneurship fund (Frumkvöðlasjóður Íslandsbanka), which gives grants, not equity, to innovative projects and startups.",
        website: "https://www.islandsbanki.is/en/product/about/our-entrepreneurship-fund",
        focus: ["sector-agnostic"],
        stages: ["pre-seed"],
        ticketSize: null,
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
    },
    {
        id: 27,
        name: "Foobar",
        type: "family-office",
        description: "Long-term investment company of Unity co-founder David Helgason, focused on decarbonisation and sustainability startups.",
        website: null,
        focus: ["cleantech"],
        stages: ["seed", "series-a"],
        ticketSize: "€100K - €1M",
        portfolio: [],
        foundedYear: 2015,
        location: "Reykjavik"
    },

    // === ADDITIONAL VCs ===
    {
        id: 28,
        name: "Investa",
        type: "vc",
        description: "Early-stage investor in innovative Icelandic startups with international appeal. Hands-on approach with select portfolio companies.",
        website: "https://www.investa.is",
        focus: ["tech", "saas"],
        stages: ["seed"],
        ticketSize: "€100K - €500K",
        portfolio: ["Meniga", "Avo", "GRID", "Travelade", "Aldin Dynamics"],
        foundedYear: 2011,
        location: "Reykjavik"
    },
    {
        id: 29,
        name: "Transition Ventures",
        type: "vc",
        description: "Climate-focused early-stage VC founded by Unity co-founder David Helgason. Invests in deep-tech climate solutions globally.",
        website: "https://www.transition.vc",
        focus: ["cleantech"],
        stages: ["seed", "series-a"],
        ticketSize: "€500K - €3M",
        portfolio: ["FabricNano"],
        foundedYear: 2021,
        location: "Reykjavik"
    },
    {
        id: 30,
        name: "Iðunn (Kvika)",
        type: "vc",
        description: "Life sciences and health tech venture fund managed by Kvika Asset Management. €50M+ under management focused on transformational growth.",
        website: null,
        focus: ["healthtech"],
        stages: ["seed", "series-a"],
        ticketSize: "€500K - €5M",
        portfolio: ["Kara Connect", "PLAIO", "Coripharma", "EpiEndo"],
        foundedYear: 2021,
        location: "Reykjavik"
    },
    {
        id: 31,
        name: "Novator Partners",
        type: "vc",
        description: "Private equity investment firm owned by Björgólfur Thor Björgólfsson. Focuses on telecoms, pharma, gaming, fintech in emerging markets.",
        website: "https://www.novator.com",
        focus: ["tech", "fintech"],
        stages: ["series-a", "series-b", "growth"],
        ticketSize: "€10M - €100M+",
        portfolio: ["Play", "Actavis", "WoW Games"],
        foundedYear: 2003,
        location: "London"
    },

    // === ADDITIONAL ANGELS ===
    {
        id: 32,
        name: "Kjartan Olafsson",
        type: "angel",
        description: "Entrepreneur, founder of Basno and Volta Labs. Named Best Business Angel 2016 Iceland. Harvard MBA, former Bertelsmann executive.",
        website: "https://volta.is",
        focus: ["tech", "saas"],
        stages: ["pre-seed", "seed"],
        ticketSize: "€25K - €100K",
        portfolio: ["Laxey", "Blendin", "Watchbox"],
        foundedYear: 2010,
        location: "Reykjavik"
    },
    {
        id: 33,
        name: "Reynir Harðarson",
        type: "angel",
        description: "Co-founder and first CEO of CCP Games. General Partner at Brunnur Ventures, Chairman of Solid Clouds. Active in gaming and deep-tech.",
        website: null,
        focus: ["gaming", "tech"],
        stages: ["seed", "series-a"],
        ticketSize: "€50K - €200K",
        portfolio: ["CCP Games", "Solid Clouds"],
        foundedYear: 2000,
        location: "Reykjavik"
    },
    {
        id: 34,
        name: "David Helgason",
        type: "angel",
        description: "Co-founder of Unity Technologies. Now focused on climate investing through Foobar family office and Transition Ventures.",
        website: null,
        focus: ["cleantech", "tech"],
        stages: ["seed", "series-a"],
        ticketSize: "€100K - €500K",
        portfolio: ["Unity"],
        foundedYear: 2014,
        location: "Reykjavik"
    },

    // === ANGEL NETWORKS ===
    {
        id: 35,
        name: "IceBAN",
        type: "angel",
        description: "Iceland Business Angel Network. Founded May 2024 to professionalize and unite Iceland's angel investors. Supported by EBAN.",
        website: null,
        focus: ["sector-agnostic"],
        stages: ["pre-seed", "seed"],
        ticketSize: "€25K - €250K",
        portfolio: [],
        foundedYear: 2024,
        location: "Reykjavik"
    },
    {
        id: 36,
        name: "FnFI ehf.",
        type: "family-office",
        description: "Investment company owned by Guðmundur Fertram Sigurjónsson, founder and CEO of Kerecis, and Fanney Kr. Hermannsdóttir, Managing Director.",
        website: null,
        focus: ["healthtech", "sector-agnostic"],
        stages: ["seed", "series-a", "series-b"],
        ticketSize: "€100K - €2M",
        portfolio: ["Kerecis"],
        foundedYear: 2015,
        location: "Reykjavik"
    },
    {
        id: 37,
        name: "Nordic Ignite",
        type: "angel",
        description: "Angel investment firm bridging the early-stage funding gap in the Nordics & Baltics. Provides capital, knowledge, and network to founders at the earliest stages. Vertical agnostic but prefers sectors where Nordics have competitive advantage. Strong focus on sustainability and UN SDGs.",
        website: "https://www.nordicignite.com",
        focus: ["sector-agnostic", "cleantech"],
        stages: ["pre-seed", "seed"],
        ticketSize: "€25K - €200K",
        portfolio: ["Vilje Bionics"],
        foundedYear: 2020,
        location: "Kópavogur"
    },
    {
        id: 38,
        name: "Arctell",
        type: "family-office",
        description: "High North innovation and investment platform founded in 2026 by Kerecis founder Fertram Sigurjónsson, closely affiliated with his family investment office. It originates, co-builds and invests in companies built on science, local expertise and High North resources.",
        website: "https://arctell.com",
        focus: ["sector-agnostic", "healthtech", "maritime", "cleantech"],
        stages: ["pre-seed", "seed"],
        ticketSize: null,
        portfolio: [],
        foundedYear: 2026,
        location: "Ísafjörður and Reykjavík"
    },
    {
        id: 39,
        name: "EIC Fund",
        type: "government",
        description: "The European Innovation Council's equity fund, run by the European Commission, which invests in deep-tech startups across Europe alongside EIC Accelerator grants.",
        website: "https://eic.ec.europa.eu",
        focus: ["tech", "healthtech", "cleantech"],
        stages: ["seed", "series-a", "series-b"],
        ticketSize: null,
        portfolio: ["Arctic Therapeutics", "Treble"],
        foundedYear: 2020,
        location: "Luxembourg"
    },
    {
        id: 40,
        name: "Omega",
        type: "family-office",
        description: "Privately held Icelandic investment firm, based in Gróska, Reykjavík, investing in Icelandic startups in life sciences, fintech and technology.",
        website: "https://omega.vc",
        focus: ["healthtech", "fintech", "tech"],
        stages: ["seed", "series-a"],
        ticketSize: null,
        portfolio: ["Axelyf"],
        foundedYear: 2012,
        location: "Reykjavík"
    },
    {
        id: 41,
        name: "MGMT Ventures",
        type: "vc",
        description: "Reykjavík operator-investors (MGMT Capital Partners) who invest their own money in early-stage technology companies.",
        website: "https://www.mgmt.is",
        focus: ["tech", "saas", "gaming", "cleantech"],
        stages: ["pre-seed", "seed"],
        ticketSize: null,
        portfolio: [],
        foundedYear: 2019,
        location: "Reykjavík"
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
