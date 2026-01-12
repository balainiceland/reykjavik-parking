// Iceland Startup Directory Data v1.5.0
// Curated list of Icelandic startups and tech companies
// Includes: Iceland Venture Studio, Founders Ventures, Frumtak Ventures portfolios
// Accelerators: Klak Startup Supernova, Startup Reykjavik, Startup Energy Reykjavik
// Sectors: Biotech, Travel Tech, Marine/Blue Economy, Climate Tech/Sustainability

var STARTUP_SECTORS = [
    { id: 'all', name: 'All Sectors' },
    { id: 'gaming', name: 'Gaming' },
    { id: 'fintech', name: 'Fintech' },
    { id: 'healthtech', name: 'Healthtech / Biotech' },
    { id: 'travel', name: 'Travel / Tourism' },
    { id: 'saas', name: 'SaaS / Software' },
    { id: 'cleantech', name: 'Cleantech / Energy' },
    { id: 'food', name: 'Food / Consumer' },
    { id: 'media', name: 'Media / Entertainment' },
    { id: 'maritime', name: 'Maritime / Blue Economy' },
    { id: 'retail', name: 'Retail / Commerce' },
    { id: 'security', name: 'Security / Identity' },
    { id: 'data', name: 'Data / Analytics' },
    { id: 'edtech', name: 'EdTech / Education' },
    { id: 'other', name: 'Other' }
];

var STARTUP_STATUSES = [
    { id: 'all', name: 'All' },
    { id: 'active', name: 'Active' },
    { id: 'acquired', name: 'Acquired' },
    { id: 'exited', name: 'Exited' }
];

