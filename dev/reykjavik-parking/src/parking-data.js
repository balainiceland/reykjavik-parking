// Reykjavik Downtown Parking Data
// Coordinates for downtown Reykjavik parking locations

const REYKJAVIK_CENTER = [64.1466, -21.9426];

const parkingGarages = [
    {
        id: 1,
        name: "Kolaport Parking Garage",
        address: "Kalkofnsvegur 1, 101 Reykjavik",
        lat: 64.1512,
        lng: -21.9383,
        capacity: 550,
        hours: "07:00 - 00:00 daily",
        rates: "270 ISK first hour, 140 ISK/hr after",
        type: "garage"
    },
    {
        id: 2,
        name: "Harpa / Hafnartorg Garage",
        address: "Austurbakki 2, 101 Reykjavik",
        lat: 64.1503,
        lng: -21.9328,
        capacity: 1000,
        hours: "24/7",
        rates: "370 ISK/hr (08-18), 140 ISK/hr (18-08)",
        type: "garage"
    },
    {
        id: 3,
        name: "City Hall Garage",
        address: "Tjarnargata 11, 101 Reykjavik",
        lat: 64.1463,
        lng: -21.9420,
        capacity: 200,
        hours: "07:00 - 23:00",
        rates: "250 ISK/hr",
        type: "garage"
    },
    {
        id: 4,
        name: "Traðarkot Garage",
        address: "Hverfisgata 20, 101 Reykjavik",
        lat: 64.1475,
        lng: -21.9310,
        capacity: 300,
        hours: "07:00 - 23:00",
        rates: "200 ISK/hr",
        type: "garage"
    },
    {
        id: 5,
        name: "Stjörnuport Garage",
        address: "Laugavegur 94, 105 Reykjavik",
        lat: 64.1438,
        lng: -21.9120,
        capacity: 250,
        hours: "08:00 - 22:00",
        rates: "185 ISK/hr",
        type: "garage"
    },
    {
        id: 6,
        name: "Vitatorg Garage",
        address: "Skúlagata / Vitastígur, 101 Reykjavik",
        lat: 64.1490,
        lng: -21.9250,
        capacity: 400,
        hours: "24/7",
        rates: "250 ISK/hr",
        type: "garage"
    },
    {
        id: 7,
        name: "Vesturgata Lot",
        address: "Vesturgata / Mjóstræti, 101 Reykjavik",
        lat: 64.1478,
        lng: -21.9450,
        capacity: 80,
        hours: "Street parking hours",
        rates: "Zone P1 rates",
        type: "lot"
    }
];

// Parking zones (approximate boundaries for downtown)
const parkingZones = {
    p1: {
        name: "P1 - Central",
        color: "#ff6b6b",
        rate: "270 ISK/hr",
        hours: "Mon-Fri 09:00-18:00, Sat 10:00-16:00",
        bounds: [
            [64.1495, -21.9500],
            [64.1495, -21.9350],
            [64.1445, -21.9350],
            [64.1445, -21.9500]
        ]
    },
    p2: {
        name: "P2 - Inner Ring",
        color: "#ffd93d",
        rate: "185 ISK/hr",
        hours: "Mon-Fri 09:00-18:00, Sat 10:00-16:00",
        bounds: [
            [64.1520, -21.9550],
            [64.1520, -21.9280],
            [64.1430, -21.9280],
            [64.1430, -21.9550]
        ]
    },
    p3: {
        name: "P3 - Outer Ring",
        color: "#6bcb77",
        rate: "125 ISK/hr",
        hours: "Mon-Fri 09:00-18:00, Sat 10:00-16:00",
        bounds: [
            [64.1550, -21.9600],
            [64.1550, -21.9100],
            [64.1400, -21.9100],
            [64.1400, -21.9600]
        ]
    }
};

// Statistics from open data (2026)
const parkingStats = {
    year: 2026,
    publicGarage: { paid: 3334, free: 0 },
    streetParking: { paid: 1201, free: 471 },
    privateGarage: { paid: 0, free: 1754 },
    lotParking: { paid: 169, free: 1062 }
};
