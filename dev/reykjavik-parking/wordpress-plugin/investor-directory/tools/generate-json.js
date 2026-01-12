#!/usr/bin/env node
/**
 * Generate JSON Data File for Investors
 *
 * Converts investors-data.js to investors-data.json for CDN loading
 *
 * Usage:
 *   node generate-json.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const jsPath = path.join(__dirname, '..', 'js', 'investors-data.js');
const jsonPath = path.join(__dirname, '..', 'js', 'investors-data.json');

console.log('=== Generate Investor JSON Data ===\n');

// Read the JS file
const jsContent = fs.readFileSync(jsPath, 'utf8');

// Create a sandbox to execute the JS and extract the data
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(jsContent, sandbox);

// Extract the data
const data = {
    version: '1.1.0',
    lastUpdated: new Date().toISOString(),
    types: sandbox.INVESTOR_TYPES || [],
    stages: sandbox.INVESTMENT_STAGES || [],
    sectors: sandbox.SECTOR_FOCUS || [],
    investors: sandbox.icelandInvestors || []
};

// Write JSON file
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

console.log(`Generated: ${jsonPath}`);
console.log(`- Types: ${data.types.length}`);
console.log(`- Stages: ${data.stages.length}`);
console.log(`- Sectors: ${data.sectors.length}`);
console.log(`- Investors: ${data.investors.length}`);
console.log(`- Version: ${data.version}`);
console.log(`\nDone! Now commit and push to update the CDN.`);
