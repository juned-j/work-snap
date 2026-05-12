import { supabase } from '../api/supabase';

export interface ActivityRecord {
  id: string;
  user_id: string;
  session_id: string;
  event_type: string;
  metadata: any;
  created_at: string;
}

export const fetchActivity = async (userId: string, sessionId?: string) => {
  if (!userId) return [];

  let query = supabase
    .from('activity_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (sessionId) {
    query = query.eq('session_id', sessionId);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching activity:', error);
    return [];
  }

  return (data ?? []) as ActivityRecord[];
};