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

# Surface a board that is hiding open jobs.
#
# Everything above is redirected into $LOG_FILE, so launchd_stderr.log stays
# empty on a healthy run. Writing the alarm to stderr HERE — outside that
# redirect — means a non-empty launchd_stderr.log is itself the signal, with
# no log-reading required.
#
# This is the check that was missing when the filled-detector matched the bare
# word 'expired' inside `"expired":false` and quietly killed every job posted
# over two weeks. The log read perfectly normally the whole time.
if grep -q "ARE LISTED LIVE ON THE SOURCE BUT SHOWN AS UNAVAILABLE" "$LOG_FILE"; then
    {
        echo "JOBS BOARD ALARM - $(date '+%Y-%m-%d %H:%M:%S')"
        sed -n '/ARE LISTED LIVE ON THE SOURCE BUT SHOWN AS UNAVAILABLE/,/^!\{10,\}$/p' "$LOG_FILE" | tail -40
        echo "Full log: $LOG_FILE"
    } >&2
fi

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

# Sync data to reykjavik-parking repo for CDN
SYNC_DIR="$HOME/.jobs-board-sync"
REPO_URL="git@github.com:balainiceland/reykjavik-parking.git"
DATA_PATH="dev/reykjavik-parking/wordpress-plugin/jobs-board"

# Clone or pull the sync repo
if [ -d "$SYNC_DIR/.git" ]; then
    cd "$SYNC_DIR" && git pull --ff-only origin master >> "$LOG_FILE" 2>&1
else
    git clone --branch master --single-branch "$REPO_URL" "$SYNC_DIR" >> "$LOG_FILE" 2>&1
    cd "$SYNC_DIR"
fi

# Copy updated data files
cp "$SCRIPT_DIR/js/jobs-data.js" "$SYNC_DIR/$DATA_PATH/js/jobs-data.js"
cp "$SCRIPT_DIR/js/jobs-data.json" "$SYNC_DIR/$DATA_PATH/js/jobs-data.json"
cp "$SCRIPT_DIR/scraped_jobs.json" "$SYNC_DIR/$DATA_PATH/scraped_jobs.json"

git add "$DATA_PATH/js/jobs-data.js" "$DATA_PATH/js/jobs-data.json" "$DATA_PATH/scraped_jobs.json"
if git diff --cached --quiet; then
    echo "No data changes to commit" >> "$LOG_FILE"
else
    git commit -m "Update jobs board data ($JOB_COUNT jobs)" >> "$LOG_FILE" 2>&1
    git push origin master >> "$LOG_FILE" 2>&1
    echo "Pushed updated jobs data to reykjavik-parking repo" >> "$LOG_FILE"
fi

cd "$SCRIPT_DIR"

echo "" >> "$LOG_FILE"
echo "Scraper completed at $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Keep only last 1000 lines of log
tail -1000 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
