#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INTERLUDE_DIR="${INTERLUDE_DIR:-$HOME/dev/Interlude}"
SECRETS_FILE="$INTERLUDE_DIR/.secrets"
DOMAIN="learn.sumii.me"
WEB_DIR="/var/www/$DOMAIN/html"
API_DIR="/srv/learnhub/api"
SERVER_SRC="$ROOT/server/src"

SKIP_TYPECHECK=false
FRONTEND_ONLY=false
for arg in "$@"; do
  case "$arg" in
    --skip-typecheck) SKIP_TYPECHECK=true ;;
    --frontend-only) FRONTEND_ONLY=true ;;
    *) echo "usage: $0 [--frontend-only] [--skip-typecheck]" >&2; exit 1 ;;
  esac
done

DEPLOY_API=false
if [[ "$FRONTEND_ONLY" == false && -d "$SERVER_SRC" ]]; then DEPLOY_API=true; fi

if [[ ! -f "$SECRETS_FILE" ]]; then
  echo "$SECRETS_FILE not found (set INTERLUDE_DIR if Interlude lives elsewhere)" >&2
  exit 1
fi

set +x
source "$SECRETS_FILE"
: "${VPS_HOST:?VPS_HOST is not set in $SECRETS_FILE}"
: "${VPS_USER:?VPS_USER is not set in $SECRETS_FILE}"
: "${VPS_KEY:?VPS_KEY is not set in $SECRETS_FILE}"

KEY_FILE="$(mktemp)"
trap 'rm -f "$KEY_FILE"' EXIT
chmod 600 "$KEY_FILE"
printf '%s\n' "$VPS_KEY" > "$KEY_FILE"
unset VPS_KEY

SSH_OPTS=(-i "$KEY_FILE" -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=accept-new)
TARGET="$VPS_USER@$VPS_HOST"
remote() { ssh "${SSH_OPTS[@]}" "$TARGET" "$@"; }
sync() { rsync -az --delete -e "ssh ${SSH_OPTS[*]}" "$@"; }

echo "==> Building frontend"
cd "$ROOT"
npm ci --silent
if [[ "$SKIP_TYPECHECK" == true ]]; then
  npx vite build
else
  npm run build
fi

echo "==> Uploading frontend"
remote "mkdir -p $WEB_DIR"
sync "$ROOT/dist/" "$TARGET:$WEB_DIR/"

if [[ "$DEPLOY_API" == true ]]; then
  echo "==> Uploading API"
  remote "mkdir -p $API_DIR"
  sync --exclude '.venv' --exclude '__pycache__' --exclude '.env' --exclude 'requirements.txt' "$SERVER_SRC/" "$TARGET:$API_DIR/"
  if [[ -f "$ROOT/server/requirements.txt" ]]; then
    rsync -az -e "ssh ${SSH_OPTS[*]}" "$ROOT/server/requirements.txt" "$TARGET:$API_DIR/requirements.txt"
  fi
  remote "set -e
    cd $API_DIR
    [ -d .venv ] || python3 -m venv .venv
    .venv/bin/pip install -q --upgrade pip
    if [ -f requirements.txt ]; then .venv/bin/pip install -q -r requirements.txt; fi
    chown -R learnhub:learnhub /srv/learnhub
    systemctl enable --now learnhub-api
    systemctl restart learnhub-api"
fi

echo "==> Checking https://$DOMAIN"
status="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "https://$DOMAIN/")"
echo "frontend: $status"
if [[ "$DEPLOY_API" == true ]]; then
  sleep 2
  echo "api: $(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "https://$DOMAIN/api/")"
fi
[[ "$status" == "200" ]] || { echo "Frontend check failed" >&2; exit 1; }
echo "Deployed to https://$DOMAIN"
