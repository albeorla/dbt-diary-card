import React from "react";

export function WeeklySummary({
  entriesCount,
  skillsCount,
  emotionsCount,
}: {
  entriesCount: number;
  skillsCount: number;
  emotionsCount: number;
}) {
  return (
    <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="rounded border p-4">
        <div className="text-sm text-gray-500">Entries</div>
        <div className="text-2xl font-semibold">{entriesCount}</div>
      </div>
      <div className="rounded border p-4">
        <div className="text-sm text-gray-500">Skills Used</div>
        <div className="text-2xl font-semibold">{skillsCount}</div>
      </div>
      <div className="rounded border p-4">
        <div className="text-sm text-gray-500">Tracked Emotions</div>
        <div className="text-2xl font-semibold">{emotionsCount}</div>
      </div>
    </section>
  );
}

export default WeeklySummary;

