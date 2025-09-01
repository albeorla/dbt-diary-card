import React from 'react';
import InfoIcon from '~/components/ui/InfoIcon';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Slider from '@mui/material/Slider';

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
              <FormControlLabel
                control={
                  <Checkbox
                    checked={v.actedOn}
                    onChange={(e) => onToggleActed(k as Urge, e.target.checked)}
                    inputProps={{
                      'aria-label': `Acted on ${URGE_LABELS[k as Urge].toLowerCase()} urge`,
                    }}
                  />
                }
                label={<span className="text-sm">Acted on</span>}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ flex: 1, px: 1 }}>
                <Slider
                  aria-label={`${URGE_LABELS[k as Urge]} intensity`}
                  min={0}
                  max={5}
                  step={1}
                  value={v.intensity}
                  onChange={(_, value) => onChangeIntensity(k as Urge, Number(value))}
                  valueLabelDisplay="auto"
                />
              </Box>
              <span className="w-6 text-right text-sm" aria-live="polite">
                {v.intensity}
              </span>
            </Box>
          </Paper>
        ))}
      </div>
    </section>
  );
}

export default UrgeTracker;
