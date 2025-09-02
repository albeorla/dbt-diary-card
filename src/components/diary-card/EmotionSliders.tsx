import React from 'react';
import InfoIcon from '~/components/ui/InfoIcon';
import { Box, Typography, Slider, Card, Chip } from '@mui/material';
import { Skeleton } from '@mui/material';

export type Emotion =
  | 'SADNESS'
  | 'ANGER'
  | 'FEAR'
  | 'SHAME'
  | 'JOY'
  | 'PRIDE'
  | 'LOVE'
  | 'GUILT'
  | 'ANXIETY'
  | 'DISGUST';

export const EMOTION_LABELS: Record<Emotion, string> = {
  SADNESS: 'Sadness',
  ANGER: 'Anger',
  FEAR: 'Fear',
  SHAME: 'Shame',
  JOY: 'Joy',
  PRIDE: 'Pride',
  LOVE: 'Love',
  GUILT: 'Guilt',
  ANXIETY: 'Anxiety',
  DISGUST: 'Disgust',
};

const emotionColors = {
  SADNESS: '#6b7280',
  ANGER: '#ef4444',
  FEAR: '#8b5cf6',
  SHAME: '#ec4899',
  JOY: '#eab308',
  PRIDE: '#10b981',
  LOVE: '#f97316',
  GUILT: '#84cc16',
  ANXIETY: '#06b6d4',
  DISGUST: '#64748b',
};

const getEmotionIntensity = (value: number) => {
  if (value === 0) return 'None';
  if (value <= 2) return 'Low';
  if (value <= 5) return 'Mild';
  if (value <= 7) return 'Moderate';
  if (value <= 9) return 'High';
  return 'Extreme';
};

export function EmotionSliders({
  emotions,
  onChange,
  isLoading,
  readOnly = false,
}: {
  emotions: Record<Emotion, number>;
  onChange: (key: Emotion, value: number) => void;
  isLoading?: boolean;
  readOnly?: boolean;
}) {
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i} sx={{ p: 2 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
            >
              <Skeleton width={80} height={20} />
              <Skeleton width={30} height={16} />
            </Box>
            <Skeleton width="100%" height={4} sx={{ mb: 1 }} />
            <Skeleton width={50} height={14} />
          </Card>
        ))}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
        gap: 2,
      }}
    >
      {Object.entries(emotions).map(([k, value]) => {
        const emotion = k as Emotion;
        const color = emotionColors[emotion];

        return (
          <Card
            key={k}
            sx={{
              p: 2.5,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 3,
              },
              border: value > 0 ? `2px solid ${color}` : '1px solid',
              borderColor: value > 0 ? color : 'divider',
            }}
          >
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 600,
                    color: value > 0 ? color : 'text.primary',
                  }}
                  id={`emotion-${k}-label`}
                >
                  {EMOTION_LABELS[emotion]}
                </Typography>
                <InfoIcon
                  title={`Rate ${EMOTION_LABELS[emotion].toLowerCase()} from 0 (none) to 10 (extreme).`}
                />
              </Box>
              <Chip
                label={value}
                size="small"
                sx={{
                  backgroundColor: value > 0 ? color : 'grey.200',
                  color: value > 0 ? 'white' : 'text.secondary',
                  fontWeight: 600,
                  minWidth: 32,
                }}
              />
            </Box>

            <Slider
              aria-labelledby={`emotion-${k}-label`}
              min={0}
              max={10}
              step={1}
              value={value}
              onChange={readOnly ? undefined : (_, v) => onChange(emotion, Number(v))}
              valueLabelDisplay="auto"
              disabled={readOnly}
              sx={{
                color: value > 0 ? color : 'grey.300',
                mb: 1,
                '& .MuiSlider-thumb': {
                  backgroundColor: value > 0 ? color : 'grey.400',
                },
                '& .MuiSlider-track': {
                  backgroundColor: value > 0 ? color : 'grey.300',
                },
                '& .MuiSlider-rail': {
                  backgroundColor: 'grey.200',
                },
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography
                variant="caption"
                sx={{
                  color: value > 0 ? color : 'text.secondary',
                  fontWeight: 500,
                }}
              >
                {getEmotionIntensity(value)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                0-10 scale
              </Typography>
            </Box>
          </Card>
        );
      })}
    </Box>
  );
}

export default EmotionSliders;
