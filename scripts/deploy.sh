#!/usr/bin/env bash
# Deploy a git tag or branch to the Pi (D-29). Run on the Mac; it works over SSH.
# UNVERIFIED until run.
#
# Usage: bash scripts/deploy.sh <tag-or-branch>
#   Example: bash scripts/deploy.sh phase-0-foundations
#
# On the Pi it: stops if tracked files have local changes, fetches tags from origin
# (over HTTPS, so the Pi needs internet), checks the ref out detached, then runs
# `npm ci` and `npm run build` in each app folder listed in APPS below.
# It does not restart anything (Phase 0). Stop any running server first, because
# `npm ci` replaces node_modules, and start it again by hand afterwards.
#
# Settings come from the environment or from .env in the repo root (gitignored):
#   PI_HOST      required  the Pi's IP address (not hello-party.local)
#   PI_USER      required  login user on the Pi
#   PI_REPO_DIR  optional  repo folder in the Pi's home (default: hello-party)
# Only those three keys are read from .env. No passwords or tokens are handled here;
# ssh uses your own key or asks you itself.

set -euo pipefail

# App folders to install and build on the Pi. Later phases add lines here.
APPS="web/display"

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

if [ "$#" -ne 1 ]; then
  echo "usage: bash scripts/deploy.sh <tag-or-branch>" >&2
  exit 2
fi
ref="$1"

PI_HOST="${PI_HOST:-$(read_env PI_HOST)}"
PI_USER="${PI_USER:-$(read_env PI_USER)}"
PI_REPO_DIR="${PI_REPO_DIR:-$(read_env PI_REPO_DIR)}"
PI_REPO_DIR="${PI_REPO_DIR:-hello-party}"

# The ref and folder go into a command run on the Pi, so only plain characters are allowed.
ref_ok='^[A-Za-z0-9][A-Za-z0-9._/-]*$'
name_ok='^[A-Za-z0-9][A-Za-z0-9._-]*$'
[[ "$ref" =~ $ref_ok ]] || { echo "deploy: '$ref' is not a plain tag or branch name" >&2; exit 2; }
[ -n "$PI_HOST" ] || { echo "deploy: PI_HOST is not set (put it in .env or the environment)" >&2; exit 2; }
[ -n "$PI_USER" ] || { echo "deploy: PI_USER is not set (put it in .env or the environment)" >&2; exit 2; }
[[ "$PI_HOST" =~ $name_ok ]] || { echo "deploy: PI_HOST has unexpected characters" >&2; exit 2; }
[[ "$PI_USER" =~ $name_ok ]] || { echo "deploy: PI_USER has unexpected characters" >&2; exit 2; }
[[ "$PI_REPO_DIR" =~ $ref_ok ]] || { echo "deploy: PI_REPO_DIR has unexpected characters" >&2; exit 2; }

echo "deploy: $ref -> $PI_USER@$PI_HOST:~/$PI_REPO_DIR"

ssh -o ConnectTimeout=10 "$PI_USER@$PI_HOST" bash -s -- "$ref" "$PI_REPO_DIR" "$APPS" <<'REMOTE' \
  || { echo "deploy: FAILED (see the messages above)" >&2; exit 1; }
set -euo pipefail
ref="$1"; dir="$2"; apps="$3"
cd "$HOME/$dir"

if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "deploy: tracked files on the Pi have local changes; leaving them alone:" >&2
  git status --short --untracked-files=no >&2
  exit 1
fi

git fetch --tags origin

if git rev-parse -q --verify "refs/tags/$ref" >/dev/null; then
  target="refs/tags/$ref"
elif git rev-parse -q --verify "refs/remotes/origin/$ref" >/dev/null; then
  target="refs/remotes/origin/$ref"
else
  echo "deploy: '$ref' is not a tag or a branch on origin" >&2
  exit 1
fi
git checkout --detach "$target"

for app in $apps; do
  echo "deploy: npm ci and build in $app"
  (cd "$app" && npm ci && npm run build)
done

echo "deploy: the Pi is on $(git rev-parse --short HEAD) ($(git describe --tags --always))"
echo "deploy: nothing was restarted; restart any running server by hand"
REMOTE

echo "deploy: done"
