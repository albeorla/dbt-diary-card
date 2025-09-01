import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    message: 'API working',
    timestamp: new Date().toISOString(),
    node_env: process.env.NODE_ENV,
  });
}
