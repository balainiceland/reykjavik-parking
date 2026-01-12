# Startup Directory Tools

## process-submissions.js

Converts startup submissions from a simple text format to JavaScript code ready to paste into `startups-data.js`.

### Usage

```bash
# Process the default submissions file
node process-submissions.js

# Process a specific file
node process-submissions.js path/to/submissions.txt

# Output as JSON instead
node process-submissions.js --json

# Show help
node process-submissions.js --help
```

### Input Format

Create a text file with startup entries in this format:

```
Startup Name: Company Name
Website: https://example.com
Description: What the company does in one or two sentences
Founded Year: 2024
Sector: SaaS

Startup Name: Another Company
Website: example2.com
Description: Another description here
Founded Year: 2023
Sector: Gaming
```

Blank lines separate different startups. Field order doesn't matter.

### Supported Sectors

The script automatically maps common terms to our sector IDs:

| Input Terms | Maps To |
|-------------|---------|
| gaming, games, video games | gaming |
| fintech, financial, banking, payments | fintech |
| healthtech, biotech, medical, healthcare | healthtech |
| travel, tourism, hospitality | travel |
| saas, software, b2b saas, enterprise | saas |
| cleantech, energy, sustainability, climate | cleantech |
| food, foodtech, consumer, agtech | food |
| media, entertainment, streaming, anime | media |
| maritime, marine, blue economy, ocean | maritime |
| retail, commerce, ecommerce | retail |
| security, identity, cybersecurity | security |
| data, analytics, ai, machine learning | data |
| edtech, education, learning | edtech |
| hrtech, hr, recruitment, talent | hrtech |
| (unrecognized) | other |

### Output

The script outputs:
1. A summary of parsed startups
2. Formatted JavaScript code to paste into `startups-data.js`
3. The next available ID

### Workflow

1. Collect submissions in a text file (or keep adding to `Startup_submissions_1.txt`)
2. Run: `node tools/process-submissions.js`
3. Review the parsed output
4. Copy the formatted JS code
5. Paste into `js/startups-data.js` before the closing `];`
6. Commit and push
