import React from "react";
import InfoIcon from "~/components/ui/InfoIcon";

export const SKILL_MODULE_LABELS: Record<string, string> = {
  MINDFULNESS: "Mindfulness",
  DISTRESS_TOLERANCE: "Distress Tolerance",
  EMOTION_REGULATION: "Emotion Regulation",
  INTERPERSONAL_EFFECTIVENESS: "Interpersonal Effectiveness",
};

type Skill = { id: string; name: string; description: string | null };

export function SkillsCheckList({
  groupedSkills,
  selected,
  onToggle,
}: {
  groupedSkills: Record<string, Skill[]>;
  selected: string[];
  onToggle: (skillName: string, checked: boolean) => void;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-2 text-xl font-semibold">Skills Used</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Object.entries(groupedSkills).map(([module, skills]) => (
          <div key={module} className="rounded border p-3">
            <div className="mb-2 flex items-center gap-1">
              <h3 className="font-medium">{SKILL_MODULE_LABELS[module as string] ?? module}</h3>
              <InfoIcon title="Check the DBT skills you used today." />
            </div>
            <div className="flex flex-col gap-1">
              {skills.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.includes(s.name)}
                    onChange={(e) => onToggle(s.name, e.target.checked)}
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
  );
}

export default SkillsCheckList;

