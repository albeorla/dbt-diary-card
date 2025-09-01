import React from 'react';
import InfoIcon from '~/components/ui/InfoIcon';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export const SKILL_MODULE_LABELS: Record<string, string> = {
  MINDFULNESS: 'Mindfulness',
  DISTRESS_TOLERANCE: 'Distress Tolerance',
  EMOTION_REGULATION: 'Emotion Regulation',
  INTERPERSONAL_EFFECTIVENESS: 'Interpersonal Effectiveness',
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
      <Typography variant="h6" sx={{ mb: 1 }}>
        Skills Used
      </Typography>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Object.entries(groupedSkills).map(([module, skills]) => (
          <Paper key={module} variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {SKILL_MODULE_LABELS[module as string] ?? module}
              </Typography>
              <InfoIcon title="Check the DBT skills you used today." />
            </Box>
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
                    <InfoIcon title={`${s.name}: ${s.description ?? 'DBT skill'}`} />
                  </span>
                </label>
              ))}
            </div>
          </Paper>
        ))}
      </div>
    </section>
  );
}

export default SkillsCheckList;
