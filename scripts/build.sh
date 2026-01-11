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

echo "Resolving any failed migrations..."
npx prisma migrate resolve --rolled-back 20250718011153_init || echo "No failed migration to resolve"

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding database with defaults..."
npx prisma db seed

echo "Generating Prisma client..."
npx prisma generate --schema=prisma/schema.prisma

echo "Building Next.js application..."
npx next build
