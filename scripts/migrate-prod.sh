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

# Load production database URL
PROD_DB_URL="postgresql://diarycard001:.tYX|U1~r787uSK[QIxoDj#D6_>h@diarycard001.cluster-ciqxffdrwe90.us-east-1.rds.amazonaws.com:5432/diarycard001?schema=public&sslmode=require"

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
