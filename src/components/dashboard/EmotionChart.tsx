import React from "react";

type Point = { date: string; rating: number };

function Sparkline({ data, height = 28 }: { data: Point[]; height?: number }) {
  const width = 160;
  const padding = 4;
  const xs = data
    .map((d) => d.date)
    .sort()
    .filter((v, i, a) => a.indexOf(v) === i);
  const points = xs.map((x, i) => {
    const dayVals = data.filter((d) => d.date === x).map((d) => d.rating);
    const val = dayVals.length ? dayVals.reduce((a, b) => a + b, 0) / dayVals.length : 0;
    const px = padding + (i / Math.max(1, xs.length - 1)) * (width - padding * 2);
    const py = padding + (1 - Math.min(10, Math.max(0, val)) / 10) * (height - padding * 2);
    return [px, py] as const;
  });
  const dAttr = points.map((p, i) => (i === 0 ? `M ${p[0]},${p[1]}` : `L ${p[0]},${p[1]}`)).join(" ");
  return (
    <svg width={width} height={height} className="text-indigo-500">
      <rect x={0} y={0} width={width} height={height} fill="none" />
      <path d={dAttr} stroke="currentColor" strokeWidth={2} fill="none" />
    </svg>
  );
}

export function EmotionChart({
  trends,
}: {
  trends: { emotion: string; date: string; rating: number }[];
}) {
  const grouped = trends.reduce<Record<string, Point[]>>((acc, r) => {
    (acc[r.emotion] ??= []).push({ date: new Date(r.date).toISOString().slice(0, 10), rating: r.rating });
    return acc;
  }, {});

  return (
    <div className="space-y-2">
      {Object.entries(grouped).map(([emotion, points]) => (
        <div key={emotion} className="flex items-center gap-3">
          <span className="w-40 text-sm">{emotion}</span>
          <Sparkline data={points} />
        </div>
      ))}
      {Object.keys(grouped).length === 0 && (
        <div className="text-sm text-gray-500">No data</div>
      )}
    </div>
  );
}

export default EmotionChart;

