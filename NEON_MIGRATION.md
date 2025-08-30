# Quick Migration to Neon (Fix Auth Today)

## Why Neon?
- **Built-in connection pooling** - Solves serverless connection issues
- **Direct HTTPS access** - Works immediately with Vercel
- **PostgreSQL compatible** - Works with Prisma/NextAuth
- **Free tier available** - Perfect for testing

## Step-by-Step Migration

### 1. Create Neon Database
1. Sign up at [neon.tech](https://neon.tech)
2. Create new project
3. **IMPORTANT**: Copy the **pooled connection string** (not the direct one)
   - Should look like: `postgresql://user:pass@ep-xxx-pooler.us-east-1.aws.neon.tech/database?sslmode=require`
   - Note the `-pooler` in the hostname

### 2. Prepare Connection String
```bash
# Your Neon pooled connection string should include:
DATABASE_URL="postgresql://user:password@ep-xxx-pooler.us-east-1.aws.neon.tech/database?sslmode=require&pgbouncer=true&connect_timeout=15"
```

### 3. Create Database Schema
```bash
# In your dbt-diary-card directory
export DATABASE_URL="your-neon-connection-string"

# Push schema to Neon
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### 4. Migrate Data (If Needed)
```bash
# Export from RDS (if you have existing data)
pg_dump -h your-rds-host -U your-user -d your-db > backup.sql

# Import to Neon
psql "your-neon-connection-string" < backup.sql
```

### 5. Update Vercel Environment
```bash
# Set in Vercel Dashboard or CLI
vercel env add DATABASE_URL production
# Paste your Neon pooled connection string
```

### 6. Redeploy
```bash
vercel --prod
```

### 7. Test Authentication
1. Clear cookies
2. Visit https://dbt-diarycard.vercel.app
3. Try Google sign-in
4. Should work! 🎉

## Connection String Format
```
postgresql://[user]:[password]@[host]/[database]?sslmode=require&pgbouncer=true&connect_timeout=15
```

## Troubleshooting
- Ensure you're using the **pooled** endpoint (with `-pooler` in hostname)
- Add `?pgbouncer=true` to the connection string
- Check Vercel function logs for any connection errors
