import Head from 'next/head';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { api } from '~/utils/api';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import React from 'react';
import WeeklySummary from '~/components/dashboard/WeeklySummary';
import EmotionChart from '~/components/dashboard/EmotionChart';
import SkillsFrequency from '~/components/dashboard/SkillsFrequency';
import UrgeHeatmap from '~/components/dashboard/UrgeHeatmap';
import { TextField, Button, Typography, Box, Chip } from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  CalendarToday,
  People as PeopleIcon,
  Timeline as TimelineIcon,
  Psychology,
  Analytics,
  LocalFireDepartment,
} from '@mui/icons-material';
import ModernCard from '~/components/ui/ModernCard';
import StatCard from '~/components/ui/StatCard';
import ChartCard from '~/components/ui/ChartCard';
import EmptyState from '~/components/ui/EmptyState';

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
  const orgState = api.org.state.useQuery(undefined, { enabled: status === 'authenticated' });
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
    router.replace(
      { pathname: router.pathname, query: { start: range.start, end: range.end } },
      undefined,
      { shallow: true },
    );
  }, [range.start, range.end]);

  const trends = api.analytics.getEmotionTrends.useQuery(
    { startDate: range.start, endDate: range.end },
    { enabled: status === 'authenticated' },
  );
  const skills = api.analytics.getSkillsUsage.useQuery(
    { startDate: range.start, endDate: range.end },
    { enabled: status === 'authenticated' },
  );
  const weekly = api.analytics.getWeeklySummary.useQuery(
    { weekStart: range.start },
    { enabled: status === 'authenticated' },
  );
  const urges = api.analytics.getUrgePatterns.useQuery(
    { startDate: range.start, endDate: range.end },
    { enabled: status === 'authenticated' },
  );
  const recent = api.diary.getRecent.useQuery(
    { limit: 30 },
    { enabled: status === 'authenticated' },
  );

  // Calculate streak days (must be before any conditional returns to respect Rules of Hooks)
  const streakDays = useMemo(() => {
    const dates = (recent.data ?? [])
      .map((e: any) => new Date(e.entryDate))
      .sort((a, b) => b.getTime() - a.getTime());
    if (dates.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let cursor = new Date(today);
    const hasDate = (d: Date) =>
      dates.some((x) => {
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

  if (status === 'unauthenticated') {
    return (
      <Box
        sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <ModernCard sx={{ textAlign: 'center', maxWidth: 400 }}>
          <EmptyState
            icon="🔐"
            title="Sign in required"
            description="You must sign in to view your dashboard and diary entries."
            action={{
              label: 'Sign In',
              onClick: () => void signIn(),
              variant: 'contained',
            }}
          />
        </ModernCard>
      </Box>
    );
  }

  // Redirect admins and managers to their appropriate dashboards
  if (status === 'authenticated' && orgState.data?.role === 'ADMIN') {
    router.push('/admin/org');
    return null;
  }

  if (status === 'authenticated' && orgState.data?.role === 'MANAGER') {
    router.push('/manager');
    return null;
  }

  const avgByEmotion: Record<string, number> = {};
  (trends.data ?? []).forEach((r) => {
    avgByEmotion[r.emotion as string] =
      ((avgByEmotion[r.emotion as string] ?? 0) + (r.rating as number)) / 2 || r.rating;
  });

  const totalEntries = weekly.data?.length ?? 0;

  return (
    <>
      <Head>
        <title>Dashboard · DBT Diary Card</title>
      </Head>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
        <Box sx={{ maxWidth: '1400px', mx: 'auto', px: { xs: 2, sm: 3, lg: 4 } }}>
          <ModernCard sx={{ mb: 3, position: 'sticky', top: 16, zIndex: 10 }}>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Personal Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Track your progress and insights across time
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                <TextField
                  id="start"
                  label="Start Date"
                  type="date"
                  size="small"
                  value={range.start}
                  onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 140 }}
                />
                <TextField
                  id="end"
                  label="End Date"
                  type="date"
                  size="small"
                  value={range.end}
                  onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 140 }}
                />
                <Button
                  component={Link}
                  href={`/diary?date=${range.end}`}
                  variant="contained"
                  startIcon={<CalendarToday />}
                  sx={{ ml: 1 }}
                  onMouseEnter={() => {
                    // Prefetch common diary data
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    utils.skills.getAll.prefetch();
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    utils.diary.getByDate.prefetch({ date: range.end });
                  }}
                >
                  New Entry
                </Button>
              </Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                mt: 2,
                pt: 2,
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <Chip
                label="7 days"
                onClick={() => setRange(def)}
                variant={range.start === def.start ? 'filled' : 'outlined'}
                color="primary"
                size="small"
              />
              <Chip
                label="14 days"
                onClick={() => {
                  const end = new Date();
                  const start = new Date();
                  start.setDate(end.getDate() - 13);
                  setRange({
                    start: start.toISOString().slice(0, 10),
                    end: end.toISOString().slice(0, 10),
                  });
                }}
                variant="outlined"
                color="primary"
                size="small"
              />
              <Chip
                label="30 days"
                onClick={() => {
                  const end = new Date();
                  const start = new Date();
                  start.setDate(end.getDate() - 29);
                  setRange({
                    start: start.toISOString().slice(0, 10),
                    end: end.toISOString().slice(0, 10),
                  });
                }}
                variant="outlined"
                color="primary"
                size="small"
              />
            </Box>
          </ModernCard>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Diary Entries"
                value={weekly.isLoading ? '...' : totalEntries}
                subtitle="In selected range"
                icon={<CalendarToday />}
                color="primary"
                trend={{
                  value: totalEntries > 0 ? Math.round((totalEntries / 7) * 100) : 0,
                  label: 'entries per week',
                  direction: totalEntries >= 5 ? 'up' : totalEntries >= 2 ? 'neutral' : 'down',
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Skills Used"
                value={
                  skills.isLoading
                    ? '...'
                    : (skills.data ?? []).reduce((a, b) => a + (b.count as number), 0)
                }
                subtitle="Total skill applications"
                icon={<Psychology />}
                color="success"
                trend={{
                  value:
                    (skills.data ?? []).reduce((a, b) => a + (b.count as number), 0) > 5
                      ? 15
                      : (skills.data ?? []).reduce((a, b) => a + (b.count as number), 0) > 2
                        ? 5
                        : 0,
                  label: 'skill usage',
                  direction:
                    (skills.data ?? []).reduce((a, b) => a + (b.count as number), 0) > 5
                      ? 'up'
                      : (skills.data ?? []).reduce((a, b) => a + (b.count as number), 0) > 2
                        ? 'neutral'
                        : 'neutral',
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Emotions Tracked"
                value={trends.isLoading ? '...' : Object.keys(avgByEmotion).length}
                subtitle="Unique emotions logged"
                icon={<Analytics />}
                color="warning"
                trend={{
                  value:
                    Object.keys(avgByEmotion).length >= 5
                      ? 20
                      : Object.keys(avgByEmotion).length >= 3
                        ? 10
                        : 0,
                  label: 'emotional awareness',
                  direction:
                    Object.keys(avgByEmotion).length >= 5
                      ? 'up'
                      : Object.keys(avgByEmotion).length >= 3
                        ? 'neutral'
                        : 'neutral',
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Current Streak"
                value={`${streakDays}`}
                subtitle={streakDays === 1 ? 'day' : 'days'}
                icon={<LocalFireDepartment />}
                color="error"
                trend={{
                  value: streakDays >= 7 ? 25 : streakDays >= 3 ? 10 : -5,
                  label: 'consistency score',
                  direction: streakDays >= 7 ? 'up' : streakDays >= 3 ? 'neutral' : 'down',
                }}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <ChartCard
                title="Emotion Trends"
                subtitle="Track your emotional patterns over time"
                loading={trends.isLoading}
                height={350}
                emptyState={{
                  icon: '📈',
                  message: 'No emotion data yet',
                  description: 'Start logging your emotions to see trends here',
                }}
              >
                <EmotionChart trends={(trends.data as any) ?? []} />
              </ChartCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartCard
                title="Skills Usage"
                subtitle="Most frequently used DBT skills"
                loading={skills.isLoading}
                height={350}
                emptyState={{
                  icon: '🛠️',
                  message: 'No skills logged yet',
                  description: 'Track your DBT skill usage in diary entries',
                }}
              >
                <SkillsFrequency items={(skills.data ?? []) as any} />
              </ChartCard>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <ChartCard
                title="Urge & Behavior Patterns"
                subtitle={`Intensity heatmap from ${range.start} to ${range.end}`}
                loading={urges.isLoading}
                height={200}
                emptyState={{
                  icon: '🎯',
                  message: 'No urge data available',
                  description: 'Track urges and behaviors in your diary entries',
                }}
              >
                <UrgeHeatmap
                  start={range.start}
                  end={range.end}
                  items={(urges.data ?? []) as any}
                />
              </ChartCard>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
}
