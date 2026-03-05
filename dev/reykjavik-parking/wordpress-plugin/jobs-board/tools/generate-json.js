#!/usr/bin/env node
/**
 * Generate JSON Data File
 *
 * Converts jobs-data.js to jobs-data.json for CDN loading
 *
 * Usage:
 *   node generate-json.js
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const jsPath = path.join(__dirname, '..', 'js', 'jobs-data.js');
const jsonPath = path.join(__dirname, '..', 'js', 'jobs-data.json');

console.log('=== Generate Jobs JSON Data ===\n');

// Read the JS file
const jsContent = fs.readFileSync(jsPath, 'utf8');

// Create a sandbox to execute the JS and extract the data
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(jsContent, sandbox);

// Extract the data
const src = sandbox.StartupIcelandJobsData || {};
const data = {
    version: src.metadata ? src.metadata.version : '1.0.0',
    lastUpdated: new Date().toISOString(),
    metadata: src.metadata || {},
    categories: src.categories || {},
    types: src.types || {},
    levels: src.levels || {},
    remoteOptions: src.remoteOptions || {},
    jobs: src.jobs || []
};

// Write JSON file
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

console.log(`Generated: ${jsonPath}`);
console.log(`- Jobs: ${data.jobs.length}`);
console.log(`- Categories: ${Object.keys(data.categories).length}`);
console.log(`- Version: ${data.version}`);
console.log(`\nDone! Now commit and push to update the CDN.`);
