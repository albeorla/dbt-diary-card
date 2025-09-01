import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useSession, signIn } from 'next-auth/react';
import { api } from '~/utils/api';
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

// Types and labels are imported from components

export default function DiaryPage() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);
  const [date, setDate] = useState<string>(todayStr);
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

  // Lock the diary to today's date only
  useEffect(() => {
    setDate(todayStr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4">You must sign in to view your diary card.</p>
          <button
            className="rounded bg-indigo-600 px-4 py-2 text-white"
            onClick={() => void signIn()}
          >
            Sign in
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Diary · DBT Diary Card</title>
      </Head>
      <main className="mx-auto max-w-4xl p-6">
        <div className="sticky top-0 z-10 mb-6 flex items-center justify-between border-b bg-white/90 px-0 py-3 backdrop-blur">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-800 hover:bg-gray-50"
            title="Go back to the previous page"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold">
            {session?.user?.name ? `${session.user.name}'s Diary Card` : 'Diary Card'}
          </h1>
          <span className="w-16" />
        </div>
        <div className="mb-6 flex items-center gap-4">
          <div className="flex items-center gap-1">
            <label className="text-sm font-medium" htmlFor="date">
              Date
            </label>
            <InfoIcon title="The diary card is locked to today's date." />
          </div>
          <input
            id="date"
            type="date"
            className="rounded border p-2 bg-gray-100 text-gray-500 cursor-not-allowed"
            value={date}
            disabled
            title="The diary card is locked to today's date."
          />
          {getByDate.isFetching && <span className="text-sm text-gray-500">Loading…</span>}
        </div>
        {showSaved && (
          <div className="fixed bottom-4 right-4 z-20 rounded border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800 shadow">
            Saved
          </div>
        )}

        <EmotionSliders
          emotions={emotions}
          onChange={(key, value) => setEmotions((prev) => ({ ...(prev as any), [key]: value }))}
          isLoading={!skillsQuery.data && getByDate.isLoading}
        />

        <UrgeTracker
          urges={urges}
          onToggleActed={(key, acted) =>
            setUrges((prev) => ({
              ...(prev as any),
              [key]: { ...(prev as any)[key], actedOn: acted },
            }))
          }
          onChangeIntensity={(key, intensity) =>
            setUrges((prev) => ({ ...(prev as any), [key]: { ...(prev as any)[key], intensity } }))
          }
        />

        <SkillsCheckList
          groupedSkills={(skillsQuery.data as any) ?? {}}
          selected={selectedSkills}
          onToggle={(name, checked) =>
            setSelectedSkills((prev) =>
              checked ? [...prev, name] : prev.filter((n) => n !== name),
            )
          }
        />

        <NotesSection value={notes} onChange={setNotes} />

        <FormActions
          isSaving={upsert.isPending}
          onSave={() => void handleSave()}
          onReset={handleReset}
          saved={upsert.isSuccess}
          error={upsert.isError}
        />
      </main>
    </>
  );
}

// Tooltip and InfoIcon moved to reusable components
