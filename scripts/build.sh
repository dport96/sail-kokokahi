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

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set. Aborting build."
  exit 1
fi

export DATABASE_URL

echo "Building with NEXTAUTH_URL=${NEXTAUTH_URL:-unset}, DATABASE_URL=set"

echo "Generating Prisma client..."
npx prisma generate

echo "Recovering known failed migration state if present..."
npx prisma migrate resolve --rolled-back 20260701_add_event_pin || echo "No failed 20260701_add_event_pin migration to recover"

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding database with defaults..."
npx prisma db seed

echo "Building Next.js application..."
next build
