import { useEffect, useState } from 'react';

import { supabase } from '../api/supabase';

export interface ActivityRecord {
  id: string;
  user_id: string;
  session_id: string;
  event_type?: string;
  action?: string;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export const useActivity = (
  userId: string,
  sessionId?: string
) => {

  const [activities, setActivities] =
    useState<ActivityRecord[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  /*
  |------------------------------------------------------------------
  | FETCH ACTIVITY
  |------------------------------------------------------------------
  */
  useEffect(() => {

    let active = true;

    const loadActivities = async () => {

      if (!userId) return;

      setLoading(true);

      setError(null);

      try {

        let query = supabase
          .from('activity_logs')
          .select(`
            id,
            user_id,
            session_id,
            event_type,
            action,
            description,
            metadata,
            created_at
          `)
          .eq('user_id', userId)
          .order('created_at', {
            ascending: false,
          });

        if (sessionId) {

          query = query.eq(
            'session_id',
            sessionId
          );

        }

        const { data, error } =
          await query;

        if (error) {

          console.error(
            'Fetch activity error:',
            error
          );

          throw error;
        }

        if (!active) return;

        setActivities(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {

        console.error(
          'Unexpected fetch activity error:',
          err
        );

        if (active) {

          setError(
            'Unable to load activity logs.'
          );

        }

      } finally {

        if (active) {

          setLoading(false);

        }
      }
    };

    loadActivities();

    return () => {
      active = false;
    };

  }, [userId, sessionId]);

  return {
    activities,
    loading,
    error,
  };
};