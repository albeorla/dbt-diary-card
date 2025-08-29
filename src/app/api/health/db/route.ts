import { NextResponse } from "next/server";
import { db } from "~/server/db";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await db.$queryRawUnsafe<{ now: Date }[]>("SELECT NOW() as now");
    return NextResponse.json({ ok: true, now: rows?.[0]?.now ?? null });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message ?? e) }, { status: 500 });
  }
}


