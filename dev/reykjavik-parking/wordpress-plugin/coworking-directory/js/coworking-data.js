// Iceland Co-working Spaces Data
// Last updated: January 2025

var icelandCoworkingSpaces = [
    {
        id: 1,
        name: "Gróska",
        type: "innovation-hub",
        description: "Iceland's premier innovation and startup hub, home to the University of Iceland Science Park, KLAK accelerator, and major tech companies like CCP Games. Offers flexible co-working options alongside dedicated office space.",
        address: "Bjargargata 1",
        city: "Reykjavik",
        lat: 64.1458,
        lng: -21.9198,
        website: "https://groska.is",
        amenities: ["high-speed-wifi", "meeting-rooms", "event-space", "cafe", "parking", "24-7-access"],
        pricing: "Varies by space",
        capacity: "Large",
        targetAudience: ["startups", "tech", "corporate"],
        phone: null,
        email: null
    },
    {
        id: 2,
        name: "Haus",
        type: "creative-community",
        description: "Non-profit creative community and co-working space with over 500 members across 6,000m². A vibrant hub for artists, designers, musicians, and creative entrepreneurs in the old fishing harbor area.",
        address: "Grandagarður 16",
        city: "Reykjavik",
        lat: 64.1521,
        lng: -21.9486,
        website: "https://haus.is",
        amenities: ["high-speed-wifi", "studios", "workshops", "event-space", "cafe", "gallery"],
        pricing: "Membership-based",
        capacity: "Large",
        targetAudience: ["creative", "artists", "designers"],
        phone: null,
        email: null
    },
    {
        id: 3,
        name: "Regus - Kalkofnsvegur",
        type: "business-center",
        description: "Professional serviced office and co-working space in central Reykjavik. Part of the global Regus/IWG network offering flexible workspace solutions with full business services.",
        address: "Kalkofnsvegur 2",
        city: "Reykjavik",
        lat: 64.1466,
        lng: -21.9306,
        website: "https://www.regus.com/en-gb/iceland/reykjavik",
        amenities: ["high-speed-wifi", "meeting-rooms", "reception", "printing", "kitchen", "24-7-access"],
        pricing: "From ISK 15,000/day",
        capacity: "Medium",
        targetAudience: ["corporate", "remote-workers", "freelancers"],
        phone: "+354 578 8080",
        email: null
    },
    {
        id: 4,
        name: "Regus - Suðurlandsbraut",
        type: "business-center",
        description: "Modern serviced office and co-working space in the business district. Offers hot desks, dedicated desks, and private offices with comprehensive business amenities.",
        address: "Suðurlandsbraut 8",
        city: "Reykjavik",
        lat: 64.1369,
        lng: -21.8827,
        website: "https://www.regus.com/en-gb/iceland/reykjavik",
        amenities: ["high-speed-wifi", "meeting-rooms", "reception", "printing", "kitchen", "parking"],
        pricing: "From ISK 15,000/day",
        capacity: "Medium",
        targetAudience: ["corporate", "remote-workers", "freelancers"],
        phone: "+354 578 8080",
        email: null
    },
    {
        id: 5,
        name: "Innovation House",
        type: "innovation-hub",
        description: "Government-supported startup and innovation center providing affordable workspace for early-stage startups and entrepreneurs. Includes access to mentorship and networking events.",
        address: "Austurstræti 14",
        city: "Reykjavik",
        lat: 64.1471,
        lng: -21.9330,
        website: "https://www.innovationhouse.is",
        amenities: ["high-speed-wifi", "meeting-rooms", "event-space", "mentorship"],
        pricing: "Subsidized rates",
        capacity: "Medium",
        targetAudience: ["startups", "entrepreneurs"],
        phone: null,
        email: null
    },
    {
        id: 6,
        name: "Reykjavik Coworking Unit (RCU)",
        type: "coworking",
        description: "Dedicated co-working space on the main shopping street offering flexible desk options for freelancers, remote workers, and small teams in a collaborative environment.",
        address: "Laugavegur 116",
        city: "Reykjavik",
        lat: 64.1428,
        lng: -21.9074,
        website: null,
        amenities: ["high-speed-wifi", "meeting-rooms", "kitchen", "lounge"],
        pricing: "Contact for rates",
        capacity: "Small",
        targetAudience: ["freelancers", "remote-workers"],
        phone: null,
        email: null
    },
    {
        id: 7,
        name: "Hitt Húsið",
        type: "youth-center",
        description: "Creative space and cultural center for young people aged 16-25. Offers workspace, studios, and facilities for young creatives, artists, and entrepreneurs to develop their projects.",
        address: "Pósthússtræti 3-5",
        city: "Reykjavik",
        lat: 64.1471,
        lng: -21.9315,
        website: "https://hitthusid.is",
        amenities: ["high-speed-wifi", "studios", "event-space", "workshops"],
        pricing: "Free/Low-cost",
        capacity: "Medium",
        targetAudience: ["youth", "creative", "students"],
        phone: "+354 561 8555",
        email: null
    },
    {
        id: 8,
        name: "Hafnar.haus",
        type: "creative-community",
        description: "Creative co-working space in the harbor area, fostering collaboration between artists, designers, and creative professionals. Features shared studios and workshop facilities.",
        address: "Geirsgata 7",
        city: "Reykjavik",
        lat: 64.1503,
        lng: -21.9416,
        website: "https://hafnar.haus",
        amenities: ["high-speed-wifi", "studios", "workshops", "kitchen"],
        pricing: "Membership-based",
        capacity: "Small",
        targetAudience: ["creative", "artists", "designers"],
        phone: null,
        email: null
    },
    {
        id: 9,
        name: "Blábankinn",
        type: "coworking",
        description: "Co-working space in Ísafjörður, the largest town in the Westfjords. Provides remote workers and local entrepreneurs with a professional workspace in this beautiful coastal region.",
        address: "Hafnarstræti 7",
        city: "Ísafjörður",
        lat: 66.0718,
        lng: -23.1247,
        website: "https://blabankinn.is",
        amenities: ["high-speed-wifi", "meeting-rooms", "kitchen", "lounge"],
        pricing: "Contact for rates",
        capacity: "Small",
        targetAudience: ["remote-workers", "freelancers", "local-business"],
        phone: null,
        email: null
    },
    {
        id: 10,
        name: "Músík- og listsmiðjan",
        type: "creative-community",
        description: "Music and arts workshop in Akureyri, providing creative workspace and studio facilities for musicians, artists, and performers in North Iceland's cultural capital.",
        address: "Glerárgata 32",
        city: "Akureyri",
        lat: 65.6839,
        lng: -18.0886,
        website: "https://listsmidjanoakureyri.is",
        amenities: ["studios", "recording-facilities", "workshops", "event-space"],
        pricing: "Membership-based",
        capacity: "Medium",
        targetAudience: ["creative", "artists", "musicians"],
        phone: null,
        email: null
    },
    {
        id: 11,
        name: "Icelandair Hotel - Work Lounge",
        type: "hotel-workspace",
        description: "Flexible workspace options at Icelandair Hotels, offering day passes and hourly rates for business travelers and remote workers needing professional meeting and work space.",
        address: "Mýrargata 2 (Marina)",
        city: "Reykjavik",
        lat: 64.1495,
        lng: -21.9461,
        website: "https://www.icelandairhotels.com",
        amenities: ["high-speed-wifi", "meeting-rooms", "cafe", "lounge"],
        pricing: "Day passes available",
        capacity: "Medium",
        targetAudience: ["business-travelers", "remote-workers"],
        phone: null,
        email: null
    },
    {
        id: 12,
        name: "KLAK Accelerator",
        type: "accelerator",
        description: "Iceland's leading startup accelerator located within Gróska. Provides intensive workspace and mentorship for startups going through their acceleration programs.",
        address: "Bjargargata 1",
        city: "Reykjavik",
        lat: 64.1458,
        lng: -21.9198,
        website: "https://www.klak.is",
        amenities: ["high-speed-wifi", "meeting-rooms", "mentorship", "event-space"],
        pricing: "Program participants",
        capacity: "Small",
        targetAudience: ["startups", "tech"],
        phone: null,
        email: "info@klak.is"
    },
    {
        id: 13,
        name: "Iceland Ocean Cluster House",
        type: "innovation-hub",
        description: "A hub for the ocean industry and blue economy, bringing together startups, established companies, and researchers focused on marine resources, fisheries, and ocean technology. Over 70 companies under one roof fostering collaboration in the maritime sector.",
        address: "Grandagarður 16",
        city: "Reykjavik",
        lat: 64.1521,
        lng: -21.9486,
        website: "https://www.sjavarklasinn.is",
        amenities: ["high-speed-wifi", "meeting-rooms", "event-space", "cafe", "kitchen"],
        pricing: "Contact for rates",
        capacity: "Large",
        targetAudience: ["startups", "corporate", "marine"],
        phone: "+354 517 5810",
        email: "ocean@sjavarklasinn.is"
    }
];

