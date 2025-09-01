import React from 'react';
import InfoIcon from '~/components/ui/InfoIcon';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export type Urge =
  | 'SELF_HARM'
  | 'SUBSTANCE_USE'
  | 'BINGE_EATING'
  | 'RESTRICTING'
  | 'ISOLATING'
  | 'LASHING_OUT'
  | 'RUMINATING';

export const URGE_LABELS: Record<Urge, string> = {
  SELF_HARM: 'Self-harm',
  SUBSTANCE_USE: 'Substance use',
  BINGE_EATING: 'Binge eating',
  RESTRICTING: 'Restricting',
  ISOLATING: 'Isolating',
  LASHING_OUT: 'Lashing out',
  RUMINATING: 'Ruminating',
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
      <Typography variant="h6" sx={{ mb: 1 }}>
        Urges (0-5)
      </Typography>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Object.entries(urges).map(([k, v]) => (
          <Paper key={k} variant="outlined" sx={{ p: 2 }}>
            <Box
              sx={{
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {URGE_LABELS[k as Urge]}
                </Typography>
                <InfoIcon
                  title={`Track your urge: ${URGE_LABELS[k as Urge].toLowerCase()}. Set intensity and whether you acted on it.`}
                />
              </Box>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={v.actedOn}
                  onChange={(e) => onToggleActed(k as Urge, e.target.checked)}
                  title={`Mark if you acted on the ${k.toLowerCase()} urge today.`}
                />
                Acted on
              </label>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="range"
                min={0}
                max={5}
                value={v.intensity}
                onChange={(e) => onChangeIntensity(k as Urge, Number(e.target.value))}
                title={`Set ${URGE_LABELS[k as Urge].toLowerCase()} urge intensity from 0 (none) to 5 (strongest). Current: ${v.intensity}`}
              />
              <span className="w-6 text-right text-sm">{v.intensity}</span>
            </Box>
          </Paper>
        ))}
      </div>
    </section>
  );
}

export default UrgeTracker;
