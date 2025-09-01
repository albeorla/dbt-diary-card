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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function SkillsFrequency({ items }: { items: { name: string; count: number }[] }) {
  const data = useMemo(() => {
    const labels = items.map((s) => s.name);
    const counts = items.map((s) => s.count);
    return {
      labels,
      datasets: [
        {
          label: 'Uses',
          data: counts,
          backgroundColor: '#10b981',
        },
      ],
    };
  }, [items]);
  if (items.length === 0) return <div className="text-sm text-gray-500">No data</div>;
  return (
    <Bar
      data={data}
      options={{
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } },
        maintainAspectRatio: false,
      }}
      height={200}
    />
  );
}

export default SkillsFrequency;
