import Head from 'next/head';
import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { api } from '~/utils/api';
import { useRouter } from 'next/router';

export default function OnboardingPage() {
  const { status } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const state = api.org.state.useQuery(undefined, { enabled: status === 'authenticated' });
  const create = api.org.create.useMutation({
    onSuccess: async () => {
      await state.refetch();
      await router.push('/');
    },
  });

  useEffect(() => {
    if (state.data?.org) void router.replace('/');
  }, [state.data?.org, router]);

  if (status === 'unauthenticated') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <button
          className="rounded bg-indigo-600 px-4 py-2 text-white"
          onClick={() => void signIn()}
        >
          Sign in
        </button>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Create Organization</title>
      </Head>
      <main className="mx-auto max-w-md p-6">
        <h1 className="mb-4 text-2xl font-bold">Create Organization</h1>
        <p className="mb-4 text-sm text-gray-600">
          This will create your organization and set you as Admin.
        </p>
        <div className="mb-4">
          <label className="mb-1 block text-sm" htmlFor="orgname">
            Organization name
          </label>
          <input
            id="orgname"
            className="w-full rounded border p-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button
          className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
          onClick={() => create.mutate({ name })}
          disabled={!name || create.isPending}
        >
          {create.isPending ? 'Creating…' : 'Create'}
        </button>
      </main>
    </>
  );
}
