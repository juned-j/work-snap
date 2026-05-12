import { supabase } from '../api/supabase';

export interface SettingsPayload {
  user_id: string;
  preferences: Record<string, any>;
}

const defaultSettings = [
  { key: 'notifications', label: 'Enable Notifications', value: true },
  { key: 'auto_capture', label: 'Auto Screenshot Capture', value: true },
  { key: 'dark_mode', label: 'Dark Mode', value: false },
];

const normalizePreferences = (preferences: Record<string, any>) =>
  Object.entries(preferences).map(([key, value]) => ({
    key,
    label: key.replace(/_/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase()),
    value: Boolean(value),
  }));

export const fetchSettings = async (userId?: string) => {
  if (!userId) return defaultSettings;

  const { data, error } = await supabase
    .from('settings')
    .select('preferences')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.warn('Settings record not found, returning defaults.', error);
    return defaultSettings;
  }

  if (!data || typeof data.preferences !== 'object') {
    return defaultSettings;
  }

  return normalizePreferences(data.preferences);
};

export const saveSettings = async (userId: string, preferences: Record<string, any>) => {
  if (!userId) return null;

  const { data, error } = await supabase
    .from('settings')
    .upsert({ user_id: userId, preferences }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('Error saving settings:', error);
    return null;
  }

  return data as SettingsPayload | null;
};