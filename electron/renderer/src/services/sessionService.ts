import { supabase } from '../api/supabase'

export const sessionService = {
  // 1. Purani active session load karna
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

  // Get latest session (active or stopped) for the user
  async getLatestSession(userId: string) {
    const { data, error } = await supabase
      .from('work_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('id', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data?.[0] || null;
  },

  // 2. Nayi session start karna
  async createSession(userId: string) {
    const { data, error } = await supabase
      .from('work_sessions')
      .insert({
        user_id: userId,
        start_time: new Date().toISOString(),
        is_active: true,
        status: 'active'
      })
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  // 3. Session update karna (Status ya General updates)
  async updateSession(sessionId: number, updates: any) {
    const { error } = await supabase
      .from('work_sessions')
      .update(updates)
      .eq('id', sessionId);
    
    if (error) throw error;
  },

  // 4. Session stop karna (End time save karke data return karega)
  async stopSession(sessionId: number) {
    const endTime = new Date().toISOString();
    const { data, error } = await supabase
      .from('work_sessions')
      .update({ 
        end_time: endTime, 
        is_active: false, 
        status: 'stopped' 
      })
      .eq('id', sessionId)
      .select('*')
      .single();
    
    if (error) throw error;
    return data; 
  },

  // 5. Screenshot upload aur DB entry
// 5. Screenshot upload aur DB entry with Heavy Logging
  async uploadScreenshot(sessionId: number, userId: string, blob: Blob) {
    console.log("📸 --- SCREENSHOT UPLOAD START ---");
    console.log("🔹 Session ID:", sessionId);
    console.log("🔹 User ID:", userId);
    console.log("🔹 Blob Info:", { size: blob.size, type: blob.type });

    // Validation: Agar blob khali hai toh aage mat badho
    if (blob.size === 0) {
      console.error("❌ ERROR: Blob size is 0. Screenshot capture failed.");
      return false;
    }

    const fileName = `${sessionId}/${Date.now()}.png`;
    console.log("🔹 Generated FileName:", fileName);

    // 1. Storage Upload Attempt
    console.log("🚀 Attempting Supabase Storage upload...");
    const { data: storageData, error: storageError } = await supabase.storage
      .from('screenshots')
      .upload(fileName, blob, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (storageError) {
      console.error("❌ STORAGE ERROR DETAILS:", {
        message: storageError.message,
        name: storageError.name,
        status: (storageError as any).status // Error code like 403, 404, etc.
      });
      throw storageError;
    }

    console.log("✅ STORAGE SUCCESS:", storageData);

    // 2. Get Public URL
    const { data: urlData } = supabase.storage
      .from('screenshots')
      .getPublicUrl(fileName);

    console.log("🔗 Public URL Generated:", urlData.publicUrl);

    // 3. Database Entry Attempt
    console.log("🚀 Attempting Database entry...");
    const { data: dbData, error: dbError } = await supabase
      .from('screenshots')
      .insert({
        session_id: sessionId,
        user_id: userId,
        image_url: urlData.publicUrl,
        captured_at: new Date().toISOString()
      })
      .select();

    if (dbError) {
      console.error("❌ DATABASE ERROR DETAILS:", dbError.message);
      throw dbError;
    }

    console.log("✅ DATABASE SUCCESS:", dbData);
    console.log("🎉 --- SCREENSHOT SYNC COMPLETE ---");
    return true;
  }
};