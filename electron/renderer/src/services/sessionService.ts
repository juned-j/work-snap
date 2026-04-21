import { supabase } from '../supabaseClient'

export const sessionService = {
  // Purani active session load karna
  async getActiveSession(userId: string) {
    const { data, error } = await supabase
      .from('work_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('id', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    return data?.[0] || null;
  },

  // Nayi session start karna
  async createSession(userId: string) {
    const { data, error } = await supabase
      .from('work_sessions')
      .insert({
        user_id: userId,
        start_time: new Date().toISOString(),
        is_active: true,
        status: 'active'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Session update karna (Status ya End Time)
  async updateSession(sessionId: number, updates: any) {
    const { error } = await supabase
      .from('work_sessions')
      .update(updates)
      .eq('id', sessionId);
    
    if (error) throw error;
  },

  // Screenshot upload aur DB entry
  async uploadScreenshot(sessionId: number, userId: string, blob: Blob) {
    const fileName = `${sessionId}/${Date.now()}.png`;

    const { error: storageError } = await supabase.storage
      .from('screenshots')
      .upload(fileName, blob);

    if (storageError) throw storageError;

    const { data: urlData } = supabase.storage
      .from('screenshots')
      .getPublicUrl(fileName);

    const { error: dbError } = await supabase
      .from('screenshots')
      .insert({
        session_id: sessionId,
        user_id: userId,
        image_url: urlData.publicUrl,
        captured_at: new Date().toISOString()
      });

    if (dbError) throw dbError;
    return true;
  }
};