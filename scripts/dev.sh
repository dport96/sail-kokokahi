#!/usr/bin/env bash
# Dev start wrapper that ensures DATABASE_URL is exported for consistency.
set -euo pipefail
# Load `.env` first, then `.env.local` so machine-specific overrides in `.env.local`
# take precedence over shared `.env` values during local development.
# This prevents `.env` from accidentally overwriting developer-specific settings.
if [ -f .env ]; then
  # shellcheck disable=SC1091
  export $(grep -v '^#' .env | sed -E 's/^([^=]+)=(.*)$/\1=\2/' | xargs)
fi

if [ -f .env.local ]; then
  # shellcheck disable=SC1091
  export $(grep -v '^#' .env.local | sed -E 's/^([^=]+)=(.*)$/\1=\2/' | xargs)
fi
# If DATABASE_URL not set, fall back to README recommended local DB (non-production).
: ${DATABASE_URL:="postgresql://sail_user:your_password@localhost:5432/sail_kokokahi"}
export DATABASE_URL

echo "Starting dev with DATABASE_URL=${DATABASE_URL}"
exec next dev
