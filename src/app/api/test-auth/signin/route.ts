import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "~/server/db";

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }
  const header = req.headers.get("x-test-auth") ?? "";
  const required = process.env.TEST_AUTH_SECRET ?? "";
  if (required && header !== required) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { email = "e2e@example.com", role = "USER" } = (await req.json().catch(() => ({}))) as {
    email?: string;
    role?: "ADMIN" | "MANAGER" | "USER";
  };

  // Ensure an organization exists
  let org = await db.organization.findFirst();
  if (!org) {
    org = await db.organization.create({ data: { name: "Test Org" } });
  }

  // Ensure user exists
  const user = await db.user.upsert({
    where: { email },
    update: {},
    create: { email, name: email.split("@")[0] },
  });

  // Ensure membership
  await db.orgMembership.upsert({
    where: { orgId_userId: { orgId: org.id, userId: user.id } },
    update: { role },
    create: { orgId: org.id, userId: user.id, role },
  });

  // Create a DB session and set cookie
  const sessionToken = crypto.randomUUID();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.session.create({ data: { sessionToken, userId: user.id, expires } });

  const name = "next-auth.session-token"; // matches dev cookie name
  const cookieStore = await cookies();
  cookieStore.set(name, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    expires,
  });

  return NextResponse.json({ ok: true, email, role, sessionToken });
}
