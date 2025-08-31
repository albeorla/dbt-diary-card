import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { useSession, signIn } from "next-auth/react";
import WeekView from "~/components/calendar/WeekView";

function toYMD(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
}

export default function WeekPage() {
  const router = useRouter();
  const { status } = useSession();
  const dateParam = (router.query.date as string) ?? toYMD(new Date());
  const weekStart = useMemo(() => {
    const d = new Date(dateParam);
    const day = (d.getDay() + 6) % 7; // Mon=0
    d.setDate(d.getDate() - day);
    return toYMD(d);
  }, [dateParam]);

  const goPrev = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    void router.replace(`/week/${toYMD(d)}`);
  };
  const goNext = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    void router.replace(`/week/${toYMD(d)}`);
  };

  if (status === "unauthenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4">You must sign in to view the weekly view.</p>
          <button className="rounded bg-indigo-600 px-4 py-2 text-white" onClick={() => void signIn()}>
            Sign in
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Week · DBT Diary Card</title>
      </Head>
      <main className="mx-auto max-w-5xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <button className="rounded border px-3 py-2 hover:bg-gray-50" onClick={goPrev} aria-label="Previous week">
            ←
          </button>
          <h1 className="text-2xl font-semibold">Week of {weekStart}</h1>
          <button className="rounded border px-3 py-2 hover:bg-gray-50" onClick={goNext} aria-label="Next week">
            →
          </button>
        </div>

        <WeekView weekStart={weekStart} />
      </main>
    </>
  );
}

