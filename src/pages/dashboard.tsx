import Head from "next/head";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { api } from "~/utils/api";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";

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
  const recent = api.diary.getRecent.useQuery(
    { limit: 30 },
    { enabled: status === "authenticated" }
  );

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
    avgByEmotion[r.emotion as string] =
      ((avgByEmotion[r.emotion as string] ?? 0) + (r.rating as number)) / 2 || r.rating;
  });

  const totalEntries = weekly.data?.length ?? 0;
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

        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded border p-4">
            <div className="text-sm text-gray-500">Entries</div>
            <div className="text-2xl font-semibold">{weekly.isLoading ? <Skeleton width={48} /> : totalEntries}</div>
          </div>
          <div className="rounded border p-4">
            <div className="text-sm text-gray-500">Skills Used</div>
            <div className="text-2xl font-semibold">{skills.isLoading ? <Skeleton width={48} /> : (skills.data ?? []).reduce((a, b) => a + (b.count as number), 0)}</div>
          </div>
          <div className="rounded border p-4">
            <div className="text-sm text-gray-500">Tracked Emotions</div>
            <div className="text-2xl font-semibold">{trends.isLoading ? <Skeleton width={48} /> : Object.keys(avgByEmotion).length}</div>
          </div>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded border p-4">
            <h2 className="mb-3 text-lg font-semibold">Average Emotions</h2>
            <div className="space-y-2">
              {trends.isLoading && (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton width={120} />
                      <Skeleton width={200} height={8} />
                    </div>
                  ))}
                </div>
              )}
              {!trends.isLoading && Object.entries(avgByEmotion).map(([emotion, avg]) => (
                <div key={emotion} className="flex items-center gap-3">
                  <span className="w-40 text-sm">{emotion}</span>
                  <div className="h-2 grow rounded bg-gray-100">
                    <div className="h-2 rounded bg-indigo-500" style={{ width: `${(avg as number) * 10}%` }} />
                  </div>
                  <span className="w-10 text-right text-sm">{(avg as number).toFixed(1)}</span>
                </div>
              ))}
              {Object.keys(avgByEmotion).length === 0 && (
                <div className="text-sm text-gray-500">No data</div>
              )}
            </div>
          </div>

          <div className="rounded border p-4">
            <h2 className="mb-3 text-lg font-semibold">Top Skills</h2>
            <div className="space-y-2">
              {skills.isLoading && (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton width={120} />
                      <Skeleton width={200} height={8} />
                    </div>
                  ))}
                </div>
              )}
              {!skills.isLoading && (skills.data ?? []).map((s) => (
                <div key={s.name as string} className="flex items-center gap-3">
                  <span className="w-40 text-sm">{s.name as string}</span>
                  <div className="h-2 grow rounded bg-gray-100">
                    <div className="h-2 rounded bg-emerald-500" style={{ width: `${Math.min(100, (s.count as number) * 10)}%` }} />
                  </div>
                  <span className="w-10 text-right text-sm">{s.count as number}</span>
                </div>
              ))}
              {(skills.data ?? []).length === 0 && (
                <div className="text-sm text-gray-500">No data</div>
              )}
            </div>
          </div>
        </section>

        <section className="mb-8 rounded border p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Emotion Trends</h2>
            <div className="text-sm text-gray-500">Range: {range.start} → {range.end}</div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {Object.entries(
              (trends.data ?? []).reduce<Record<string, { date: string; rating: number }[]>>((acc, r: any) => {
                (acc[r.emotion] ??= []).push({ date: new Date(r.date).toISOString().slice(0, 10), rating: r.rating });
                return acc;
              }, {})
            ).map(([emotion, points]) => (
              <div key={emotion} className="flex items-center gap-3">
                <span className="w-40 text-sm">{emotion}</span>
                <Sparkline data={points} height={28} />
              </div>
            ))}
            {(!trends.data || trends.data.length === 0) && (
              <div className="text-sm text-gray-500">No data</div>
            )}
          </div>
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

function Sparkline({ data, height = 24 }: { data: { date: string; rating: number }[]; height?: number }) {
  const width = 160;
  const padding = 4;
  const xs = data
    .map((d) => d.date)
    .sort()
    .filter((v, i, a) => a.indexOf(v) === i);
  const points = xs.map((x, i) => {
    const dayVals = data.filter((d) => d.date === x).map((d) => d.rating);
    const val = dayVals.length ? dayVals.reduce((a, b) => a + b, 0) / dayVals.length : 0;
    const px = padding + (i / Math.max(1, xs.length - 1)) * (width - padding * 2);
    const py = padding + (1 - Math.min(10, Math.max(0, val)) / 10) * (height - padding * 2);
    return [px, py] as const;
  });
  const dAttr = points.map((p, i) => (i === 0 ? `M ${p[0]},${p[1]}` : `L ${p[0]},${p[1]}`)).join(" ");
  return (
    <svg width={width} height={height} className="text-indigo-500">
      <rect x={0} y={0} width={width} height={height} fill="none" />
      <path d={dAttr} stroke="currentColor" strokeWidth={2} fill="none" />
    </svg>
  );
}

