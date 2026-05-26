import { supabase } from '../api/supabase'

export const sessionService = {

  // ACTIVE SESSION
  async getActiveSession(userId: string) {
    console.log('📡 GET ACTIVE SESSION:', userId)

    const { data, error } = await supabase
      .from('work_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('id', { ascending: false })
      .limit(1)

    if (error) {
      console.error('❌ GET ACTIVE SESSION ERROR:', error)
      throw error
    }

    console.log('✅ ACTIVE SESSION:', data?.[0])
    return data?.[0] || null
  },

  // LATEST SESSION
  async getLatestSession(userId: string) {
    console.log('📡 GET LATEST SESSION:', userId)

    const { data, error } = await supabase
      .from('work_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('id', { ascending: false })
      .limit(1)

    if (error) {
      console.error('❌ GET LATEST SESSION ERROR:', error)
      throw error
    }

    console.log('✅ LATEST SESSION:', data?.[0])
    return data?.[0] || null
  },

  // CREATE SESSION
  async createSession(userId: string) {

    const payload = {
      user_id: userId,
      start_time: new Date().toISOString(),
      is_active: true,
      status: 'active',

      // ✅ FIX: missing fields added
      paused_at: null,
      ip_address: null,
      user_agent: typeof navigator !== 'undefined'
        ? navigator.userAgent
        : null
    }

    console.log('🚀 CREATE SESSION PAYLOAD:', payload)

    const { data, error } = await supabase
      .from('work_sessions')
      .insert(payload)
      .select('*')
      .single()

    if (error) {
      console.error('❌ CREATE SESSION ERROR:', error)
      throw error
    }

    console.log('✅ SESSION CREATED:', data)
    return data
  },

 
async updateSession(sessionId: number, updates: any) {
    console.log('🟡 -----------------------------')
    console.log('🟡 UPDATE SESSION START')
    console.log('🟡 Session ID:', sessionId)
    console.log('🟡 Incoming Updates:', updates)

    const finalUpdates: any = {
      ...updates
    }

    // 🟢 PAUSE LOGIC
    if (updates.is_active === false && updates.status !== 'stopped') {
      finalUpdates.status = 'paused'
      finalUpdates.paused_at = new Date().toISOString()
    }

    // 🟢 RESUME LOGIC (Yahan major fix hai)
    if (updates.is_active === true) {
      finalUpdates.status = 'active'
      finalUpdates.paused_at = null // Clear pause time on resume

      try {
        // 1. Pehle DB se current session fetch karo taaki purani paused_at value mil sake
        const { data: currentSession } = await supabase
          .from('work_sessions')
          .select('paused_at, total_paused_seconds')
          .eq('id', sessionId)
          .single();

        if (currentSession && currentSession.paused_at) {
          const pausedAtTime = new Date(currentSession.paused_at).getTime();
          const nowTime = new Date().getTime();
          
          // Is pause session me kitne seconds waste hue
          const currentPauseDurationSeconds = Math.floor((nowTime - pausedAtTime) / 1000);
          
          // Purane total seconds me naye paused seconds jod do
          const existingPausedSeconds = currentSession.total_paused_seconds || 0;
          finalUpdates.total_paused_seconds = existingPausedSeconds + currentPauseDurationSeconds;
          
          console.log(`⏱️ Adding ${currentPauseDurationSeconds}s to total paused time. New Total: ${finalUpdates.total_paused_seconds}s`);
        }
      } catch (err) {
        console.error('❌ Error calculating pause duration:', err);
      }
    }

    // 🔴 STOP LOGIC
    if (updates.status === 'stopped') {
      finalUpdates.status = 'stopped'
      finalUpdates.is_active = false
      finalUpdates.end_time = new Date().toISOString()
      
      // Agar direct paused state se stop kiya hai, toh bacha hua pause time bhi calculate karein
      try {
        const { data: currentSession } = await supabase
          .from('work_sessions')
          .select('paused_at, total_paused_seconds')
          .eq('id', sessionId)
          .single();

        if (currentSession && currentSession.paused_at) {
          const pausedAtTime = new Date(currentSession.paused_at).getTime();
          const nowTime = new Date().getTime();
          const currentPauseDurationSeconds = Math.floor((nowTime - pausedAtTime) / 1000);
          finalUpdates.total_paused_seconds = (currentSession.total_paused_seconds || 0) + currentPauseDurationSeconds;
          finalUpdates.paused_at = null;
        }
      } catch (err) {
        console.error('❌ Error during stop-pause calculation:', err);
      }
    }

    console.log('🟢 FINAL PAYLOAD GOING TO DB:', finalUpdates)

    const { data, error } = await supabase
      .from('work_sessions')
      .update(finalUpdates)
      .eq('id', sessionId)
      .select('*')
      .single()

    if (error) {
      console.error('❌ UPDATE SESSION ERROR:', error)
      throw error
    }

    console.log('✅ UPDATE SESSION SUCCESS')
    console.log('📦 DB RESPONSE:', data)
    console.log('🟢 -----------------------------')

    return data
  },

  // STOP SESSION
  async stopSession(sessionId: number) {

    const payload = {
      end_time: new Date().toISOString(),
      is_active: false,
      status: 'stopped',
      paused_at: null
    }

    console.log('🛑 STOP SESSION PAYLOAD:', payload)

    const { data, error } = await supabase
      .from('work_sessions')
      .update(payload)
      .eq('id', sessionId)
      .select('*')
      .single()

    if (error) {
      console.error('❌ STOP SESSION ERROR:', error)
      throw error
    }

    console.log('✅ SESSION STOPPED:', data)
    return data
  },

  // SCREENSHOT UPLOAD
  async uploadScreenshot(sessionId: number, userId: string, blob: Blob) {

    console.log('📸 --- SCREENSHOT UPLOAD START ---')
    console.log('🔹 Session ID:', sessionId)
    console.log('🔹 User ID:', userId)
    console.log('🔹 Blob Info:', { size: blob.size, type: blob.type })

    if (blob.size === 0) {
      console.error('❌ Blob size is 0')
      return false
    }

    const { data: { session }, error: sessionError } =
      await supabase.auth.getSession()

    if (sessionError) {
      console.warn('⚠️ Auth warning:', sessionError.message)
    }

    const fileName = `${sessionId}/${Date.now()}.png`

    console.log('🔹 FileName:', fileName)

    // STORAGE
    console.log('🚀 Uploading to storage...')

    const { data: storageData, error: storageError } =
      await supabase.storage
        .from('screenshots')
        .upload(fileName, blob, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: false
        })

    if (storageError) {
      console.error('❌ STORAGE ERROR:', storageError)
      throw storageError
    }

    console.log('✅ STORAGE SUCCESS:', storageData)

    // PUBLIC URL
    const { data: urlData } =
      supabase.storage.from('screenshots').getPublicUrl(fileName)

    console.log('🔗 PUBLIC URL:', urlData.publicUrl)

    // DB INSERT
    console.log('🚀 DB INSERT START...')

    const { data: dbData, error: dbError } =
      await supabase.from('screenshots').insert({
        session_id: sessionId,
        user_id: userId,
        image_url: urlData.publicUrl,
        captured_at: new Date().toISOString()
      }).select('*')

    if (dbError) {
      console.error('❌ SCREENSHOT DB ERROR:', dbError)
      throw dbError
    }

    console.log('✅ SCREENSHOT DB SUCCESS:', dbData)
    console.log('🎉 --- SCREENSHOT COMPLETE ---')

    return true
  }
}