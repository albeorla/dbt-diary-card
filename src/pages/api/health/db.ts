import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/server/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const now = await db.$queryRawUnsafe<{ now: Date }[]>("SELECT NOW() as now");
    res.status(200).json({ ok: true, now: now?.[0]?.now ?? null });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: String(e?.message ?? e) });
  }
}


