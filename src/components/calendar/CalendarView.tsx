import React, { useMemo, useState } from 'react';
import { api } from '~/utils/api';
import DayCell from './DayCell';
import EntryModal from './EntryModal';

function range(n: number) {
  return Array.from({ length: n }, (_, i) => i);
}

function toYMD(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
}

export function CalendarView({ year, month }: { year: number; month: number }) {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const startOfGrid = new Date(first);
  startOfGrid.setDate(first.getDate() - ((first.getDay() + 6) % 7)); // Monday-start grid
  const totalDays = 42; // 6 weeks grid
  const endOfGrid = new Date(startOfGrid);
  endOfGrid.setDate(startOfGrid.getDate() + totalDays - 1);

  const { data } = api.diary.getRange.useQuery({
    startDate: toYMD(startOfGrid),
    endDate: toYMD(endOfGrid),
  });
  const entrySet = useMemo(
    () => new Set((data ?? []).map((e: any) => toYMD(new Date(e.entryDate)))),
    [data],
  );

  const [openDate, setOpenDate] = useState<string | null>(null);
  const [focusDate, setFocusDate] = useState<string>(() => {
    const today = toYMD(new Date());
    const inGrid = new Date(today) >= startOfGrid && new Date(today) <= endOfGrid;
    return inGrid ? today : toYMD(first);
  });

  const moveFocus = (daysDelta: number) => {
    const d = new Date(focusDate);
    d.setDate(d.getDate() + daysDelta);
    const ymd = toYMD(d);
    setFocusDate(ymd);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-gray-600 mb-2">
        {'Mon Tue Wed Thu Fri Sat Sun'.split(' ').map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div
        className="grid grid-cols-7 gap-2"
        role="grid"
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            moveFocus(-1);
          }
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            moveFocus(1);
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            moveFocus(-7);
          }
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            moveFocus(7);
          }
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpenDate(focusDate);
          }
          if (e.key.toLowerCase() === 't') {
            e.preventDefault();
            const t = toYMD(new Date());
            setFocusDate(t);
            setOpenDate(t);
          }
        }}
        tabIndex={0}
        aria-label="Calendar grid"
      >
        {range(totalDays).map((i) => {
          const d = new Date(startOfGrid);
          d.setDate(startOfGrid.getDate() + i);
          const ymd = toYMD(d);
          const isCurrentMonth = d.getMonth() === month - 1;
          const hasEntry = entrySet.has(ymd);
          const isToday = toYMD(new Date()) === ymd;
          return (
            <div key={i} role="gridcell" aria-selected={focusDate === ymd}>
              <DayCell
                key={i}
                day={d.getDate()}
                isCurrentMonth={isCurrentMonth}
                hasEntry={hasEntry}
                isToday={isToday}
                onClick={() => {
                  setFocusDate(ymd);
                  setOpenDate(ymd);
                }}
              />
            </div>
          );
        })}
      </div>
      {openDate && <EntryModal date={openDate} onClose={() => setOpenDate(null)} />}
    </div>
  );
}

export default CalendarView;
