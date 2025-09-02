import React from 'react';
import { Button, Box, Typography, LinearProgress, Alert } from '@mui/material';
import { Save, Refresh, CheckCircle, Error as ErrorIcon, History } from '@mui/icons-material';

export function FormActions({
  isSaving,
  onSave,
  onReset,
  saved,
  error,
}: {
  isSaving: boolean;
  onSave: () => void;
  onReset: () => void;
  saved?: boolean;
  error?: boolean;
}) {
  return (
    <Box>
      {/* Status Messages */}
      {saved && (
        <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 2, borderRadius: 2 }}>
          Entry saved successfully! You&apos;ll be redirected to your history.
        </Alert>
      )}

      {error && (
        <Alert severity="error" icon={<ErrorIcon />} sx={{ mb: 2, borderRadius: 2 }}>
          Error saving your entry. Please try again.
        </Alert>
      )}

      {isSaving && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Saving your diary entry...
          </Typography>
          <LinearProgress sx={{ borderRadius: 1 }} />
        </Box>
      )}

      {/* Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Save />}
            onClick={onSave}
            disabled={isSaving}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            {isSaving ? 'Saving...' : 'Save Entry'}
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<Refresh />}
            onClick={onReset}
            disabled={isSaving}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
            }}
            title="Reset all fields to blank/defaults for this date. This does not delete saved data until you save again."
          >
            Reset
          </Button>
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            fontStyle: 'italic',
          }}
        >
          <History fontSize="small" />
          Saving will redirect to your history
        </Typography>
      </Box>

      {/* Additional Help */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          backgroundColor: 'info.light',
          borderRadius: 2,
          border: 1,
          borderColor: 'info.main',
        }}
      >
        <Typography variant="body2" color="info.dark" sx={{ fontWeight: 500, mb: 1 }}>
          📋 Daily Check-in Complete
        </Typography>
        <Typography variant="caption" color="info.dark">
          Remember: This diary helps track patterns and progress. Be honest and gentle with
          yourself.
        </Typography>
      </Box>
    </Box>
  );
}

export default FormActions;
