import React from 'react';
import InfoIcon from '~/components/ui/InfoIcon';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';

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
      <Typography variant="h6" sx={{ mb: 1 }}>
        Emotions (0-10)
      </Typography>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {isLoading && (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <Paper
                key={i}
                variant="outlined"
                sx={{
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <span className="w-28 animate-pulse rounded bg-gray-200" style={{ height: 16 }} />
                <span className="grow animate-pulse rounded bg-gray-200" style={{ height: 8 }} />
                <span className="w-6" />
              </Paper>
            ))}
          </>
        )}
        {Object.keys(emotions).map((k) => (
          <Paper
            key={k}
            variant="outlined"
            sx={{
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, width: 140 }}>
              <label
                className="text-sm font-medium"
                id={`emotion-${k}-label`}
                title={`Rate ${EMOTION_LABELS[k as Emotion].toLowerCase()} from 0 (none) to 10 (extreme).`}
              >
                {EMOTION_LABELS[k as Emotion]}
              </label>
              <InfoIcon
                title={`Rate ${EMOTION_LABELS[k as Emotion].toLowerCase()} from 0 (none) to 10 (extreme).`}
              />
            </Box>
            <Box sx={{ flex: 1, px: 1 }}>
              <Slider
                aria-labelledby={`emotion-${k}-label`}
                min={0}
                max={10}
                step={1}
                value={(emotions as any)[k]}
                onChange={(_, v) => onChange(k as Emotion, Number(v))}
                valueLabelDisplay="auto"
              />
            </Box>
            <span className="w-6 text-right text-sm" aria-live="polite">
              {(emotions as any)[k]}
            </span>
          </Paper>
        ))}
      </div>
    </section>
  );
}

export default EmotionSliders;
