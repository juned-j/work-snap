import { supabase } from '../api/supabase';

export interface ProfileRecord {
  id: string;
  name?: string;
  email?: string;
  role?: string;
}

export const fetchProfile = async (userId?: string) => {
  const { data: authState } = await supabase.auth.getUser();
  const currentUser = authState.user;
  const ownerId = userId ?? currentUser?.id;

  if (!ownerId) return null;

  const { data, error } = await supabase
    .from<ProfileRecord>('profiles')
    .select('id, name, email, role')
    .eq('id', ownerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return {
        id: ownerId,
        name: currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0],
        email: currentUser?.email || '',
        role: currentUser?.user_metadata?.role || 'employee',
      };
    }

    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
};

export const updateProfile = async (userId: string, updates: Partial<ProfileRecord>) => {
  if (!userId) return null;

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
};