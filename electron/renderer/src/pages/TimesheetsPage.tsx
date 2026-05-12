import React, { useEffect, useState } from 'react';
import { fetchTimesheets } from '../services/timesheetsService';
import type { TimesheetRecord } from '../services/timesheetsService';

const formatDate = (value?: string) => value ? new Date(value).toLocaleString() : '—';

const TimesheetsPage = ({ userId }: { userId: string }) => {
  const [timesheets, setTimesheets] = useState<TimesheetRecord[]>([]);

  useEffect(() => {
    const loadTimesheets = async () => {
      const data = await fetchTimesheets(userId);
      setTimesheets(data);
    };

    if (userId) loadTimesheets();
  }, [userId]);

  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-900">
      <h1 className="text-2xl font-bold mb-4">Timesheets</h1>
      {timesheets.length ? (
        <div className="grid gap-3">
          {timesheets.map((timesheet) => (
            <div key={timesheet.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-lg">Session {timesheet.id.slice(0, 8)}</h2>
                  <p className="text-sm text-slate-500">Started: {formatDate(timesheet.start_time)}</p>
                </div>
                <span className={`text-xs font-semibold rounded-full px-3 py-1 ${timesheet.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {timesheet.is_active ? 'Active' : 'Completed'}
                </span>
              </div>
              <div className="mt-3 text-sm text-slate-700 space-y-1">
                <p>Ended: {formatDate(timesheet.end_time)}</p>
                <p>Created: {formatDate(timesheet.created_at)}</p>
                <p>Updated: {formatDate(timesheet.updated_at)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 text-slate-600">
          No timesheets found for this account yet. Start a session to populate your history.
        </div>
      )}
    </div>
  );
};

export default TimesheetsPage;