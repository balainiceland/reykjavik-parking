#!/usr/bin/env node
/**
 * Generate coworking-data.json from coworking-data.js
 * This JSON file is used by the CDN for dynamic loading
 *
 * Usage: node generate-json.js
 */

const fs = require('fs');
const path = require('path');

// Load the data
const dataPath = path.join(__dirname, '../js/coworking-data.js');
const data = require(dataPath);

// Create JSON structure
const jsonData = {
    spaces: data.icelandCoworkingSpaces,
    types: data.SPACE_TYPES,
    cities: data.CITIES,
    audiences: data.TARGET_AUDIENCES,
    amenities: data.AMENITIES,
    generated: new Date().toISOString(),
    version: '1.0.0'
};

// Write JSON file
const outputPath = path.join(__dirname, '../js/coworking-data.json');
fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));

console.log(`Generated ${outputPath}`);
console.log(`  - ${jsonData.spaces.length} co-working spaces`);
console.log(`  - ${jsonData.types.length} space types`);
console.log(`  - ${jsonData.cities.length} cities`);
console.log(`  - ${jsonData.audiences.length} target audiences`);
console.log(`  - ${jsonData.amenities.length} amenities`);
