import React, { useEffect, useState } from 'react';
import { fetchTimesheets } from '../services/timesheetsService';
import type { TimesheetRecord } from '../services/timesheetsService';

const formatDate = (value?: string | null) => value ? new Date(value).toLocaleString() : '—';

const formatDuration = (start?: string, end?: string | null) => {
  if (!start) return 'Unknown';
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  const diffSeconds = Math.max(0, Math.floor((endDate.getTime() - startDate.getTime()) / 1000));
  const hours = Math.floor(diffSeconds / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const TimesheetsPage = ({ userId }: { userId: string }) => {
  const [timesheets, setTimesheets] = useState<TimesheetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadTimesheets = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchTimesheets(userId);
        if (!active) return;
        setTimesheets(data);
      } catch (err) {
        console.error('Failed to load timesheets:', err);
        if (active) setError('Unable to load timesheet history. Please try again later.');
      } finally {
        if (active) setLoading(false);
      }
    };

    if (userId) loadTimesheets();

    return () => {
      active = false;
    };
  }, [userId]);

  return (
    <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-200 text-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Timesheets</h1>
          <p className="text-sm text-slate-500 mt-1">Review your session history, durations, and recent activity.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
          {loading ? 'Loading…' : `${timesheets.length} record${timesheets.length === 1 ? '' : 's'}`}
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
          Loading timesheets…
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      ) : timesheets.length ? (
        <div className="grid gap-4">
          {timesheets.map((timesheet) => (
            <div key={timesheet.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
              <div className="p-5 bg-white border-b border-slate-200 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Session {timesheet.id.toString().slice(0, 8)}</h2>
                  <p className="mt-1 text-sm text-slate-500">Started {formatDate(timesheet.start_time)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${timesheet.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {timesheet.is_active ? 'Active' : 'Completed'}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{timesheet.status ?? 'Status unknown'}</span>
                </div>
              </div>
              <div className="p-5 grid gap-4 sm:grid-cols-3 text-sm text-slate-700">
                <div>
                  <p className="font-semibold text-slate-900">Duration</p>
                  <p>{formatDuration(timesheet.start_time, timesheet.end_time)}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Ended</p>
                  <p>{formatDate(timesheet.end_time)}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Last updated</p>
                  <p>{formatDate(timesheet.updated_at)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
          <p className="text-lg font-semibold text-slate-900">No timesheets found</p>
          <p className="mt-2 text-sm">Start a session to populate your history and see your productivity at a glance.</p>
        </div>
      )}
    </div>
  );
};

export default TimesheetsPage;