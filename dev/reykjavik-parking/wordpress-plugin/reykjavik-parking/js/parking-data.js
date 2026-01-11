// Reykjavik Parking Data v2.0
// Updated January 2026 with official rates from reykjavik.is
// Includes downtown garages, malls, BSI, and University

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
        tip1: "P1 & P2: Paid until 21:00 (incl. weekends)",
        tip2: "P3: Weekdays only 09:00-18:00",
        tip3: "P4: Weekdays only 08:00-16:00",
        tip4: "Free on public holidays. Use Parka app to pay",
        freeNow: "FREE NOW (P3/P4)",
        paidNow: "Paid parking until",
        paidAllZones: "All zones paid until",
        calculator: "Price Calculator",
        duration: "Duration (hours)",
        calculate: "Calculate",
        estimatedCost: "Estimated cost",
        selectParking: "Select a parking location first",
        perHour: "/hr",
        evAvailable: "EV charging available",
        evStations: "charging stations",
        free: "Free",
        freeParking: "Free Parking",
        maxTime: "Max 3 hours",
        dataSource: "Data source:"
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
        tip1: "P1 og P2: Gjaldskylda til 21:00 (líka um helgar)",
        tip2: "P3: Aðeins virka daga 09:00-18:00",
        tip3: "P4: Aðeins virka daga 08:00-16:00",
        tip4: "Ókeypis á helgidögum. Notaðu Parka app",
        freeNow: "ÓKEYPIS NÚNA (P3/P4)",
        paidNow: "Gjaldskylda til kl.",
        paidAllZones: "Öll svæði gjaldskylda til",
        calculator: "Verðreiknivél",
        duration: "Tímalengd (klst)",
        calculate: "Reikna",
        estimatedCost: "Áætlað verð",
        selectParking: "Veldu bílastæði fyrst",
        perHour: "/klst",
        evAvailable: "Rafbílahleðsla í boði",
        evStations: "hleðslustöðvar",
        free: "Ókeypis",
        freeParking: "Ókeypis bílastæði",
        maxTime: "Hámark 3 klst",
        dataSource: "Gögn frá:"
    }
};

