import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { api } from '~/utils/api';
import { useMemo } from 'react';
import { useRouter } from 'next/router';
import React from 'react';
import { Box, Typography, Avatar, Chip, IconButton } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Visibility as ViewIcon,
  People as PeopleIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
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
import ModernCard from '~/components/ui/ModernCard';
import StatCard from '~/components/ui/StatCard';
import ChartCard from '~/components/ui/ChartCard';
import EmptyState from '~/components/ui/EmptyState';
import Link from 'next/link';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function ManagerPage() {
  const { status } = useSession();
  const router = useRouter();
  const mid = typeof router.query.mid === 'string' ? router.query.mid : null;
  const users = api.org.managerUsers.useQuery(undefined, { enabled: !mid });
  const def = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  }, []);
  const summary = api.org.managerSummary.useQuery(
    { start: def.start, end: def.end },
    { enabled: !mid },
  );
  const adminUsers = api.org.adminManagerUsers.useQuery(
    { managerMembershipId: mid! },
    { enabled: !!mid },
  );
  const adminSummary = api.org.adminManagerSummaryFor.useQuery(
    { managerMembershipId: mid!, start: def.start, end: def.end },
    { enabled: !!mid },
  );
  const emo = api.org.managerTrendsEmotions.useQuery(
    { start: def.start, end: def.end, managerMembershipId: mid ?? undefined },
    { enabled: true },
  );
  const skl = api.org.managerTrendsSkills.useQuery(
    { start: def.start, end: def.end, managerMembershipId: mid ?? undefined },
    { enabled: true },
  );

  if (status === 'unauthenticated') return null;

  // Precompute common aggregates safely
  const teamStats = (!mid ? summary.data : adminSummary.data) ?? [];
  const totalTeamEntries = teamStats.reduce((sum: number, u: any) => sum + (u.entryCount ?? 0), 0);
  const activeUsers = teamStats.filter((u: any) => (u.entryCount ?? 0) > 0).length;
  const avgEntries = teamStats.length ? (totalTeamEntries / teamStats.length).toFixed(1) : '0.0';

  return (
    <>
      <Head>
        <title>Manager · DBT Diary Card</title>
      </Head>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
        <Box sx={{ maxWidth: '1200px', mx: 'auto', px: { xs: 2, sm: 3, lg: 4 } }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
              {mid ? 'Manager Overview' : 'My Team'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor your team&apos;s progress and insights from the past 7 days
            </Typography>
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Team Members"
                value={(!mid ? users.data?.length : adminUsers.data?.length) ?? 0}
                icon={<PeopleIcon />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Entries"
                value={totalTeamEntries}
                subtitle="Last 7 days"
                icon={<TimelineIcon />}
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Active Users"
                value={activeUsers}
                subtitle="With entries"
                icon="👥"
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Avg Entries"
                value={avgEntries}
                subtitle="Per user"
                icon="📊"
                color="error"
              />
            </Grid>
          </Grid>
          <ModernCard
            title="Team Members"
            subtitle="Click on any member to view their detailed progress"
          >
            {(!mid ? users.data?.length : adminUsers.data?.length) ? (
              <Grid container spacing={2}>
                {(!mid ? (users.data ?? []) : (adminUsers.data ?? [])).map((u: any) => {
                  const cnt = teamStats.find((r: any) => r.userId === u.userId)?.entryCount ?? 0;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={u.userId}>
                      <Box
                        component={Link}
                        href={`/manager/user/${u.userId}`}
                        sx={{
                          display: 'block',
                          textDecoration: 'none',
                          color: 'inherit',
                        }}
                      >
                        <Box
                          sx={{
                            p: 2,
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 2,
                            transition: 'all 0.2s ease-in-out',
                            cursor: 'pointer',
                            '&:hover': {
                              borderColor: 'primary.main',
                              boxShadow: 1,
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              sx={{
                                bgcolor:
                                  cnt > 3
                                    ? 'success.main'
                                    : cnt > 0
                                      ? 'warning.main'
                                      : 'error.main',
                                width: 40,
                                height: 40,
                                fontSize: '1rem',
                              }}
                            >
                              {u.name?.charAt(0)?.toUpperCase() || '?'}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {u.name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <Chip
                                  label={`${cnt} entries`}
                                  size="small"
                                  color={cnt > 3 ? 'success' : cnt > 0 ? 'warning' : 'error'}
                                  variant="outlined"
                                />
                                <IconButton size="small" color="primary">
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <EmptyState
                icon="👥"
                title="No team members"
                description="There are no users assigned to this manager yet."
              />
            )}
          </ModernCard>

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <ChartCard
                title="Top Emotions"
                subtitle="Average emotional ratings over the last 7 days"
                loading={emo.isLoading}
                emptyState={{
                  icon: '😊',
                  message: 'No emotion data available',
                  description: "Team members haven't logged emotions yet",
                }}
              >
                {(emo.data ?? []).length > 0 && (
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
                            font: { size: 12 },
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
                )}
              </ChartCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartCard
                title="Top Skills"
                subtitle="Most frequently used DBT skills"
                loading={skl.isLoading}
                emptyState={{
                  icon: '🛠️',
                  message: 'No skills data available',
                  description: "Team members haven't logged skills usage yet",
                }}
              >
                {(skl.data ?? []).length > 0 && (
                  <Bar
                    data={{
                      labels: (skl.data ?? [])
                        .slice(0, 6)
                        .map((s: any) =>
                          s.name.length > 15 ? `${s.name.slice(0, 15)}...` : s.name,
                        ),
                      datasets: [
                        {
                          label: 'Usage Count',
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
                        legend: { display: false },
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
                          grid: { color: 'rgba(0, 0, 0, 0.05)' },
                          ticks: { stepSize: 1, color: '#6b7280' },
                        },
                        x: {
                          grid: { display: false },
                          ticks: { color: '#6b7280', maxRotation: 45 },
                        },
                      },
                    }}
                  />
                )}
              </ChartCard>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
}
