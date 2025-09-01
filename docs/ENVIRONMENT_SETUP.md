# Environment Setup for DBT Diary Card

## Required Environment Variables for Vercel Deployment

### 1. Critical Authentication Variables

#### NEXTAUTH_URL

- **Required**: Yes
- **Value**: `https://dbt-diarycard.vercel.app`
- **Description**: Must match your deployment URL exactly. This is critical for cookie security and OAuth callbacks.

#### AUTH_SECRET

- **Required**: Yes (in production)
- **How to generate**: Run `openssl rand -base64 32`
- **Description**: Used to encrypt session cookies. Must be the same across all deployments.

#### AUTH_GOOGLE_ID

- **Required**: Yes
- **Value**: Your Google OAuth Client ID (currently: `***REMOVED***`)
- **Get from**: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

#### AUTH_GOOGLE_SECRET

- **Required**: Yes
- **Value**: Your Google OAuth Client Secret
- **Get from**: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

### 2. Database Configuration

#### DATABASE_URL

- **Required**: Yes
- **Format**: `postgresql://user:password@host:5432/database?schema=public`
- **Important for Vercel**:
  - Use a cloud-hosted PostgreSQL (e.g., Neon, Supabase, Railway, Vercel Postgres)
  - Add connection pooling parameters: `?pgbouncer=true&connect_timeout=15`
  - Ensure the database is accessible from Vercel's IP ranges

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select or create your OAuth 2.0 Client ID
3. Under "Authorized redirect URIs", add exactly:
   - `https://dbt-diarycard.vercel.app/api/auth/callback/google`
   - If testing locally, also add: `http://localhost:3000/api/auth/callback/google`
4. Save the changes

### 4. Setting Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable listed above
4. Make sure to select the appropriate environments (Production, Preview, Development)
5. Redeploy your application after adding the variables

### 5. Troubleshooting Authentication Issues

If you're getting 401 Unauthorized errors after OAuth:

1. **Verify NEXTAUTH_URL**: Must exactly match your deployment URL
2. **Check AUTH_SECRET**: Must be set and consistent
3. **Database Access**: Ensure your database is accessible from Vercel
4. **Cookie Settings**: Check browser dev tools for session cookies
5. **Google OAuth**: Verify redirect URI matches exactly

### 6. Testing the Configuration

After setting up environment variables:

1. Clear browser cookies for the domain
2. Try signing in with Google
3. Check Vercel function logs for any errors
4. Verify session is created in the database

### Common Issues and Solutions

| Issue                        | Solution                                             |
| ---------------------------- | ---------------------------------------------------- |
| "Callback" error after OAuth | Check NEXTAUTH_URL and AUTH_SECRET are set correctly |
| 401 on API calls after login | Verify database connection and session creation      |
| OAuth redirect mismatch      | Ensure Google Console redirect URI matches exactly   |
| Session not persisting       | Check AUTH_SECRET is consistent across deployments   |
