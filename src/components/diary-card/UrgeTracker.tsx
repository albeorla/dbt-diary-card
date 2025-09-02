import React from 'react';
import InfoIcon from '~/components/ui/InfoIcon';
import { Box, Typography, Slider, Card, Chip, Switch, FormControlLabel } from '@mui/material';
import { Warning, CheckCircle } from '@mui/icons-material';

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

const urgeColors = {
  SELF_HARM: '#dc2626',
  SUBSTANCE_USE: '#ea580c',
  BINGE_EATING: '#d97706',
  RESTRICTING: '#ca8a04',
  ISOLATING: '#7c3aed',
  LASHING_OUT: '#c2410c',
  RUMINATING: '#0891b2',
};

const getIntensityLabel = (value: number) => {
  if (value === 0) return 'None';
  if (value === 1) return 'Low';
  if (value === 2) return 'Mild';
  if (value === 3) return 'Moderate';
  if (value === 4) return 'High';
  return 'Extreme';
};

export function UrgeTracker({
  urges,
  onToggleActed,
  onChangeIntensity,
  readOnly,
}: {
  urges: Record<Urge, { intensity: number; actedOn: boolean }>;
  onToggleActed: (key: Urge, acted: boolean) => void;
  onChangeIntensity: (key: Urge, intensity: number) => void;
  readOnly?: boolean;
}) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
      {Object.entries(urges).map(([k, v]) => {
        const urge = k as Urge;
        const color = urgeColors[urge];
        const hasUrge = v.intensity > 0;
        const actedOn = v.actedOn;

        return (
          <Card
            key={k}
            sx={{
              p: 3,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 3,
              },
              border: hasUrge ? `2px solid ${color}` : '1px solid',
              borderColor: hasUrge ? color : 'divider',
              backgroundColor: actedOn ? `${color}08` : 'background.paper',
            }}
          >
            {/* Header */}
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: hasUrge ? color : 'text.primary',
                  }}
                >
                  {URGE_LABELS[urge]}
                </Typography>
                <InfoIcon
                  title={`Track your urge: ${URGE_LABELS[urge].toLowerCase()}. Set intensity (0-5) and whether you acted on it.`}
                />
                {actedOn && (
                  <Warning
                    sx={{
                      color: color,
                      fontSize: 18,
                      ml: 0.5,
                    }}
                  />
                )}
              </Box>
              <Chip
                label={v.intensity}
                size="small"
                sx={{
                  backgroundColor: hasUrge ? color : 'grey.200',
                  color: hasUrge ? 'white' : 'text.secondary',
                  fontWeight: 600,
                  minWidth: 32,
                }}
              />
            </Box>

            {/* Intensity Slider */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Intensity Level
              </Typography>
              <Slider
                aria-label={`${URGE_LABELS[urge]} intensity`}
                min={0}
                max={5}
                step={1}
                value={v.intensity}
                onChange={(_, value) => onChangeIntensity(urge, Number(value))}
                valueLabelDisplay="auto"
                disabled={!!readOnly}
                sx={{
                  color: hasUrge ? color : 'grey.300',
                  '& .MuiSlider-thumb': {
                    backgroundColor: hasUrge ? color : 'grey.400',
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: hasUrge ? color : 'grey.300',
                  },
                  '& .MuiSlider-rail': {
                    backgroundColor: 'grey.200',
                  },
                  '& .MuiSlider-mark': {
                    backgroundColor: 'grey.400',
                  },
                  '& .MuiSlider-markActive': {
                    backgroundColor: hasUrge ? color : 'grey.400',
                  },
                }}
                marks={[
                  { value: 0, label: '0' },
                  { value: 1, label: '1' },
                  { value: 2, label: '2' },
                  { value: 3, label: '3' },
                  { value: 4, label: '4' },
                  { value: 5, label: '5' },
                ]}
              />
            </Box>

            {/* Footer */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pt: 1,
                borderTop: 1,
                borderColor: 'divider',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: hasUrge ? color : 'text.secondary',
                  fontWeight: 500,
                }}
              >
                {getIntensityLabel(v.intensity)}
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={actedOn}
                    onChange={(e) => onToggleActed(urge, e.target.checked)}
                    size="small"
                    disabled={!!readOnly}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: color,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: color,
                      },
                    }}
                    inputProps={{
                      'aria-label': `Acted on ${URGE_LABELS[urge].toLowerCase()} urge`,
                    }}
                  />
                }
                label={
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 500,
                      color: actedOn ? color : 'text.secondary',
                    }}
                  >
                    Acted on it
                  </Typography>
                }
                sx={{ m: 0 }}
              />
            </Box>
          </Card>
        );
      })}
    </Box>
  );
}

export default UrgeTracker;
