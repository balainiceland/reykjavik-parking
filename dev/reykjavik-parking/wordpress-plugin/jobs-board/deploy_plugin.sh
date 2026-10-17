#!/bin/bash
#
# Deploy the jobs board plugin to WordPress over SFTP.
#
# WHAT THIS DOES NOT DO
#   It does not ship job data. The board fetches jobs from jsDelivr at runtime,
#   so new postings reach the site without anything being deployed — that path
#   is already automatic and this script is irrelevant to it. This is only for
#   the rare change to the plugin's own code, which last happened in March.
#
# WHAT IT SHIPS
#   jobs-board.php, css/jobs-board.css, js/jobs-board.js — the three files the
#   plugin actually loads, and nothing else. The hand-built zip also carried
#   crawler.py, sources.txt, tools/ and two log files, all of which are
#   downloadable from the live site today:
#
#       curl https://startupiceland.com/wp-content/plugins/jobs-board/crawler.py
#
#   No credentials are in them, so this is untidiness rather than a breach, but
#   the scraper's source does not belong on a public web server.
#
# CREDENTIALS
#   Read from ~/.jobs-board-deploy.conf, which is deliberately outside the repo.
#   WordPress.com Business: Settings -> Hosting Configuration -> SFTP/SSH.
#   Add one of your public keys there; key auth avoids storing a password.
#
#       SFTP_HOST=sftp.wp.com
#       SFTP_USER=your.username
#       REMOTE_DIR=/htdocs/wp-content/plugins/jobs-board
#       VERIFY_URL=https://startupiceland.com/wp-content/plugins/jobs-board
#
#   Then ONE of:
#       SFTP_KEY=$HOME/.ssh/id_ed25519          # preferred: no secret on disk
#       SFTP_PASSWORD=the-generated-password     # what WordPress.com hands you
#
#   chmod 600 the file either way.
#
# Usage:
#   ./deploy_plugin.sh --check    what differs between local and live
#   ./deploy_plugin.sh            deploy if anything differs
#   ./deploy_plugin.sh --force    deploy regardless

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONF="${JOBS_BOARD_DEPLOY_CONF:-$HOME/.jobs-board-deploy.conf}"

# Exactly what the plugin loads. Verified against jobs-board.php:
#   plugin_dir_url(__FILE__) . 'css/jobs-board.css'
#   plugin_dir_url(__FILE__) . 'js/jobs-board.js'
FILES=(
    "jobs-board.php"
    "css/jobs-board.css"
    "js/jobs-board.js"
)

MODE="${1:-deploy}"

die() { echo "deploy: $*" >&2; exit 1; }

# ── Config ──────────────────────────────────────────────────────────────
if [ ! -f "$CONF" ]; then
    echo "deploy: not configured — $CONF does not exist."
    echo "deploy: skipping (this is not an error; the site's job data is"
    echo "deploy: unaffected and updates through the CDN regardless)."
    exit 0
fi
# shellcheck disable=SC1090
source "$CONF"
for v in SFTP_HOST SFTP_USER REMOTE_DIR; do
    [ -n "${!v:-}" ] || die "$v is not set in $CONF"
done
SFTP_KEY="${SFTP_KEY:-$HOME/.ssh/id_ed25519}"
VERIFY_URL="${VERIFY_URL:-}"

# What the site serves, bypassing its edge cache. WordPress.com caches plugin
# CSS/JS for a year (max-age=31536000), so a plain fetch right after an upload
# returns the old copy: on 2026-10-16 and -17 a deploy that had worked was
# reported as failed, and the next run re-sent the file for the same reason. A
# query string the cache has never seen is a guaranteed miss, served fresh.
live_sum() {
    curl -sf --max-time 20 "$VERIFY_URL/$1?verify=$(date +%s)$RANDOM" 2>/dev/null \
        | shasum -a 256 | cut -d' ' -f1
}

# ── What differs? ───────────────────────────────────────────────────────
# Compared against what the site is actually serving, not against a local
# record of what we believe we uploaded. A local manifest drifts the moment
# anyone touches the site by hand, and then reports success having sent
# nothing.
changed=()
if [ -n "$VERIFY_URL" ]; then
    for f in "${FILES[@]}"; do
        local_sum=$(shasum -a 256 "$SCRIPT_DIR/$f" 2>/dev/null | cut -d' ' -f1)
        [ -n "$local_sum" ] || die "missing local file: $f"

        # PHP is executed, not served, so it can never be compared this way.
        case "$f" in
            *.php) changed+=("$f"); continue ;;
        esac

        if [ "$local_sum" != "$(live_sum "$f")" ]; then
            changed+=("$f")
        fi
    done
else
    changed=("${FILES[@]}")
fi