// Space Types
var SPACE_TYPES = [
    { id: "all", name: "All Types" },
    { id: "innovation-hub", name: "Innovation Hub" },
    { id: "coworking", name: "Co-working Space" },
    { id: "creative-community", name: "Creative Community" },
    { id: "business-center", name: "Business Center" },
    { id: "youth-center", name: "Youth Center" },
    { id: "accelerator", name: "Accelerator" },
    { id: "hotel-workspace", name: "Hotel Workspace" }
];

// Cities
var CITIES = [
    { id: "all", name: "All Locations" },
    { id: "Reykjavik", name: "Reykjavik" },
    { id: "Akureyri", name: "Akureyri" },
    { id: "Ísafjörður", name: "Ísafjörður" }
];

// Target Audiences
var TARGET_AUDIENCES = [
    { id: "all", name: "All Audiences" },
    { id: "startups", name: "Startups" },
    { id: "freelancers", name: "Freelancers" },
    { id: "remote-workers", name: "Remote Workers" },
    { id: "creative", name: "Creative Professionals" },
    { id: "corporate", name: "Corporate" },
    { id: "tech", name: "Tech" },
    { id: "marine", name: "Marine / Blue Economy" },
    { id: "youth", name: "Youth" }
];

// Amenities
var AMENITIES = [
    { id: "high-speed-wifi", name: "High-Speed WiFi", icon: "wifi" },
    { id: "meeting-rooms", name: "Meeting Rooms", icon: "users" },
    { id: "event-space", name: "Event Space", icon: "calendar" },
    { id: "cafe", name: "Cafe", icon: "coffee" },
    { id: "kitchen", name: "Kitchen", icon: "utensils" },
    { id: "parking", name: "Parking", icon: "car" },
    { id: "24-7-access", name: "24/7 Access", icon: "clock" },
    { id: "studios", name: "Studios", icon: "palette" },
    { id: "workshops", name: "Workshops", icon: "tools" },
    { id: "reception", name: "Reception", icon: "desk" },
    { id: "printing", name: "Printing", icon: "printer" },
    { id: "lounge", name: "Lounge", icon: "couch" },
    { id: "mentorship", name: "Mentorship", icon: "lightbulb" },
    { id: "gallery", name: "Gallery", icon: "image" },
    { id: "recording-facilities", name: "Recording", icon: "microphone" }
];

// Export for Node.js (generate-json.js script)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        icelandCoworkingSpaces: icelandCoworkingSpaces,
        SPACE_TYPES: SPACE_TYPES,
        CITIES: CITIES,
        TARGET_AUDIENCES: TARGET_AUDIENCES,
        AMENITIES: AMENITIES
    };
}
