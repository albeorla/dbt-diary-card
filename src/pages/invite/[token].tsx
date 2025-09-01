import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { api } from '~/utils/api';

export default function InviteAcceptPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = typeof router.query.token === 'string' ? router.query.token : '';
  const [error, setError] = useState<string | null>(null);
  const consume = api.org.consumeInvite.useMutation();
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    const accept = async () => {
      try {
        if (!token || status !== 'authenticated' || attempted) return;
        setAttempted(true);
        await consume.mutateAsync({ token });
        await router.replace('/');
      } catch (e: any) {
        setError(e?.message ?? 'Failed to accept invite');
      }
    };
    void accept();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, status, attempted]);

  return (
    <>
      <Head>
        <title>Accept Invite · DBT Diary Card</title>
      </Head>
      <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center p-6 text-center">
        {!session && (
          <button
            className="rounded bg-indigo-600 px-4 py-2 text-white"
            onClick={() => void signIn()}
          >
            Sign in to accept invite
          </button>
        )}
        {session && !error && <div>{consume.isPending ? 'Accepting invite…' : 'Preparing…'}</div>}
        {error && (
          <div className="space-y-3">
            <div className="text-red-600">{error}</div>
            {error.toLowerCase().includes('email mismatch') && (
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  You are signed in as{' '}
                  <strong>{session?.user?.email ?? session?.user?.name}</strong>, but this invite
                  was sent to a different email.
                </p>
                <p>Please sign out and sign in with the email address that received this invite.</p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    className="rounded border px-3 py-1"
                    onClick={() => void signOut({ callbackUrl: '/signin' })}
                  >
                    Sign out
                  </button>
                  <button className="rounded border px-3 py-1" onClick={() => setAttempted(false)}>
                    Try again
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
