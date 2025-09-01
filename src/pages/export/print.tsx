import Head from 'next/head';
import { useSession, signIn } from 'next-auth/react';
import { api } from '~/utils/api';
import { useMemo } from 'react';

function toYMD(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
}

export default function ExportPrintPage() {
  const { status } = useSession();
  const end = useMemo(() => new Date(), []);
  const start = useMemo(() => {
    const s = new Date(end);
    s.setDate(end.getDate() - 29);
    return s;
  }, [end]);
  const entries = api.diary.getRange.useQuery(
    { startDate: toYMD(start), endDate: toYMD(end) },
    { enabled: status === 'authenticated' },
  );

  if (status === 'unauthenticated') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4">You must sign in to view this page.</p>
          <button
            className="rounded bg-indigo-600 px-4 py-2 text-white"
            onClick={() => void signIn()}
          >
            Sign in
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Print Export · DBT Diary Card</title>
      </Head>
      <main className="mx-auto max-w-4xl p-6 print-area">
        <header className="mb-6 print:mb-4">
          <h1 className="text-2xl font-bold">DBT Diary Export</h1>
          <div className="text-sm text-gray-600">
            Range: {toYMD(start)} → {toYMD(end)}
          </div>
        </header>
        <section className="space-y-4">
          {(entries.data ?? []).map((e: any) => (
            <article key={e.id} className="break-inside-avoid rounded border p-3">
              <h2 className="text-lg font-semibold">{toYMD(new Date(e.entryDate))}</h2>
              <div className="text-sm whitespace-pre-wrap text-gray-800">{e.notes ?? ''}</div>
            </article>
          ))}
          {entries.data?.length === 0 && (
            <div className="text-sm text-gray-500">No entries to export.</div>
          )}
        </section>
      </main>
    </>
  );
}
