import { NextRequest, NextResponse } from "next/server";
import { env } from "~/env";

/**
 * OAuth Configuration Verification Endpoint
 * Helps identify redirect URI mismatches and configuration issues
 */
export async function GET(req: NextRequest) {
  // Only allow in development or with debug header
  const isDebugEnabled = env.NODE_ENV !== "production" || 
    req.headers.get("x-debug-auth") === env.AUTH_SECRET?.substring(0, 8);

  if (!isDebugEnabled) {
    return NextResponse.json({ error: "Debug endpoint disabled" }, { status: 403 });
  }

  const requestUrl = new URL(req.url);
  const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
  
  // Construct the OAuth redirect URI that NextAuth will use
  const nextAuthCallbackUrl = `${baseUrl}/api/auth/callback/google`;
  
  // What NEXTAUTH_URL is configured as
  const configuredUrl = env.NEXTAUTH_URL || "NOT SET";
  const configuredCallbackUrl = configuredUrl !== "NOT SET" 
    ? `${configuredUrl}/api/auth/callback/google` 
    : "NOT SET";

  // Check for common mismatches
  const issues = [];
  
  // Check if NEXTAUTH_URL is set
  if (!env.NEXTAUTH_URL) {
    issues.push({
      type: "CRITICAL",
      message: "NEXTAUTH_URL is not set",
      fix: `Set NEXTAUTH_URL=${baseUrl} in Vercel environment variables`
    });
  }
  
  // Check protocol mismatch
  if (configuredUrl !== "NOT SET") {
    const configuredProtocol = new URL(configuredUrl).protocol;
    const actualProtocol = requestUrl.protocol;
    
    if (configuredProtocol !== actualProtocol) {
      issues.push({
        type: "ERROR",
        message: `Protocol mismatch: NEXTAUTH_URL uses ${configuredProtocol} but site uses ${actualProtocol}`,
        fix: `Update NEXTAUTH_URL to use ${actualProtocol}`
      });
    }
    
    // Check host mismatch
    const configuredHost = new URL(configuredUrl).host;
    const actualHost = requestUrl.host;
    
    if (configuredHost !== actualHost) {
      issues.push({
        type: "ERROR", 
        message: `Host mismatch: NEXTAUTH_URL uses ${configuredHost} but site uses ${actualHost}`,
        fix: `Update NEXTAUTH_URL to ${baseUrl}`
      });
    }
  }
  
  // Check for www vs non-www
  if (requestUrl.host.startsWith("www.") && !configuredUrl.includes("www.")) {
    issues.push({
      type: "WARNING",
      message: "Site accessed with www but NEXTAUTH_URL doesn't include www",
      fix: "Ensure consistent use of www in both NEXTAUTH_URL and Google OAuth settings"
    });
  }
  
  // Check for trailing slashes
  if (configuredUrl.endsWith("/")) {
    issues.push({
      type: "WARNING",
      message: "NEXTAUTH_URL has a trailing slash",
      fix: "Remove trailing slash from NEXTAUTH_URL"
    });
  }
  
  // Check AUTH_SECRET
  if (!env.AUTH_SECRET) {
    issues.push({
      type: "CRITICAL",
      message: "AUTH_SECRET is not set",
      fix: "Generate with: openssl rand -base64 32"
    });
  } else if (env.AUTH_SECRET.length < 32) {
    issues.push({
      type: "ERROR",
      message: `AUTH_SECRET is too short (${env.AUTH_SECRET.length} chars)`,
      fix: "Use a secret at least 32 characters long"
    });
  }
  
  // Check Google OAuth credentials
  if (!env.AUTH_GOOGLE_ID) {
    issues.push({
      type: "CRITICAL",
      message: "AUTH_GOOGLE_ID is not set",
      fix: "Get from Google Cloud Console"
    });
  }
  
  if (!env.AUTH_GOOGLE_SECRET) {
    issues.push({
      type: "CRITICAL",
      message: "AUTH_GOOGLE_SECRET is not set",
      fix: "Get from Google Cloud Console"
    });
  }
  
  // Build Google OAuth URL for testing
  const googleOAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleOAuthUrl.searchParams.set("client_id", env.AUTH_GOOGLE_ID || "NOT_SET");
  googleOAuthUrl.searchParams.set("redirect_uri", nextAuthCallbackUrl);
  googleOAuthUrl.searchParams.set("response_type", "code");
  googleOAuthUrl.searchParams.set("scope", "openid email profile");
  
  return NextResponse.json({
    status: issues.length === 0 ? "✅ Configuration looks good!" : "⚠️ Issues found",
    issues,
    configuration: {
      currentRequest: {
        url: requestUrl.toString(),
        protocol: requestUrl.protocol,
        host: requestUrl.host,
        baseUrl,
        expectedCallbackUrl: nextAuthCallbackUrl,
      },
      nextAuthConfig: {
        NEXTAUTH_URL: configuredUrl,
        configuredCallbackUrl,
        AUTH_SECRET: env.AUTH_SECRET ? `Set (${env.AUTH_SECRET.length} chars)` : "NOT SET",
        AUTH_GOOGLE_ID: env.AUTH_GOOGLE_ID || "NOT SET",
        AUTH_GOOGLE_SECRET: env.AUTH_GOOGLE_SECRET ? "Set" : "NOT SET",
      },
      googleOAuth: {
        testUrl: googleOAuthUrl.toString(),
        redirectUri: nextAuthCallbackUrl,
        note: "This redirect URI must be added to Google Cloud Console"
      },
    },
    instructions: {
      googleConsole: [
        "1. Go to https://console.cloud.google.com/apis/credentials",
        "2. Select your OAuth 2.0 Client ID",
        "3. Under 'Authorized redirect URIs', add EXACTLY:",
        `   ${nextAuthCallbackUrl}`,
        "4. Save the changes",
        "5. Wait a few minutes for changes to propagate"
      ],
      vercelSetup: [
        "1. Go to Vercel Dashboard → Settings → Environment Variables",
        `2. Set NEXTAUTH_URL = ${baseUrl}`,
        "3. Set AUTH_SECRET = (generate with: openssl rand -base64 32)",
        "4. Set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET from Google Console",
        "5. Redeploy the application"
      ],
    },
    debugTip: "After fixing issues, clear cookies and try signing in again"
  }, { 
    status: 200,
    headers: {
      "Content-Type": "application/json",
    }
  });
}

export const runtime = "nodejs";
