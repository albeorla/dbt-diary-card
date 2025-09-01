# Deployment Guide

## Production URL

https://dbt-diary-card-test.vercel.app

## Database Migrations

Since the production database (AWS RDS) is not accessible from GitHub Actions due to security restrictions, migrations must be run locally.

### Running Production Migrations

1. **Using the migration script:**

   ```bash
   ./scripts/migrate-prod.sh
   ```

2. **Or manually:**
   ```bash
   # Use an environment variable for your production DB URL (do NOT hardcode secrets)
   # Example format (replace with your real values):
   #   postgresql://<user>:<password>@<host>:5432/<database>?schema=public&sslmode=require
   DATABASE_URL="postgresql://<user>:<password>@<host>:5432/<database>?schema=public&sslmode=require" \
   npx prisma migrate deploy
   ```

## Deployment Pipeline

1. **Push to GitHub** - Code is pushed to the `main` branch
2. **GitHub Actions** - Checks database connectivity (currently skipped due to RDS security)
3. **Vercel** - Automatically deploys the application
4. **Manual Migration** - Run database migrations locally when needed

## Environment Variables

The following environment variables are configured in Vercel:

- `AUTH_GOOGLE_ID` - Google OAuth client ID
- `AUTH_GOOGLE_SECRET` - Google OAuth client secret
- `AUTH_SECRET` - NextAuth secret
- `DATABASE_URL` - PostgreSQL connection string
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `SMTP_HOST` - Email SMTP host
- `SMTP_PORT` - Email SMTP port
- `SMTP_USER` - Email SMTP user
- `SMTP_PASS` - Email SMTP password
- `EMAIL_FROM` - From email address

## Troubleshooting

### Build Failures

If builds fail on Vercel:

1. Check the build logs at https://vercel.com/albertjorlandos-projects/dbt-diary-card-test
2. Ensure all environment variables are set
3. Run `npm run build` locally to verify the build works

### Database Connection Issues

If you can't connect to the database:

1. Ensure you're using the correct connection string
2. Check that your IP is whitelisted in AWS RDS security groups
3. Verify the database is running and accessible
