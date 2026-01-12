#!/bin/bash
#
# Update Data Files
#
# Regenerates JSON data files for both directories and pushes to GitHub.
# The CDN (jsDelivr) will automatically update within ~24 hours.
#
# Usage:
#   ./update-data.sh                 # Generate JSON + commit + push
#   ./update-data.sh --no-push       # Generate JSON only, don't push
#

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
NO_PUSH=false

if [[ "$1" == "--no-push" ]]; then
    NO_PUSH=true
fi

echo "========================================"
echo "  Startup Iceland Data Update"
echo "========================================"
echo ""

# Generate startup JSON
echo "1. Generating startup data JSON..."
cd "$SCRIPT_DIR/startup-directory"
node tools/generate-json.js
echo ""

# Generate investor JSON
echo "2. Generating investor data JSON..."
cd "$SCRIPT_DIR/investor-directory"
node tools/generate-json.js
echo ""

# Git operations
cd "$SCRIPT_DIR/.."

echo "3. Checking for changes..."
if git diff --quiet startup-directory investor-directory 2>/dev/null; then
    echo "   No changes detected."
else
    echo "   Changes found. Staging files..."
    git add wordpress-plugin/startup-directory/js/startups-data.json
    git add wordpress-plugin/investor-directory/js/investors-data.json
    git add wordpress-plugin/startup-directory/js/startups-data.js
    git add wordpress-plugin/investor-directory/js/investors-data.js

    echo ""
    echo "4. Creating commit..."
    STARTUP_COUNT=$(node -e "console.log(require('./wordpress-plugin/startup-directory/js/startups-data.json').startups.length)")
    INVESTOR_COUNT=$(node -e "console.log(require('./wordpress-plugin/investor-directory/js/investors-data.json').investors.length)")

    git commit -m "Update directory data (${STARTUP_COUNT} startups, ${INVESTOR_COUNT} investors)

Auto-generated JSON data files for CDN loading.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

    if [ "$NO_PUSH" = false ]; then
        echo ""
        echo "5. Pushing to GitHub..."
        git push origin master
        echo ""
        echo "========================================"
        echo "  Done! CDN will update within ~24 hours"
        echo "  (or purge cache at jsdelivr.com)"
        echo "========================================"
    else
        echo ""
        echo "========================================"
        echo "  Done! (--no-push: skipped git push)"
        echo "========================================"
    fi
fi

echo ""
echo "Startup Directory: $STARTUP_COUNT startups"
echo "Investor Directory: $INVESTOR_COUNT investors"
