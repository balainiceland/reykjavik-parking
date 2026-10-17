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

# Everything below greps the log for things THIS run said. scraper_log.txt is
# appended to forever, so grepping the whole file finds any run that ever said
# it — "Successfully added" has been true since the first successful merge in
# February regardless of what tonight did. Record where this run starts and
# read only from there.
LOG_OFFSET=$(( $(wc -c < "$LOG_FILE" 2>/dev/null || echo 0) + 1 ))

# Run the scraper with playwright, merge, and verify existing jobs
$PYTHON startup_job_scraper.py --playwright --merge --verify >> "$LOG_FILE" 2>&1

# This run's output, and nothing earlier.
this_run() { tail -c "+$LOG_OFFSET" "$LOG_FILE"; }

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
if this_run | grep -q "ARE LISTED LIVE ON THE SOURCE BUT SHOWN AS UNAVAILABLE"; then
    {
        echo "JOBS BOARD ALARM - $(date '+%Y-%m-%d %H:%M:%S')"
        this_run | sed -n '/ARE LISTED LIVE ON THE SOURCE BUT SHOWN AS UNAVAILABLE/,/^!\{10,\}$/p' | tail -40
        echo "Full log: $LOG_FILE"
    } >&2
fi

# Check if new jobs were added
# `grep -q X | tail -1` tested tail's exit status, which is always 0, so the
# zip was rebuilt on every run whether or not anything changed.
if this_run | grep -q "Successfully added"; then
    echo "New jobs found - regenerating zip..." >> "$LOG_FILE"
    rm -f jobs-board.zip
    zip -r jobs-board.zip . -x "*.pyc" -x "__pycache__/*" -x "*.json" -x "startup_job_scraper.py" -x ".DS_Store" -x "run_scraper.sh" -x "scraper_log.txt" -x "*.log" >> "$LOG_FILE" 2>&1
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

    # Tell jsDelivr the file changed.
    #
    # The board reads its data from cdn.jsdelivr.net/gh/...@master. A branch
    # reference is mutable, so jsDelivr serves it with s-maxage=43200 — the
    # edge holds yesterday's jobs for TWELVE HOURS after the push, and the
    # browser copy (max-age=604800) for a week. Pushing alone therefore does
    # not update the site; it only makes the new data eligible to appear
    # eventually. One purge call makes the push take effect immediately.
    PURGE="https://purge.jsdelivr.net/gh/balainiceland/reykjavik-parking@master/$DATA_PATH/js/jobs-data.json"
    if curl -sf --max-time 30 "$PURGE" >> "$LOG_FILE" 2>&1; then
        echo "" >> "$LOG_FILE"
        echo "Purged jsDelivr cache — new data is live now" >> "$LOG_FILE"
    else
        echo "" >> "$LOG_FILE"
        echo "WARNING: jsDelivr purge failed; the site will pick the data up within 12h" >> "$LOG_FILE"
    fi
fi

cd "$SCRIPT_DIR"

# Deploy the plugin's own code if it changed.
#
# Job data does NOT go through here — it reaches the site via jsDelivr and is
# already live by this point. This only catches a change to the PHP, CSS or JS,
# which happens a few times a year. The script compares against what the site
# is actually serving and does nothing when they match, so running it nightly
# costs three HTTP requests.
#
# It exits 0 and does nothing when ~/.jobs-board-deploy.conf is absent, so an
# unconfigured machine does not turn this into a failing run.
if [ -x "$SCRIPT_DIR/deploy_plugin.sh" ]; then
    echo "" >> "$LOG_FILE"
    "$SCRIPT_DIR/deploy_plugin.sh" >> "$LOG_FILE" 2>&1 || {
        echo "WARNING: plugin deploy failed — the site is still serving the" >> "$LOG_FILE"
        echo "previous plugin code. Job data is unaffected." >> "$LOG_FILE"
        {
            echo "JOBS BOARD: plugin deploy failed - $(date '+%Y-%m-%d %H:%M:%S')"
            this_run | tail -12
        } >&2
    }
fi

echo "" >> "$LOG_FILE"
echo "Scraper completed at $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Keep only last 1000 lines of log
tail -1000 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
