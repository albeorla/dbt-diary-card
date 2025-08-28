import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Force all *.vercel.app traffic to the stable production domain so OAuth redirect URIs stay consistent
const CANONICAL_HOST = "dbt-diarycard.vercel.app";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  if (host !== CANONICAL_HOST && host.endsWith("vercel.app")) {
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


