import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useSession, signIn } from 'next-auth/react';
import { api } from '~/utils/api';
import React from 'react';
import {
  EmotionSliders,
  EMOTION_LABELS,
  type Emotion,
} from '~/components/diary-card/EmotionSliders';
import { UrgeTracker, URGE_LABELS, type Urge } from '~/components/diary-card/UrgeTracker';
import { SkillsCheckList, SKILL_MODULE_LABELS } from '~/components/diary-card/SkillsCheckList';
import NotesSection from '~/components/diary-card/NotesSection';
import FormActions from '~/components/diary-card/FormActions';
import InfoIcon from '~/components/ui/InfoIcon';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Avatar,
  Chip,
  LinearProgress,
} from '@mui/material';
import { ArrowBack, Today, Save, Refresh, Person, CheckCircle } from '@mui/icons-material';
import ModernCard from '~/components/ui/ModernCard';
import EmptyState from '~/components/ui/EmptyState';
import Link from 'next/link';

// Types and labels are imported from components

export default function DiaryPage() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const orgState = api.org.state.useQuery(undefined, { enabled: status === 'authenticated' });
  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  // Get date from URL query or default to today
  const urlDate = router.query.date as string;
  const [date, setDate] = useState<string>(urlDate || todayStr);
  const isToday = date === todayStr;
  const isReadOnly = !isToday;
  const [notes, setNotes] = useState<string>('');
  const [emotions, setEmotions] = useState<Record<Emotion, number>>({
    SADNESS: 0,
    ANGER: 0,
    FEAR: 0,
    SHAME: 0,
    JOY: 0,
    PRIDE: 0,
    LOVE: 0,
    GUILT: 0,
    ANXIETY: 0,
    DISGUST: 0,
  });
  const [urges, setUrges] = useState<Record<Urge, { intensity: number; actedOn: boolean }>>({
    SELF_HARM: { intensity: 0, actedOn: false },
    SUBSTANCE_USE: { intensity: 0, actedOn: false },
    BINGE_EATING: { intensity: 0, actedOn: false },
    RESTRICTING: { intensity: 0, actedOn: false },
    ISOLATING: { intensity: 0, actedOn: false },
    LASHING_OUT: { intensity: 0, actedOn: false },
    RUMINATING: { intensity: 0, actedOn: false },
  });
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const utils = api.useUtils();

  const skillsQuery = api.skills.getAll.useQuery();
  const getByDate = api.diary.getByDate.useQuery(
    { date },
    { enabled: status === 'authenticated' && !!date },
  );
  const upsert = api.diary.upsert.useMutation({
    onSuccess: async () => {
      await utils.diary.getByDate.invalidate({ date });
      setShowSaved(true);
      window.setTimeout(() => setShowSaved(false), 2000);
    },
  });

  // Set date from URL params or today
  useEffect(() => {
    if (urlDate && urlDate !== date) {
      setDate(urlDate);
    } else if (!urlDate && date !== todayStr) {
      setDate(todayStr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlDate, todayStr]);

  useEffect(() => {
    if (!getByDate.data) return;
    const entry = getByDate.data;
    setNotes(entry?.notes ?? '');
    const emotionState = { ...emotions };
    entry?.emotionRatings?.forEach((e: any) => {
      emotionState[e.emotion as Emotion] = e.rating;
    });
    setEmotions(emotionState);
    const urgeState = { ...urges };
    entry?.urgesBehaviors?.forEach((u: any) => {
      urgeState[u.urgeType as Urge] = { intensity: u.intensity, actedOn: u.actedOn };
    });
    setUrges(urgeState);
    setSelectedSkills(entry?.skillsUsed?.map((s: any) => s.skill.name) ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getByDate.data]);

  const handleSave = async () => {
    await upsert.mutateAsync({
      date,
      notes: notes || undefined,
      emotions: Object.entries(emotions)
        .filter(([, v]) => v > 0)
        .map(([emotion, rating]) => ({ emotion, rating: Number(rating) })),
      urges: Object.entries(urges)
        .filter(([, v]) => v.intensity > 0)
        .map(([urgeType, v]) => ({ urgeType, intensity: Number(v.intensity), actedOn: v.actedOn })),
      skills: selectedSkills,
    });
    // After save, navigate to history
    await router.push('/history');
  };

  const handleReset = () => {
    if (!window.confirm('Reset all fields for today? Unsaved changes will be lost.')) return;
    setNotes('');
    setEmotions({
      SADNESS: 0,
      ANGER: 0,
      FEAR: 0,
      SHAME: 0,
      JOY: 0,
      PRIDE: 0,
      LOVE: 0,
      GUILT: 0,
      ANXIETY: 0,
      DISGUST: 0,
    });
    setUrges({
      SELF_HARM: { intensity: 0, actedOn: false },
      SUBSTANCE_USE: { intensity: 0, actedOn: false },
      BINGE_EATING: { intensity: 0, actedOn: false },
      RESTRICTING: { intensity: 0, actedOn: false },
      ISOLATING: { intensity: 0, actedOn: false },
      LASHING_OUT: { intensity: 0, actedOn: false },
      RUMINATING: { intensity: 0, actedOn: false },
    });
    setSelectedSkills([]);
  };

  const [showSaved, setShowSaved] = useState(false);

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
            icon="📝"
            title="Diary access required"
            description="Sign in to access your personal DBT diary card and track your progress."
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

  // Gate diary card to USER role only
  if (status === 'authenticated' && orgState.data && orgState.data.role !== 'USER') {
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
        <ModernCard sx={{ textAlign: 'center', maxWidth: 500 }}>
          <EmptyState
            icon="📚"
            title="Diary not available"
            description={`The diary card is only available to end users. Your current role is ${orgState.data.role}.`}
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mt: 3 }}>
            <Button component={Link} href="/" variant="contained" color="primary">
              Go Home
            </Button>
            {orgState.data.role === 'ADMIN' && (
              <Button component={Link} href="/admin/org" variant="outlined">
                Open Admin
              </Button>
            )}
            {orgState.data.role === 'MANAGER' && (
              <Button component={Link} href="/manager" variant="outlined">
                Open Manager
              </Button>
            )}
          </Box>
        </ModernCard>
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>Diary · DBT Diary Card</title>
      </Head>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
        <Box sx={{ maxWidth: '900px', mx: 'auto', px: { xs: 2, sm: 3, lg: 4 } }}>
          <ModernCard sx={{ mb: 3, position: 'sticky', top: 16, zIndex: 10 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Button
                startIcon={<ArrowBack />}
                onClick={() => router.back()}
                variant="outlined"
                size="small"
              >
                Back
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
                    {session?.user?.name ? `${session.user.name}'s Diary` : 'Daily Diary'}
                    {isReadOnly ? ' (Read Only)' : ''}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    DBT Diary Card • {isToday ? "Today's Entry" : 'Historical View'}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip
                  icon={<Today />}
                  label={new Date(date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                  color={isToday ? 'primary' : 'secondary'}
                  variant={isToday ? 'filled' : 'outlined'}
                />
                {isReadOnly && (
                  <Chip label="Read Only" size="small" color="warning" variant="filled" />
                )}
              </Box>
            </Box>
            {getByDate.isFetching && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress sx={{ height: 4, borderRadius: 1 }} />
              </Box>
            )}
          </ModernCard>

          {showSaved && (
            <Alert
              severity="success"
              icon={<CheckCircle />}
              sx={{
                position: 'fixed',
                bottom: 24,
                right: 24,
                zIndex: 1300,
                minWidth: 200,
              }}
              onClose={() => setShowSaved(false)}
            >
              Entry saved successfully!
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <ModernCard
              title="Emotions"
              subtitle={
                isReadOnly ? 'Emotion ratings from this day' : 'Rate your emotions from 0-10'
              }
              action={
                isReadOnly && (
                  <Chip label="Read Only" size="small" color="warning" variant="outlined" />
                )
              }
            >
              <EmotionSliders
                emotions={emotions}
                onChange={
                  isReadOnly
                    ? () => {}
                    : (key, value) => setEmotions((prev) => ({ ...(prev as any), [key]: value }))
                }
                isLoading={!skillsQuery.data && getByDate.isLoading}
                readOnly={isReadOnly}
              />
            </ModernCard>

            <ModernCard
              title="Urges & Behaviors"
              subtitle={
                isReadOnly
                  ? 'Urge patterns from this day'
                  : 'Track urge intensity and whether you acted on them'
              }
              action={
                isReadOnly && (
                  <Chip label="Read Only" size="small" color="warning" variant="outlined" />
                )
              }
            >
              <UrgeTracker
                urges={urges}
                onToggleActed={
                  isReadOnly
                    ? () => {}
                    : (key, acted) =>
                        setUrges((prev) => ({
                          ...(prev as any),
                          [key]: { ...(prev as any)[key], actedOn: acted },
                        }))
                }
                onChangeIntensity={
                  isReadOnly
                    ? () => {}
                    : (key, intensity) =>
                        setUrges((prev) => ({
                          ...(prev as any),
                          [key]: { ...(prev as any)[key], intensity },
                        }))
                }
                readOnly={isReadOnly}
              />
            </ModernCard>

            <ModernCard
              title="DBT Skills"
              subtitle={
                isReadOnly ? 'Skills used on this day' : 'Check off the skills you used today'
              }
              action={
                isReadOnly && (
                  <Chip label="Read Only" size="small" color="warning" variant="outlined" />
                )
              }
            >
              <SkillsCheckList
                groupedSkills={(skillsQuery.data as any) ?? {}}
                selected={selectedSkills}
                onToggle={
                  isReadOnly
                    ? () => {}
                    : (name, checked) =>
                        setSelectedSkills((prev) =>
                          checked ? [...prev, name] : prev.filter((n) => n !== name),
                        )
                }
                readOnly={isReadOnly}
              />
            </ModernCard>

            <ModernCard
              title="Notes & Reflections"
              subtitle={isReadOnly ? 'Notes from this day' : 'Optional notes about your day'}
              action={
                isReadOnly && (
                  <Chip label="Read Only" size="small" color="warning" variant="outlined" />
                )
              }
            >
              <NotesSection
                value={notes}
                onChange={isReadOnly ? () => {} : setNotes}
                readOnly={isReadOnly}
              />
            </ModernCard>

            {isToday && (
              <ModernCard>
                <FormActions
                  isSaving={upsert.isPending}
                  onSave={() => void handleSave()}
                  onReset={handleReset}
                  saved={upsert.isSuccess}
                  error={upsert.isError}
                />
              </ModernCard>
            )}

            {isReadOnly && (
              <ModernCard>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    📖 Historical Entry View
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    This entry is from{' '}
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}{' '}
                    and cannot be edited.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                      component={Link}
                      href="/diary"
                      variant="contained"
                      startIcon={<Today />}
                    >
                      Edit Today&apos;s Entry
                    </Button>
                    <Button component={Link} href="/history" variant="outlined">
                      Back to History
                    </Button>
                  </Box>
                </Box>
              </ModernCard>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}

// Tooltip and InfoIcon moved to reusable components
