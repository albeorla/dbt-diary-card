import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { api } from "~/utils/api";

function isSameYMD(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function parseYMDLocal(s: string) {
  const [y, m, d] = s.split("-").map((v) => Number(v));
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function EntryModal({ date, onClose }: { date: string; onClose: () => void }) {
  const { data, isLoading } = api.diary.getByDate.useQuery({ date });
  const upsert = api.diary.upsert.useMutation();
  const utils = api.useUtils();
  const [notes, setNotes] = useState("");
  const isToday = useMemo(() => isSameYMD(parseYMDLocal(date), new Date()), [date]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastFocused = useRef<Element | null>(null);

  useEffect(() => {
    setNotes((data?.notes ?? "") as string);
  }, [data?.notes]);

  // Focus management: trap focus within modal, restore on close
  useEffect(() => {
    lastFocused.current = document.activeElement;
    const container = containerRef.current;
    if (!container) return;
    const focusables = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    first?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "Tab") {
        if (focusables.length === 0) return;
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            (last ?? first).focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            (first ?? last).focus();
          }
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (lastFocused.current instanceof HTMLElement) {
        lastFocused.current.focus();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!isToday) return; // backend forbids past edits
    await upsert.mutateAsync({ date, notes, emotions: [], urges: [], skills: [] });
    await utils.diary.getByDate.invalidate({ date });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal
      aria-labelledby="entry-modal-title"
      aria-describedby="entry-modal-desc"
      onMouseDown={(e) => {
        // Close when clicking the backdrop (not inside the panel)
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={containerRef} className="w-full max-w-lg rounded bg-white p-4 shadow" role="document">
        <div className="mb-3 flex items-center justify-between">
          <h3 id="entry-modal-title" className="text-lg font-semibold">Entry · {date}</h3>
          <button className="rounded border px-2 py-1 text-sm hover:bg-gray-50" onClick={onClose} aria-label="Close dialog">×</button>
        </div>
        {isLoading ? (
          <div className="space-y-2">
            <span className="inline-block h-4 w-40 animate-pulse rounded bg-gray-200" />
            <span className="inline-block h-20 w-full animate-pulse rounded bg-gray-200" />
          </div>
        ) : (
          <div className="space-y-3">
            <div id="entry-modal-desc">
              <div className="mb-1 text-sm text-gray-600">Notes</div>
              <textarea
                className="w-full rounded border p-2"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={!isToday}
                placeholder={isToday ? "Quick notes for today…" : "Viewing past notes"}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {data ? "Entry exists" : "No entry yet"}
              </div>
              <div className="flex items-center gap-2">
                {isToday && (
                  <button
                    className="rounded bg-indigo-600 px-3 py-2 text-white disabled:opacity-50"
                    onClick={() => void handleSave()}
                    disabled={upsert.isPending}
                    aria-label="Save notes"
                  >
                    {upsert.isPending ? "Saving…" : "Save"}
                  </button>
                )}
                <Link className="rounded border px-3 py-2 text-sm hover:bg-gray-50" href={`/diary?date=${date}`} aria-label="Open full diary entry">
                  Open full entry
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EntryModal;
