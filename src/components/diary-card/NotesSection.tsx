import React from 'react';
import InfoIcon from '~/components/ui/InfoIcon';
import { Box, Typography, TextField, Chip } from '@mui/material';
import { Notes, Psychology } from '@mui/icons-material';

export function NotesSection({
  value,
  onChange,
  readOnly,
}: {
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
}) {
  const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
  const charCount = value.length;
  const hasContent = value.trim().length > 0;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Notes sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="body2" color="text.secondary">
            Reflections, triggers, progress, or anything else from today
          </Typography>
          <InfoIcon title="Optional notes for today: triggers, events, progress, or anything else you'd like to remember." />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {hasContent && (
            <>
              <Chip
                label={`${wordCount} words`}
                size="small"
                variant="outlined"
                color={wordCount > 50 ? 'success' : 'default'}
              />
              <Chip label={`${charCount} chars`} size="small" variant="outlined" />
            </>
          )}
        </Box>
      </Box>

      {/* Text Field */}
      <TextField
        fullWidth
        multiline
        minRows={6}
        maxRows={12}
        placeholder="What happened today? How are you feeling? What triggered strong emotions? What skills helped? Any insights or reflections..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        variant="outlined"
        disabled={!!readOnly}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: hasContent ? 'action.hover' : 'background.paper',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
            '&.Mui-focused': {
              backgroundColor: 'background.paper',
            },
            '& fieldset': {
              borderColor: hasContent ? 'primary.main' : 'divider',
              borderWidth: hasContent ? 2 : 1,
            },
            '&:hover fieldset': {
              borderColor: 'primary.main',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'primary.main',
              borderWidth: 2,
            },
          },
          '& .MuiInputBase-input': {
            fontSize: '0.95rem',
            lineHeight: 1.6,
          },
        }}
        inputProps={{
          'aria-label': 'Daily notes and reflections',
          title:
            "Optional notes for today: triggers, events, progress, or anything else you'd like to remember.",
        }}
      />

      {/* Helper Text */}
      <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          💡 Tip: Include triggers, coping strategies, or insights from today
        </Typography>
        {hasContent && (
          <Typography variant="caption" color="primary.main" sx={{ fontWeight: 500 }}>
            Great reflection! 📝
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default NotesSection;
