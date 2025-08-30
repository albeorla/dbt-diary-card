import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "~/server/auth/config";
import { db } from "~/server/db";
import { env } from "~/env";

// Debug endpoint to troubleshoot authentication issues
// Only enabled when NODE_ENV is not production or when explicitly enabled
export async function GET(req: NextRequest) {
  // Security: Only allow in development or with explicit flag
  const isDebugEnabled = env.NODE_ENV !== "production" || 
    req.headers.get("x-debug-auth") === env.AUTH_SECRET?.substring(0, 8);

  if (!isDebugEnabled) {
    return NextResponse.json({ error: "Debug endpoint disabled" }, { status: 403 });
  }

  try {
    // Get session
    const session = await getServerSession(authOptions);
    
    // Check environment variables
    const envCheck = {
      NEXTAUTH_URL: !!env.NEXTAUTH_URL,
      NEXTAUTH_URL_VALUE: env.NEXTAUTH_URL || "NOT SET",
      AUTH_SECRET: !!env.AUTH_SECRET,
      AUTH_SECRET_LENGTH: env.AUTH_SECRET?.length || 0,
      AUTH_GOOGLE_ID: !!env.AUTH_GOOGLE_ID,
      AUTH_GOOGLE_ID_VALUE: env.AUTH_GOOGLE_ID || "NOT SET",
      AUTH_GOOGLE_SECRET: !!env.AUTH_GOOGLE_SECRET,
      DATABASE_URL: !!env.DATABASE_URL,
      NODE_ENV: env.NODE_ENV,
    };

    // Check database connection
    let dbStatus = "unknown";
    let userCount = 0;
    let sessionCount = 0;
    let orgStatus = null;

    try {
      // Test database connection
      await db.$queryRaw`SELECT 1`;
      dbStatus = "connected";

      // Get counts
      userCount = await db.user.count();
      sessionCount = await db.session.count();
      
      // Check org setup
      const org = await db.organization.findFirst();
      orgStatus = org ? { id: org.id, name: org.name } : null;
    } catch (dbError: any) {
      dbStatus = `error: ${dbError.message}`;
    }

    // Get request details
    const requestDetails = {
      url: req.url,
      headers: {
        host: req.headers.get("host"),
        referer: req.headers.get("referer"),
        cookie: req.headers.get("cookie") ? "PRESENT" : "NONE",
        userAgent: req.headers.get("user-agent"),
      },
    };

    // Check for current user's membership if logged in
    let membershipStatus = null;
    if (session?.user?.id && orgStatus) {
      const membership = await db.orgMembership.findFirst({
        where: { 
          userId: session.user.id,
          orgId: orgStatus.id
        },
        select: { role: true, id: true }
      });
      membershipStatus = membership || "NO_MEMBERSHIP";
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      session: session ? {
        user: session.user,
        expires: session.expires,
      } : null,
      environment: envCheck,
      database: {
        status: dbStatus,
        userCount,
        sessionCount,
        organization: orgStatus,
        currentUserMembership: membershipStatus,
      },
      request: requestDetails,
      debugging: {
        tip1: "If session is null after OAuth, check NEXTAUTH_URL matches exactly",
        tip2: "If database error, verify DATABASE_URL and network access",
        tip3: "Check browser cookies - should have next-auth.session-token",
        tip4: "Verify Google OAuth redirect URI in Cloud Console",
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: "Debug endpoint error", 
      message: error.message,
      stack: env.NODE_ENV !== "production" ? error.stack : undefined
    }, { status: 500 });
  }
}

export const runtime = "nodejs";
