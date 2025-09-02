import Head from 'next/head';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { api } from '~/utils/api';
import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Skeleton,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  CalendarToday,
  Search,
  Download,
  Sort,
  Edit,
  FilterList,
  Psychology,
  Mood,
} from '@mui/icons-material';
import ModernCard from '~/components/ui/ModernCard';
import StatCard from '~/components/ui/StatCard';
import EmptyState from '~/components/ui/EmptyState';

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
    { enabled: status === 'authenticated' },
  );

  const [sortAsc, setSortAsc] = useState(false); // Default to newest first
  const [query, setQuery] = useState('');

  // Sync filters with URL (shallow) so back/forward restore state
  useEffect(() => {
    const q: any = {
      start: range.start,
      end: range.end,
      asc: sortAsc ? '1' : '0',
    };
    if (query) q.q = query;
    router.replace({ pathname: router.pathname, query: q }, undefined, { shallow: true });
  }, [range.start, range.end, sortAsc, query]);

  const filtered = (entries.data ?? [])
    .filter((e: any) => (e.notes ?? '').toLowerCase().includes(query.toLowerCase()))
    .sort((a: any, b: any) =>
      sortAsc
        ? new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
        : new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime(),
    );

  const exportToCSV = () => {
    const rows = filtered.map((e: any) => ({
      date: new Date(e.entryDate).toISOString().slice(0, 10),
      notes: e.notes ?? '',
    }));
    const csv = [
      'date,notes',
      ...rows.map((r) => `${r.date},"${r.notes.replace(/"/g, '""')}"`),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diary_${range.start}_to_${range.end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (status === 'unauthenticated') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <ModernCard sx={{ textAlign: 'center', maxWidth: 400 }}>
          <EmptyState
            icon="📚"
            title="History access required"
            description="Sign in to view your diary entry history and track your progress over time."
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

  return (
    <>
      <Head>
        <title>History · DBT Diary Card</title>
      </Head>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
        <Box sx={{ maxWidth: '1200px', mx: 'auto', px: { xs: 2, sm: 3, lg: 4 } }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
              Diary History
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Review your past entries and track your progress over time
            </Typography>
          </Box>

          {/* Summary Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Entries"
                value={entries.data?.length ?? 0}
                subtitle="In selected range"
                icon="📝"
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Days Tracked"
                value={Math.ceil(
                  (new Date(range.end).getTime() - new Date(range.start).getTime()) /
                    (1000 * 60 * 60 * 24),
                )}
                subtitle="Date range"
                icon="📅"
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Completion Rate"
                value={`${entries.data?.length ? Math.round((entries.data.length / Math.ceil((new Date(range.end).getTime() - new Date(range.start).getTime()) / (1000 * 60 * 60 * 24))) * 100) : 0}%`}
                subtitle="Days with entries"
                icon="✅"
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Filtered Results"
                value={filtered.length}
                subtitle={query ? 'Search matches' : 'All entries'}
                icon="🔍"
                color="error"
              />
            </Grid>
          </Grid>

          {/* Filters */}
          <ModernCard sx={{ mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 2,
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
                <TextField
                  label="Start Date"
                  type="date"
                  size="small"
                  value={range.start}
                  onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 140 }}
                />
                <TextField
                  label="End Date"
                  type="date"
                  size="small"
                  value={range.end}
                  onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 140 }}
                />
                <TextField
                  placeholder="Search in notes..."
                  size="small"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  sx={{ minWidth: 200 }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<Sort />}
                  onClick={() => setSortAsc((v) => !v)}
                  sx={{ textTransform: 'none' }}
                >
                  {sortAsc ? 'Oldest First' : 'Newest First'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={exportToCSV}
                  disabled={filtered.length === 0}
                  sx={{ textTransform: 'none' }}
                  title="Export current results to CSV"
                >
                  Export
                </Button>
              </Box>
            </Box>
          </ModernCard>

          {/* Entries Table */}
          <ModernCard>
            {entries.isLoading ? (
              <Box sx={{ p: 2 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: 'flex',
                      gap: 2,
                      mb: 2,
                      p: 2,
                      borderBottom: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Skeleton width={100} height={20} />
                    <Skeleton width="60%" height={20} />
                    <Skeleton width={80} height={20} />
                  </Box>
                ))}
              </Box>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={query ? '🔍' : '📝'}
                title={query ? 'No matching entries' : 'No diary entries'}
                description={
                  query
                    ? `No entries found matching "${query}" in the selected date range.`
                    : "You haven't created any diary entries in this date range yet."
                }
                action={
                  !query
                    ? {
                        label: 'Create First Entry',
                        onClick: () => router.push('/diary'),
                        variant: 'contained',
                      }
                    : undefined
                }
                size="large"
              />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'action.hover' }}>
                      <TableCell sx={{ fontWeight: 600 }}>
                        <Button
                          variant="text"
                          startIcon={<Sort />}
                          onClick={() => setSortAsc((v) => !v)}
                          sx={{ textTransform: 'none', color: 'text.primary' }}
                        >
                          Date {sortAsc ? '↗️' : '↘️'}
                        </Button>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Notes & Reflections</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.map((e) => {
                      const date = new Date((e as any).entryDate).toISOString().slice(0, 10);
                      const hasNotes = (e as any).notes?.trim();

                      return (
                        <TableRow
                          key={(e as any).id}
                          sx={{
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {new Date(date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </Typography>
                            </Box>
                          </TableCell>

                          <TableCell>
                            {hasNotes ? (
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    maxWidth: 400,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    lineHeight: 1.4,
                                  }}
                                  title={(e as any).notes}
                                >
                                  {(e as any).notes}
                                </Typography>
                                <Chip
                                  label={`${(e as any).notes.trim().split(/\s+/).length} words`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ mt: 1, fontSize: '0.7rem' }}
                                />
                              </Box>
                            ) : (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontStyle: 'italic' }}
                              >
                                No notes recorded
                              </Typography>
                            )}
                          </TableCell>

                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="View and edit this entry">
                                <Button
                                  component={Link}
                                  href={`/diary?date=${date}`}
                                  variant="outlined"
                                  size="small"
                                  startIcon={<Edit />}
                                  sx={{ textTransform: 'none' }}
                                  onMouseEnter={() => {
                                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                                    utils.diary.getByDate.prefetch({ date });
                                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                                    utils.skills.getAll.prefetch();
                                  }}
                                >
                                  Edit
                                </Button>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </ModernCard>

          {/* Quick Actions */}
          {filtered.length > 0 && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                component={Link}
                href="/diary"
                variant="contained"
                size="large"
                startIcon={<CalendarToday />}
                sx={{ px: 4, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
              >
                Create Today&apos;s Entry
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
}
