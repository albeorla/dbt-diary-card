import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { env } from "~/env";

// Use NEXTAUTH_URL as the canonical origin in production to keep OAuth + cookies consistent
const CANONICAL_HOST = (() => {
  try {
    return env.NEXTAUTH_URL ? new URL(env.NEXTAUTH_URL).host : "dbt-diarycard.vercel.app";
  } catch {
    return "dbt-diarycard.vercel.app";
  }
})();

export function middleware(req: NextRequest) {
  // Skip redirects for API and Next.js internals to avoid breaking auth/cookies
  const { pathname } = new URL(req.url);
  // Allow TRPC calls to proceed without host canonicalization
  if (pathname.startsWith("/_next") || pathname.startsWith("/api/trpc")) {
    return NextResponse.next();
  }
  // Do NOT skip for /api/auth so that OAuth sign-in + callback are on the canonical host
  const host = req.headers.get("host") || "";
  // If a canonical host is configured, redirect any non-canonical host to it
  if (host && CANONICAL_HOST && host !== CANONICAL_HOST) {
    const url = new URL(req.url);
    url.host = CANONICAL_HOST;
    url.protocol = "https:";
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/(.*)"],
};


