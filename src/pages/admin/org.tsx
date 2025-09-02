import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { api } from '~/utils/api';
import { useState } from 'react';
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

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
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Organization Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Manage your team, view insights, and track organization activity
            </p>
          </div>
          {state.data?.org && (
            <section className="mb-8">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Manager Summary Card */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Managers</h2>
                    <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full">
                      7 days
                    </div>
                  </div>
                  <div className="space-y-3">
                    {(mgrAgg.data ?? []).slice(0, 4).map((m: any) => (
                      <a
                        key={m.managerId}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                        href={`/manager?mid=${m.managerId}`}
                      >
                        <span className="font-medium text-gray-900 truncate group-hover:text-blue-600">
                          {m.managerName}
                        </span>
                        <div className="text-right text-sm text-gray-600">
                          <div>{m.usersCount} users</div>
                          <div className="text-xs">{m.entriesCount} entries</div>
                        </div>
                      </a>
                    ))}
                    {(mgrAgg.data ?? []).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">📊</div>
                        <div className="text-sm">No data available</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Activity Chart */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h2>
                  <div className="h-64">
                    {(usrAgg.data ?? []).length > 0 ? (
                      <Bar
                        data={{
                          labels: (usrAgg.data ?? [])
                            .slice(0, 6)
                            .map((u: any) =>
                              u.name.length > 10 ? `${u.name.slice(0, 10)}...` : u.name,
                            ),
                          datasets: [
                            {
                              label: 'Entries',
                              data: (usrAgg.data ?? []).slice(0, 6).map((u: any) => u.entryCount),
                              backgroundColor: 'rgba(59, 130, 246, 0.8)',
                              borderColor: 'rgba(59, 130, 246, 1)',
                              borderWidth: 1,
                              borderRadius: 4,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false,
                            },
                            tooltip: {
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                              titleColor: 'white',
                              bodyColor: 'white',
                              borderColor: 'rgba(255, 255, 255, 0.1)',
                              borderWidth: 1,
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              max:
                                Math.max(...(usrAgg.data ?? []).map((u: any) => u.entryCount)) + 2,
                              grid: {
                                color: 'rgba(0, 0, 0, 0.05)',
                              },
                              ticks: {
                                stepSize: 1,
                                color: '#6b7280',
                              },
                            },
                            x: {
                              grid: {
                                display: false,
                              },
                              ticks: {
                                color: '#6b7280',
                              },
                            },
                          },
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <div className="text-4xl mb-2">📈</div>
                          <div className="text-sm">No activity data</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <div className="text-2xl font-bold text-green-700">
                          {(mgrAgg.data ?? []).length}
                        </div>
                        <div className="text-sm text-green-600">Active Managers</div>
                      </div>
                      <div className="text-green-500 text-2xl">👥</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <div className="text-2xl font-bold text-blue-700">
                          {(usrAgg.data ?? []).length}
                        </div>
                        <div className="text-sm text-blue-600">Active Users</div>
                      </div>
                      <div className="text-blue-500 text-2xl">🧑‍💻</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <div className="text-2xl font-bold text-purple-700">
                          {(usrAgg.data ?? []).reduce(
                            (sum: number, u: any) => sum + u.entryCount,
                            0,
                          )}
                        </div>
                        <div className="text-sm text-purple-600">Total Entries</div>
                      </div>
                      <div className="text-purple-500 text-2xl">📝</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
          {!state.data?.org && (
            <p className="text-sm text-gray-600">
              No organization found. Create one at /onboarding.
            </p>
          )}
          {state.data?.org && (
            <div className="mb-8 rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Manage roles and assignments for your organization
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Manager
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {(members.data ?? []).map((m: any) => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {m.name?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{m.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <select
                            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={m.role}
                            onChange={(e) =>
                              setRole.mutate({ membershipId: m.id, role: e.target.value as any })
                            }
                          >
                            <option value="ADMIN">Admin</option>
                            <option value="MANAGER">Manager</option>
                            <option value="USER">User</option>
                          </select>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {m.role === 'USER' ? (
                            <select
                              className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {state.data?.org && (
            <div className="mb-8 rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900">Organization Trends</h2>
                <p className="mt-1 text-sm text-gray-600">Insights from the last 7 days</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Emotions Chart */}
                  <div>
                    <h3 className="mb-4 text-base font-medium text-gray-900">Top Emotions</h3>
                    <div className="h-64">
                      {(emo.data ?? []).length > 0 ? (
                        <Doughnut
                          data={{
                            labels: (emo.data ?? []).slice(0, 6).map((e: any) => e.emotion),
                            datasets: [
                              {
                                data: (emo.data ?? []).slice(0, 6).map((e: any) => e.avg),
                                backgroundColor: [
                                  'rgba(239, 68, 68, 0.8)',
                                  'rgba(245, 158, 11, 0.8)',
                                  'rgba(34, 197, 94, 0.8)',
                                  'rgba(59, 130, 246, 0.8)',
                                  'rgba(147, 51, 234, 0.8)',
                                  'rgba(236, 72, 153, 0.8)',
                                ],
                                borderColor: [
                                  'rgba(239, 68, 68, 1)',
                                  'rgba(245, 158, 11, 1)',
                                  'rgba(34, 197, 94, 1)',
                                  'rgba(59, 130, 246, 1)',
                                  'rgba(147, 51, 234, 1)',
                                  'rgba(236, 72, 153, 1)',
                                ],
                                borderWidth: 2,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'bottom' as const,
                                labels: {
                                  padding: 15,
                                  usePointStyle: true,
                                  font: {
                                    size: 12,
                                  },
                                },
                              },
                              tooltip: {
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                titleColor: 'white',
                                bodyColor: 'white',
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                borderWidth: 1,
                                callbacks: {
                                  label: function (context: any) {
                                    return `${context.label}: ${context.parsed.toFixed(1)}`;
                                  },
                                },
                              },
                            },
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <div className="text-center">
                            <div className="text-4xl mb-2">😊</div>
                            <div className="text-sm">No emotion data</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills Chart */}
                  <div>
                    <h3 className="mb-4 text-base font-medium text-gray-900">Top Skills</h3>
                    <div className="h-64">
                      {(skl.data ?? []).length > 0 ? (
                        <Bar
                          data={{
                            labels: (skl.data ?? [])
                              .slice(0, 6)
                              .map((s: any) =>
                                s.name.length > 15 ? `${s.name.slice(0, 15)}...` : s.name,
                              ),
                            datasets: [
                              {
                                label: 'Mentions',
                                data: (skl.data ?? []).slice(0, 6).map((s: any) => s.count),
                                backgroundColor: 'rgba(16, 185, 129, 0.8)',
                                borderColor: 'rgba(16, 185, 129, 1)',
                                borderWidth: 1,
                                borderRadius: 4,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                display: false,
                              },
                              tooltip: {
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                titleColor: 'white',
                                bodyColor: 'white',
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                borderWidth: 1,
                              },
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                max: Math.max(...(skl.data ?? []).map((s: any) => s.count)) + 2,
                                grid: {
                                  color: 'rgba(0, 0, 0, 0.05)',
                                },
                                ticks: {
                                  stepSize: 1,
                                  color: '#6b7280',
                                },
                              },
                              x: {
                                grid: {
                                  display: false,
                                },
                                ticks: {
                                  color: '#6b7280',
                                  maxRotation: 45,
                                },
                              },
                            },
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          <div className="text-center">
                            <div className="text-4xl mb-2">🛠️</div>
                            <div className="text-sm">No skills data</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {state.data?.org && (
            <div className="mb-8 rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900">Invite New Member</h2>
                <p className="mt-1 text-sm text-gray-600">Add new team members by email address</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={emailRole}
                      onChange={(e) => setEmailRole(e.target.value)}
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="MANAGER">Manager</option>
                      <option value="USER">User</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                    <select
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      value={emailManager}
                      onChange={(e) => setEmailManager(e.target.value)}
                      disabled={emailRole !== 'USER'}
                    >
                      <option value="">No manager</option>
                      {managers.map((m: any) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      {assignByEmail.isPending ? 'Sending...' : 'Send Invite'}
                    </button>
                  </div>
                </div>
                {assignByEmail.data?.status === 'invited' && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className="text-amber-400 text-lg">✅</div>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-amber-800">Invitation Sent</h3>
                        <div className="mt-2 text-sm text-amber-700">
                          <p>Magic link created for {email}</p>
                          <a
                            className="mt-2 inline-flex items-center font-medium text-amber-800 hover:text-amber-900 underline"
                            href={`${inviteBase}/api/invite/accept/${assignByEmail.data.token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View invitation link
                          </a>
                          <p className="mt-1 text-xs text-amber-600">
                            Expires: {new Date(assignByEmail.data.expiresAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {state.data?.org && (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900">Pending Invitations</h2>
                <p className="mt-1 text-sm text-gray-600">Manage outstanding team invitations</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Email Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Manager
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Expires
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {(invites.data ?? []).map((i: any) => (
                      <tr key={i.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div>
                            <div
                              className="text-sm font-medium text-gray-900 truncate"
                              title={i.email}
                            >
                              {i.email}
                            </div>
                            <a
                              className="text-sm text-blue-600 hover:text-blue-800 underline"
                              href={`${inviteBase}/api/invite/accept/${i.token}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View invitation link
                            </a>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800">
                            {i.role}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {i.managerName ?? '—'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {new Date(i.expiresAt).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                              onClick={() => resendInvite.mutate({ inviteId: i.id })}
                              disabled={resendInvite.isPending}
                            >
                              {resendInvite.isPending ? 'Sending...' : 'Resend'}
                            </button>
                            <button
                              className="inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                              onClick={() => revokeInvite.mutate({ inviteId: i.id })}
                              disabled={revokeInvite.isPending}
                            >
                              {revokeInvite.isPending ? 'Revoking...' : 'Revoke'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(invites.data ?? []).length === 0 && (
                      <tr>
                        <td className="px-6 py-8 text-center text-gray-500" colSpan={5}>
                          <div className="text-center">
                            <div className="text-4xl mb-2">📧</div>
                            <div className="text-sm">No pending invitations</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
