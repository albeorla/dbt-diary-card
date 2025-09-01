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
import { useTheme } from '@mui/material/styles';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function EmotionChart({
  trends,
}: {
  trends: { emotion: string; date: string; rating: number }[];
}) {
  const theme = useTheme();
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
    const palette = [
      theme.palette.primary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.info.main,
    ];
    const datasets = Object.entries(grouped).map(([emotion, pts], i) => {
      const map = new Map(pts.map((p) => [p.date, p.rating] as const));
      const color = palette[i % palette.length];
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
  }, [trends, theme.palette]);

  if (trends.length === 0) return <div className="text-sm text-gray-500">No data</div>;
  return (
    <Line
      data={byEmotion}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: theme.palette.text.secondary, usePointStyle: true },
          },
          tooltip: {
            intersect: false,
            mode: 'index',
            backgroundColor: theme.palette.background.paper,
            titleColor: theme.palette.text.primary,
            bodyColor: theme.palette.text.secondary,
            borderColor: theme.palette.divider,
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            ticks: { color: theme.palette.text.secondary },
            grid: { color: theme.palette.divider },
          },
          y: {
            suggestedMin: 0,
            suggestedMax: 10,
            ticks: { color: theme.palette.text.secondary },
            grid: { color: theme.palette.divider },
          },
        },
      }}
      height={220}
    />
  );
}

export default EmotionChart;
