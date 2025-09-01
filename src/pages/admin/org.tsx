import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { api } from '~/utils/api';
import { useState } from 'react';

export default function AdminOrgPage() {
  const { status } = useSession();
  const state = api.org.state.useQuery(undefined, { enabled: status === 'authenticated' });
  const members = api.org.listMembers.useQuery(undefined, { enabled: !!state.data?.org });
  const setRole = api.org.setRole.useMutation({ onSuccess: () => members.refetch() });
  const assign = api.org.assignManager.useMutation({ onSuccess: () => members.refetch() });
  const assignByEmail = api.org.assignByEmail.useMutation();
  const invites = api.org.listInvites.useQuery(undefined, { enabled: !!state.data?.org });
  const resendInvite = api.org.resendInvite.useMutation({ onSuccess: () => invites.refetch() });
  const revokeInvite = api.org.revokeInvite.useMutation({ onSuccess: () => invites.refetch() });
  const [email, setEmail] = useState('');
  const [emailRole, setEmailRole] = useState('USER');
  const managers = (members.data ?? []).filter((m: any) => m.role === 'MANAGER');
  const [emailManager, setEmailManager] = useState<string | ''>('');
  const def = {
    start: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    end: new Date().toISOString().slice(0, 10),
  };
  const mgrAgg = api.org.adminManagerSummary.useQuery(def, { enabled: !!state.data?.org });
  const usrAgg = api.org.adminUserSummary.useQuery(def, { enabled: !!state.data?.org });
  const emo = api.org.adminTrendsEmotions.useQuery(def, { enabled: !!state.data?.org });
  const skl = api.org.adminTrendsSkills.useQuery(def, { enabled: !!state.data?.org });

  if (status === 'unauthenticated') return null;
  const inviteBase = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <>
      <Head>
        <title>Organization Admin · DBT Diary Card</title>
      </Head>
      <main className="mx-auto max-w-4xl p-6">
        <h1 className="mb-4 text-2xl font-bold">Organization Admin</h1>
        {state.data?.org && (
          <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded border p-4">
              <h2 className="mb-2 font-semibold">Managers (7d)</h2>
              <div className="space-y-2">
                {(mgrAgg.data ?? []).map((m: any) => (
                  <a
                    key={m.managerId}
                    className="flex items-center justify-between text-sm hover:underline"
                    href={`/manager?mid=${m.managerId}`}
                  >
                    <span className="truncate">{m.managerName}</span>
                    <span className="text-gray-600">
                      users: {m.usersCount} · entries: {m.entriesCount}
                    </span>
                  </a>
                ))}
                {(mgrAgg.data ?? []).length === 0 && (
                  <div className="text-sm text-gray-500">No data</div>
                )}
              </div>
            </div>
            <div className="rounded border p-4">
              <h2 className="mb-2 font-semibold">Users (7d)</h2>
              <div className="space-y-2">
                {(usrAgg.data ?? []).map((u: any) => (
                  <div key={u.userId} className="flex items-center justify-between text-sm">
                    <span className="truncate">{u.name}</span>
                    <span className="text-gray-600">entries: {u.entryCount}</span>
                  </div>
                ))}
                {(usrAgg.data ?? []).length === 0 && (
                  <div className="text-sm text-gray-500">No data</div>
                )}
              </div>
            </div>
          </section>
        )}
        {!state.data?.org && (
          <p className="text-sm text-gray-600">No organization found. Create one at /onboarding.</p>
        )}
        {state.data?.org && (
          <div className="overflow-x-auto rounded border">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="border-b p-3">Name</th>
                  <th className="border-b p-3">Role</th>
                  <th className="border-b p-3">Manager</th>
                </tr>
              </thead>
              <tbody>
                {(members.data ?? []).map((m: any) => (
                  <tr key={m.id}>
                    <td className="border-b p-3">{m.name}</td>
                    <td className="border-b p-3">
                      <select
                        className="rounded border p-1"
                        value={m.role}
                        onChange={(e) =>
                          setRole.mutate({ membershipId: m.id, role: e.target.value as any })
                        }
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="USER">USER</option>
                      </select>
                    </td>
                    <td className="border-b p-3">
                      {m.role === 'USER' ? (
                        <select
                          className="rounded border p-1"
                          value={m.managerId ?? ''}
                          onChange={(e) =>
                            assign.mutate({
                              membershipId: m.id,
                              managerMembershipId: e.target.value || null,
                            })
                          }
                        >
                          <option value="">Unassigned</option>
                          {managers.map((mgr: any) => (
                            <option key={mgr.id} value={mgr.id}>
                              {mgr.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {state.data?.org && (
          <div className="mt-6 rounded border p-4">
            <h2 className="mb-4 text-lg font-semibold">Org Trends (7d)</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-2 font-semibold">Top Emotions</h3>
                <ul className="list-disc pl-5 text-sm">
                  {(emo.data ?? []).slice(0, 5).map((e: any) => (
                    <li key={e.emotion}>
                      {e.emotion}: {e.avg.toFixed(1)}
                    </li>
                  ))}
                  {(emo.data ?? []).length === 0 && <li className="text-gray-500">No data</li>}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Top Skills</h3>
                <ul className="list-disc pl-5 text-sm">
                  {(skl.data ?? []).slice(0, 5).map((s: any) => (
                    <li key={s.name}>
                      {s.name}: {s.count}
                    </li>
                  ))}
                  {(skl.data ?? []).length === 0 && <li className="text-gray-500">No data</li>}
                </ul>
              </div>
            </div>
          </div>
        )}

        {state.data?.org && (
          <div className="mt-6 rounded border p-4">
            <h2 className="mb-2 text-lg font-semibold">Assign by email</h2>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <input
                type="email"
                className="rounded border p-2"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <select
                className="rounded border p-2"
                value={emailRole}
                onChange={(e) => setEmailRole(e.target.value)}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="MANAGER">MANAGER</option>
                <option value="USER">USER</option>
              </select>
              <select
                className="rounded border p-2"
                value={emailManager}
                onChange={(e) => setEmailManager(e.target.value)}
                disabled={emailRole !== 'USER'}
                title="Manager assignment applies to USER role"
              >
                <option value="">No manager</option>
                {managers.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <button
                className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
                onClick={async () => {
                  const res = await assignByEmail.mutateAsync({
                    email,
                    role: emailRole as any,
                    managerMembershipId: emailManager || null,
                  });
                  if (res.status === 'assigned') await members.refetch();
                }}
                disabled={!email || assignByEmail.isPending}
              >
                {assignByEmail.isPending ? 'Assigning…' : 'Assign'}
              </button>
            </div>
            {assignByEmail.data?.status === 'invited' && (
              <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                Invite created. Magic link:
                <a
                  className="ml-1 underline"
                  href={`${inviteBase}/api/invite/accept/${assignByEmail.data.token}`}
                >{`${inviteBase}/api/invite/accept/${assignByEmail.data.token}`}</a>
                <div>Expires: {new Date(assignByEmail.data.expiresAt).toLocaleString()}</div>
              </div>
            )}
          </div>
        )}

        {state.data?.org && (
          <div className="mt-6 rounded border p-4">
            <h2 className="mb-4 text-lg font-semibold">Pending Invites</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="border-b p-3">Email</th>
                    <th className="border-b p-3">Role</th>
                    <th className="border-b p-3">Manager</th>
                    <th className="border-b p-3">Expires</th>
                    <th className="border-b p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(invites.data ?? []).map((i: any) => (
                    <tr key={i.id}>
                      <td className="border-b p-3">
                        <div className="truncate" title={i.email}>
                          {i.email}
                        </div>
                        <a
                          className="text-indigo-600 underline"
                          href={`${inviteBase}/api/invite/accept/${i.token}`}
                        >
                          Magic link
                        </a>
                      </td>
                      <td className="border-b p-3">{i.role}</td>
                      <td className="border-b p-3">{i.managerName ?? '—'}</td>
                      <td className="border-b p-3">{new Date(i.expiresAt).toLocaleString()}</td>
                      <td className="border-b p-3">
                        <div className="flex gap-2">
                          <button
                            className="rounded border px-2 py-1 hover:bg-gray-50"
                            onClick={() => resendInvite.mutate({ inviteId: i.id })}
                            disabled={resendInvite.isPending}
                          >
                            {resendInvite.isPending ? 'Resending…' : 'Resend'}
                          </button>
                          <button
                            className="rounded border px-2 py-1 text-red-700 hover:bg-red-50"
                            onClick={() => revokeInvite.mutate({ inviteId: i.id })}
                            disabled={revokeInvite.isPending}
                          >
                            {revokeInvite.isPending ? 'Revoking…' : 'Revoke'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(invites.data ?? []).length === 0 && (
                    <tr>
                      <td className="p-4 text-center text-gray-500" colSpan={5}>
                        No pending invites
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
