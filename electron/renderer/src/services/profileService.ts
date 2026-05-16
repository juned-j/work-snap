import { supabase } from '../api/supabase';

export interface ProfileRecord {
  id: string;
  name?: string;
  email?: string;
  role?: string;
}

const fallbackProfile = (ownerId: string, user: any): ProfileRecord => ({
  id: ownerId,
  name: user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Unknown User',
  email: user?.email || '',
  role: user?.user_metadata?.role || 'employee',
});

export const fetchProfile = async (userId?: string) => {
  const { data: authState, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error('Error fetching auth user for profile:', authError);
  }

  const currentUser = authState?.user;
  const ownerId = userId ?? currentUser?.id;

  if (!ownerId) return null;

  try {
    const { data, error } = await supabase
      .from<ProfileRecord>('profiles')
      .select('id, name, email, role')
      .eq('id', ownerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
        return fallbackProfile(ownerId, currentUser);
      }

      console.error('Error fetching profile:', error);
      return fallbackProfile(ownerId, currentUser);
    }

    return data ?? fallbackProfile(ownerId, currentUser);
  } catch (err) {
    console.error('Unexpected error fetching profile:', err);
    return fallbackProfile(ownerId, currentUser);
  }
};

export const updateProfile = async (userId: string, updates: Partial<ProfileRecord>) => {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from<ProfileRecord>('profiles')
      .upsert({ id: userId, ...updates }, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error updating profile:', err);
    return null;
  }
};