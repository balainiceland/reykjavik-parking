// Reykjavik Parking Data v1.3
// Includes downtown, malls, BSI, and University

var RVK_PARKING_CENTER = [64.1466, -21.9426];

// Translations
var rvkTranslations = {
    en: {
        title: "Parking Information",
        hint: "Click a marker on the map for details",
        address: "Address",
        capacity: "Capacity",
        hours: "Hours",
        rates: "Rates",
        spaces: "spaces",
        directions: "Get Directions",
        statsTitle: "Reykjavik Parking Stats",
        garageSpaces: "Garage Spaces",
        paidStreet: "Paid Street",
        freeStreet: "Free Street",
        legend: "Legend",
        garage: "Parking Garage",
        lot: "Parking Lot",
        mall: "Shopping Mall",
        evCharging: "EV Charging",
        zone: "Zone",
        tips: "Parking Tips",
        tip1: "Free street parking after 18:00",
        tip2: "Free all day Sundays (except garages)",
        tip3: "P1-P3: Mon-Fri 09:00-18:00, Sat 10:00-16:00",
        tip4: "Download Parka app for payments",
        freeNow: "FREE PARKING NOW",
        paidNow: "Paid parking until",
        calculator: "Price Calculator",
        duration: "Duration (hours)",
        calculate: "Calculate",
        estimatedCost: "Estimated cost",
        selectParking: "Select a parking location first",
        perHour: "/hr",
        evAvailable: "EV charging available",
        evStations: "charging stations",
        free: "Free",
        freeParking: "Free Parking"
    },
    is: {
        title: "Bílastæðaupplýsingar",
        hint: "Smelltu á merki á kortinu",
        address: "Heimilisfang",
        capacity: "Rými",
        hours: "Opnunartími",
        rates: "Gjaldskrá",
        spaces: "stæði",
        directions: "Leiðsögn",
        statsTitle: "Bílastæðatölfræði",
        garageSpaces: "Stæði í geymslum",
        paidStreet: "Gjaldskyldar götur",
        freeStreet: "Ókeypis götur",
        legend: "Skýringar",
        garage: "Bílageymsla",
        lot: "Bílastæði",
        mall: "Verslunarkjarni",
        evCharging: "Rafbílahleðsla",
        zone: "Svæði",
        tips: "Góð ráð",
        tip1: "Ókeypis á götum eftir kl. 18:00",
        tip2: "Ókeypis á sunnudögum (nema geymslur)",
        tip3: "P1-P3: Mán-Fös 09-18, Lau 10-16",
        tip4: "Sæktu Parka appið",
        freeNow: "ÓKEYPIS NÚNA",
        paidNow: "Gjaldskylda til kl.",
        calculator: "Verðreiknivél",
        duration: "Tímalengd (klst)",
        calculate: "Reikna",
        estimatedCost: "Áætlað verð",
        selectParking: "Veldu bílastæði fyrst",
        perHour: "/klst",
        evAvailable: "Rafbílahleðsla í boði",
        evStations: "hleðslustöðvar",
        free: "Ókeypis",
        freeParking: "Ókeypis bílastæði"
    }
};

