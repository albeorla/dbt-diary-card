import React, { useMemo, useState } from 'react';
import { api } from '~/utils/api';

function toYMD(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
}

export function ExportOptions() {
  const today = useMemo(() => new Date(), []);
  const [range, setRange] = useState<{ start: string; end: string }>(() => {
    const end = new Date(today);
    const start = new Date(today);
    start.setDate(end.getDate() - 29);
    return { start: toYMD(start), end: toYMD(end) };
  });

  const entries = api.diary.getRange.useQuery({ startDate: range.start, endDate: range.end });

  const exportCSV = () => {
    const rows = (entries.data ?? []).map((e: any) => ({
      date: toYMD(new Date(e.entryDate)),
      notes: e.notes ?? '',
    }));
    const csv = [
      'date,notes',
      ...rows.map((r) => `${r.date},"${(r.notes as string).replace(/"/g, '""')}"`),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diary_${range.start}_to_${range.end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printPDF = () => {
    // Open the print-friendly page with range query
    const url = `/export/print?start=${encodeURIComponent(range.start)}&end=${encodeURIComponent(
      range.end,
    )}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <div className="flex items-center gap-2">
          <label className="text-sm" htmlFor="start">
            Start
          </label>
          <input
            id="start"
            type="date"
            className="rounded border p-2"
            value={range.start}
            onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm" htmlFor="end">
            End
          </label>
          <input
            id="end"
            type="date"
            className="rounded border p-2"
            value={range.end}
            onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))}
          />
        </div>
        <button
          className="ml-2 rounded border px-3 py-2 text-sm hover:bg-gray-50"
          onClick={exportCSV}
          disabled={entries.isLoading}
          title="Export current range to CSV"
        >
          Export CSV
        </button>
        <button
          className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
          onClick={printPDF}
          title="Use your browser Print to PDF"
        >
          Print to PDF
        </button>
      </div>

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="border-b p-3">Date</th>
              <th className="border-b p-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {entries.isLoading && (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td className="border-b p-3">
                      <span className="inline-block h-4 w-24 animate-pulse rounded bg-gray-200" />
                    </td>
                    <td className="border-b p-3">
                      <span className="inline-block h-4 w-64 animate-pulse rounded bg-gray-200" />
                    </td>
                  </tr>
                ))}
              </>
            )}
            {(entries.data ?? []).map((e: any) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="border-b p-3 align-top">{toYMD(new Date(e.entryDate))}</td>
                <td className="border-b p-3 align-top max-w-[480px] truncate" title={e.notes ?? ''}>
                  {e.notes ?? ''}
                </td>
              </tr>
            ))}
            {entries.data?.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan={2}>
                  No entries in range
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ExportOptions;
