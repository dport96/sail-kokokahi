#!/usr/bin/env bash
# Dev start wrapper that ensures DATABASE_URL is exported for consistency.
set -euo pipefail
# If there's a .env.local file, source it first so it overrides .env for local runs.
if [ -f .env.local ]; then
  # shellcheck disable=SC1091
  export $(grep -v '^#' .env.local | sed -E 's/^([^=]+)=(.*)$/\1=\2/' | xargs)
fi

# If there's a .env file, source it to populate env vars (safe-ish for dev).
if [ -f .env ]; then
  # shellcheck disable=SC1091
  export $(grep -v '^#' .env | sed -E 's/^([^=]+)=(.*)$/\1=\2/' | xargs)
fi
# If DATABASE_URL not set, fall back to README recommended local DB (non-production).
: ${DATABASE_URL:="postgresql://sail_user:your_password@localhost:5432/sail_kokokahi"}
export DATABASE_URL

echo "Starting dev with DATABASE_URL=${DATABASE_URL}"
exec next dev
