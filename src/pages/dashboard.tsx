import Head from "next/head";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { api } from "~/utils/api";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import WeeklySummary from "~/components/dashboard/WeeklySummary";
import EmotionChart from "~/components/dashboard/EmotionChart";
import SkillsFrequency from "~/components/dashboard/SkillsFrequency";
import UrgeHeatmap from "~/components/dashboard/UrgeHeatmap";

function useDefaultRange() {
  return useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  }, []);
}

export default function DashboardPage() {
  const { status } = useSession();
  const def = useDefaultRange();
  const [range, setRange] = useState(def);
  const utils = api.useUtils();
  const router = useRouter();

  // Sync range to URL (shallow) and initialize from URL if present
  useEffect(() => {
    const { start, end } = router.query as Record<string, string>;
    if (start && end) setRange({ start, end });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    router.replace({ pathname: router.pathname, query: { start: range.start, end: range.end } }, undefined, { shallow: true });
  }, [range.start, range.end]);

  const trends = api.analytics.getEmotionTrends.useQuery(
    { startDate: range.start, endDate: range.end },
    { enabled: status === "authenticated" }
  );
  const skills = api.analytics.getSkillsUsage.useQuery(
    { startDate: range.start, endDate: range.end },
    { enabled: status === "authenticated" }
  );
  const weekly = api.analytics.getWeeklySummary.useQuery(
    { weekStart: range.start },
    { enabled: status === "authenticated" }
  );
  const urges = api.analytics.getUrgePatterns.useQuery(
    { startDate: range.start, endDate: range.end },
    { enabled: status === "authenticated" }
  );
  const recent = api.diary.getRecent.useQuery(
    { limit: 30 },
    { enabled: status === "authenticated" }
  );

  // Calculate streak days (must be before any conditional returns to respect Rules of Hooks)
  const streakDays = useMemo(() => {
    const dates = (recent.data ?? []).map((e: any) => new Date(e.entryDate)).sort((a, b) => b.getTime() - a.getTime());
    if (dates.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let cursor = new Date(today);
    const hasDate = (d: Date) => dates.some((x) => {
      const y = new Date(x);
      y.setHours(0, 0, 0, 0);
      return y.getTime() === d.getTime();
    });
    // Count today first, then walk back consecutive days
    while (hasDate(cursor)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }, [recent.data]);

  if (status === "unauthenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4">You must sign in to view the dashboard.</p>
          <button className="rounded bg-indigo-600 px-4 py-2 text-white" onClick={() => void signIn()}>
            Sign in
          </button>
        </div>
      </main>
    );
  }

  const avgByEmotion: Record<string, number> = {};
  (trends.data ?? []).forEach((r) => {
    avgByEmotion[r.emotion as string] = ((avgByEmotion[r.emotion as string] ?? 0) + (r.rating as number)) / 2 || r.rating;
  });

  const totalEntries = weekly.data?.length ?? 0;

  return (
    <>
      <Head>
        <title>Dashboard · DBT Diary Card</title>
      </Head>
      <main className="mx-auto max-w-5xl p-6">
        <div className="sticky top-0 z-10 mb-6 flex flex-wrap items-end justify-between gap-4 border-b bg-white/90 px-0 py-3 backdrop-blur">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <label className="text-sm" htmlFor="start">Start</label>
            <input
              id="start"
              type="date"
              className="rounded border p-2"
              value={range.start}
              onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))}
            />
            <label className="text-sm" htmlFor="end">End</label>
            <input
              id="end"
              type="date"
              className="rounded border p-2"
              value={range.end}
              onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))}
            />
            <Link
              href={`/diary?date=${range.end}`}
              className="ml-2 rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              onMouseEnter={() => {
                // Prefetch common diary data
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                utils.skills.getAll.prefetch();
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                utils.diary.getByDate.prefetch({ date: range.end });
              }}
            >
              New Entry
            </Link>
            <div className="ml-2 flex items-center gap-2 text-sm">
              <button
                className="rounded border px-2 py-1 hover:bg-gray-50"
                onClick={() => setRange(def)}
                title="Last 7 days"
              >
                7d
              </button>
              <button
                className="rounded border px-2 py-1 hover:bg-gray-50"
                onClick={() => {
                  const end = new Date();
                  const start = new Date();
                  start.setDate(end.getDate() - 13);
                  setRange({ start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) });
                }}
                title="Last 14 days"
              >
                14d
              </button>
              <button
                className="rounded border px-2 py-1 hover:bg-gray-50"
                onClick={() => {
                  const end = new Date();
                  const start = new Date();
                  start.setDate(end.getDate() - 29);
                  setRange({ start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) });
                }}
                title="Last 30 days"
              >
                30d
              </button>
              <button
                className="rounded border px-2 py-1 hover:bg-gray-50"
                onClick={() => setRange({ start: def.start, end: def.end })}
                title="Today"
              >
                Today
              </button>
            </div>
          </div>
        </div>

        <WeeklySummary
          entriesCount={weekly.isLoading ? 0 : totalEntries}
          skillsCount={skills.isLoading ? 0 : (skills.data ?? []).reduce((a, b) => a + (b.count as number), 0)}
          emotionsCount={trends.isLoading ? 0 : Object.keys(avgByEmotion).length}
        />

        <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded border p-4">
            <h2 className="mb-3 text-lg font-semibold">Emotion Trends</h2>
            {trends.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton width={120} />
                    <Skeleton width={200} height={8} />
                  </div>
                ))}
              </div>
            ) : (
              <EmotionChart trends={(trends.data as any) ?? []} />
            )}
          </div>

          <div className="rounded border p-4">
            <h2 className="mb-3 text-lg font-semibold">Top Skills</h2>
            {skills.isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton width={120} />
                    <Skeleton width={200} height={8} />
                  </div>
                ))}
              </div>
            ) : (
              <SkillsFrequency items={((skills.data ?? []) as any)} />
            )}
          </div>
        </section>

        <section className="mb-8 rounded border p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Urge Heatmap</h2>
            <div className="text-sm text-gray-500">Range: {range.start} → {range.end}</div>
          </div>
          {urges.isLoading ? (
            <div className="space-y-2">
              <span className="inline-block h-6 w-full animate-pulse rounded bg-gray-200" />
              <span className="inline-block h-6 w-full animate-pulse rounded bg-gray-200" />
              <span className="inline-block h-6 w-full animate-pulse rounded bg-gray-200" />
            </div>
          ) : (
            <UrgeHeatmap start={range.start} end={range.end} items={((urges.data ?? []) as any)} />
          )}
        </section>

        <section className="mb-8 rounded border p-4">
          <h2 className="mb-1 text-lg font-semibold">Streak</h2>
          <div className="text-sm text-gray-600">Consecutive days with an entry (including today)</div>
          <div className="mt-2 text-3xl font-bold">{streakDays} day{streakDays === 1 ? "" : "s"}</div>
        </section>
      </main>
    </>
  );
}

function Skeleton({ width = 80, height = 24 }: { width?: number | string; height?: number | string }) {
  return (
    <span
      className="inline-block animate-pulse rounded bg-gray-200"
      style={{ width, height }}
      aria-hidden
    />
  );
}

// Sparkline moved to dedicated component
