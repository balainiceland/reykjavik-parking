#!/usr/bin/env node
/**
 * Generate JSON Data File
 *
 * Converts startups-data.js to startups-data.json for CDN loading
 *
 * Usage:
 *   node generate-json.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const jsPath = path.join(__dirname, '..', 'js', 'startups-data.js');
const jsonPath = path.join(__dirname, '..', 'js', 'startups-data.json');

console.log('=== Generate JSON Data ===\n');

// Read the JS file
const jsContent = fs.readFileSync(jsPath, 'utf8');

// Create a sandbox to execute the JS and extract the data
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(jsContent, sandbox);

// Extract the data
const data = {
    version: '1.6.0',
    lastUpdated: new Date().toISOString(),
    sectors: sandbox.STARTUP_SECTORS || [],
    statuses: sandbox.STARTUP_STATUSES || [],
    startups: sandbox.icelandStartups || []
};

// Write JSON file
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

console.log(`Generated: ${jsonPath}`);
console.log(`- Sectors: ${data.sectors.length}`);
console.log(`- Statuses: ${data.statuses.length}`);
console.log(`- Startups: ${data.startups.length}`);
console.log(`- Version: ${data.version}`);
console.log(`\nDone! Now commit and push to update the CDN.`);
