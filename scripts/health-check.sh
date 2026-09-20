#!/usr/bin/env bash
# Report whether the server answers. Run on the Mac. UNVERIFIED until run.
#
# Usage: bash scripts/health-check.sh
# Prints "OK: ..." and exits 0 when the URL answers with HTTP 2xx within 5 seconds.
# Otherwise prints "FAIL: ..." and exits 1. It checks nothing else (not the page contents).
#
# The URL is HEALTH_URL if set, else http://PI_HOST:PORT/api/health, with PI_HOST and PORT
# read from the environment or .env in the repo root (PORT defaults to 3000).
# /api/health does not exist until Phase 2, so in Phase 0 test against the preview server:
#   HEALTH_URL=http://192.168.1.203:4173/ bash scripts/health-check.sh
# Never put tokens or passwords in the URL.

set -u

script_dir="$(cd "$(dirname "$0")" && pwd)"
env_file="$script_dir/../.env"

read_env() {
  local key="$1" val=""
  if [ -f "$env_file" ]; then
    val="$(grep -E "^${key}=" "$env_file" | tail -n 1 | cut -d= -f2- | tr -d '\r' || true)"
  fi
  val="${val#\"}"; val="${val%\"}"; val="${val#\'}"; val="${val%\'}"
  printf '%s' "$val"
}

url="${HEALTH_URL:-}"
if [ -z "$url" ]; then
  PI_HOST="${PI_HOST:-$(read_env PI_HOST)}"
  PORT="${PORT:-$(read_env PORT)}"
  PORT="${PORT:-3000}"
  if [ -z "$PI_HOST" ]; then
    echo "FAIL: no HEALTH_URL and PI_HOST is not set (put it in .env or the environment)"
    exit 1
  fi
  url="http://$PI_HOST:$PORT/api/health"
fi

if code="$(curl -s -o /dev/null --max-time 5 -w '%{http_code}' "$url")"; then
  rc=0
else
  rc=$?
fi

if [ "$rc" -ne 0 ]; then
  echo "FAIL: no answer from $url (curl exit $rc; 7 = connection refused, 28 = timed out)"
  exit 1
fi

case "$code" in
  2??)
    echo "OK: $url answered $code"
    exit 0
    ;;
  *)
    echo "FAIL: $url answered $code"
    exit 1
    ;;
esac
