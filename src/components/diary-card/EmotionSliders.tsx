import React from "react";
import InfoIcon from "~/components/ui/InfoIcon";

export type Emotion =
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

export const EMOTION_LABELS: Record<Emotion, string> = {
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

export function EmotionSliders({
  emotions,
  onChange,
  isLoading,
}: {
  emotions: Record<Emotion, number>;
  onChange: (key: Emotion, value: number) => void;
  isLoading?: boolean;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-2 text-xl font-semibold">Emotions (0-10)</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {isLoading && (
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
              onChange={(e) => onChange(k as Emotion, Number(e.target.value))}
              title={`Rate ${EMOTION_LABELS[k as Emotion].toLowerCase()} from 0 (none) to 10 (extreme). Current: ${(emotions as any)[k]}`}
            />
            <span className="w-6 text-right text-sm">{(emotions as any)[k]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default EmotionSliders;

