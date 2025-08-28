import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useSession, signIn } from "next-auth/react";
import { api } from "~/utils/api";

type Emotion =
  | "SADNESS"
  | "ANGER"
  | "FEAR"
  | "SHAME"
  | "JOY"
  | "PRIDE"
  | "LOVE"
  | "GUILT"
  | "ANXIETY"
  | "DISGUST";

type Urge =
  | "SELF_HARM"
  | "SUBSTANCE_USE"
  | "BINGE_EATING"
  | "RESTRICTING"
  | "ISOLATING"
  | "LASHING_OUT"
  | "RUMINATING";

const EMOTION_LABELS: Record<Emotion, string> = {
  SADNESS: "Sadness",
  ANGER: "Anger",
  FEAR: "Fear",
  SHAME: "Shame",
  JOY: "Joy",
  PRIDE: "Pride",
  LOVE: "Love",
  GUILT: "Guilt",
  ANXIETY: "Anxiety",
  DISGUST: "Disgust",
};

const URGE_LABELS: Record<Urge, string> = {
  SELF_HARM: "Self-harm",
  SUBSTANCE_USE: "Substance use",
  BINGE_EATING: "Binge eating",
  RESTRICTING: "Restricting",
  ISOLATING: "Isolating",
  LASHING_OUT: "Lashing out",
  RUMINATING: "Ruminating",
};

const SKILL_MODULE_LABELS: Record<string, string> = {
  MINDFULNESS: "Mindfulness",
  DISTRESS_TOLERANCE: "Distress Tolerance",
  EMOTION_REGULATION: "Emotion Regulation",
  INTERPERSONAL_EFFECTIVENESS: "Interpersonal Effectiveness",
};

export default function DiaryPage() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [date, setDate] = useState<string>(todayStr);
  const [notes, setNotes] = useState<string>("");
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
    { enabled: status === "authenticated" && !!date }
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
    setNotes(entry?.notes ?? "");
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
    await router.push("/history");
  };

  const handleReset = () => {
    if (!window.confirm("Reset all fields for today? Unsaved changes will be lost.")) return;
    setNotes("");
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

  if (status === "unauthenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4">You must sign in to view your diary card.</p>
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
            {session?.user?.name ? `${session.user.name}'s Diary Card` : "Diary Card"}
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

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">Emotions (0-10)</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {(!skillsQuery.data && getByDate.isLoading) && (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 rounded border p-2">
                    <span className="w-28 animate-pulse rounded bg-gray-200" style={{ height: 16 }} />
                    <span className="grow animate-pulse rounded bg-gray-200" style={{ height: 8 }} />
                    <span className="w-6" />
                  </div>
                ))}
              </>
            )}
            {Object.keys(emotions).map((k) => (
              <div key={k} className="flex items-center justify-between gap-2 rounded border p-2">
                <div className="flex w-28 items-center gap-1">
                  <label className="text-sm font-medium" title={`Rate ${EMOTION_LABELS[k as Emotion].toLowerCase()} from 0 (none) to 10 (extreme).`}>
                    {EMOTION_LABELS[k as Emotion]}
                  </label>
                  <InfoIcon title={`Rate ${EMOTION_LABELS[k as Emotion].toLowerCase()} from 0 (none) to 10 (extreme).`} />
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={(emotions as any)[k]}
                  onChange={(e) =>
                    setEmotions((prev) => ({ ...(prev as any), [k]: Number(e.target.value) }))
                  }
                  title={`Rate ${EMOTION_LABELS[k as Emotion].toLowerCase()} from 0 (none) to 10 (extreme). Current: ${(emotions as any)[k]}`}
                />
                <span className="w-6 text-right text-sm">{(emotions as any)[k]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">Urges (0-5)</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Object.entries(urges).map(([k, v]) => (
              <div key={k} className="rounded border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{URGE_LABELS[k as Urge]}</span>
                    <InfoIcon title={`Track your urge: ${URGE_LABELS[k as Urge].toLowerCase()}. Set intensity and whether you acted on it.`} />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={v.actedOn}
                      onChange={(e) =>
                        setUrges((prev) => ({
                          ...(prev as any),
                          [k]: { ...(prev as any)[k], actedOn: e.target.checked },
                        }))
                      }
                      title={`Mark if you acted on the ${k.toLowerCase()} urge today.`}
                    />
                    Acted on
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={5}
                    value={v.intensity}
                    onChange={(e) =>
                      setUrges((prev) => ({
                        ...(prev as any),
                        [k]: { ...(prev as any)[k], intensity: Number(e.target.value) },
                      }))
                    }
                    title={`Set ${URGE_LABELS[k as Urge].toLowerCase()} urge intensity from 0 (none) to 5 (strongest). Current: ${v.intensity}`}
                  />
                  <span className="w-6 text-right text-sm">{v.intensity}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-xl font-semibold">Skills Used</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Object.entries(skillsQuery.data ?? {}).map(([module, skills]) => (
              <div key={module} className="rounded border p-3">
                <div className="mb-2 flex items-center gap-1">
                  <h3 className="font-medium">{SKILL_MODULE_LABELS[module as string] ?? module}</h3>
                  <InfoIcon title="Check the DBT skills you used today." />
                </div>
                <div className="flex flex-col gap-1">
                  {(skills as any).map((s: any) => (
                    <label key={s.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(s.name)}
                        onChange={(e) =>
                          setSelectedSkills((prev) =>
                            e.target.checked
                              ? [...prev, s.name]
                              : prev.filter((n) => n !== s.name)
                          )
                        }
                      />
                      <span className="flex items-center gap-1">
                        {s.name}
                        <InfoIcon title={`${s.name}: ${s.description ?? "DBT skill"}`} />
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <div className="mb-2 flex items-center gap-1">
            <h2 className="text-xl font-semibold">Notes</h2>
            <InfoIcon title="Optional notes for today: triggers, events, progress, or anything else you'd like to remember." />
          </div>
          <textarea
            className="w-full rounded border p-3"
            rows={4}
            placeholder="Notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            title="Optional notes for today: triggers, events, progress, or anything else you'd like to remember."
          />
        </section>

        <div className="flex items-center gap-3">
          <button
            className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
            onClick={() => void handleSave()}
            disabled={upsert.isPending}
            title={`Save or update your diary entry for ${date}.`}
          >
            {upsert.isPending ? "Saving…" : "Save"}
          </button>
          <button
            className="rounded border border-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-50"
            onClick={handleReset}
            type="button"
            title="Reset all fields to blank/defaults for this date. This does not delete saved data until you save again."
          >
            Reset
          </button>
          {upsert.isSuccess && <span className="text-sm text-green-700">Saved</span>}
          {upsert.isError && <span className="text-sm text-red-700">Error saving</span>}
        </div>
      </main>
    </>
  );
}

function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
  return (
    <span className="relative inline-flex items-center group">
      {children}
      <span className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-full whitespace-pre rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow transition-opacity duration-150 group-hover:opacity-100">
        {content}
      </span>
    </span>
  );
}

function InfoIcon({ title }: { title: string }) {
  return (
    <Tooltip content={title}>
      <span
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 text-[10px] font-semibold text-gray-500 hover:bg-gray-50"
        role="img"
        aria-label="Info"
      >
        i
      </span>
    </Tooltip>
  );
}


