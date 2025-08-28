import Head from "next/head";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { api } from "~/utils/api";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function HistoryPage() {
  const { status } = useSession();
  const router = useRouter();
  const utils = api.useUtils();
  const today = useMemo(() => new Date(), []);
  const [range, setRange] = useState<{ start: string; end: string }>(() => {
    const end = new Date(today);
    const start = new Date(today);
    start.setDate(end.getDate() - 29);
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  });

  const entries = api.diary.getRange.useQuery(
    { startDate: range.start, endDate: range.end },
    { enabled: status === "authenticated" }
  );

  const [sortAsc, setSortAsc] = useState(true);
  const [query, setQuery] = useState("");

  // Sync filters with URL (shallow) so back/forward restore state
  useEffect(() => {
    const q: any = {
      start: range.start,
      end: range.end,
      asc: sortAsc ? "1" : "0",
    };
    if (query) q.q = query;
    router.replace({ pathname: router.pathname, query: q }, undefined, { shallow: true });
  }, [range.start, range.end, sortAsc, query]);
  const filtered = (entries.data ?? [])
    .filter((e: any) => (e.notes ?? "").toLowerCase().includes(query.toLowerCase()))
    .sort((a: any, b: any) =>
      sortAsc
        ? new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
        : new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
    );

  if (status === "unauthenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4">You must sign in to view your history.</p>
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
        <title>History · DBT Diary Card</title>
      </Head>
      <main className="mx-auto max-w-5xl p-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-3xl font-bold">Diary History</h1>
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
            <input
              type="text"
              className="ml-2 rounded border p-2"
              placeholder="Search notes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              className="ml-2 rounded border px-3 py-2 text-sm hover:bg-gray-50"
              onClick={() => {
                const rows = filtered.map((e: any) => ({
                  date: new Date(e.entryDate).toISOString().slice(0, 10),
                  notes: e.notes ?? "",
                }));
                const csv = ["date,notes", ...rows.map((r) => `${r.date},"${r.notes.replace(/"/g, '""')}"`)].join("\n");
                const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `diary_${range.start}_to_${range.end}.csv`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              title="Export current range to CSV"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded border">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="border-b p-3">
                  <button className="flex items-center gap-1 hover:underline" onClick={() => setSortAsc((v) => !v)}>
                    Date {sortAsc ? "↑" : "↓"}
                  </button>
                </th>
                <th className="border-b p-3">Notes</th>
                <th className="border-b p-3">Top Emotions</th>
                <th className="border-b p-3">Urges</th>
                <th className="border-b p-3">Skills</th>
                <th className="border-b p-3"></th>
              </tr>
            </thead>
            <tbody>
              {entries.isLoading && (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td className="border-b p-3"><span className="inline-block h-4 w-24 animate-pulse rounded bg-gray-200" /></td>
                      <td className="border-b p-3"><span className="inline-block h-4 w-64 animate-pulse rounded bg-gray-200" /></td>
                      <td className="border-b p-3"><span className="inline-block h-4 w-24 animate-pulse rounded bg-gray-200" /></td>
                      <td className="border-b p-3"><span className="inline-block h-4 w-24 animate-pulse rounded bg-gray-200" /></td>
                      <td className="border-b p-3"><span className="inline-block h-4 w-24 animate-pulse rounded bg-gray-200" /></td>
                      <td className="border-b p-3"></td>
                    </tr>
                  ))}
                </>
              )}
              {filtered.map((e) => {
                const date = new Date((e as any).entryDate).toISOString().slice(0, 10);
                return (
                  <tr key={(e as any).id} className="hover:bg-gray-50">
                    <td className="border-b p-3 align-top">{date}</td>
                    <td className="border-b p-3 align-top max-w-[320px] truncate" title={(e as any).notes ?? ""}>
                      {(e as any).notes ?? ""}
                    </td>
                    <td className="border-b p-3 align-top">
                      {/* This page uses range query without includes; keep minimal */}
                      <span className="text-gray-500">—</span>
                    </td>
                    <td className="border-b p-3 align-top">
                      <span className="text-gray-500">—</span>
                    </td>
                    <td className="border-b p-3 align-top">
                      <span className="text-gray-500">—</span>
                    </td>
                    <td className="border-b p-3 align-top">
                      <Link
                        className="text-indigo-600 hover:underline"
                        href={`/diary?date=${date}`}
                        onMouseEnter={() => {
                          // eslint-disable-next-line @typescript-eslint/no-floating-promises
                          utils.diary.getByDate.prefetch({ date });
                          // eslint-disable-next-line @typescript-eslint/no-floating-promises
                          utils.skills.getAll.prefetch();
                        }}
                      >
                        View/Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {entries.data?.length === 0 && (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={6}>
                    No entries in range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}


