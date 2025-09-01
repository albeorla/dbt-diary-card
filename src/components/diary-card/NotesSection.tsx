import React from 'react';
import InfoIcon from '~/components/ui/InfoIcon';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

export function NotesSection({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <section className="mb-8">
      <div className="mb-2 flex items-center gap-1">
        <Typography variant="h6">Notes</Typography>
        <InfoIcon title="Optional notes for today: triggers, events, progress, or anything else you'd like to remember." />
      </div>
      <Paper variant="outlined" sx={{ p: 1 }}>
        <TextField
          fullWidth
          multiline
          minRows={4}
          placeholder="Notes..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputProps={{
            title:
              "Optional notes for today: triggers, events, progress, or anything else you'd like to remember.",
          }}
          variant="outlined"
        />
      </Paper>
    </section>
  );
}

export default NotesSection;
