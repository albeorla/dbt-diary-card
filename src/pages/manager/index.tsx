import Head from "next/head";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { useMemo } from "react";
import { useRouter } from "next/router";

export default function ManagerPage() {
  const { status } = useSession();
  const router = useRouter();
  const mid = typeof router.query.mid === "string" ? router.query.mid : null;
  const users = api.org.managerUsers.useQuery(undefined, { enabled: !mid });
  const def = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  }, []);
  const summary = api.org.managerSummary.useQuery({ start: def.start, end: def.end }, { enabled: !mid });
  const adminUsers = api.org.adminManagerUsers.useQuery({ managerMembershipId: mid! }, { enabled: !!mid });
  const adminSummary = api.org.adminManagerSummaryFor.useQuery({ managerMembershipId: mid!, start: def.start, end: def.end }, { enabled: !!mid });
  const emo = api.org.managerTrendsEmotions.useQuery({ start: def.start, end: def.end, managerMembershipId: mid ?? undefined }, { enabled: true });
  const skl = api.org.managerTrendsSkills.useQuery({ start: def.start, end: def.end, managerMembershipId: mid ?? undefined }, { enabled: true });

  if (status === "unauthenticated") return null;

  return (
    <>
      <Head>
        <title>Manager · DBT Diary Card</title>
      </Head>
      <main className="mx-auto max-w-4xl p-6">
        <h1 className="mb-4 text-2xl font-bold">My Users</h1>
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded border p-4">
            <div className="text-sm text-gray-500">Users</div>
            <div className="text-2xl font-semibold">{users.data?.length ?? 0}</div>
          </div>
          <div className="rounded border p-4">
            <div className="text-sm text-gray-500">Range</div>
            <div className="text-2xl font-semibold">7 days</div>
          </div>
        </div>
        <div className="overflow-x-auto rounded border">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="border-b p-3">User</th>
                <th className="border-b p-3">Entries (7d)</th>
              </tr>
            </thead>
            <tbody>
              {(!mid ? (users.data ?? []) : (adminUsers.data ?? [])).map((u: any) => {
                const cnt = (!mid ? summary.data : adminSummary.data)?.find((r: any) => r.userId === u.userId)?.entryCount ?? 0;
                return (
                  <tr key={u.userId} className="hover:bg-gray-50">
                    <td className="border-b p-3">
                      <a className="text-indigo-600 hover:underline" href={`/manager/user/${u.userId}`}>{u.name}</a>
                    </td>
                    <td className="border-b p-3">{cnt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 rounded border p-4">
          <h2 className="mb-4 text-lg font-semibold">Team Trends (7d)</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold">Top Emotions</h3>
              <ul className="list-disc pl-5 text-sm">
                {(emo.data ?? []).slice(0, 5).map((e: any) => (
                  <li key={e.emotion}>{e.emotion}: {e.avg.toFixed(1)}</li>
                ))}
                {(emo.data ?? []).length === 0 && <li className="text-gray-500">No data</li>}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-semibold">Top Skills</h3>
              <ul className="list-disc pl-5 text-sm">
                {(skl.data ?? []).slice(0, 5).map((s: any) => (
                  <li key={s.name}>{s.name}: {s.count}</li>
                ))}
                {(skl.data ?? []).length === 0 && <li className="text-gray-500">No data</li>}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}


