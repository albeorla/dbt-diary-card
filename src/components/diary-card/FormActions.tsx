import React from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

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
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Button variant="contained" onClick={onSave} disabled={isSaving} title="Save or update your diary entry for today.">
        {isSaving ? "Saving…" : "Save"}
      </Button>
      <Button variant="outlined" onClick={onReset} type="button" title="Reset all fields to blank/defaults for this date. This does not delete saved data until you save again.">
        Reset
      </Button>
      {saved && <span className="text-sm text-green-700">Saved</span>}
      {error && <span className="text-sm text-red-700">Error saving</span>}
    </Box>
  );
}

export default FormActions;
