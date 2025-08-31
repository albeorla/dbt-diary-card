import React from "react";
import InfoIcon from "~/components/ui/InfoIcon";

export type Urge =
  | "SELF_HARM"
  | "SUBSTANCE_USE"
  | "BINGE_EATING"
  | "RESTRICTING"
  | "ISOLATING"
  | "LASHING_OUT"
  | "RUMINATING";

export const URGE_LABELS: Record<Urge, string> = {
  SELF_HARM: "Self-harm",
  SUBSTANCE_USE: "Substance use",
  BINGE_EATING: "Binge eating",
  RESTRICTING: "Restricting",
  ISOLATING: "Isolating",
  LASHING_OUT: "Lashing out",
  RUMINATING: "Ruminating",
};

export function UrgeTracker({
  urges,
  onToggleActed,
  onChangeIntensity,
}: {
  urges: Record<Urge, { intensity: number; actedOn: boolean }>;
  onToggleActed: (key: Urge, acted: boolean) => void;
  onChangeIntensity: (key: Urge, intensity: number) => void;
}) {
  return (
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
                  onChange={(e) => onToggleActed(k as Urge, e.target.checked)}
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
                onChange={(e) => onChangeIntensity(k as Urge, Number(e.target.value))}
                title={`Set ${URGE_LABELS[k as Urge].toLowerCase()} urge intensity from 0 (none) to 5 (strongest). Current: ${v.intensity}`}
              />
              <span className="w-6 text-right text-sm">{v.intensity}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default UrgeTracker;

