import React, { useEffect, useState } from 'react';
import { fetchActivity } from '../services/activityService';
import type { ActivityRecord } from '../services/activityService';

const formatDate = (value?: string) => value ? new Date(value).toLocaleString() : '—';

const ActivityPage = ({ userId, sessionId }: { userId: string; sessionId?: string }) => {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);

  useEffect(() => {
    const loadActivities = async () => {
      const data = await fetchActivity(userId, sessionId);
      setActivities(data);
    };

    if (userId) loadActivities();
  }, [userId, sessionId]);

  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-900">
      <h1 className="text-2xl font-bold mb-4">Activity</h1>
      {activities.length ? (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-lg">{activity.event_type || 'System Activity'}</h2>
                  <p className="text-sm text-slate-500">{formatDate(activity.created_at)}</p>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Session {activity.session_id?.slice(0, 8)}</span>
              </div>
              <pre className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700">
                {JSON.stringify(activity.metadata || {}, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 text-slate-600">
          No activity logs found for this user{sessionId ? ` in session ${sessionId}` : ''}.
        </div>
      )}
    </div>
  );
};

export default ActivityPage;