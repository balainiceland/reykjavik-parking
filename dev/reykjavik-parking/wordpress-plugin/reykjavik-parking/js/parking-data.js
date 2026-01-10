// Reykjavik Downtown Parking Data
// Coordinates for downtown Reykjavik parking locations

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
        statsTitle: "Downtown Statistics (2026)",
        garageSpaces: "Parking Garage Spaces",
        paidStreet: "Paid Street Parking",
        freeStreet: "Free Street Parking",
        legend: "Legend",
        garage: "Parking Garage",
        lot: "Parking Lot",
        zone: "Zone",
        tips: "Parking Tips",
        tip1: "Free parking after 18:00 on streets",
        tip2: "Free all day on Sundays (except garages)",
        tip3: "P1-P3 zones: Mon-Fri 09:00-18:00, Sat 10:00-16:00",
        tip4: "Download Parka app for mobile payments",
        freeNow: "FREE PARKING NOW",
        paidNow: "Paid parking until",
        calculator: "Price Calculator",
        duration: "Duration (hours)",
        calculate: "Calculate",
        estimatedCost: "Estimated cost",
        selectParking: "Select a parking location first",
        perHour: "/hr"
    },
    is: {
        title: "Bílastæðaupplýsingar",
        hint: "Smelltu á merki á kortinu til að sjá upplýsingar",
        address: "Heimilisfang",
        capacity: "Rými",
        hours: "Opnunartími",
        rates: "Gjaldskrá",
        spaces: "stæði",
        directions: "Leiðsögn",
        statsTitle: "Tölfræði miðbæjar (2026)",
        garageSpaces: "Stæði í bílageymslum",
        paidStreet: "Gjaldskyldar götur",
        freeStreet: "Ókeypis götur",
        legend: "Skýringar",
        garage: "Bílageymsla",
        lot: "Bílastæði",
        zone: "Svæði",
        tips: "Góð ráð",
        tip1: "Ókeypis eftir kl. 18:00 á götum",
        tip2: "Ókeypis alla sunnudaga (nema bílageymslur)",
        tip3: "P1-P3: Mán-Fös 09:00-18:00, Lau 10:00-16:00",
        tip4: "Sæktu Parka appið fyrir greiðslur",
        freeNow: "ÓKEYPIS NÚNA",
        paidNow: "Gjaldskylda til kl.",
        calculator: "Verðreiknivél",
        duration: "Tímalengd (klukkustundir)",
        calculate: "Reikna",
        estimatedCost: "Áætlað verð",
        selectParking: "Veldu bílastæði fyrst",
        perHour: "/klst"
    }
};

var rvkParkingGarages = [
    {
        id: 1,
        name: "Kolaport Parking Garage",
        nameIs: "Kolaportsbílageymsla",
        address: "Kalkofnsvegur 1, 101 Reykjavik",
        lat: 64.1512,
        lng: -21.9383,
        capacity: 550,
        hours: "07:00 - 00:00 daily",
        hoursIs: "07:00 - 00:00 alla daga",
        rates: "270 ISK first hour, 140 ISK/hr after",
        ratesIs: "270 kr. fyrsta klst, 140 kr./klst eftir það",
        firstHourRate: 270,
        hourlyRate: 140,
        type: "garage"
    },
    {
        id: 2,
        name: "Harpa / Hafnartorg Garage",
        nameIs: "Harpa / Hafnartorg bílageymsla",
        address: "Austurbakki 2, 101 Reykjavik",
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
        type: "garage"
    },
    {
        id: 3,
        name: "City Hall Garage",
        nameIs: "Ráðhúsbílageymsla",
        address: "Tjarnargata 11, 101 Reykjavik",
        lat: 64.1463,
        lng: -21.9420,
        capacity: 200,
        hours: "07:00 - 23:00",
        hoursIs: "07:00 - 23:00",
        rates: "250 ISK/hr",
        ratesIs: "250 kr./klst",
        firstHourRate: 250,
        hourlyRate: 250,
        type: "garage"
    },
    {
        id: 4,
        name: "Tradarkot Garage",
        nameIs: "Traðarkotsbílageymsla",
        address: "Hverfisgata 20, 101 Reykjavik",
        lat: 64.1475,
        lng: -21.9310,
        capacity: 300,
        hours: "07:00 - 23:00",
        hoursIs: "07:00 - 23:00",
        rates: "200 ISK/hr",
        ratesIs: "200 kr./klst",
        firstHourRate: 200,
        hourlyRate: 200,
        type: "garage"
    },
    {
        id: 5,
        name: "Stjornuport Garage",
        nameIs: "Stjörnuportsbílageymsla",
        address: "Laugavegur 94, 105 Reykjavik",
        lat: 64.1438,
        lng: -21.9120,
        capacity: 250,
        hours: "08:00 - 22:00",
        hoursIs: "08:00 - 22:00",
        rates: "185 ISK/hr",
        ratesIs: "185 kr./klst",
        firstHourRate: 185,
        hourlyRate: 185,
        type: "garage"
    },
    {
        id: 6,
        name: "Vitatorg Garage",
        nameIs: "Vitatorgsbílageymsla",
        address: "Skulagata / Vitastigur, 101 Reykjavik",
        lat: 64.1490,
        lng: -21.9250,
        capacity: 400,
        hours: "24/7",
        hoursIs: "Alltaf opið",
        rates: "250 ISK/hr",
        ratesIs: "250 kr./klst",
        firstHourRate: 250,
        hourlyRate: 250,
        type: "garage"
    },
    {
        id: 7,
        name: "Vesturgata Lot",
        nameIs: "Vesturgötustæði",
        address: "Vesturgata / Mjostraeti, 101 Reykjavik",
        lat: 64.1478,
        lng: -21.9450,
        capacity: 80,
        hours: "Street parking hours",
        hoursIs: "Götugjöld gilda",
        rates: "Zone P1 rates (270 ISK/hr)",
        ratesIs: "P1 svæðisgjöld (270 kr./klst)",
        firstHourRate: 270,
        hourlyRate: 270,
        type: "lot",
        zone: "p1"
    }
];

// Parking zones (approximate boundaries for downtown)
var rvkParkingZones = {
    p1: {
        name: "P1 - Central",
        nameIs: "P1 - Miðbær",
        color: "#ff6b6b",
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
        name: "P2 - Inner Ring",
        nameIs: "P2 - Innri hringur",
        color: "#ffd93d",
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
        name: "P3 - Outer Ring",
        nameIs: "P3 - Ytri hringur",
        color: "#6bcb77",
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
    var day = now.getDay(); // 0 = Sunday
    var hour = now.getHours();
    var minute = now.getMinutes();
    var time = hour + minute / 60;

    // Sunday = free all day
    if (day === 0) {
        return { free: true, until: null, reason: 'sunday' };
    }

    // Saturday: paid 10:00-16:00
    if (day === 6) {
        if (time < 10) {
            return { free: true, until: '10:00', reason: 'before_hours' };
        } else if (time >= 16) {
            return { free: true, until: null, reason: 'after_hours' };
        } else {
            return { free: false, until: '16:00', reason: 'paid_hours' };
        }
    }

    // Weekdays: paid 09:00-18:00
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

    var cost = 0;

    if (parking.firstHourRate && hours >= 1) {
        cost = parking.firstHourRate;
        var remainingHours = hours - 1;
        if (remainingHours > 0) {
            cost += Math.ceil(remainingHours) * parking.hourlyRate;
        }
    } else {
        cost = Math.ceil(hours) * parking.hourlyRate;
    }

    return cost;
}
