import React from "react";
import InfoIcon from "~/components/ui/InfoIcon";

export function NotesSection({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <section className="mb-8">
      <div className="mb-2 flex items-center gap-1">
        <h2 className="text-xl font-semibold">Notes</h2>
        <InfoIcon title="Optional notes for today: triggers, events, progress, or anything else you'd like to remember." />
      </div>
      <textarea
        className="w-full rounded border p-3"
        rows={4}
        placeholder="Notes..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        title="Optional notes for today: triggers, events, progress, or anything else you'd like to remember."
      />
    </section>
  );
}

export default NotesSection;

