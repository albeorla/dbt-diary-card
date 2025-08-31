import React from "react";

export function DayCell({
  day,
  isCurrentMonth,
  hasEntry,
  isToday,
  onClick,
}: {
  day: number;
  isCurrentMonth: boolean;
  hasEntry?: boolean;
  isToday?: boolean;
  onClick?: () => void;
}) {
  const base = "w-full aspect-square p-2 border rounded hover:bg-gray-50 cursor-pointer";
  const dim = isCurrentMonth ? "" : "opacity-40";
  return (
    <button
      className={`${base} ${dim}`}
      onClick={onClick}
      aria-label={`Day ${day}${hasEntry ? ", has entry" : ""}${isToday ? ", today" : ""}`}
      aria-current={isToday ? "date" : undefined}
    >
      <div className="flex items-start justify-between">
        <span className={`text-sm ${isToday ? "font-semibold text-indigo-600" : ""}`}>{day}</span>
        {hasEntry && <span className="h-2 w-2 rounded-full bg-emerald-500" aria-label="Has entry" />}
      </div>
    </button>
  );
}

export default DayCell;
