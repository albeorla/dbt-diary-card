import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useTheme } from '@mui/material/styles';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function SkillsFrequency({ items }: { items: { name: string; count: number }[] }) {
  const theme = useTheme();
  const data = useMemo(() => {
    const labels = items.map((s) => s.name);
    const counts = items.map((s) => s.count);
    return {
      labels,
      datasets: [
        {
          label: 'Uses',
          data: counts,
          backgroundColor: theme.palette.success.main,
        },
      ],
    };
  }, [items, theme.palette.success.main]);
  if (items.length === 0) return <div className="text-sm text-gray-500">No data</div>;
  return (
    <Bar
      data={data}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: theme.palette.background.paper,
            titleColor: theme.palette.text.primary,
            bodyColor: theme.palette.text.secondary,
            borderColor: theme.palette.divider,
            borderWidth: 1,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: theme.palette.text.secondary },
            grid: { color: theme.palette.divider },
          },
          x: {
            ticks: { color: theme.palette.text.secondary },
            grid: { display: false },
          },
        },
      }}
      height={220}
    />
  );
}

export default SkillsFrequency;
