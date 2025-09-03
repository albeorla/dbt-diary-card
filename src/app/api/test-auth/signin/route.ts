import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '~/server/db';

export async function POST(req: Request) {
  // Debug logging for CI
  console.log('=== TEST-AUTH DEBUG ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('CI:', process.env.CI);
  console.log('TEST_AUTH_SECRET:', process.env.TEST_AUTH_SECRET ? '[SET]' : '[UNSET]');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '[SET]' : '[UNSET]');

  // Allow in CI environment even if NODE_ENV is production
  if (process.env.NODE_ENV === 'production' && process.env.CI !== 'true') {
    console.log('REJECTED: NODE_ENV is production and not in CI');
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  const header = req.headers.get('x-test-auth') ?? '';
  const required = process.env.TEST_AUTH_SECRET ?? '';
  console.log('Header auth:', header ? '[PROVIDED]' : '[MISSING]');
  console.log('Required auth:', required ? '[SET]' : '[UNSET]');

  if (required && header !== required) {
    console.log('REJECTED: Auth header mismatch');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { email = 'e2e@example.com', role = 'USER' } = (await req.json().catch(() => ({}))) as {
    email?: string;
    role?: 'ADMIN' | 'MANAGER' | 'USER';
  };

  // Ensure an organization exists
  let org = await db.organization.findFirst();
  if (!org) {
    org = await db.organization.create({ data: { name: 'Test Org' } });
  }

  // Ensure user exists (tolerate concurrent creation across parallel tests)
  let user;
  try {
    user = await db.user.upsert({
      where: { email },
      update: {},
      create: { email, name: email.split('@')[0] },
    });
  } catch (err: any) {
    // If another worker created the same user at the exact same time, Prisma can surface a P2002
    // unique constraint error from the create branch of upsert. In that case, just fetch it.
    if (err?.code === 'P2002') {
      user = await db.user.findUniqueOrThrow({ where: { email } });
    } else {
      throw err;
    }
  }

  // Ensure membership
  try {
    await db.orgMembership.upsert({
      where: { orgId_userId: { orgId: org.id, userId: user.id } },
      update: { role },
      create: { orgId: org.id, userId: user.id, role },
    });
  } catch (err: any) {
    if (err?.code === 'P2002') {
      // Created by a concurrent request; ensure role is up to date
      await db.orgMembership.update({
        where: { orgId_userId: { orgId: org.id, userId: user.id } },
        data: { role },
      });
    } else {
      throw err;
    }
  }

  // Create a DB session and set cookie
  const sessionToken = crypto.randomUUID();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await db.session.create({ data: { sessionToken, userId: user.id, expires } });

  const name = 'next-auth.session-token'; // matches dev cookie name
  const cookieStore = await cookies();
  cookieStore.set(name, sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    expires,
  });

  console.log('SUCCESS: Returning sessionToken:', sessionToken);
  return NextResponse.json({ ok: true, email, role, sessionToken });
}
