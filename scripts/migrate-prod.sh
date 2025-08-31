#!/bin/bash

# Production Database Migration Script
# Run this locally when you need to migrate the production database

set -e

echo "🚀 Production Database Migration Script"
echo "======================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "prisma" ]; then
    echo "❌ Error: Must run from dbt-diary-card directory"
    exit 1
fi

# Resolve production database URL from env/args (never hardcode secrets)
# Usage:
#   PROD_DB_URL=postgresql://user:pass@host:5432/db?schema=public ./scripts/migrate-prod.sh
#   or: ./scripts/migrate-prod.sh postgresql://user:pass@host:5432/db?schema=public

PROD_DB_URL_INPUT="$1"
PROD_DB_URL="${PROD_DB_URL_INPUT:-${PROD_DB_URL:-${DATABASE_URL_PROD:-}}}"

if [ -z "$PROD_DB_URL" ]; then
  echo "❌ Error: Please provide your production database URL via argument or env var."
  echo "   Example:"
  echo "     PROD_DB_URL=postgresql://<user>:<password>@<host>:5432/<db>?schema=public ./scripts/migrate-prod.sh"
  exit 1
fi

echo "📦 Installing dependencies..."
npm install --silent

echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "🗄️  Running production migrations..."
DATABASE_URL="$PROD_DB_URL" npx prisma migrate deploy

echo "✅ Migration completed successfully!"
echo ""
echo "📊 Database status:"
DATABASE_URL="$PROD_DB_URL" npx prisma migrate status

echo ""
echo "🎉 Production database is up to date!"
