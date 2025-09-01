import Head from 'next/head';
import { getProviders, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function SignInPage() {
  const [providers, setProviders] = useState<Record<string, any> | null>(null);
  useEffect(() => {
    void getProviders().then((p) => setProviders(p));
  }, []);

  return (
    <>
      <Head>
        <title>Sign in</title>
      </Head>
      <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center p-6 text-center">
        <h1 className="mb-6 text-3xl font-bold">Sign in</h1>
        {!providers && <div className="animate-pulse rounded bg-gray-200 px-16 py-6" />}
        {providers && (
          <div className="flex flex-col gap-3">
            {Object.values(providers).map((provider) => (
              <button
                key={provider.id}
                onClick={() => void signIn(provider.id, { callbackUrl: '/' })}
                className="rounded bg-gray-800 px-4 py-2 text-white hover:bg-black"
              >
                Continue with {provider.name}
              </button>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
