#!/usr/bin/env node
/**
 * Startup Submission Processor
 *
 * Reads startup submissions from a text file and converts them to the
 * JavaScript format needed for startups-data.js
 *
 * Usage:
 *   node process-submissions.js                    # Process default file
 *   node process-submissions.js submissions.txt   # Process specific file
 *   node process-submissions.js --help            # Show help
 */

const fs = require('fs');
const path = require('path');

// Sector mapping - maps common terms to our sector IDs
const SECTOR_MAP = {
    // Gaming
    'gaming': 'gaming',
    'games': 'gaming',
    'game': 'gaming',
    'video games': 'gaming',

    // Fintech
    'fintech': 'fintech',
    'financial': 'fintech',
    'finance': 'fintech',
    'banking': 'fintech',
    'payments': 'fintech',

    // Healthtech
    'healthtech': 'healthtech',
    'health tech': 'healthtech',
    'biotech': 'healthtech',
    'biotechnology': 'healthtech',
    'healthcare': 'healthtech',
    'medical': 'healthtech',
    'life sciences': 'healthtech',

    // Travel
    'travel': 'travel',
    'tourism': 'travel',
    'travel tech': 'travel',
    'hospitality': 'travel',

    // SaaS
    'saas': 'saas',
    'software': 'saas',
    'b2b saas': 'saas',
    'enterprise': 'saas',

    // Cleantech
    'cleantech': 'cleantech',
    'clean tech': 'cleantech',
    'energy': 'cleantech',
    'sustainability': 'cleantech',
    'climate': 'cleantech',
    'climate tech': 'cleantech',
    'green tech': 'cleantech',

    // Food
    'food': 'food',
    'foodtech': 'food',
    'food tech': 'food',
    'consumer': 'food',
    'agtech': 'food',
    'agriculture': 'food',

    // Media
    'media': 'media',
    'entertainment': 'media',
    'media/entertainment': 'media',
    'content': 'media',
    'streaming': 'media',
    'anime': 'media',

    // Maritime
    'maritime': 'maritime',
    'marine': 'maritime',
    'blue economy': 'maritime',
    'ocean': 'maritime',
    'fisheries': 'maritime',
    'aquaculture': 'maritime',

    // Retail
    'retail': 'retail',
    'commerce': 'retail',
    'ecommerce': 'retail',
    'e-commerce': 'retail',

    // Security
    'security': 'security',
    'identity': 'security',
    'cybersecurity': 'security',
    'cyber': 'security',

    // Data
    'data': 'data',
    'analytics': 'data',
    'ai': 'data',
    'machine learning': 'data',
    'ml': 'data',

    // EdTech
    'edtech': 'edtech',
    'education': 'edtech',
    'learning': 'edtech',

    // HR Tech
    'hrtech': 'hrtech',
    'hr tech': 'hrtech',
    'hr': 'hrtech',
    'recruitment': 'hrtech',
    'talent': 'hrtech',

    // Other
    'other': 'other',
    'community': 'other',
    'community systems': 'other',
    'proptech': 'other',
    'real estate': 'other'
};

function showHelp() {
    console.log(`
Startup Submission Processor
=============================

Converts startup submissions from text format to JavaScript format.

USAGE:
  node process-submissions.js [options] [file]

OPTIONS:
  --help, -h     Show this help message
  --append, -a   Append directly to startups-data.js (careful!)
  --json         Output as JSON instead of JS

EXAMPLES:
  node process-submissions.js
  node process-submissions.js ../Startup_submissions_1.txt
  node process-submissions.js submissions.txt --json

INPUT FORMAT:
  Each startup should have these fields (order doesn't matter):

  Startup Name: Company Name
  Website: https://example.com
  Description: What the company does
  Founded Year: 2024
  Sector: SaaS

  Blank lines separate different startups.
`);
}

function mapSector(sectorInput) {
    if (!sectorInput) return 'other';
    const normalized = sectorInput.toLowerCase().trim();
    return SECTOR_MAP[normalized] || 'other';
}

function parseYear(yearInput) {
    if (!yearInput) return new Date().getFullYear();

    // Extract just the year if there's extra text
    const match = yearInput.match(/\b(19|20)\d{2}\b/);
    if (match) {
        return parseInt(match[0], 10);
    }

    const parsed = parseInt(yearInput, 10);
    return isNaN(parsed) ? new Date().getFullYear() : parsed;
}

function cleanUrl(url) {
    if (!url || url.trim() === '') return null;
    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    return url;
}

function cleanDescription(desc) {
    if (!desc) return '';
    // Remove extra whitespace and newlines
    return desc.trim().replace(/\s+/g, ' ');
}