var rvkParkingGarages = [
    // === DOWNTOWN GARAGES ===
    {
        id: 1,
        name: "Kolaport Garage",
        nameIs: "Kolaportsbílageymsla",
        address: "Kalkofnsvegur 1, 101 Reykjavík",
        lat: 64.1512,
        lng: -21.9383,
        capacity: 550,
        hours: "07:00 - 00:00",
        hoursIs: "07:00 - 00:00",
        rates: "270 ISK 1st hr, 140 ISK/hr after",
        ratesIs: "270 kr. 1. klst, 140 kr./klst eftir",
        firstHourRate: 270,
        hourlyRate: 140,
        type: "garage",
        area: "downtown",
        evCharging: true,
        evStations: 6
    },
    {
        id: 2,
        name: "Harpa / Hafnartorg",
        nameIs: "Harpa / Hafnartorg",
        address: "Austurbakki 2, 101 Reykjavík",
        lat: 64.1503,
        lng: -21.9328,
        capacity: 1000,
        hours: "24/7",
        hoursIs: "Alltaf opið",
        rates: "370 ISK/hr (08-18), 140 ISK/hr (18-08)",
        ratesIs: "370 kr./klst (08-18), 140 kr./klst (18-08)",
        firstHourRate: 370,
        hourlyRate: 370,
        eveningRate: 140,
        type: "garage",
        area: "downtown",
        evCharging: true,
        evStations: 13
    },
    {
        id: 3,
        name: "City Hall Garage",
        nameIs: "Ráðhúsbílageymsla",
        address: "Tjarnargata 11, 101 Reykjavík",
        lat: 64.1463,
        lng: -21.9420,
        capacity: 200,
        hours: "07:00 - 23:00",
        hoursIs: "07:00 - 23:00",
        rates: "270 ISK 1st hr, 140 ISK/hr after",
        ratesIs: "270 kr. 1. klst, 140 kr./klst eftir",
        firstHourRate: 270,
        hourlyRate: 140,
        type: "garage",
        area: "downtown",
        evCharging: true,
        evStations: 12
    },
    {
        id: 4,
        name: "Traðarkot Garage",
        nameIs: "Traðarkotsbílageymsla",
        address: "Hverfisgata 20, 101 Reykjavík",
        lat: 64.1475,
        lng: -21.9310,
        capacity: 300,
        hours: "07:00 - 23:00",
        hoursIs: "07:00 - 23:00",
        rates: "200 ISK/hr",
        ratesIs: "200 kr./klst",
        firstHourRate: 200,
        hourlyRate: 200,
        type: "garage",
        area: "downtown",
        evCharging: false,
        evStations: 0
    },
    {
        id: 5,
        name: "Stjörnuport Garage",
        nameIs: "Stjörnuportsbílageymsla",
        address: "Laugavegur 94, 105 Reykjavík",
        lat: 64.1438,
        lng: -21.9120,
        capacity: 250,
        hours: "08:00 - 22:00",
        hoursIs: "08:00 - 22:00",
        rates: "185 ISK/hr",
        ratesIs: "185 kr./klst",
        firstHourRate: 185,
        hourlyRate: 185,
        type: "garage",
        area: "downtown",
        evCharging: false,
        evStations: 0
    },
    {
        id: 6,
        name: "Vitatorg Garage",
        nameIs: "Vitatorgsbílageymsla",
        address: "Skúlagata / Vitastígur, 101 Reykjavík",
        lat: 64.1490,
        lng: -21.9250,
        capacity: 400,
        hours: "24/7",
        hoursIs: "Alltaf opið",
        rates: "250 ISK/hr",
        ratesIs: "250 kr./klst",
        firstHourRate: 250,
        hourlyRate: 250,
        type: "garage",
        area: "downtown",
        evCharging: false,
        evStations: 0
    },
    {
        id: 7,
        name: "Vesturgata Garage",
        nameIs: "Vesturgötubílageymsla",
        address: "Vesturgata / Mýrargata, 101 Reykjavík",
        lat: 64.1492,
        lng: -21.9460,
        capacity: 150,
        hours: "24/7",
        hoursIs: "Alltaf opið",
        rates: "Zone P1 rates",
        ratesIs: "P1 gjaldskrá",
        firstHourRate: 270,
        hourlyRate: 270,
        type: "garage",
        area: "downtown",
        evCharging: true,
        evStations: 4
    },

    // === SHOPPING MALLS ===
    {
        id: 8,
        name: "Kringlan Mall",
        nameIs: "Kringlan",
        address: "Kringlan 4-12, 103 Reykjavík",
        lat: 64.1318,
        lng: -21.8935,
        capacity: 1800,
        hours: "Mall hours (10-19)",
        hoursIs: "Opnunartími (10-19)",
        rates: "Free",
        ratesIs: "Ókeypis",
        firstHourRate: 0,
        hourlyRate: 0,
        type: "mall",
        area: "kringlan",
        evCharging: true,
        evStations: 8,
        isFree: true
    },
    {
        id: 9,
        name: "Smáralind Mall",
        nameIs: "Smáralind",
        address: "Hagasmári 1, 201 Kópavogur",
        lat: 64.1048,
        lng: -21.8847,
        capacity: 2500,
        hours: "Mall hours (11-19)",
        hoursIs: "Opnunartími (11-19)",
        rates: "Free",
        ratesIs: "Ókeypis",
        firstHourRate: 0,
        hourlyRate: 0,
        type: "mall",
        area: "smaralind",
        evCharging: true,
        evStations: 10,
        isFree: true
    },

    // === TRANSPORT HUBS ===
    {
        id: 10,
        name: "BSÍ Bus Terminal",
        nameIs: "BSÍ Umferðarmiðstöð",
        address: "Vatnsmýrarvegur 10, 101 Reykjavík",
        lat: 64.1373,
        lng: -21.9349,
        capacity: 200,
        hours: "24/7",
        hoursIs: "Alltaf opið",
        rates: "600 ISK/hr (45 min free)",
        ratesIs: "600 kr./klst (45 mín ókeypis)",
        firstHourRate: 600,
        hourlyRate: 600,
        type: "transit",
        area: "bsi",
        evCharging: true,
        evStations: 4,
        freeMinutes: 45
    },

    // === UNIVERSITY ===
    {
        id: 11,
        name: "University of Iceland",
        nameIs: "Háskóli Íslands",
        address: "Sæmundargata 2, 102 Reykjavík",
        lat: 64.1398,
        lng: -21.9505,
        capacity: 800,
        hours: "24/7",
        hoursIs: "Alltaf opið",
        rates: "230 ISK/hr (15 min free)",
        ratesIs: "230 kr./klst (15 mín ókeypis)",
        firstHourRate: 230,
        hourlyRate: 230,
        type: "university",
        area: "university",
        evCharging: true,
        evStations: 6,
        freeMinutes: 15
    }
];

