#!/bin/bash
# Startup Iceland Jobs Scraper - Daily Scheduled Job
# Runs the job scraper and logs output
# Triggered by launchd: ~/Library/LaunchAgents/com.startupiceland.jobscraper.plist

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$SCRIPT_DIR/scraper_log.txt"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Explicit paths for launchd (no login shell PATH)
PYTHON="/opt/anaconda3/bin/python3"
NODE="/usr/local/bin/node"

echo "========================================" >> "$LOG_FILE"
echo "Scraper run: $DATE" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

# Change to script directory
cd "$SCRIPT_DIR"

# Run the scraper with playwright, merge, and verify existing jobs
$PYTHON startup_job_scraper.py --playwright --merge --verify >> "$LOG_FILE" 2>&1

# Check if new jobs were added
if grep -q "Successfully added" "$LOG_FILE" | tail -1; then
    echo "New jobs found - regenerating zip..." >> "$LOG_FILE"
    rm -f jobs-board.zip
    zip -r jobs-board.zip . -x "*.pyc" -x "__pycache__/*" -x "*.json" -x "startup_job_scraper.py" -x ".DS_Store" -x "run_scraper.sh" -x "scraper_log.txt" >> "$LOG_FILE" 2>&1
    echo "Zip regenerated at $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"
fi

# Generate JSON for CDN
echo "Generating jobs-data.json for CDN..." >> "$LOG_FILE"
$NODE "$SCRIPT_DIR/tools/generate-json.js" >> "$LOG_FILE" 2>&1

# Count jobs for commit message
JOB_COUNT=$($NODE -e "const d = require('$SCRIPT_DIR/js/jobs-data.json'); console.log(d.jobs.length)" 2>/dev/null || echo "unknown")

# Git commit and push to update CDN
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$REPO_ROOT"

git add "$SCRIPT_DIR/js/jobs-data.js" "$SCRIPT_DIR/js/jobs-data.json" "$SCRIPT_DIR/scraped_jobs.json"
if git diff --cached --quiet; then
    echo "No data changes to commit" >> "$LOG_FILE"
else
    git commit -m "Update jobs board data ($JOB_COUNT jobs)" >> "$LOG_FILE" 2>&1
    git push origin master >> "$LOG_FILE" 2>&1
    echo "Pushed updated jobs data to GitHub" >> "$LOG_FILE"
fi

cd "$SCRIPT_DIR"

echo "" >> "$LOG_FILE"
echo "Scraper completed at $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Keep only last 1000 lines of log
tail -1000 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