var rvkParkingGarages = [
    // === CITY-OPERATED GARAGES (reykjavik.is) ===
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
        rates: "280 ISK 1st hr, 150 ISK/hr after",
        ratesIs: "280 kr. 1. klst, 150 kr./klst eftir",
        firstHourRate: 280,
        hourlyRate: 150,
        type: "garage",
        area: "downtown",
        evCharging: true,
        evStations: 6,
        cityOperated: true
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
        rates: "Variable rates (private)",
        ratesIs: "Breytileg gjaldskrá (einkarekin)",
        firstHourRate: 350,
        hourlyRate: 350,
        type: "garage",
        area: "downtown",
        evCharging: true,
        evStations: 13,
        cityOperated: false
    },
    {
        id: 3,
        name: "City Hall Garage",
        nameIs: "Ráðhúsbílageymsla",
        address: "Tjarnargata 11, 101 Reykjavík",
        lat: 64.1463,
        lng: -21.9420,
        capacity: 200,
        hours: "07:00 - 00:00",
        hoursIs: "07:00 - 00:00",
        rates: "280 ISK 1st hr, 150 ISK/hr after",
        ratesIs: "280 kr. 1. klst, 150 kr./klst eftir",
        firstHourRate: 280,
        hourlyRate: 150,
        type: "garage",
        area: "downtown",
        evCharging: true,
        evStations: 12,
        cityOperated: true
    },
    {
        id: 4,
        name: "Traðarkot Garage",
        nameIs: "Traðarkotsbílageymsla",
        address: "Hverfisgata 20, 101 Reykjavík",
        lat: 64.1475,
        lng: -21.9310,
        capacity: 300,
        hours: "07:00 - 00:00",
        hoursIs: "07:00 - 00:00",
        rates: "280 ISK 1st hr, 150 ISK/hr after",
        ratesIs: "280 kr. 1. klst, 150 kr./klst eftir",
        firstHourRate: 280,
        hourlyRate: 150,
        type: "garage",
        area: "downtown",
        evCharging: false,
        evStations: 0,
        cityOperated: true
    },
    {
        id: 5,
        name: "Stjörnuport Garage",
        nameIs: "Stjörnuportsbílageymsla",
        address: "Laugavegur 94, 105 Reykjavík",
        lat: 64.1438,
        lng: -21.9120,
        capacity: 250,
        hours: "07:00 - 00:00",
        hoursIs: "07:00 - 00:00",
        rates: "190 ISK 1st hr, 140 ISK/hr after",
        ratesIs: "190 kr. 1. klst, 140 kr./klst eftir",
        firstHourRate: 190,
        hourlyRate: 140,
        type: "garage",
        area: "downtown",
        evCharging: false,
        evStations: 0,
        cityOperated: true
    },
    {
        id: 6,
        name: "Vitatorg Garage",
        nameIs: "Vitatorgsbílageymsla",
        address: "Lindargata, 101 Reykjavík",
        lat: 64.1490,
        lng: -21.9250,
        capacity: 400,
        hours: "07:00 - 00:00",
        hoursIs: "07:00 - 00:00",
        rates: "190 ISK 1st hr, 140 ISK/hr after",
        ratesIs: "190 kr. 1. klst, 140 kr./klst eftir",
        firstHourRate: 190,
        hourlyRate: 140,
        type: "garage",
        area: "downtown",
        evCharging: false,
        evStations: 0,
        cityOperated: true
    },
    {
        id: 7,
        name: "Vesturgata Garage",
        nameIs: "Vesturgötubílageymsla",
        address: "Vesturgata / Mýrargata, 101 Reykjavík",
        lat: 64.1492,
        lng: -21.9460,
        capacity: 150,
        hours: "07:00 - 00:00",
        hoursIs: "07:00 - 00:00",
        rates: "280 ISK 1st hr, 150 ISK/hr after",
        ratesIs: "280 kr. 1. klst, 150 kr./klst eftir",
        firstHourRate: 280,
        hourlyRate: 150,
        type: "garage",
        area: "downtown",
        evCharging: true,
        evStations: 4,
        cityOperated: true
    },
    {
        id: 8,
        name: "Bergstaðir Garage",
        nameIs: "Bergstaðabílageymsla",
        address: "Bergstaðastræti, 101 Reykjavík",
        lat: 64.1448,
        lng: -21.9380,
        capacity: 200,
        hours: "07:00 - 00:00",
        hoursIs: "07:00 - 00:00",
        rates: "280 ISK 1st hr, 150 ISK/hr after",
        ratesIs: "280 kr. 1. klst, 150 kr./klst eftir",
        firstHourRate: 280,
        hourlyRate: 150,
        type: "garage",
        area: "downtown",
        evCharging: false,
        evStations: 0,
        cityOperated: true
    },

    // === SHOPPING MALLS ===
    {
        id: 9,
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
        id: 10,
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
        id: 11,
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
        id: 12,
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

// Parking zones (downtown street parking)
// Updated October 2023 per reykjavik.is
var rvkParkingZones = {
    p1: {
        name: "P1 - Central",
        nameIs: "P1 - Miðbær",
        color: "#d32f2f",
        rate: 630,
        rateText: "630 ISK/hr (max 3 hrs)",
        rateTextIs: "630 kr./klst (hámark 3 klst)",
        hours: "Mon-Sat 09:00-21:00, Sun 10:00-21:00",
        hoursIs: "Mán-Lau 09:00-21:00, Sun 10:00-21:00",
        maxHours: 3,
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
        color: "#f57c00",
        rate: 230,
        rateText: "230 ISK/hr",
        rateTextIs: "230 kr./klst",
        hours: "Mon-Sat 09:00-21:00, Sun 10:00-21:00",
        hoursIs: "Mán-Lau 09:00-21:00, Sun 10:00-21:00",
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
        color: "#388e3c",
        rate: 230,
        rateAfter2Hours: 70,
        rateText: "230 ISK/hr (first 2 hrs), then 70 ISK/hr",
        rateTextIs: "230 kr./klst (fyrstu 2 klst), síðan 70 kr./klst",
        hours: "Mon-Fri 09:00-18:00",
        hoursIs: "Mán-Fös 09:00-18:00",
        bounds: [
            [64.1550, -21.9600],
            [64.1550, -21.9100],
            [64.1400, -21.9100],
            [64.1400, -21.9600]
        ]
    },
    p4: {
        name: "P4 - Extended",
        nameIs: "P4 - Útvíkkað",
        color: "#1976d2",
        rate: 230,
        rateText: "230 ISK/hr",
        rateTextIs: "230 kr./klst",
        hours: "Mon-Fri 08:00-16:00",
        hoursIs: "Mán-Fös 08:00-16:00",
        bounds: [
            [64.1580, -21.9650],
            [64.1580, -21.9050],
            [64.1380, -21.9050],
            [64.1380, -21.9650]
        ]
    }
};

// Check if street parking is currently free
// Note: This is simplified - actual rules vary by zone
function isStreetParkingFree() {
    var now = new Date();
    var day = now.getDay(); // 0 = Sunday, 6 = Saturday
    var hour = now.getHours();
    var minute = now.getMinutes();
    var time = hour + minute / 60;

    // Check for public holidays (simplified - just checks major ones)
    var month = now.getMonth();
    var date = now.getDate();
    var isHoliday = (month === 0 && date === 1) ||  // New Year
                    (month === 4 && date === 1) ||  // May Day
                    (month === 5 && date === 17) || // National Day
                    (month === 11 && (date >= 24 && date <= 26)); // Christmas

    if (isHoliday) {
        return { free: true, until: null, reason: 'holiday', allZones: true };
    }

    // P3 and P4 are free on weekends
    var isWeekend = (day === 0 || day === 6);

    // Sunday: P1 & P2 paid 10:00-21:00
    if (day === 0) {
        if (time < 10) {
            return { free: true, until: '10:00', reason: 'before_hours', allZones: true };
        } else if (time >= 21) {
            return { free: true, until: null, reason: 'after_hours', allZones: true };
        } else {
            return { free: false, until: '21:00', reason: 'paid_hours', p3p4Free: true };
        }
    }

    // Saturday: P1 & P2 paid 09:00-21:00, P3 & P4 free all day
    if (day === 6) {
        if (time < 9) {
            return { free: true, until: '09:00', reason: 'before_hours', allZones: true };
        } else if (time >= 21) {
            return { free: true, until: null, reason: 'after_hours', allZones: true };
        } else {
            return { free: false, until: '21:00', reason: 'paid_hours', p3p4Free: true };
        }
    }

    // Weekdays
    // P4: 08:00-16:00
    // P3: 09:00-18:00
    // P1 & P2: 09:00-21:00

    if (time < 8) {
        return { free: true, until: '08:00', reason: 'before_hours', allZones: true };
    } else if (time >= 21) {
        return { free: true, until: null, reason: 'after_hours', allZones: true };
    } else if (time >= 18) {
        // After 18:00: P3 & P4 free, P1 & P2 still paid
        return { free: false, until: '21:00', reason: 'evening', p3p4Free: true };
    } else if (time >= 16) {
        // After 16:00: P4 free, others still paid
        return { free: false, until: '21:00', reason: 'afternoon', p4Free: true };
    } else if (time >= 9) {
        // 09:00-16:00: All zones paid
        return { free: false, until: '21:00', reason: 'paid_hours', allZones: false };
    } else {
        // 08:00-09:00: Only P4 is paid
        return { free: true, until: '09:00', reason: 'early_morning', p4Paid: true };
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

    // Handle P3 zone special pricing (230 first 2 hrs, then 70)
    if (parking.rateAfter2Hours !== undefined) {
        if (effectiveHours <= 2) {
            cost = Math.ceil(effectiveHours) * parking.rate;
        } else {
            cost = 2 * parking.rate; // First 2 hours
            var remainingHours = effectiveHours - 2;
            cost += Math.ceil(remainingHours) * parking.rateAfter2Hours;
        }
        return cost;
    }

    // Standard garage pricing
    if (parking.firstHourRate && parking.firstHourRate !== parking.hourlyRate) {
        cost = parking.firstHourRate;
        var remainingHours = effectiveHours - 1;
        if (remainingHours > 0) {
            cost += Math.ceil(remainingHours) * parking.hourlyRate;
        }
    } else {
        cost = Math.ceil(effectiveHours) * (parking.hourlyRate || parking.rate);
    }

    return cost;
}
