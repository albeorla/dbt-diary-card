import React from "react";

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
    <div className="flex items-center gap-3">
      <button
        className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
        onClick={onSave}
        disabled={isSaving}
        title="Save or update your diary entry for today."
      >
        {isSaving ? "Saving…" : "Save"}
      </button>
      <button
        className="rounded border border-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-50"
        onClick={onReset}
        type="button"
        title="Reset all fields to blank/defaults for this date. This does not delete saved data until you save again."
      >
        Reset
      </button>
      {saved && <span className="text-sm text-green-700">Saved</span>}
      {error && <span className="text-sm text-red-700">Error saving</span>}
    </div>
  );
}

export default FormActions;

