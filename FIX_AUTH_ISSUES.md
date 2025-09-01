# 🔧 Complete Fix for Google OAuth Authentication Issues

## Problem Summary

Your app successfully initiates Google OAuth, receives the authorization code, but fails with a 401 Unauthorized error when trying to access protected endpoints. The root cause is improper session creation/persistence in Vercel's serverless environment.

## Root Causes Identified

1. **Missing/Incorrect Environment Variables** - NEXTAUTH_URL and AUTH_SECRET not configured
2. **Session Persistence Issues** - Database sessions not working properly in serverless
3. **Cookie Configuration** - Secure cookie settings preventing session persistence
4. **Database Connection Pooling** - Connection exhaustion in serverless functions
5. **OAuth Redirect URI Mismatch** - Even minor differences cause failures

## ✅ Complete Solution Implementation

### Step 1: Run Setup Script

Generate your production configuration:

```bash
cd /Users/aorlando/dev/github/dbt/dbt-diary-card
node scripts/setup-vercel-env.js
```

This creates `.env.production` with a secure AUTH_SECRET and proper configuration.

### Step 2: Configure Your Database

**CRITICAL**: You need a cloud-hosted PostgreSQL database with connection pooling.

#### Recommended: Neon (Free tier available)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new database
3. Get the pooled connection string (includes `-pooler` in the hostname)
4. Your DATABASE_URL should look like:
   ```
   postgresql://user:pass@host-pooler.neon.tech:5432/database?sslmode=require&pgbouncer=true&connect_timeout=15
   ```

#### Alternative: Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Go to Settings → Database
3. Use the "Connection Pooling" connection string (port 6543)
4. Add `?pgbouncer=true` to the URL

### Step 3: Update Google OAuth Configuration

**EXACT STEPS** (This is critical):

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your OAuth 2.0 Client ID: `***REMOVED***`
3. Click to edit it
4. Under **Authorized redirect URIs**, remove any existing entries
5. Add EXACTLY this URI (copy-paste to avoid typos):
   ```
   https://dbt-diarycard.vercel.app/api/auth/callback/google
   ```
6. **NO trailing slash, MUST be https://, NO www**
7. Click "Save"
8. **WAIT 5 MINUTES** for changes to propagate

### Step 4: Set Vercel Environment Variables

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to Settings → Environment Variables
4. Add these variables (copy from `.env.production`):

| Variable             | Value                              | Notes                        |
| -------------------- | ---------------------------------- | ---------------------------- |
| `NEXTAUTH_URL`       | `https://dbt-diarycard.vercel.app` | EXACT URL, no trailing slash |
| `AUTH_SECRET`        | (from .env.production)             | 44-character secure string   |
| `AUTH_GOOGLE_ID`     | `***REMOVED***`                    | Your OAuth client ID         |
| `AUTH_GOOGLE_SECRET` | (from Google Console)              | Keep this secret!            |
| `DATABASE_URL`       | (your Neon/Supabase URL)           | Must include pooling params  |
| `NODE_ENV`           | `production`                       | Required for production      |

5. Select "Production" environment
6. Click "Save" for each variable

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Set each environment variable
vercel env add NEXTAUTH_URL production
# (paste: https://dbt-diarycard.vercel.app)

vercel env add AUTH_SECRET production
# (paste from .env.production)

vercel env add AUTH_GOOGLE_ID production
# (paste: ***REMOVED***)

vercel env add AUTH_GOOGLE_SECRET production
# (paste from Google Console)

vercel env add DATABASE_URL production
# (paste your cloud database URL with pooling)

vercel env add NODE_ENV production
# (type: production)
```

### Step 5: Deploy the Fixed Code

```bash
# Commit the fixes
git add -A
git commit -m "Fix Google OAuth with proper session handling and connection pooling"
git push origin main

