import { NextRequest, NextResponse } from 'next/server';
import { env } from '~/env';

// Simple debug endpoint to inspect auth-related configuration.
// Enabled in development, or in production when the request includes
// x-debug-auth header equal to the first 8 chars of AUTH_SECRET.
export async function GET(req: NextRequest) {
  const allow =
    env.NODE_ENV !== 'production' ||
    req.headers.get('x-debug-auth') === env.AUTH_SECRET?.substring(0, 8);

  if (!allow) {
    return NextResponse.json({ error: 'Debug endpoint disabled' }, { status: 403 });
  }

  const currentUrl = new URL(req.url);
  const baseUrl = `${currentUrl.protocol}//${currentUrl.host}`;
  const isProduction = env.NEXTAUTH_URL?.startsWith('https://') ?? false;

  return NextResponse.json(
    {
      status: 'ok',
      nodeEnv: env.NODE_ENV,
      urls: {
        current: currentUrl.toString(),
        base: baseUrl,
        NEXTAUTH_URL: env.NEXTAUTH_URL || null,
        callback: `${env.NEXTAUTH_URL || baseUrl}/api/auth/callback/google`,
      },
      auth: {
        AUTH_DEBUG: !!env.AUTH_DEBUG,
        AUTH_SECRET: env.AUTH_SECRET ? `Set (${env.AUTH_SECRET.length} chars)` : 'NOT SET',
        AUTH_GOOGLE_ID: env.AUTH_GOOGLE_ID ? `${env.AUTH_GOOGLE_ID.slice(0, 6)}...` : 'NOT SET',
        AUTH_GOOGLE_SECRET: env.AUTH_GOOGLE_SECRET ? 'Set' : 'NOT SET',
      },
      cookies: {
        secure: isProduction,
        sessionTokenName: `${isProduction ? '__Secure-' : ''}next-auth.session-token`,
      },
    },
    { status: 200 },
  );
}

export const runtime = 'nodejs';
