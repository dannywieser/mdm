#!/usr/bin/env bash
# Bootstraps a standalone mdm install: downloads docker-compose.yml and an
# example config from GitHub (no repo clone required), then creates
# app.config.json and .env in a target directory if they don't exist yet.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/dannywieser/mdm/main/infra/docker/quickstart.sh | bash -s -- [target-dir]
#
# target-dir defaults to ./mdm. Set MDM_REF to pin a tag/branch/commit
# instead of main, e.g. MDM_REF=v1.0.0.
set -euo pipefail

REPO="dannywieser/mdm"
REF="${MDM_REF:-main}"
RAW_BASE="https://raw.githubusercontent.com/${REPO}/${REF}"
TARGET_DIR="${1:-mdm}"

mkdir -p "$TARGET_DIR"
cd "$TARGET_DIR"
TARGET_DIR="$(pwd)"

echo "Downloading docker-compose.yml and example config into ${TARGET_DIR} ..."
curl -fsSL "${RAW_BASE}/docker-compose.yml" -o docker-compose.yml
curl -fsSL "${RAW_BASE}/app.config.example.json" -o app.config.example.json

if [ -f app.config.json ]; then
  echo "${TARGET_DIR}/app.config.json already exists, leaving it as-is."
else
  cp app.config.example.json app.config.json
  echo "Created ${TARGET_DIR}/app.config.json from the example."
fi

if [ -f .env ]; then
  echo "${TARGET_DIR}/.env already exists, leaving it as-is."
else
  # NOTES_ROOT is the only value docker-compose.yml requires from .env; the
  # rest (obsidianVault, dateFormats, views, habits, ...) live in
  # app.config.json and are edited directly by the user.
  read -rp "Absolute path to your notes vault (NOTES_ROOT): " notes_root
  printf 'NOTES_ROOT=%s\n' "$notes_root" > .env
  echo "Created ${TARGET_DIR}/.env with NOTES_ROOT=${notes_root}"
fi

cat <<EOF

All files were created in: ${TARGET_DIR}

Next steps:
  1. cd ${TARGET_DIR}
  2. Double-check .env has NOTES_ROOT set to the absolute path of your notes
     vault - it's mounted read-only into the containers, so nothing will
     start correctly without it pointed at the right place.
  3. Edit app.config.json - set at least "obsidianVault", and review
     "dateFormats", "views", "habits", and "flags" for your vault.
  4. docker compose pull && docker compose up -d
  5. Open http://localhost

To update to newer images later, re-run step 4 from that directory.
EOF
