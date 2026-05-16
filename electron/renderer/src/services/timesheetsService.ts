import { supabase } from '../api/supabase';

export interface TimesheetRecord {
  id: string;
  user_id: string;
  start_time: string;
  end_time?: string | null;
  status?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const fetchTimesheets = async (userId: string) => {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('work_sessions')
      .select('id, user_id, start_time, end_time, status, is_active, created_at, updated_at')
      .eq('user_id', userId)
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching timesheets:', error);
      return [];
    }

    return (data ?? []) as TimesheetRecord[];
  } catch (err) {
    console.error('Unexpected error fetching timesheets:', err);
    return [];
  }
};