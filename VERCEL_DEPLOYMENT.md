# Vercel Deployment Guide for DBT Diary Card

## Quick Fix for Authentication Issues

If you're experiencing the **401 Unauthorized** error after Google OAuth callback, follow these steps:

### Step 1: Set Environment Variables in Vercel

Go to your [Vercel Dashboard](https://vercel.com/dashboard) → Select your project → Settings → Environment Variables

Add these **required** variables:

```bash
# 1. NEXTAUTH_URL (CRITICAL - Must match your deployment URL exactly)
NEXTAUTH_URL=https://dbt-diarycard.vercel.app

# 2. AUTH_SECRET (CRITICAL - Generate a secure random string)
# Generate using: openssl rand -base64 32
AUTH_SECRET=[your-generated-secret-here]

# 3. Google OAuth (Use your existing values)
AUTH_GOOGLE_ID=***REMOVED***
AUTH_GOOGLE_SECRET=[your-google-client-secret]

# 4. Database URL (Must be accessible from Vercel)
DATABASE_URL=postgresql://[user]:[password]@[host]:5432/[database]?pgbouncer=true&connect_timeout=15
```

### Step 2: Verify Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your OAuth 2.0 Client ID (the one matching your AUTH_GOOGLE_ID)
3. Under **Authorized redirect URIs**, ensure you have EXACTLY:
   ```
   https://dbt-diarycard.vercel.app/api/auth/callback/google
   ```
   ⚠️ **Must be HTTPS, not HTTP**
   ⚠️ **Must match exactly (no trailing slash)**

### Step 3: Database Setup

Your database must be:
- **Cloud-hosted** (Vercel can't access localhost)
- **Accessible from Vercel's IP ranges**

Recommended providers:
- [Neon](https://neon.tech/) - Works great with Vercel
- [Supabase](https://supabase.com/)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Railway](https://railway.app/)

### Step 4: Redeploy

After setting all environment variables:
1. Go to Vercel Dashboard → Deployments
2. Click the three dots on the latest deployment
3. Select "Redeploy"
4. Wait for deployment to complete

### Step 5: Test Authentication

1. Clear all cookies for `dbt-diarycard.vercel.app`
2. Visit https://dbt-diarycard.vercel.app
3. Try signing in with Google
4. Check the debug endpoint (development only):
   ```
   https://dbt-diarycard.vercel.app/api/auth/debug
   ```

## Troubleshooting

### Still Getting 401 Errors?

1. **Check Vercel Function Logs**:
   - Vercel Dashboard → Functions → View logs
   - Look for `[AUTH ERROR]` or `[AUTH]` messages

2. **Verify Environment Variables**:
   ```bash
   vercel env pull  # Download current env vars
   cat .env.local   # Check they're set correctly
   ```

3. **Database Connection Issues**:
   - Ensure DATABASE_URL includes `?pgbouncer=true` for connection pooling
   - Add `&connect_timeout=15` to prevent timeouts
   - Check database allows connections from Vercel IPs

4. **Cookie Issues**:
   - Browser DevTools → Application → Cookies
   - Look for `next-auth.session-token`
   - If missing, AUTH_SECRET might be wrong

### Common Problems and Solutions

| Problem | Cause | Solution |
|---------|-------|----------|
| "Callback" error | Missing/wrong NEXTAUTH_URL | Set to exact deployment URL with https:// |
| No session after login | AUTH_SECRET not set | Generate and set a secure secret |
| Database timeout | Connection string issue | Add pooling parameters to DATABASE_URL |
| OAuth redirect mismatch | Wrong URI in Google Console | Must match exactly including https:// |

## Local Development

For local testing, create a `.env.local` file:

```bash
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=dev-secret-at-least-32-characters-long
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
DATABASE_URL=postgresql://user:pass@localhost:5432/dbt_diary
```

Also add `http://localhost:3000/api/auth/callback/google` to Google OAuth redirect URIs.

## Security Notes

- **Never commit** `.env` files to git
- **AUTH_SECRET** must be unique and secure in production
- **Use HTTPS** for all production URLs
- **Rotate secrets** regularly

## Need Help?

If you're still having issues after following this guide:

1. Check the [NextAuth.js documentation](https://next-auth.js.org/)
2. Review Vercel function logs for specific errors
3. Use the debug endpoint to verify configuration
4. Ensure all environment variables are set in Vercel (not just locally)
