import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '~/server/db';
import { env } from '~/env';

export async function GET(_: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  if (!token)
    return NextResponse.redirect(new URL('/signin', env.NEXTAUTH_URL || 'http://localhost:3000'));

  const invite = await db.orgInvite.findUnique({ where: { token } });
  const baseUrl = env.NEXTAUTH_URL || 'http://localhost:3000';
  const fallback = NextResponse.redirect(new URL(`/invite/${token}`, baseUrl));

  if (!invite) return fallback;
  if (invite.consumedAt) return NextResponse.redirect(new URL('/', baseUrl));
  if (new Date(invite.expiresAt).getTime() < Date.now()) return fallback;

  // Ensure user exists for invited email
  const email = invite.email.toLowerCase();
  const user = await db.user.upsert({ where: { email }, update: {}, create: { email } });

  // Ensure membership
  await db.orgMembership.upsert({
    where: { orgId_userId: { orgId: invite.orgId, userId: user.id } },
    update: { role: invite.role, managerId: invite.managerId ?? undefined },
    create: {
      orgId: invite.orgId,
      userId: user.id,
      role: invite.role,
      managerId: invite.managerId ?? undefined,
    },
  });

  // Create session and set cookie
  const sessionToken = crypto.randomUUID();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.session.create({ data: { sessionToken, userId: user.id, expires } });

  const isProduction = (env.NEXTAUTH_URL ?? '').startsWith('https://');
  const name = `${isProduction ? '__Secure-' : ''}next-auth.session-token`;
  const cookieStore = await cookies();
  cookieStore.set(name, sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    path: '/',
    expires,
  });

  // Mark invite consumed
  await db.orgInvite.update({
    where: { id: invite.id },
    data: { consumedAt: new Date(), consumedBy: user.id },
  });

  // Redirect to app index; it will route based on role
  return NextResponse.redirect(new URL('/', baseUrl));
}
