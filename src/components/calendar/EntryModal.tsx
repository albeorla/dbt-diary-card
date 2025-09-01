import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '~/utils/api';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

function isSameYMD(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function parseYMDLocal(s: string) {
  const parts = s.split('-');
  const y = Number(parts[0] ?? 1970);
  const m = Number(parts[1] ?? 1);
  const d = Number(parts[2] ?? 1);
  return new Date(y, m - 1, d);
}

export function EntryModal({ date, onClose }: { date: string; onClose: () => void }) {
  const { data, isLoading } = api.diary.getByDate.useQuery({ date });
  const upsert = api.diary.upsert.useMutation();
  const utils = api.useUtils();
  const [notes, setNotes] = useState('');
  const isToday = useMemo(() => isSameYMD(parseYMDLocal(date), new Date()), [date]);

  useEffect(() => {
    setNotes((data?.notes ?? '') as string);
  }, [data?.notes]);

  // MUI Dialog handles focus management and Escape/backdrop by default

  const handleSave = async () => {
    if (!isToday) return; // backend forbids past edits
    await upsert.mutateAsync({ date, notes, emotions: [], urges: [], skills: [] });
    await utils.diary.getByDate.invalidate({ date });
    onClose();
  };

  return (
    <Dialog open onClose={onClose} aria-labelledby="entry-modal-title" fullWidth maxWidth="sm">
      <DialogTitle id="entry-modal-title">Entry · {date}</DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <div className="space-y-2">
            <span className="inline-block h-4 w-40 animate-pulse rounded bg-gray-200" />
            <span className="inline-block h-20 w-full animate-pulse rounded bg-gray-200" />
          </div>
        ) : (
          <div className="space-y-3" id="entry-modal-desc">
            <div className="mb-1 text-sm text-gray-600">Notes</div>
            <textarea
              className="w-full rounded border p-2"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={!isToday}
              placeholder={isToday ? 'Quick notes for today…' : 'Viewing past notes'}
            />
            <div className="text-sm text-gray-500">{data ? 'Entry exists' : 'No entry yet'}</div>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Link
          className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
          href={`/diary?date=${date}`}
          aria-label="Open full diary entry"
        >
          Open full entry
        </Link>
        {isToday && (
          <Button
            variant="contained"
            onClick={() => void handleSave()}
            disabled={upsert.isPending}
            aria-label="Save notes"
          >
            {upsert.isPending ? 'Saving…' : 'Save'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default EntryModal;
