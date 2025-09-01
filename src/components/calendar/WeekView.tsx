import React from 'react';
import { api } from '~/utils/api';

function toYMD(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
}

export function WeekView({ weekStart }: { weekStart: string }) {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const { data, isLoading } = api.diary.getRange.useQuery({
    startDate: toYMD(start),
    endDate: toYMD(end),
  });
  const byDate = new Map<string, any>();
  (data ?? []).forEach((e: any) => byDate.set(toYMD(new Date(e.entryDate)), e));

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
      {Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const ymd = toYMD(d);
        const e = byDate.get(ymd);
        return (
          <div key={i} className="rounded border p-3">
            <div className="mb-2 text-sm font-medium">{ymd}</div>
            {isLoading ? (
              <span className="inline-block h-4 w-full animate-pulse rounded bg-gray-200" />
            ) : e ? (
              <div className="text-sm text-gray-900 truncate" title={e.notes ?? ''}>
                {e.notes ?? '(no notes)'}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No entry</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default WeekView;
