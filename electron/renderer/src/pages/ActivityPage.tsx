import {
  Activity,
  Clock3,
  Database,
  AlertCircle,
} from 'lucide-react';

import { useActivity } from '../hooks/useActivity';

const formatDate = (
  value?: string
) => {

  if (!value) return '—';

  return new Date(value).toLocaleString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ActivityPage = ({
  userId,
  sessionId,
}: {
  userId: string;
  sessionId?: string;
}) => {

  const {
    activities,
    loading,
    error,
  } = useActivity(
    userId,
    sessionId
  );

  /*
  |------------------------------------------------------------------
  | LOADING UI
  |------------------------------------------------------------------
  */
  if (loading) {

    return (

      <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">

        <div className="text-center">

          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading activity logs...
          </p>

        </div>

      </div>
    );
  }

  /*
  |------------------------------------------------------------------
  | ERROR UI
  |------------------------------------------------------------------
  */
  if (error) {

    return (

      <div className="flex items-center gap-3 rounded-3xl border border-red-200 bg-red-50 p-5 text-red-700 shadow-sm">

        <AlertCircle className="h-5 w-5" />

        <p className="text-sm font-medium">
          {error}
        </p>

      </div>
    );
  }

  return (

    <div className="mx-auto max-w-6xl space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white shadow-lg md:flex-row md:items-center md:justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Activity Logs
          </h1>

          <p className="mt-2 text-sm text-indigo-100">
            Monitor user activities and system events.
          </p>

        </div>

        <div className="inline-flex items-center rounded-2xl bg-white/20 px-5 py-3 text-sm font-semibold backdrop-blur-sm">

          {activities.length} Event
          {activities.length !== 1
            ? 's'
            : ''}

        </div>

      </div>

      {/* ACTIVITY LIST */}
      {activities.length > 0 ? (

        <div className="space-y-5">

          {activities.map((activity) => (

            <div
              key={activity.id}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
            >

              {/* TOP */}
              <div className="flex flex-col gap-4 border-b border-slate-100 p-6 md:flex-row md:items-center md:justify-between">

                <div className="flex items-start gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100">

                    <Activity className="h-6 w-6 text-indigo-600" />

                  </div>

                  <div>

                    <h2 className="text-lg font-semibold text-slate-900">

                      {activity.action ||
                        'System Activity'}

                    </h2>

                    <p className="mt-1 text-sm text-slate-500">

                      {activity.description ||
                        'No description available.'}

                    </p>

                    <p className="mt-2 text-xs font-medium text-slate-400">

                      {formatDate(
                        activity.created_at
                      )}

                    </p>

                  </div>

                </div>

                <div className="flex flex-wrap gap-2">

                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">

                    User #
                    {activity.user_id}

                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">

                    Session #
                    {activity.session_id
                      ? String(
                          activity.session_id
                        ).slice(0, 8)
                      : 'N/A'}

                  </span>

                </div>

              </div>

              {/* BODY */}
              <div className="grid gap-5 p-6 lg:grid-cols-2">

                {/* ACTIVITY TIME */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">

                  <div className="flex items-center gap-2">

                    <Clock3 className="h-4 w-4 text-slate-500" />

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">

                      Activity Time

                    </p>

                  </div>

                  <p className="mt-3 text-sm font-medium text-slate-800">

                    {formatDate(
                      activity.created_at
                    )}

                  </p>

                </div>

                {/* METADATA */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">

                  <div className="flex items-center gap-2">

                    <Database className="h-4 w-4 text-slate-500" />

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">

                      Metadata

                    </p>

                  </div>

                  <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white">

                    <pre className="max-h-60 overflow-auto p-4 text-xs leading-6 text-slate-700">

{JSON.stringify(
  activity.metadata || {},
  null,
  2
)}

                    </pre>

                  </div>

                </div>

              </div>

            </div>

          ))}

        </div>

      ) : (

        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-14 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100">

            <Activity className="h-7 w-7 text-slate-500" />

          </div>

          <h3 className="mt-5 text-xl font-semibold text-slate-900">
            No Activity Logs Found
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            No activity available for this user.
          </p>

        </div>

      )}

    </div>
  );
};

export default ActivityPage;