# The push will trigger automatic deployment on Vercel
```

Or deploy manually:

```bash
vercel --prod
```

### Step 6: Verify the Fix

1. **Clear ALL cookies** for `dbt-diarycard.vercel.app` in your browser
2. Visit the verification endpoint:

   ```
   https://dbt-diarycard.vercel.app/api/auth/verify-oauth
   ```

   - Should show "✅ Configuration looks good!" if everything is set correctly

3. Check the debug endpoint:

   ```
   https://dbt-diarycard.vercel.app/api/auth/debug
   ```

   - Should show environment variables are set
   - Database should be "connected"

4. Try signing in with Google:
   - Go to https://dbt-diarycard.vercel.app
   - Click "Sign in with Google"
   - Should redirect to Google, then back to your app
   - Should NOT get "Callback" error or 401

### Step 7: Monitor Logs

If issues persist, check Vercel logs:

1. Go to Vercel Dashboard → Functions tab
2. Look for `api/auth/[...nextauth]` function
3. Check logs for errors like:
   - `[AUTH ERROR]` - Authentication failures
   - Database connection errors
   - Missing environment variables

## 🎯 What We Fixed

### 1. **Cookie Configuration** (Critical for Vercel)

- Added explicit cookie settings with proper secure/httpOnly flags
- Set domain to `.vercel.app` for production
- Used `sameSite: "lax"` for same-origin requests

### 2. **Database Connection Pooling**

- Added Prisma configuration for serverless environments
- Limited connection pool to 1 connection per function
- Added automatic cleanup on function termination

### 3. **Environment Detection**

- Proper production detection based on NEXTAUTH_URL
- Conditional secure cookie usage

### 4. **Enhanced Error Logging**

- Added detailed logging throughout auth flow
- Created debug endpoints for troubleshooting

## Common Issues & Solutions

### Still Getting 401?

1. **Check cookie in browser DevTools**:
   - Open DevTools → Application → Cookies
   - Look for `__Secure-next-auth.session-token`
   - If missing, AUTH_SECRET might be wrong

2. **Verify environment variables are set**:

   ```bash
   vercel env ls production
   ```

3. **Database connection test**:
   ```bash
   # In your project directory
   npx prisma db push
   ```
   Should connect without errors

### "Callback" Error?

This means NextAuth can't process the OAuth callback:

- NEXTAUTH_URL doesn't match actual URL
- AUTH_SECRET is missing or wrong
- Database connection failed during session creation

### Session Not Persisting?

- Ensure DATABASE_URL includes `?pgbouncer=true`
- Check Vercel logs for database timeout errors
- Verify cookies are being set with correct domain

## Testing Checklist

- [ ] `.env.production` created with all variables
- [ ] Database is cloud-hosted (not localhost)
- [ ] DATABASE_URL includes pooling parameters
- [ ] Google OAuth redirect URI matches exactly
- [ ] All environment variables set in Vercel
- [ ] Cookies cleared before testing
- [ ] `/api/auth/verify-oauth` shows no issues
- [ ] Can sign in without errors
- [ ] Session persists across page refreshes

## Need More Help?

1. **Check Vercel Function Logs**:
   - Look for specific error messages
   - Check database connection logs
   - Verify environment variables are loaded

2. **Test Locally First**:

   ```bash
   # Create .env.local with same variables
   npm run dev
   # Test at http://localhost:3000
   ```

3. **Database Issues**:
   - Ensure database allows connections from Vercel IPs
   - Try connecting with `psql` using the same connection string
   - Check if you've hit connection limits

## Final Notes

The key insights from troubleshooting:

- **Redirect URI must match EXACTLY** - even trailing slashes matter
- **Serverless needs connection pooling** - or you'll exhaust connections
- **Cookies need proper configuration** - for cross-site and secure contexts
- **Environment variables are critical** - especially NEXTAUTH_URL and AUTH_SECRET

With these fixes implemented, your Google OAuth should work properly on Vercel!
