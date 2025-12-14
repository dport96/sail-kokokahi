#!/usr/bin/env bash
set -euo pipefail

# Load vars from .env then .env.local, exporting them so child processes see them.
# .env.local should override .env when both are present.
if [ -f .env ]; then
  # shellcheck disable=SC1091
  set -a
  . .env
  set +a
fi

if [ -f .env.local ]; then
  # shellcheck disable=SC1091
  set -a
  . .env.local
  set +a
fi

echo "Building with NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL:-unset} NEXTAUTH_URL=${NEXTAUTH_URL:-unset}"

prisma generate --schema=prisma/schema.prisma
next build