var icelandStartups = [
    // === GAMING ===
    {
        id: 1,
        name: "CCP Games",
        description: "Video game developer best known for EVE Online, the groundbreaking space MMO",
        website: "https://www.ccpgames.com",
        sector: "gaming",
        status: "active",
        acquiredBy: null,
        foundedYear: 1997
    },
    {
        id: 2,
        name: "QuizUp",
        description: "Social trivia game that became the fastest-growing mobile game in history",
        website: "https://www.quizup.com",
        sector: "gaming",
        status: "exited",
        acquiredBy: null,
        foundedYear: 2012
    },
    {
        id: 3,
        name: "Solid Clouds",
        description: "Game development studio creating immersive gaming experiences",
        website: "https://www.solidclouds.com",
        sector: "gaming",
        status: "active",
        acquiredBy: null,
        foundedYear: 2013
    },
    {
        id: 4,
        name: "Directive Games",
        description: "Game studio focused on competitive multiplayer and AR games",
        website: "https://www.directivegames.com",
        sector: "gaming",
        status: "active",
        acquiredBy: null,
        foundedYear: 2014
    },
    {
        id: 5,
        name: "Radiant Games",
        description: "Independent game development studio",
        website: null,
        sector: "gaming",
        status: "active",
        acquiredBy: null,
        foundedYear: 2015
    },

    // === FINTECH ===
    {
        id: 6,
        name: "Meniga",
        description: "White-label digital banking and personal finance management platform",
        website: "https://www.meniga.com",
        sector: "fintech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2009
    },
    {
        id: 7,
        name: "Lucinity",
        description: "AI-powered anti-money laundering (AML) compliance software",
        website: "https://www.lucinity.com",
        sector: "fintech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2018
    },
    {
        id: 8,
        name: "Kvika",
        description: "Financial services and investment banking",
        website: "https://www.kvika.is",
        sector: "fintech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2014
    },
    {
        id: 9,
        name: "Indó",
        description: "Digital payment solutions and fintech services",
        website: "https://www.indo.is",
        sector: "fintech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2016
    },

    // === HEALTHTECH / BIOTECH ===
    {
        id: 10,
        name: "Kerecis",
        description: "Medical devices using fish skin for wound healing and tissue regeneration",
        website: "https://www.kerecis.com",
        sector: "healthtech",
        status: "acquired",
        acquiredBy: "Coloplast",
        foundedYear: 2009
    },
    {
        id: 11,
        name: "Orf Genetics",
        description: "Biotechnology company producing growth factors in barley for skincare",
        website: "https://www.orfgenetics.com",
        sector: "healthtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2001
    },
    {
        id: 12,
        name: "deCODE Genetics",
        description: "Biopharmaceutical company specializing in genetic research and drug development",
        website: "https://www.decode.com",
        sector: "healthtech",
        status: "acquired",
        acquiredBy: "Amgen",
        foundedYear: 1996
    },
    {
        id: 13,
        name: "Algalif",
        description: "Produces high-value natural astaxanthin from microalgae",
        website: "https://www.algalif.com",
        sector: "healthtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2012
    },
    {
        id: 14,
        name: "Retina Risk",
        description: "AI-powered diabetic retinopathy screening and risk assessment",
        website: "https://www.retinarisk.com",
        sector: "healthtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2013
    },
    {
        id: 15,
        name: "NextCODE Health",
        description: "Genomics platform for population-scale sequencing analysis",
        website: null,
        sector: "healthtech",
        status: "acquired",
        acquiredBy: "WuXi NextCODE",
        foundedYear: 2013
    },

    // === TRAVEL / TOURISM ===
    {
        id: 16,
        name: "Dohop",
        description: "Flight search and virtual interlining platform connecting airlines",
        website: "https://www.dohop.com",
        sector: "travel",
        status: "active",
        acquiredBy: null,
        foundedYear: 2004
    },
    {
        id: 17,
        name: "TripCreator",
        description: "Travel planning and itinerary management platform",
        website: "https://www.tripcreator.com",
        sector: "travel",
        status: "active",
        acquiredBy: null,
        foundedYear: 2013
    },
    {
        id: 18,
        name: "Kaptio",
        description: "Travel management software for tour operators",
        website: "https://www.kaptio.com",
        sector: "travel",
        status: "acquired",
        acquiredBy: "VEX Private Equity Fund",
        foundedYear: 2013
    },
    {
        id: 19,
        name: "TravelShift",
        description: "Online travel marketplace technology",
        website: "https://www.travelshift.com",
        sector: "travel",
        status: "active",
        acquiredBy: null,
        foundedYear: 2012
    },
    {
        id: 20,
        name: "Guide to Iceland",
        description: "Iceland's largest travel marketplace and booking platform",
        website: "https://www.guidetoiceland.is",
        sector: "travel",
        status: "active",
        acquiredBy: null,
        foundedYear: 2012
    },
    {
        id: 21,
        name: "Calidris",
        description: "Airline revenue management and passenger services technology",
        website: null,
        sector: "travel",
        status: "acquired",
        acquiredBy: "Sabre (NASDAQ:SABR)",
        foundedYear: 2004
    },
    {
        id: 22,
        name: "Oz",
        description: "Travel technology and booking platform",
        website: null,
        sector: "travel",
        status: "active",
        acquiredBy: null,
        foundedYear: 2014
    },

    // === SAAS / SOFTWARE ===
    {
        id: 23,
        name: "CLARA",
        description: "Enterprise search and knowledge management platform",
        website: null,
        sector: "saas",
        status: "acquired",
        acquiredBy: "Jive Software (NASDAQ:JIVE)",
        foundedYear: 2007
    },
    {
        id: 24,
        name: "DataMarket",
        description: "Data marketplace and analytics platform",
        website: null,
        sector: "data",
        status: "acquired",
        acquiredBy: "Qlik",
        foundedYear: 2008
    },
    {
        id: 25,
        name: "Modio",
        description: "3D design tool for creating printable models",
        website: null,
        sector: "saas",
        status: "acquired",
        acquiredBy: "Autodesk",
        foundedYear: 2013
    },
    {
        id: 26,
        name: "Tempo Software",
        description: "Time tracking and resource planning for Jira and Atlassian",
        website: "https://www.tempo.io",
        sector: "saas",
        status: "active",
        acquiredBy: null,
        foundedYear: 2009
    },
    {
        id: 27,
        name: "CrankWheel",
        description: "Instant screen sharing for sales and support teams",
        website: "https://www.crankwheel.com",
        sector: "saas",
        status: "active",
        acquiredBy: null,
        foundedYear: 2015
    },
    {
        id: 28,
        name: "Sling",
        description: "Employee scheduling and workforce management platform",
        website: "https://www.getsling.com",
        sector: "saas",
        status: "acquired",
        acquiredBy: "Toast",
        foundedYear: 2015
    },
    {
        id: 29,
        name: "Activity Stream",
        description: "Enterprise collaboration and activity management platform",
        website: "https://www.activitystream.com",
        sector: "saas",
        status: "active",
        acquiredBy: null,
        foundedYear: 2012
    },
    {
        id: 30,
        name: "Controlant",
        description: "Cold chain visibility and monitoring for pharma and food supply chains",
        website: "https://www.controlant.com",
        sector: "saas",
        status: "active",
        acquiredBy: null,
        foundedYear: 2007
    },
    {
        id: 31,
        name: "Vivaldi",
        description: "Web browser built for power users with extensive customization",
        website: "https://www.vivaldi.com",
        sector: "saas",
        status: "active",
        acquiredBy: null,
        foundedYear: 2013
    },
    {
        id: 32,
        name: "LS Retail",
        description: "Retail and hospitality management software on Microsoft Dynamics",
        website: "https://www.lsretail.com",
        sector: "retail",
        status: "acquired",
        acquiredBy: "Aptos",
        foundedYear: 1990
    },

    // === CLEANTECH / ENERGY ===
    {
        id: 33,
        name: "Verne Global",
        description: "Data center services powered by 100% renewable energy",
        website: "https://www.verneglobal.com",
        sector: "cleantech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2007
    },
    {
        id: 34,
        name: "GreenQloud",
        description: "Green cloud computing powered by renewable energy",
        website: null,
        sector: "cleantech",
        status: "acquired",
        acquiredBy: "NetApp",
        foundedYear: 2010
    },
    {
        id: 35,
        name: "Carbfix",
        description: "Carbon capture and storage technology turning CO2 into stone",
        website: "https://www.carbfix.com",
        sector: "cleantech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2007
    },
    {
        id: 36,
        name: "atNorth",
        description: "Sustainable data center and high-performance computing services",
        website: "https://www.atnorth.com",
        sector: "cleantech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2012
    },

    // === MEDIA / ENTERTAINMENT ===
    {
        id: 37,
        name: "LazyTown",
        description: "Children's entertainment company promoting healthy lifestyles",
        website: null,
        sector: "media",
        status: "acquired",
        acquiredBy: "Turner Broadcasting",
        foundedYear: 1995
    },
    {
        id: 38,
        name: "Solfar",
        description: "Virtual reality experiences and immersive content",
        website: "https://www.solfar.com",
        sector: "media",
        status: "active",
        acquiredBy: null,
        foundedYear: 2014
    },
    {
        id: 39,
        name: "MURE VR",
        description: "Virtual reality content and experiences",
        website: null,
        sector: "media",
        status: "active",
        acquiredBy: null,
        foundedYear: 2016
    },
    {
        id: 40,
        name: "FlowVR",
        description: "Virtual reality content production",
        website: null,
        sector: "media",
        status: "active",
        acquiredBy: null,
        foundedYear: 2016
    },
    {
        id: 41,
        name: "Tagplay",
        description: "Interactive social content platform for events and media",
        website: "https://www.tagplay.co",
        sector: "media",
        status: "active",
        acquiredBy: null,
        foundedYear: 2013
    },
    {
        id: 42,
        name: "Promogogo",
        description: "Music marketing and promotion platform for artists",
        website: "https://www.promogogo.com",
        sector: "media",
        status: "active",
        acquiredBy: null,
        foundedYear: 2012
    },

    // === MARITIME / BLUE ECONOMY ===
    {
        id: 43,
        name: "Marorka",
        description: "Maritime energy management and vessel performance optimization",
        website: "https://www.marorka.com",
        sector: "maritime",
        status: "acquired",
        acquiredBy: "Wartsila",
        foundedYear: 2002
    },
    {
        id: 44,
        name: "Iceland Ocean Cluster",
        description: "Innovation hub for marine and ocean-related industries",
        website: "https://www.sjavarklasinn.is",
        sector: "maritime",
        status: "active",
        acquiredBy: null,
        foundedYear: 2012
    },
    {
        id: 45,
        name: "Anitar",
        description: "Marine research and technology services",
        website: null,
        sector: "maritime",
        status: "active",
        acquiredBy: null,
        foundedYear: 2010
    },

    // === SECURITY / IDENTITY ===
    {
        id: 46,
        name: "Syndis",
        description: "Cybersecurity risk assessment and penetration testing",
        website: "https://www.syndis.is",
        sector: "security",
        status: "active",
        acquiredBy: null,
        foundedYear: 2013
    },
    {
        id: 47,
        name: "Authenteq",
        description: "Digital identity verification and KYC automation",
        website: "https://www.authenteq.com",
        sector: "security",
        status: "acquired",
        acquiredBy: "FNZ Group",
        foundedYear: 2016
    },
    {
        id: 48,
        name: "Videntifier",
        description: "Video fingerprinting and content identification technology",
        website: "https://www.videntifier.com",
        sector: "security",
        status: "active",
        acquiredBy: null,
        foundedYear: 2008
    },

    // === FOOD / CONSUMER ===
    {
        id: 49,
        name: "Crowbar Protein",
        description: "Protein bars and healthy snacks brand (Jungle Bar)",
        website: "https://www.crowbar.is",
        sector: "food",
        status: "active",
        acquiredBy: null,
        foundedYear: 2015
    },
    {
        id: 50,
        name: "Wasabi Iceland",
        description: "Icelandic wasabi cultivation and products",
        website: null,
        sector: "food",
        status: "active",
        acquiredBy: null,
        foundedYear: 2014
    },
    {
        id: 51,
        name: "KeyNatura",
        description: "Natural products and supplements from Icelandic ingredients",
        website: null,
        sector: "food",
        status: "active",
        acquiredBy: null,
        foundedYear: 2012
    },

    // === RETAIL / COMMERCE ===
    {
        id: 52,
        name: "Bungalo",
        description: "Real estate marketplace and property technology",
        website: "https://www.bungalo.is",
        sector: "retail",
        status: "active",
        acquiredBy: null,
        foundedYear: 2015
    },

    // === DATA / ANALYTICS ===
    {
        id: 53,
        name: "Datadrive",
        description: "Data analytics and business intelligence services",
        website: null,
        sector: "data",
        status: "active",
        acquiredBy: null,
        foundedYear: 2014
    },
    {
        id: 54,
        name: "Jivaro",
        description: "Market research and consumer insights platform",
        website: null,
        sector: "data",
        status: "active",
        acquiredBy: null,
        foundedYear: 2013
    },

    // === OTHER ===
    {
        id: 55,
        name: "Betware",
        description: "Gaming and betting technology platform",
        website: null,
        sector: "gaming",
        status: "acquired",
        acquiredBy: "Novomatic",
        foundedYear: 1998
    },
    {
        id: 56,
        name: "KeyWe",
        description: "Smart lock and access control technology",
        website: null,
        sector: "other",
        status: "active",
        acquiredBy: null,
        foundedYear: 2014
    },
    {
        id: 57,
        name: "Teqhire",
        description: "Technical recruitment and hiring platform",
        website: null,
        sector: "other",
        status: "active",
        acquiredBy: null,
        foundedYear: 2015
    },
    {
        id: 58,
        name: "Össur",
        description: "Global leader in prosthetics, orthotics and osteoarthritis solutions",
        website: "https://www.ossur.com",
        sector: "healthtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 1971
    },
    {
        id: 59,
        name: "Marel",
        description: "Advanced food processing equipment and systems",
        website: "https://www.marel.com",
        sector: "food",
        status: "active",
        acquiredBy: null,
        foundedYear: 1983
    },
    {
        id: 60,
        name: "Aha.is",
        description: "Leading e-commerce and delivery platform in Iceland",
        website: "https://www.aha.is",
        sector: "retail",
        status: "active",
        acquiredBy: null,
        foundedYear: 2019
    },
    {
        id: 61,
        name: "Sidekick Health",
        description: "Digital therapeutics platform using gamification for chronic disease management",
        website: "https://www.sidekickhealth.com",
        sector: "healthtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2014
    },
    {
        id: 62,
        name: "Treble Technologies",
        description: "Acoustic simulation software for architects and audio engineers",
        website: "https://www.treble.tech",
        sector: "saas",
        status: "active",
        acquiredBy: null,
        foundedYear: 2018
    },
    {
        id: 63,
        name: "Aldin Dynamics",
        description: "Virtual reality game development studio",
        website: "https://www.aldindynamics.com",
        sector: "gaming",
        status: "active",
        acquiredBy: null,
        foundedYear: 2013
    },

    // === ICELAND VENTURE STUDIO / FOUNDERS VENTURES PORTFOLIO ===
    {
        id: 64,
        name: "Bara Tala",
        description: "AI-powered Icelandic language learning app with speech recognition and personalized lessons",
        website: "https://www.baratala.is",
        sector: "edtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2022
    },
    {
        id: 65,
        name: "LearnCove",
        description: "Training platform for regulated industries, specializing in seafood and food safety compliance",
        website: "https://www.learncove.com",
        sector: "edtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2018
    },
    {
        id: 66,
        name: "Spesia",
        description: "Fintech app enabling easy foreign investments, founded by ex-Meniga CEO Georg Lúðvíksson",
        website: "https://www.spesia.is",
        sector: "fintech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2022
    },
    {
        id: 67,
        name: "Sundra",
        description: "AI-powered captioning, subtitling and translation tool for video content",
        website: "https://www.sundra.io",
        sector: "saas",
        status: "active",
        acquiredBy: null,
        foundedYear: 2021
    },
    {
        id: 68,
        name: "Marea",
        description: "Sustainable packaging made from seaweed - biodegradable alternative to plastic",
        website: "https://www.marea.is",
        sector: "cleantech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2021
    },
    {
        id: 69,
        name: "Flow Meditation",
        description: "VR meditation app featuring immersive Icelandic nature environments",
        website: "https://www.flowvr.io",
        sector: "healthtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2020
    },
    {
        id: 70,
        name: "Smart Data",
        description: "AI and data solutions company founded by Stefan Baxter",
        website: null,
        sector: "data",
        status: "active",
        acquiredBy: null,
        foundedYear: 2019
    },
    {
        id: 71,
        name: "Atlas Primer",
        description: "Audio-first learning platform designed for neurodivergent learners",
        website: "https://www.atlasprimer.com",
        sector: "edtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2022
    },
    {
        id: 72,
        name: "Aldin Biodome",
        description: "Sustainable geodesic biodome infrastructure using Iceland's geothermal resources",
        website: "https://www.aldinbiodome.com",
        sector: "cleantech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2020
    },

    // === FRUMTAK VENTURES PORTFOLIO ===
    {
        id: 73,
        name: "50skills",
        description: "HR platform revolutionizing employee engagement, onboarding, and development",
        website: "https://www.50skills.com",
        sector: "saas",
        status: "active",
        acquiredBy: null,
        foundedYear: 2017
    },
    {
        id: 74,
        name: "Abler",
        description: "Sports club management app for admins, coaches, parents, and players",
        website: "https://www.abler.is",
        sector: "saas",
        status: "active",
        acquiredBy: null,
        foundedYear: 2019
    },
    {
        id: 75,
        name: "Alda",
        description: "Next-generation diversity, equity, and inclusion (DEI) solution",
        website: "https://www.aldahq.com",
        sector: "saas",
        status: "active",
        acquiredBy: null,
        foundedYear: 2020
    },
    {
        id: 76,
        name: "Ankeri",
        description: "Complete fleet overview and management platform",
        website: "https://www.ankeri.is",
        sector: "saas",
        status: "active",
        acquiredBy: null,
        foundedYear: 2018
    },
    {
        id: 77,
        name: "Arctic Trucks",
        description: "Engineering extreme terrain vehicles for exploration and adventure",
        website: "https://www.arctictrucks.com",
        sector: "other",
        status: "active",
        acquiredBy: null,
        foundedYear: 1990
    },
    {
        id: 78,
        name: "AviLabs",
        description: "Leading passenger disruption management solutions for aviation",
        website: "https://www.avilabs.com",
        sector: "travel",
        status: "active",
        acquiredBy: null,
        foundedYear: 2017
    },
    {
        id: 79,
        name: "Data Dwell",
        description: "Smarter sales and marketing software for businesses",
        website: "https://www.datadwell.com",
        sector: "saas",
        status: "active",
        acquiredBy: null,
        foundedYear: 2016
    },
    {
        id: 80,
        name: "Euler",
        description: "AI-powered intelligent monitoring for metal additive manufacturing",
        website: "https://www.euler.ai",
        sector: "data",
        status: "active",
        acquiredBy: null,
        foundedYear: 2019
    },
    {
        id: 81,
        name: "Heima",
        description: "Digital chore chart and routine tracker for family collaboration",
        website: "https://www.heima.app",
        sector: "saas",
        status: "active",
        acquiredBy: null,
        foundedYear: 2021
    },
    {
        id: 82,
        name: "Moombix",
        description: "Platform connecting people with live online music lessons",
        website: "https://www.moombix.com",
        sector: "edtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2020
    },
    {
        id: 83,
        name: "MyDello",
        description: "Automated digital freight forwarding and logistics platform",
        website: "https://www.mydello.com",
        sector: "other",
        status: "active",
        acquiredBy: null,
        foundedYear: 2018
    },
    {
        id: 84,
        name: "Optise",
        description: "AI-powered website insights platform for B2B companies",
        website: "https://www.optise.io",
        sector: "data",
        status: "active",
        acquiredBy: null,
        foundedYear: 2020
    },
    {
        id: 85,
        name: "Plaio",
        description: "The future of digital pharmaceutical planning",
        website: "https://www.plaio.com",
        sector: "healthtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2019
    },
    {
        id: 86,
        name: "Smitten",
        description: "Next-generation dating app blending dating, social, and gaming",
        website: "https://www.smitten.app",
        sector: "media",
        status: "active",
        acquiredBy: null,
        foundedYear: 2021
    },
    {
        id: 87,
        name: "Sweeply",
        description: "Simple housekeeping and task management for hospitality",
        website: "https://www.sweeply.com",
        sector: "saas",
        status: "active",
        acquiredBy: null,
        foundedYear: 2017
    },
    {
        id: 88,
        name: "Tulipop",
        description: "Fun and creative adventure world for kids - entertainment and merchandise",
        website: "https://www.tulipop.com",
        sector: "media",
        status: "active",
        acquiredBy: null,
        foundedYear: 2010
    },
    {
        id: 89,
        name: "AGR Dynamics",
        description: "Inventory management and supply chain optimization software",
        website: null,
        sector: "saas",
        status: "acquired",
        acquiredBy: "VEX Private Equity Fund",
        foundedYear: 2003
    },
    {
        id: 90,
        name: "MainManager",
        description: "Facility management software for property maintenance",
        website: null,
        sector: "saas",
        status: "acquired",
        acquiredBy: "View Software",
        foundedYear: 2006
    },
    {
        id: 91,
        name: "Valka",
        description: "Advanced fish processing technology and automation",
        website: "https://www.valka.is",
        sector: "maritime",
        status: "active",
        acquiredBy: null,
        foundedYear: 2003
    },

    // === BIOTECH ADDITIONS ===
    {
        id: 92,
        name: "Alvotech",
        description: "Development and manufacturing of biosimilar medicines for global markets",
        website: "https://www.alvotech.com",
        sector: "healthtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2013
    },
    {
        id: 93,
        name: "BioEffect",
        description: "Biotech skincare using plant-based EGF (Epidermal Growth Factor) from barley",
        website: "https://www.bioeffect.com",
        sector: "healthtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2010
    },
    {
        id: 94,
        name: "Arctic Therapeutics",
        description: "Drug discovery and development company spun off from Center for Applied Genomics",
        website: "https://www.arctictherapeutics.com",
        sector: "healthtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2015
    },
    {
        id: 95,
        name: "Genis",
        description: "Pioneering development of therapeutic chitin derivatives for medical applications",
        website: "https://www.genis.is",
        sector: "healthtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2006
    },
    {
        id: 96,
        name: "EpiEndo Pharmaceuticals",
        description: "Developing treatments for respiratory diseases and airway conditions",
        website: "https://www.epiendopharma.com",
        sector: "healthtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2015
    },
    {
        id: 97,
        name: "Matís",
        description: "Food and biotech research institute advancing food safety and innovation",
        website: "https://www.matis.is",
        sector: "healthtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2007
    },
    {
        id: 98,
        name: "Vaxa Technologies",
        description: "Sustainable algae cultivation for nutrition and food ingredients",
        website: "https://www.vaxa.life",
        sector: "cleantech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2017
    },
    {
        id: 99,
        name: "Primex",
        description: "Marine biotechnology producing chitin and chitosan products from shellfish",
        website: "https://www.primex.is",
        sector: "healthtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 1999
    },

    // === TRAVEL TECH ADDITIONS ===
    {
        id: 100,
        name: "Bokun",
        description: "Booking solutions and channel management platform for travel suppliers",
        website: "https://www.bokun.io",
        sector: "travel",
        status: "acquired",
        acquiredBy: "TripAdvisor",
        foundedYear: 2012
    },
    {
        id: 101,
        name: "SafeTravel",
        description: "Weather and safety alerts app helping travelers stay safe in Iceland",
        website: "https://www.safetravel.is",
        sector: "travel",
        status: "active",
        acquiredBy: null,
        foundedYear: 2010
    },
    {
        id: 102,
        name: "Live Aurora Network",
        description: "Northern lights prediction app using HD cameras for real-time aurora detection",
        website: "https://www.liveaurora.com",
        sector: "travel",
        status: "active",
        acquiredBy: null,
        foundedYear: 2018
    },
    {
        id: 103,
        name: "PaxFlow",
        description: "Automation platform helping tour companies handle bookings and customer communication",
        website: "https://www.paxflow.io",
        sector: "travel",
        status: "active",
        acquiredBy: null,
        foundedYear: 2020
    },
    {
        id: 104,
        name: "Guyde",
        description: "AI voice-activated navigation app providing personalized guidance for travelers",
        website: "https://www.guyde.app",
        sector: "travel",
        status: "active",
        acquiredBy: null,
        foundedYear: 2019
    },
    {
        id: 105,
        name: "HotSheep",
        description: "Last-minute tour booking platform offering discounts close to departure",
        website: "https://www.hotsheep.is",
        sector: "travel",
        status: "active",
        acquiredBy: null,
        foundedYear: 2018
    },
    {
        id: 106,
        name: "Snotra",
        description: "AI-powered SaaS solution for tourism sustainability and EU compliance",
        website: "https://www.snotra.io",
        sector: "travel",
        status: "active",
        acquiredBy: null,
        foundedYear: 2022
    },

    // === MARINE TECHNOLOGY / BLUE ECONOMY ===
    {
        id: 107,
        name: "Hefring Marine",
        description: "AI-powered vessel navigation and fleet management reducing fuel consumption by up to 20%",
        website: "https://www.hefringmarine.com",
        sector: "maritime",
        status: "active",
        acquiredBy: null,
        foundedYear: 2018
    },
    {
        id: 108,
        name: "Feel Iceland",
        description: "Marine collagen supplements from wild-caught fish skin by-products",
        website: "https://www.feeliceland.com",
        sector: "healthtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2014
    },
    {
        id: 109,
        name: "Codlagen",
        description: "Premium marine collagen products sourced from Icelandic cod",
        website: "https://www.codlagen.com",
        sector: "healthtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2018
    },
    {
        id: 110,
        name: "Oceans of Data",
        description: "Data analytics platform providing actionable insights for the seafood industry",
        website: "https://www.oceansofdata.co",
        sector: "data",
        status: "active",
        acquiredBy: null,
        foundedYear: 2020
    },
    {
        id: 111,
        name: "Loki Foods",
        description: "Sustainable seafood products maximizing fish utilization and reducing waste",
        website: "https://www.lokifoods.is",
        sector: "food",
        status: "active",
        acquiredBy: null,
        foundedYear: 2019
    },
    {
        id: 112,
        name: "Aurora Abalone",
        description: "Sustainable abalone aquaculture using Iceland's pure geothermal water",
        website: "https://www.auroraabalone.is",
        sector: "maritime",
        status: "active",
        acquiredBy: null,
        foundedYear: 2017
    },

    // === CLIMATE TECH / SUSTAINABILITY ===
    {
        id: 113,
        name: "Carbon Recycling International",
        description: "Pioneering CO2-to-methanol technology, producing renewable Vulcanol fuel",
        website: "https://www.carbonrecycling.com",
        sector: "cleantech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2006
    },
    {
        id: 114,
        name: "DTE",
        description: "AI sensors for aluminum recycling, helping reduce emissions by up to 95%",
        website: "https://www.dte.ai",
        sector: "cleantech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2013
    },
    {
        id: 115,
        name: "Coolity",
        description: "Eco-friendly compostable cooling boxes for sustainable seafood export",
        website: "https://www.coolity.is",
        sector: "cleantech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2017
    },
    {
        id: 116,
        name: "GeoSilica",
        description: "Natural silica health supplements extracted from geothermal water",
        website: "https://www.geosilica.com",
        sector: "healthtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2012
    },
    {
        id: 117,
        name: "GEG",
        description: "Modular small-scale geothermal wellhead power plants for global deployment",
        website: "https://www.geg.is",
        sector: "cleantech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2019
    },
    {
        id: 118,
        name: "Reykjavik Geothermal",
        description: "Global leader in geothermal energy development and power generation",
        website: "https://www.rg.is",
        sector: "cleantech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2008
    },
    {
        id: 119,
        name: "Arctic Green Energy",
        description: "Geothermal district heating solutions for sustainable urban development",
        website: "https://www.arcticgreenenergy.com",
        sector: "cleantech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2007
    },

    // === KLAK STARTUP SUPERNOVA 2024 COHORT ===
    {
        id: 120,
        name: "FairGame",
        description: "AI software creating fair matchups for youth sports tournaments",
        website: "https://www.fairgame.is",
        sector: "saas",
        status: "active",
        acquiredBy: null,
        foundedYear: 2024
    },
    {
        id: 121,
        name: "GrowthApp",
        description: "Growth platform helping first-time founders organize ideas into actionable plans",
        website: "https://www.growthapp.is",
        sector: "saas",
        status: "active",
        acquiredBy: null,
        foundedYear: 2024
    },
    {
        id: 122,
        name: "JarðarGreining",
        description: "Ground Penetrating Radar devices accessing subsurface information non-invasively",
        website: "https://www.jardargreining.is",
        sector: "other",
        status: "active",
        acquiredBy: null,
        foundedYear: 2023
    },
    {
        id: 123,
        name: "Massif Network",
        description: "Destination platform helping film/photo producers discover remote shooting locations",
        website: "https://www.massifnetwork.com",
        sector: "media",
        status: "active",
        acquiredBy: null,
        foundedYear: 2023
    },
    {
        id: 124,
        name: "Medvit Health",
        description: "AI medical systems supporting healthcare workers in diagnostics and treatment",
        website: "https://www.medvit.is",
        sector: "healthtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2023
    },
    {
        id: 125,
        name: "Neurotic",
        description: "AI-powered data management platform reducing organizational data anxiety",
        website: "https://www.neurotic.is",
        sector: "data",
        status: "active",
        acquiredBy: null,
        foundedYear: 2024
    },
    {
        id: 126,
        name: "TAPP",
        description: "Complete gig economy platform for project management, contracts, and invoicing",
        website: "https://www.tapp.is",
        sector: "saas",
        status: "active",
        acquiredBy: null,
        foundedYear: 2023
    },
    {
        id: 127,
        name: "Thorexa",
        description: "AI email response software that learns individual writing styles",
        website: "https://www.thorexa.com",
        sector: "saas",
        status: "active",
        acquiredBy: null,
        foundedYear: 2024
    },
    {
        id: 128,
        name: "Gyna-app",
        description: "Women's health app helping users manage health factors and take control",
        website: "https://www.gynaapp.com",
        sector: "healthtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2024
    },
    {
        id: 129,
        name: "VibEvent",
        description: "Community platform connecting musicians, audiences, and organizers",
        website: "https://www.vibevent.is",
        sector: "media",
        status: "active",
        acquiredBy: null,
        foundedYear: 2024
    },

    // === KLAK STARTUP SUPERNOVA 2023 COHORT ===
    {
        id: 130,
        name: "Astrid EdTech",
        description: "Climate change education through immersive storytelling for young people",
        website: "https://www.astridedtech.com",
        sector: "edtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2023
    },
    {
        id: 131,
        name: "GET Consulting",
        description: "Multi-party customer self-service portals for efficient collaboration",
        website: "https://www.getconsulting.is",
        sector: "saas",
        status: "active",
        acquiredBy: null,
        foundedYear: 2023
    },
    {
        id: 132,
        name: "Gæðameistari",
        description: "Quality management system for construction companies to improve quality and reduce costs",
        website: "https://www.gaedameistari.is",
        sector: "saas",
        status: "active",
        acquiredBy: null,
        foundedYear: 2023
    },
    {
        id: 133,
        name: "KuraTech",
        description: "Automation platform maximizing bankruptcy estate value for liquidators",
        website: "https://www.kuratech.is",
        sector: "fintech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2023
    },
    {
        id: 134,
        name: "Knittable",
        description: "Interactive knitting patterns that adapt to any yarn type and size",
        website: "https://www.knittable.com",
        sector: "other",
        status: "active",
        acquiredBy: null,
        foundedYear: 2023
    },
    {
        id: 135,
        name: "Lóalóa",
        description: "Easy-to-use online video platform for business content management",
        website: "https://www.loaloa.is",
        sector: "saas",
        status: "active",
        acquiredBy: null,
        foundedYear: 2023
    },
    {
        id: 136,
        name: "Modul Work",
        description: "Cloud solution using dynamic job descriptions to boost job satisfaction",
        website: "https://www.modulwork.is",
        sector: "saas",
        status: "active",
        acquiredBy: null,
        foundedYear: 2023
    },
    {
        id: 137,
        name: "Soultech",
        description: "Platform connecting the public with psychologists to democratize mental health",
        website: "https://www.soultech.is",
        sector: "healthtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2023
    },

    // === KLAK STARTUP SUPERNOVA 2022 COHORT ===
    {
        id: 138,
        name: "Bulby",
        description: "Software boosting creativity through researched methods for innovative problem-solving",
        website: "https://www.bulby.io",
        sector: "saas",
        status: "active",
        acquiredBy: null,
        foundedYear: 2022
    },
    {
        id: 139,
        name: "Deed Delivery",
        description: "Consumer platform tracking shipments from multiple delivery companies in one place",
        website: "https://www.deeddelivery.com",
        sector: "saas",
        status: "active",
        acquiredBy: null,
        foundedYear: 2022
    },
    {
        id: 140,
        name: "Euneo",
        description: "Individualized rehabilitation programs for musculoskeletal issues via smart app",
        website: "https://www.euneo.co",
        sector: "healthtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2022
    },
    {
        id: 141,
        name: "FitTales",
        description: "Exercise planning app for individuals and groups with complete workout history",
        website: "https://www.fittales.com",
        sector: "healthtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2022
    },
    {
        id: 142,
        name: "Keeps",
        description: "Software helping travel agents centralize and share photos across platforms",
        website: "https://www.keeps.io",
        sector: "travel",
        status: "active",
        acquiredBy: null,
        foundedYear: 2022
    },
    {
        id: 143,
        name: "Mindnes",
        description: "AI-powered time tracking that automatically classifies locations and activities",
        website: "https://www.mindnes.com",
        sector: "saas",
        status: "active",
        acquiredBy: null,
        foundedYear: 2022
    },
    {
        id: 144,
        name: "NúnaTrix",
        description: "Educational computer games in healthcare using evidence-based game design",
        website: "https://www.nunatrix.is",
        sector: "healthtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2022
    },

    // === OTHER ACCELERATOR ALUMNI ===
    {
        id: 145,
        name: "PayAnalytics",
        description: "HR software for salary reviews and analyzing demographic pay discrepancies",
        website: "https://www.payanalytics.com",
        sector: "saas",
        status: "active",
        acquiredBy: null,
        foundedYear: 2017
    },
    {
        id: 146,
        name: "Kara Connect",
        description: "Telehealth platform linking therapists, healthcare specialists with patients",
        website: "https://www.karaconnect.com",
        sector: "healthtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2014
    },
    {
        id: 147,
        name: "Hopp",
        description: "Micro-mobility SaaS providing e-scooter sharing franchise solutions",
        website: "https://www.hopp.bike",
        sector: "travel",
        status: "active",
        acquiredBy: null,
        foundedYear: 2019
    },
    {
        id: 148,
        name: "Mussila",
        description: "Award-winning music learning apps for children",
        website: "https://www.mussila.com",
        sector: "edtech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2015
    },
    {
        id: 149,
        name: "GreenBytes",
        description: "AI-driven platform helping restaurants reduce food waste",
        website: "https://www.greenbytes.is",
        sector: "food",
        status: "active",
        acquiredBy: null,
        foundedYear: 2020
    },
    {
        id: 150,
        name: "IceWind",
        description: "Micro vertical axis wind turbines for extreme arctic weather conditions",
        website: "https://www.icewind.is",
        sector: "cleantech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2012
    },
    {
        id: 151,
        name: "Atmonia",
        description: "Zero-carbon process for nitrogen fertilizer production",
        website: "https://www.atmonia.com",
        sector: "cleantech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2016
    },
    {
        id: 152,
        name: "Quest Portal",
        description: "Virtual tabletop platform for playing TTRPGs on desktop and mobile",
        website: "https://www.questportal.com",
        sector: "gaming",
        status: "active",
        acquiredBy: null,
        foundedYear: 2021
    },
    {
        id: 153,
        name: "SNERPA Power",
        description: "Real-time data platform for electricity consumption decisions",
        website: "https://www.snerpa.is",
        sector: "cleantech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2022
    },
    {
        id: 154,
        name: "Glaze",
        description: "Contactless ordering and payment experience for restaurants",
        website: "https://www.glaze.is",
        sector: "fintech",
        status: "active",
        acquiredBy: null,
        foundedYear: 2021
    },

    // === USER SUBMISSIONS ===
    {
        id: 155,
        name: "Co-Living Iceland",
        description: "AI-driven matchmaking platform connecting individuals with ideal housing and housemates in Iceland",
        website: "https://colivingiceland.app",
        sector: "other",
        status: "active",
        acquiredBy: null,
        foundedYear: 2023
    },
    {
        id: 156,
        name: "Cliezen",
        description: "B2B client experience and engagement platform",
        website: "https://www.cliezen.com",
        sector: "saas",
        status: "active",
        acquiredBy: null,
        foundedYear: 2022
    }
];

// Helper functions
function getStartupStats() {
    var total = icelandStartups.length;
    var active = icelandStartups.filter(function(s) { return s.status === 'active'; }).length;
    var acquired = icelandStartups.filter(function(s) { return s.status === 'acquired'; }).length;
    var exited = icelandStartups.filter(function(s) { return s.status === 'exited'; }).length;
    return { total: total, active: active, acquired: acquired, exited: exited };
}

function getSectorName(sectorId) {
    var sector = STARTUP_SECTORS.find(function(s) { return s.id === sectorId; });
    return sector ? sector.name : sectorId;
}