// Parking zones (downtown only)
var rvkParkingZones = {
    p1: {
        name: "P1 - Central",
        nameIs: "P1 - Miðbær",
        color: "#ef5350",
        rate: 270,
        rateText: "270 ISK/hr",
        rateTextIs: "270 kr./klst",
        hours: "Mon-Fri 09:00-18:00, Sat 10:00-16:00",
        hoursIs: "Mán-Fös 09:00-18:00, Lau 10:00-16:00",
        bounds: [
            [64.1495, -21.9500],
            [64.1495, -21.9350],
            [64.1445, -21.9350],
            [64.1445, -21.9500]
        ]
    },
    p2: {
        name: "P2 - Inner",
        nameIs: "P2 - Innri",
        color: "#ffb74d",
        rate: 185,
        rateText: "185 ISK/hr",
        rateTextIs: "185 kr./klst",
        hours: "Mon-Fri 09:00-18:00, Sat 10:00-16:00",
        hoursIs: "Mán-Fös 09:00-18:00, Lau 10:00-16:00",
        bounds: [
            [64.1520, -21.9550],
            [64.1520, -21.9280],
            [64.1430, -21.9280],
            [64.1430, -21.9550]
        ]
    },
    p3: {
        name: "P3 - Outer",
        nameIs: "P3 - Ytri",
        color: "#81c784",
        rate: 125,
        rateText: "125 ISK/hr",
        rateTextIs: "125 kr./klst",
        hours: "Mon-Fri 09:00-18:00, Sat 10:00-16:00",
        hoursIs: "Mán-Fös 09:00-18:00, Lau 10:00-16:00",
        bounds: [
            [64.1550, -21.9600],
            [64.1550, -21.9100],
            [64.1400, -21.9100],
            [64.1400, -21.9600]
        ]
    }
};

// Check if street parking is currently free
function isStreetParkingFree() {
    var now = new Date();
    var day = now.getDay();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var time = hour + minute / 60;

    if (day === 0) {
        return { free: true, until: null, reason: 'sunday' };
    }

    if (day === 6) {
        if (time < 10) {
            return { free: true, until: '10:00', reason: 'before_hours' };
        } else if (time >= 16) {
            return { free: true, until: null, reason: 'after_hours' };
        } else {
            return { free: false, until: '16:00', reason: 'paid_hours' };
        }
    }

    if (time < 9) {
        return { free: true, until: '09:00', reason: 'before_hours' };
    } else if (time >= 18) {
        return { free: true, until: null, reason: 'after_hours' };
    } else {
        return { free: false, until: '18:00', reason: 'paid_hours' };
    }
}

// Calculate parking cost
function calculateParkingCost(parking, hours) {
    if (!parking || hours <= 0) return 0;
    if (parking.isFree) return 0;

    var cost = 0;
    var effectiveHours = hours;

    // Subtract free minutes if applicable
    if (parking.freeMinutes) {
        effectiveHours = Math.max(0, hours - (parking.freeMinutes / 60));
    }

    if (effectiveHours <= 0) return 0;

    if (parking.firstHourRate && effectiveHours >= 1) {
        cost = parking.firstHourRate;
        var remainingHours = effectiveHours - 1;
        if (remainingHours > 0) {
            cost += Math.ceil(remainingHours) * parking.hourlyRate;
        }
    } else {
        cost = Math.ceil(effectiveHours) * parking.hourlyRate;
    }

    return cost;
}
