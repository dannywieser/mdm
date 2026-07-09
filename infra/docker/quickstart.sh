#!/usr/bin/env bash
# Bootstraps a standalone mdm install: downloads docker-compose.yml and an
# example config from GitHub (no repo clone required), then creates
# app.config.json and .env in a target directory if they don't exist yet.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/dannywieser/mdm/main/infra/docker/quickstart.sh | bash -s -- [target-dir]
#
# target-dir defaults to ./mdm. Set MDM_REF to pin a tag/branch/commit
# instead of main, e.g. MDM_REF=v1.0.0. Set NOTES_ROOT to skip the
# interactive prompt (required when there's no controlling terminal to
# prompt against), e.g. NOTES_ROOT="/absolute/path/to/vault".
set -euo pipefail

REPO="dannywieser/mdm"
REF="${MDM_REF:-main}"
RAW_BASE="https://raw.githubusercontent.com/${REPO}/${REF}"
TARGET_DIR="${1:-mdm}"

mkdir -p -- "$TARGET_DIR"
# bash's cd special-cases a bare "-" as $OLDPWD even with "--" before it, so
# a target dir literally named "-" needs a "./" prefix to read as a normal
# relative path instead (absolute paths are unaffected by this).
case "$TARGET_DIR" in
  /*) cd -- "$TARGET_DIR" ;;
  *) cd -- "./$TARGET_DIR" ;;
esac
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
  # rest (obsidianVault, dateFormats, views, flags, ...) live in
  # app.config.json and are edited directly by the user.
  notes_root="${NOTES_ROOT:-}"
  if [ -z "$notes_root" ]; then
    # /dev/tty can exist as a device node with no controlling terminal
    # attached (e.g. CI, a non-interactive `bash -c`), so actually try to
    # open it rather than just checking for its existence.
    if ! ( : < /dev/tty ) 2>/dev/null; then
      echo "No terminal available to prompt for NOTES_ROOT - set it as an" >&2
      echo "environment variable instead, e.g.:" >&2
      echo "  curl -fsSL ${RAW_BASE}/infra/docker/quickstart.sh | NOTES_ROOT=\"/absolute/path/to/vault\" bash -s -- \"${TARGET_DIR}\"" >&2
      exit 1
    fi
    while true; do
      # Read from the controlling terminal, not this script's own stdin -
      # when piped via `curl | bash`, stdin is already consumed by bash
      # reading the script itself, so a plain `read` here never sees input.
      read -rp "Absolute path to your notes vault (NOTES_ROOT): " notes_root < /dev/tty
      case "$notes_root" in
        /*) break ;;
        *) echo "NOTES_ROOT must be an absolute path (starting with /)." ;;
      esac
    done
  elif [ "${notes_root#/}" = "$notes_root" ]; then
    echo "NOTES_ROOT must be an absolute path (starting with /): ${notes_root}" >&2
    exit 1
  fi
  if [ ! -d "$notes_root" ]; then
    echo "Warning: ${notes_root} doesn't exist (yet) - continuing anyway."
  fi
  # Quoted so paths containing spaces are preserved as a single value -
  # docker compose's .env parser strips the surrounding quotes.
  printf 'NOTES_ROOT="%s"\n' "$notes_root" > .env
  echo "Created ${TARGET_DIR}/.env with NOTES_ROOT=${notes_root}"
fi

cat <<EOF

All files were created in: ${TARGET_DIR}

Next steps:
  1. cd "${TARGET_DIR}"
  2. Double-check .env has NOTES_ROOT set to the absolute path of your notes
     vault - it's mounted read-only into the containers, so without it
     pointed at the right place the stack starts against an empty
     ./notes folder instead of your actual notes.
  3. Edit app.config.json:
     - set "obsidianVault" - needed for links to open notes in Obsidian
       to work correctly.
     - update "dateFormats" to match how dates appear in your notes -
       this is key to mdm's date filtering.
  4. docker compose pull && docker compose up -d --no-build
  5. Open http://localhost

To update to newer images later, re-run step 4 from that directory.
EOF
