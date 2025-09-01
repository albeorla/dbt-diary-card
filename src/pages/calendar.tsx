import Head from 'next/head';
import { useEffect, useMemo, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import CalendarView from '~/components/calendar/CalendarView';
import { api } from '~/utils/api';

export default function CalendarPage() {
  const { status } = useSession();
  const today = useMemo(() => new Date(), []);
  const [yearMonth, setYearMonth] = useState<{ year: number; month: number }>(() => ({
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  }));
  const utils = api.useUtils();

  // Prefetch common data for snappy interactions
  useEffect(() => {
    const d = new Date();
    const ymd = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
    void utils.skills.getAll.prefetch();
    void utils.diary.getByDate.prefetch({ date: ymd });
  }, [utils]);

  const prevMonth = () => {
    setYearMonth(({ year, month }) => {
      const d = new Date(year, month - 2, 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    });
  };
  const nextMonth = () => {
    setYearMonth(({ year, month }) => {
      const d = new Date(year, month, 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    });
  };

  if (status === 'unauthenticated') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4">You must sign in to view the calendar.</p>
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
        <title>Calendar · DBT Diary Card</title>
      </Head>
      <main className="mx-auto max-w-5xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <button
            className="rounded border px-3 py-2 hover:bg-gray-50"
            onClick={prevMonth}
            aria-label="Previous month"
          >
            ←
          </button>
          <h1 className="text-2xl font-semibold">
            {new Date(yearMonth.year, yearMonth.month - 1, 1).toLocaleString(undefined, {
              month: 'long',
              year: 'numeric',
            })}
          </h1>
          <div className="flex items-center gap-2">
            <button
              className="rounded border px-3 py-2 hover:bg-gray-50"
              onClick={() => {
                const d = new Date();
                setYearMonth({ year: d.getFullYear(), month: d.getMonth() + 1 });
                // hint: keyboard shortcuts available in grid
              }}
              aria-label="Jump to current month"
            >
              Today
            </button>
            <button
              className="rounded border px-3 py-2 hover:bg-gray-50"
              onClick={nextMonth}
              aria-label="Next month"
            >
              →
            </button>
          </div>
        </div>

        <CalendarView year={yearMonth.year} month={yearMonth.month} />
      </main>
    </>
  );
}
