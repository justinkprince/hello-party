#!/usr/bin/env bash
# Start the TV display in Chromium kiosk mode on the Pi (labwc, Wayland).
# Waits for the server to answer its health check, then replaces itself with Chromium.
# UNVERIFIED until run on the Pi. Run it with `bash scripts/kiosk.sh` (no exec bit needed).
#
# Environment overrides (handy for testing before the server exists):
#   DISPLAY_URL        page to open   (default http://localhost:3000/display/)
#   HEALTH_URL         URL to wait on (default http://localhost:3000/api/health)
#   KIOSK_WAIT_SECONDS how long to wait before opening anyway (default 120)
#
# Secrets never go in the URL. The display's local token is read by the server side later.

set -u

DISPLAY_URL="${DISPLAY_URL:-http://localhost:3000/display/}"
HEALTH_URL="${HEALTH_URL:-http://localhost:3000/api/health}"
WAIT_SECONDS="${KIOSK_WAIT_SECONDS:-120}"

waited=0
until curl -fsS -o /dev/null --max-time 2 "$HEALTH_URL"; do
  waited=$((waited + 1))
  if [ "$waited" -ge "$WAIT_SECONDS" ]; then
    echo "kiosk: $HEALTH_URL did not answer after ${WAIT_SECONDS}s; opening the display anyway" >&2
    break
  fi
  sleep 1
done

exec chromium "$DISPLAY_URL" \
  --ozone-platform=wayland \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --no-first-run \
  --password-store=basic \
  --autoplay-policy=no-user-gesture-required \
  --disable-features=CrashRecoveryBubble
