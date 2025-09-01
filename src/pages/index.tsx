import { getServerSession } from 'next-auth';
import type { GetServerSideProps } from 'next';
import { authOptions } from '~/server/auth/config';
import { db } from '~/server/db';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  if (!session) {
    return { redirect: { destination: '/signin', permanent: false } };
  }

  const org = await db.organization.findFirst({ select: { id: true } });
  if (!org) {
    return { redirect: { destination: '/onboarding', permanent: false } };
  }

  const membership = await db.orgMembership.findFirst({
    where: { orgId: org.id, userId: session.user.id },
    select: { role: true },
  });

  if (membership?.role === 'ADMIN') {
    return { redirect: { destination: '/admin/org', permanent: false } };
  }
  if (membership?.role === 'MANAGER') {
    return { redirect: { destination: '/manager', permanent: false } };
  }
  return { redirect: { destination: '/dashboard', permanent: false } };
};

export default function Index() {
  return null;
}
