import Head from "next/head";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useMemo, useState } from "react";

export default function ManagerUserDetail() {
  const router = useRouter();
  const userId = typeof router.query.userId === "string" ? router.query.userId : "";
  const def = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  }, []);
  const agg = api.org.userEntriesAndLast.useQuery({ userId, start: def.start, end: def.end }, { enabled: !!userId });
  const recent = api.org.userRecentEntries.useQuery({ userId, limit: 7 }, { enabled: !!userId });
  const [openEntryId, setOpenEntryId] = useState<string | null>(null);
  const entryDetail = api.org.userEntryById.useQuery({ entryId: openEntryId! }, { enabled: !!openEntryId });

  return (
    <>
      <Head>
        <title>User Detail</title>
      </Head>
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="mb-4 text-2xl font-bold">User Overview</h1>
        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded border p-4">
            <div className="text-sm text-gray-500">Entries (7d)</div>
            <div className="text-2xl font-semibold">{agg.data?.count ?? 0}</div>
          </div>
          <div className="rounded border p-4">
            <div className="text-sm text-gray-500">Last entry</div>
            <div className="text-2xl font-semibold">{agg.data?.lastDate ? new Date(agg.data.lastDate).toLocaleDateString() : "—"}</div>
          </div>
        </section>
        <section className="rounded border p-4">
          <h2 className="mb-2 text-lg font-semibold">Recent entries</h2>
          <ul className="list-disc pl-5 text-sm">
            {(recent.data ?? []).map((e: any) => (
              <li key={e.id}>
                <button className="text-indigo-600 hover:underline" onClick={() => setOpenEntryId(e.id)}>
                  {new Date(e.entryDate).toLocaleDateString()} — {e.notes ? e.notes.slice(0, 80) : "(no notes)"}
                </button>
              </li>
            ))}
            {(recent.data ?? []).length === 0 && <li className="text-gray-500">No entries</li>}
          </ul>
        </section>
        {openEntryId && entryDetail.data && (
          <section className="mt-6 rounded border p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Entry details</h3>
              <button className="text-sm text-gray-600 hover:underline" onClick={() => setOpenEntryId(null)}>Close</button>
            </div>
            <div className="mb-2 text-sm text-gray-700">Date: {new Date(entryDetail.data.entryDate).toLocaleDateString()}</div>
            <div className="mb-4 text-sm">Notes: {entryDetail.data.notes ?? "—"}</div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-1 font-semibold">Emotions</h4>
                <ul className="list-disc pl-5 text-sm">
                  {entryDetail.data.emotionRatings.map((x: any) => (
                    <li key={x.id}>{x.emotion}: {x.rating}</li>
                  ))}
                  {entryDetail.data.emotionRatings.length === 0 && <li className="text-gray-500">None</li>}
                </ul>
              </div>
              <div>
                <h4 className="mb-1 font-semibold">Urges</h4>
                <ul className="list-disc pl-5 text-sm">
                  {entryDetail.data.urgesBehaviors.map((x: any) => (
                    <li key={x.id}>{x.urgeType}: {x.intensity} {x.actedOn ? "(acted)" : ""}</li>
                  ))}
                  {entryDetail.data.urgesBehaviors.length === 0 && <li className="text-gray-500">None</li>}
                </ul>
              </div>
              <div className="md:col-span-2">
                <h4 className="mb-1 font-semibold">Skills</h4>
                <ul className="list-disc pl-5 text-sm">
                  {entryDetail.data.skillsUsed.map((x: any) => (
                    <li key={x.id}>{x.skill.name}</li>
                  ))}
                  {entryDetail.data.skillsUsed.length === 0 && <li className="text-gray-500">None</li>}
                </ul>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}


