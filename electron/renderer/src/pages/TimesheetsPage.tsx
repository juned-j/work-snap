import React, { useEffect, useState } from 'react';
import { Clock3, Activity, CheckCircle2 } from 'lucide-react';

import { fetchTimesheets } from '../services/timesheetsService';
import type { TimesheetRecord } from '../services/timesheetsService';

const formatDate = (value?: string | null) => {
  if (!value) return '—';

  return new Date(value).toLocaleString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDuration = (
  start?: string,
  end?: string | null
) => {

  if (!start) return '0 min';

  const startDate = new Date(start);

  const endDate = end
    ? new Date(end)
    : new Date();

  const diffSeconds = Math.max(
    0,
    Math.floor(
      (endDate.getTime() - startDate.getTime()) / 1000
    )
  );

  const hours = Math.floor(diffSeconds / 3600);

  const minutes = Math.floor(
    (diffSeconds % 3600) / 60
  );

  if (hours > 0 && minutes > 0) {
    return `${hours} hr ${minutes} min`;
  }

  if (hours > 0) {
    return `${hours} hr`;
  }

  return `${minutes} min`;
};

const TimesheetsPage = ({
  userId,
}: {
  userId: string;
}) => {

  const [timesheets, setTimesheets] = useState<
    TimesheetRecord[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(
    null
  );

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

        console.error(
          'Failed to load timesheets:',
          err
        );

        if (active) {

          setError(
            'Unable to load timesheet history.'
          );

        }

      } finally {

        if (active) {

          setLoading(false);

        }
      }
    };

    if (userId) {
      loadTimesheets();
    }

    return () => {
      active = false;
    };

  }, [userId]);

  return (

    <div className="space-y-5">

      {/* HEADER */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

        <div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Timesheets
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Review employee work sessions and activity history.
          </p>

        </div>

        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">

          {loading
            ? 'Loading...'
            : `${timesheets.length} Record${timesheets.length !== 1 ? 's' : ''}`}

        </div>

      </div>

      {/* LOADING */}
      {loading ? (

        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />

          <p className="mt-4 text-sm text-slate-500">
            Loading timesheets...
          </p>

        </div>

      ) : error ? (

        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">

          {error}

        </div>

      ) : timesheets.length > 0 ? (

        <div className="space-y-4">

          {timesheets.map((timesheet) => (

            <div
              key={timesheet.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
            >

              {/* TOP */}
              <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">

                      <Clock3 className="h-4 w-4 text-indigo-600" />

                    </div>

                    <div>

                      <h2 className="text-base font-semibold text-slate-900">
                        Session #{timesheet.id}
                      </h2>

                      <p className="text-xs text-slate-500">
                        Started {formatDate(timesheet.start_time)}
                      </p>

                    </div>

                  </div>

                </div>

                <div className="flex flex-wrap items-center gap-2">

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                      timesheet.is_active
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >

                    <Activity className="h-3.5 w-3.5" />

                    {timesheet.is_active
                      ? 'Active'
                      : 'Completed'}

                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">

                    {timesheet.status ?? 'Unknown'}

                  </span>

                </div>

              </div>

              {/* DETAILS */}
              <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">

                {/* Duration */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

                  <div className="flex items-center gap-2">

                    <Clock3 className="h-4 w-4 text-slate-500" />

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Duration
                    </p>

                  </div>

                  <p className="mt-2 text-lg font-semibold text-slate-900">

                    {formatDuration(
                      timesheet.start_time,
                      timesheet.end_time
                    )}

                  </p>

                </div>

                {/* Ended */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

                  <div className="flex items-center gap-2">

                    <CheckCircle2 className="h-4 w-4 text-slate-500" />

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Ended
                    </p>

                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-800">

                    {formatDate(timesheet.end_time)}

                  </p>

                </div>

                {/* Updated */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">

                  <div className="flex items-center gap-2">

                    <Activity className="h-4 w-4 text-slate-500" />

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Last Updated
                    </p>

                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-800">

                    {formatDate(timesheet.updated_at)}

                  </p>

                </div>

              </div>

            </div>

          ))}

        </div>

      ) : (

        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">

            <Clock3 className="h-6 w-6 text-slate-500" />

          </div>

          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            No timesheets found
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Start a work session to see activity history here.
          </p>

        </div>

      )}

    </div>
  );
};

export default TimesheetsPage;