function parseSubmissions(content) {
    const startups = [];

    // Split by double newlines or by "Startup Name:" pattern
    const blocks = content.split(/\n\s*\n|\n(?=Startup Name:)/i).filter(b => b.trim());

    for (const block of blocks) {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l);
        const startup = {};

        for (const line of lines) {
            const colonIndex = line.indexOf(':');
            if (colonIndex === -1) continue;

            const key = line.substring(0, colonIndex).toLowerCase().trim();
            const value = line.substring(colonIndex + 1).trim();

            if (key.includes('name') && key.includes('startup')) {
                startup.name = value;
            } else if (key === 'website' || key === 'url') {
                startup.website = cleanUrl(value);
            } else if (key === 'description') {
                startup.description = cleanDescription(value);
            } else if (key.includes('year') || key.includes('founded')) {
                startup.foundedYear = parseYear(value);
            } else if (key === 'sector' || key === 'industry') {
                startup.sector = mapSector(value);
            } else if (key === 'status') {
                startup.status = value.toLowerCase().includes('acquir') ? 'acquired' :
                                value.toLowerCase().includes('exit') ? 'exited' : 'active';
            } else if (key.includes('acquired')) {
                startup.acquiredBy = value || null;
            }
        }

        // Only add if we have at least a name
        if (startup.name) {
            // Set defaults
            startup.sector = startup.sector || 'other';
            startup.status = startup.status || 'active';
            startup.acquiredBy = startup.acquiredBy || null;
            startup.foundedYear = startup.foundedYear || new Date().getFullYear();
            startup.description = startup.description || '';

            startups.push(startup);
        }
    }

    return startups;
}

function getNextId(dataFilePath) {
    try {
        const content = fs.readFileSync(dataFilePath, 'utf8');
        const matches = content.match(/id:\s*(\d+)/g);
        if (matches) {
            const ids = matches.map(m => parseInt(m.replace(/id:\s*/, ''), 10));
            return Math.max(...ids) + 1;
        }
    } catch (e) {
        // File doesn't exist or can't be read
    }
    return 1;
}

function formatAsJS(startups, startId) {
    let output = '\n    // === NEW SUBMISSIONS ===\n';

    startups.forEach((startup, index) => {
        const id = startId + index;
        const website = startup.website ? `"${startup.website}"` : 'null';
        const acquiredBy = startup.acquiredBy ? `"${startup.acquiredBy}"` : 'null';
        const description = startup.description.replace(/"/g, '\\"');

        output += `    {
        id: ${id},
        name: "${startup.name}",
        description: "${description}",
        website: ${website},
        sector: "${startup.sector}",
        status: "${startup.status}",
        acquiredBy: ${acquiredBy},
        foundedYear: ${startup.foundedYear}
    }`;

        if (index < startups.length - 1) {
            output += ',\n';
        }
    });

    return output;
}

function formatAsJSON(startups, startId) {
    return JSON.stringify(startups.map((s, i) => ({ id: startId + i, ...s })), null, 2);
}

// Main execution
function main() {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        showHelp();
        process.exit(0);
    }

    const asJson = args.includes('--json');
    const shouldAppend = args.includes('--append') || args.includes('-a');

    // Find the input file
    let inputFile = args.find(a => !a.startsWith('-'));
    if (!inputFile) {
        inputFile = path.join(__dirname, '..', 'Startup_submissions_1.txt');
    }

    // Resolve paths
    const dataFile = path.join(__dirname, '..', 'js', 'startups-data.js');

    // Check if input file exists
    if (!fs.existsSync(inputFile)) {
        console.error(`Error: Input file not found: ${inputFile}`);
        console.error('\nCreate a submissions file with this format:');
        console.error(`
Startup Name: Example Company
Website: https://example.com
Description: What the company does
Founded Year: 2024
Sector: SaaS
`);
        process.exit(1);
    }

    // Read and parse
    const content = fs.readFileSync(inputFile, 'utf8');
    const startups = parseSubmissions(content);

    if (startups.length === 0) {
        console.log('No startups found in the input file.');
        process.exit(0);
    }

    // Get next ID
    const nextId = getNextId(dataFile);

    console.log(`\n=== Startup Submission Processor ===\n`);
    console.log(`Found ${startups.length} startup(s) in: ${inputFile}`);
    console.log(`Next ID: ${nextId}\n`);

    // Show parsed startups
    console.log('Parsed Startups:');
    console.log('----------------');
    startups.forEach((s, i) => {
        console.log(`${i + 1}. ${s.name}`);
        console.log(`   Sector: ${s.sector} | Year: ${s.foundedYear} | Status: ${s.status}`);
        console.log(`   Website: ${s.website || '(none)'}`);
        console.log(`   Description: ${s.description.substring(0, 60)}${s.description.length > 60 ? '...' : ''}`);
        console.log('');
    });

    // Output formatted code
    console.log('\n=== Formatted Output ===\n');

    if (asJson) {
        console.log(formatAsJSON(startups, nextId));
    } else {
        console.log('Add this to startups-data.js (before the closing ];):');
        console.log('------------------------------------------------------');
        console.log(formatAsJS(startups, nextId));
        console.log('\n------------------------------------------------------');
    }

    if (shouldAppend) {
        console.log('\n--append flag detected. This feature is not yet implemented.');
        console.log('Please manually copy the output above into startups-data.js');
    }

    console.log(`\nTotal startups after adding: ${nextId + startups.length - 1}`);
}

main();
