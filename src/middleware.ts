import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { env } from '~/env';

// Use NEXTAUTH_URL as the canonical origin in production to keep OAuth + cookies consistent
const CANONICAL_HOST = (() => {
  try {
    return env.NEXTAUTH_URL ? new URL(env.NEXTAUTH_URL).host : 'dbt-diarycard.vercel.app';
  } catch {
    return 'dbt-diarycard.vercel.app';
  }
})();

export function middleware(req: NextRequest) {
  const startedAt = Date.now();
  // Create/propagate a request ID for correlation across logs
  const hdr = (name: string) => req.headers.get(name) || '';
  const requestId =
    hdr('x-request-id') ||
    hdr('x-vercel-id') ||
    (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`);

  // Build a safe snapshot of the incoming request for logs (no secrets)
  const url = new URL(req.url);
  const cookieNames = (() => {
    try {
      return req.cookies.getAll().map((c) => c.name);
    } catch {
      return [] as string[];
    }
  })();

  const baseInfo = {
    id: requestId,
    method: (req as any).method || 'GET',
    url: req.url,
    pathname: url.pathname,
    search: url.search || undefined,
    host: hdr('host'),
    forwardedHost: hdr('x-forwarded-host') || undefined,
    forwardedProto: hdr('x-forwarded-proto') || undefined,
    forwardedFor: hdr('x-forwarded-for')?.split(',')[0]?.trim() || undefined,
    referer: hdr('referer') || undefined,
    userAgent: hdr('user-agent') || undefined,
    cookieNames,
    env: process.env.NODE_ENV,
    canonicalHost: CANONICAL_HOST,
  } as const;

  const log = (event: string, extra?: Record<string, unknown>) => {
    // Keep logs compact but structured; avoid leaking secrets
    const payload = { ts: new Date().toISOString(), scope: 'MW', event, ...baseInfo, ...extra };
    try {
      console.log(JSON.stringify(payload));
    } catch {
      // Fallback if JSON serialization fails for any reason
      console.log('[MW]', event, payload);
    }
  };

  try {
    // Skip redirects for API and Next.js internals to avoid breaking auth/cookies
    // IMPORTANT: Skip /api/auth to keep the entire OAuth flow on the same host.
    // NextAuth sets host-only __Host- cookies for CSRF which do not cross subdomains.
    const skipPaths = ['/_next', '/api/trpc', '/api/auth'];
    const matchedSkip = skipPaths.find((p) => url.pathname.startsWith(p));
    if (matchedSkip) {
      // For auth endpoints, emit a one-line sanitized view of critical auth env
      if (matchedSkip === '/api/auth') {
        const actualProto = baseInfo.forwardedProto || (url.protocol.replace(':', '') as string);
        const baseUrl = `${actualProto}://${baseInfo.host}`;
        const configuredUrl = env.NEXTAUTH_URL || '';
        const configuredCallbackUrl = configuredUrl
          ? `${configuredUrl}/api/auth/callback/google`
          : '';
        const requestCallbackUrl = `${baseUrl}/api/auth/callback/google`;
        const googleId = env.AUTH_GOOGLE_ID || '';
        const mask = (v: string, start = 6, end = 4) =>
          v ? `${v.slice(0, start)}...${v.slice(Math.max(0, v.length - end))}` : '';
        log('auth-env', {
          NEXTAUTH_URL: configuredUrl || 'NOT SET',
          expectedCallbackUrl: requestCallbackUrl,
          configuredCallbackUrl: configuredCallbackUrl || 'NOT SET',
          AUTH_GOOGLE_ID: googleId ? mask(googleId) : 'NOT SET',
          AUTH_GOOGLE_ID_isPlaceholder: googleId === 'placeholder' || undefined,
          AUTH_GOOGLE_SECRET: env.AUTH_GOOGLE_SECRET
            ? `Set (${env.AUTH_GOOGLE_SECRET.length} chars)`
            : 'NOT SET',
          AUTH_SECRET: env.AUTH_SECRET ? `Set (${env.AUTH_SECRET.length} chars)` : 'NOT SET',
          useSecureCookies: (env.NEXTAUTH_URL ?? '').startsWith('https://') || false,
        });
      }
      const res = NextResponse.next();
      res.headers.set('x-mw-request-id', requestId);
      log('skip', { matchedSkip, durationMs: Date.now() - startedAt });
      return res;
    }

    // All other routes may be canonicalized in production
    const host = hdr('host');
    const shouldCanonicalize =
      process.env.NODE_ENV === 'production' && host && CANONICAL_HOST && host !== CANONICAL_HOST;

    if (shouldCanonicalize) {
      const redirectUrl = new URL(req.url);
      redirectUrl.host = CANONICAL_HOST;
      redirectUrl.protocol = 'https:';
      const res = NextResponse.redirect(redirectUrl, 308);
      res.headers.set('x-mw-request-id', requestId);
      log('redirect', {
        fromHost: host,
        toHost: CANONICAL_HOST,
        status: 308,
        durationMs: Date.now() - startedAt,
      });
      return res;
    }

    const res = NextResponse.next();
    res.headers.set('x-mw-request-id', requestId);
    // Also log auth env on hitting the signin page to aid debugging
    if (url.pathname === '/signin') {
      const actualProto = baseInfo.forwardedProto || (url.protocol.replace(':', '') as string);
      const baseUrl = `${actualProto}://${baseInfo.host}`;
      const configuredUrl = env.NEXTAUTH_URL || '';
      const configuredCallbackUrl = configuredUrl
        ? `${configuredUrl}/api/auth/callback/google`
        : '';
      const requestCallbackUrl = `${baseUrl}/api/auth/callback/google`;
      const googleId = env.AUTH_GOOGLE_ID || '';
      const mask = (v: string, start = 6, end = 4) =>
        v ? `${v.slice(0, start)}...${v.slice(Math.max(0, v.length - end))}` : '';
      log('auth-env', {
        NEXTAUTH_URL: configuredUrl || 'NOT SET',
        expectedCallbackUrl: requestCallbackUrl,
        configuredCallbackUrl: configuredCallbackUrl || 'NOT SET',
        AUTH_GOOGLE_ID: googleId ? mask(googleId) : 'NOT SET',
        AUTH_GOOGLE_ID_isPlaceholder: googleId === 'placeholder' || undefined,
        AUTH_GOOGLE_SECRET: env.AUTH_GOOGLE_SECRET
          ? `Set (${env.AUTH_GOOGLE_SECRET.length} chars)`
          : 'NOT SET',
        AUTH_SECRET: env.AUTH_SECRET ? `Set (${env.AUTH_SECRET.length} chars)` : 'NOT SET',
        useSecureCookies: (env.NEXTAUTH_URL ?? '').startsWith('https://') || false,
      });
    }
    log('next', { durationMs: Date.now() - startedAt });
    return res;
  } catch (err) {
    // Never throw from middleware; log and proceed
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    log('error', { message, stack });
    const res = NextResponse.next();
    res.headers.set('x-mw-request-id', requestId);
    return res;
  }
}

export const config = {
  matcher: ['/(.*)'],
};