if [ "$MODE" = "--check" ]; then
    if [ ${#changed[@]} -eq 0 ]; then
        echo "deploy: live site matches local — nothing to send."
    else
        echo "deploy: would send ${#changed[@]} file(s):"
        printf '  %s\n' "${changed[@]}"
        echo "deploy: (.php is always listed — PHP is executed, so it cannot be compared over HTTP)"
    fi
    exit 0
fi

if [ "$MODE" != "--force" ] && [ ${#changed[@]} -le 1 ] \
   && [ "${changed[0]:-}" = "jobs-board.php" ]; then
    echo "deploy: only the unverifiable .php differs — nothing else changed, skipping."
    echo "deploy: use --force to send it anyway."
    exit 0
fi

# ── Send ────────────────────────────────────────────────────────────────
BATCH=$(mktemp)
trap 'rm -f "$BATCH"' EXIT
{
    # A leading '-' tells sftp to carry on when the command fails. These exist
    # on any site that has ever had the plugin installed, so the failure is the
    # normal case and is silenced rather than reported as a problem.
    echo "-mkdir $REMOTE_DIR"
    echo "-mkdir $REMOTE_DIR/css"
    echo "-mkdir $REMOTE_DIR/js"
    for f in "${FILES[@]}"; do
        echo "put $SCRIPT_DIR/$f $REMOTE_DIR/$f"
    done
} > "$BATCH"

echo "deploy: sending ${#FILES[@]} file(s) to $SFTP_USER@$SFTP_HOST:$REMOTE_DIR"

# Two ways in. A key is preferable — nothing secret ends up on disk and it
# cannot be shoulder-surfed out of a config file — but WordPress.com issues a
# generated password by default, so that path is supported rather than making
# key setup a precondition for this working at all.
if [ -n "${SFTP_PASSWORD:-}" ]; then
    command -v expect >/dev/null || die "SFTP_PASSWORD is set but 'expect' is not installed.
     Either install expect, or switch to key auth by setting SFTP_KEY."
    expect -c "
        log_user 0
        set timeout 120
        spawn sftp -o StrictHostKeyChecking=accept-new -b $BATCH $SFTP_USER@$SFTP_HOST
        expect {
            -re {[Pp]assword:} { send \"$SFTP_PASSWORD\r\"; exp_continue }
            -re {denied|Permission denied} { exit 5 }
            timeout { exit 6 }
            eof
        }
        catch wait result
        exit [lindex \$result 3]
    "
    rc=$?
    case $rc in
        0) ;;
        5) die "SFTP rejected the password. Regenerate it under Hosting Configuration." ;;
        6) die "SFTP timed out connecting to $SFTP_HOST." ;;
        *) die "SFTP failed (exit $rc). Check SFTP_HOST, SFTP_USER and REMOTE_DIR in $CONF." ;;
    esac
else
    [ -f "$SFTP_KEY" ] || die "no SFTP_PASSWORD set and the key is missing: $SFTP_KEY"

    # A passphrase-protected key cannot be used unattended unless an agent is
    # holding it: BatchMode suppresses the prompt, ssh cannot sign, and the
    # server reports "Permission denied" — indistinguishable from a key it has
    # never heard of. That cost several rounds of debugging the wrong end.
    #
    # launchd does not inherit the ssh-agent from a login shell, so the nightly
    # run starts with an empty one even though it works by hand. Load the key
    # from the macOS Keychain, which is where its passphrase already lives.
    if ! ssh-keygen -y -P "" -f "$SFTP_KEY" >/dev/null 2>&1; then
        key_fp=$(ssh-keygen -lf "$SFTP_KEY" | awk '{print $2}')

        # Already available? Nothing to do.
        if ! ssh-add -l 2>/dev/null | grep -q "$key_fp"; then
            # Try the agent we inherited, if any.
            ssh-add --apple-load-keychain >/dev/null 2>&1 || true
        fi

        # Still nothing — most likely because launchd handed us no agent at
        # all, which is exactly the nightly case: SSH_AUTH_SOCK is a login
        # shell's, and a scheduled job does not get one. Start a private agent,
        # take the passphrase from the Keychain where it already lives, and
        # tear it down on the way out.
        if ! ssh-add -l 2>/dev/null | grep -q "$key_fp"; then
            eval "$(ssh-agent -s)" >/dev/null 2>&1
            OWN_AGENT=1
            trap 'rm -f "$BATCH" 2>/dev/null; [ -n "${OWN_AGENT:-}" ] && ssh-agent -k >/dev/null 2>&1' EXIT
            ssh-add --apple-load-keychain >/dev/null 2>&1 || true
        fi

        if ! ssh-add -l 2>/dev/null | grep -q "$key_fp"; then
            die "$(basename "$SFTP_KEY") has a passphrase, is not in any agent, and its
     passphrase is not in the Keychain. Store it once with:
         ssh-add --apple-use-keychain $SFTP_KEY
     (A locked login Keychain will also cause this.)"
        fi
    fi
    if ! sftp -q -o StrictHostKeyChecking=accept-new -o BatchMode=yes \
              -i "$SFTP_KEY" -b "$BATCH" "$SFTP_USER@$SFTP_HOST" \
              > /tmp/sftp-deploy.$$ 2>&1; then
        sed 's/^/deploy:   /' /tmp/sftp-deploy.$$ >&2; rm -f /tmp/sftp-deploy.$$
        die "SFTP failed. Check the credentials in $CONF, and that
     $(basename "$SFTP_KEY").pub is registered under Hosting Configuration."
    fi
    rm -f /tmp/sftp-deploy.$$
fi

# ── Confirm it landed ───────────────────────────────────────────────────
# An upload that reports success proves the bytes left this machine, not that
# the site is serving them.
if [ -n "$VERIFY_URL" ]; then
    sleep 3
    fail=0
    for f in "${FILES[@]}"; do
        case "$f" in *.php) continue ;; esac
        local_sum=$(shasum -a 256 "$SCRIPT_DIR/$f" | cut -d' ' -f1)
        if [ "$local_sum" = "$(live_sum "$f")" ]; then
            echo "deploy:   OK   $f"
        else
            echo "deploy:   FAIL $f — the site is not serving what was sent" >&2
            fail=1
        fi
    done
    [ "$fail" -eq 0 ] || die "deployment did not take effect"
fi

echo "deploy: done"
