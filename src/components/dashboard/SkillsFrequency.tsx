import React from "react";

export function SkillsFrequency({
  items,
}: {
  items: { name: string; count: number }[];
}) {
  return (
    <div className="space-y-2">
      {items.map((s) => (
        <div key={s.name} className="flex items-center gap-3">
          <span className="w-40 text-sm">{s.name}</span>
          <div className="h-2 grow rounded bg-gray-100">
            <div className="h-2 rounded bg-emerald-500" style={{ width: `${Math.min(100, s.count * 10)}%` }} />
          </div>
          <span className="w-10 text-right text-sm">{s.count}</span>
        </div>
      ))}
      {items.length === 0 && <div className="text-sm text-gray-500">No data</div>}
    </div>
  );
}

export default SkillsFrequency;

