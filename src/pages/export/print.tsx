import Head from 'next/head';
import { useSession, signIn } from 'next-auth/react';
import { api } from '~/utils/api';
import { useMemo } from 'react';
import { useRouter } from 'next/router';

function toYMD(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
}

export default function ExportPrintPage() {
  const { status } = useSession();
  const router = useRouter();
  const end = useMemo(() => {
    const qEnd = typeof router.query.end === 'string' ? router.query.end : '';
    const d = qEnd ? new Date(qEnd) : new Date();
    return d;
  }, [router.query.end]);
  const start = useMemo(() => {
    const qStart = typeof router.query.start === 'string' ? router.query.start : '';
    if (qStart) return new Date(qStart);
    const s = new Date(end);
    s.setDate(end.getDate() - 29);
    return s;
  }, [router.query.start, end]);
  const entries = api.diary.getRangeDetailed.useQuery(
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
          {(entries.data ?? []).map((e: any) => {
            const date = toYMD(new Date(e.entryDate));
            const topEmotions = (e.emotionRatings || [])
              .slice()
              .sort((a: any, b: any) => b.rating - a.rating)
              .slice(0, 3)
              .map((x: any) => `${x.emotion}: ${x.rating}`)
              .join(', ');
            const urges = (e.urgesBehaviors || [])
              .slice()
              .sort((a: any, b: any) => b.intensity - a.intensity)
              .map((x: any) => `${x.urgeType}: ${x.intensity}${x.actedOn ? ' (acted)' : ''}`)
              .join(', ');
            const skills = (e.skillsUsed || [])
              .map((s: any) => s.skill?.name)
              .filter(Boolean)
              .join(', ');
            return (
              <article key={e.id} className="break-inside-avoid rounded border p-3">
                <h2 className="text-lg font-semibold">{date}</h2>
                <div className="mt-1 text-sm text-gray-700">
                  <strong>Top emotions:</strong> {topEmotions || '—'}
                </div>
                <div className="text-sm text-gray-700">
                  <strong>Urges:</strong> {urges || '—'}
                </div>
                <div className="text-sm text-gray-700">
                  <strong>Skills:</strong> {skills || '—'}
                </div>
                <div className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
                  {e.notes ?? ''}
                </div>
              </article>
            );
          })}
          {entries.data?.length === 0 && (
            <div className="text-sm text-gray-500">No entries to export.</div>
          )}
        </section>
      </main>
    </>
  );
}
