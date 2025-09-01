import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function EmotionChart({
  trends,
}: {
  trends: { emotion: string; date: string; rating: number }[];
}) {
  const byEmotion = useMemo(() => {
    const grouped = trends.reduce<Record<string, { date: string; rating: number }[]>>((acc, r) => {
      (acc[r.emotion] ??= []).push({
        date: new Date(r.date).toISOString().slice(0, 10),
        rating: r.rating,
      });
      return acc;
    }, {});
    const labels = Array.from(
      new Set(trends.map((r) => new Date(r.date).toISOString().slice(0, 10))),
    ).sort();
    const datasets = Object.entries(grouped).map(([emotion, pts], i) => {
      const map = new Map(pts.map((p) => [p.date, p.rating] as const));
      const color = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'][i % 5];
      return {
        label: emotion,
        data: labels.map((d) => map.get(d) ?? null),
        borderColor: color,
        backgroundColor: color,
        spanGaps: true,
        tension: 0.3,
      };
    });
    return { labels, datasets };
  }, [trends]);

  if (trends.length === 0) return <div className="text-sm text-gray-500">No data</div>;
  return (
    <Line
      data={byEmotion}
      options={{
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { suggestedMin: 0, suggestedMax: 10 } },
        maintainAspectRatio: false,
      }}
      height={200}
    />
  );
}

export default EmotionChart;
