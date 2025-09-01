import React, { useMemo } from 'react';

type Urge =
  | 'SELF_HARM'
  | 'SUBSTANCE_USE'
  | 'BINGE_EATING'
  | 'RESTRICTING'
  | 'ISOLATING'
  | 'LASHING_OUT'
  | 'RUMINATING';
const URGE_LABELS: Record<Urge, string> = {
  SELF_HARM: 'Self-harm',
  SUBSTANCE_USE: 'Substance use',
  BINGE_EATING: 'Binge eating',
  RESTRICTING: 'Restricting',
  ISOLATING: 'Isolating',
  LASHING_OUT: 'Lashing out',
  RUMINATING: 'Ruminating',
};

function toYMD(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
}

export function UrgeHeatmap({
  start,
  end,
  items,
}: {
  start: string;
  end: string;
  items: { urgeType: Urge; intensity: number; actedOn: boolean; entry: { entryDate: string } }[];
}) {
  const days = useMemo(() => {
    const s = new Date(start);
    const e = new Date(end);
    const out: string[] = [];
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) out.push(toYMD(d));
    return out;
  }, [start, end]);

  const matrix = useMemo(() => {
    const m = new Map<string, number>();
    items.forEach((u: any) => {
      const rawDate = u?.entry?.entryDate ?? u?.entryDate ?? null;
      if (!rawDate) return; // skip if date missing
      const key = `${u.urgeType}:${toYMD(new Date(rawDate))}`;
      const prev = m.get(key) ?? 0;
      m.set(key, Math.max(prev, u.intensity));
    });
    return m;
  }, [items]);

  const urges: Urge[] = [
    'SELF_HARM',
    'SUBSTANCE_USE',
    'BINGE_EATING',
    'RESTRICTING',
    'ISOLATING',
    'LASHING_OUT',
    'RUMINATING',
  ];

  const color = (val: number) => {
    const t = Math.min(1, Math.max(0, val / 5));
    const g = Math.floor(255 - t * 160);
    const r = Math.floor(240 - t * 200);
    return `rgb(${r}, ${g}, 255)`; // light -> bluish strengthening
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="border-b p-2 text-left">Urge</th>
            {days.map((d) => (
              <th key={d} className="border-b p-2 text-center">
                {d.slice(5)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {urges.map((u) => (
            <tr key={u}>
              <td className="border-b p-2 text-left whitespace-nowrap">{URGE_LABELS[u]}</td>
              {days.map((d) => {
                const val = matrix.get(`${u}:${d}`) ?? 0;
                return (
                  <td key={d} className="border-b p-1">
                    <div
                      className="h-6 w-6 rounded"
                      style={{ background: val > 0 ? color(val) : '#f3f4f6' }}
                      title={`${URGE_LABELS[u]} on ${d}: ${val}`}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UrgeHeatmap;
