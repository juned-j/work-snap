import { supabase } from '../api/supabase';

export const setupActivityLogger = (userSession: any, session: any, status: string) => {
  if (!userSession || !session || !session.id || status !== 'active' || !window.electron) {
    return () => {}; 
  }

  try {
    const electronApi = (window as any).electron;
    if (!electronApi || !electronApi.onActivityUpdate) {
      console.warn("Electron API not found");
      return () => {};
    }

    console.log("🚀 Activity Logger Started for Session:", session.id);

    const removeListener = electronApi.onActivityUpdate(async (data: any) => {
      const { error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: userSession.user.id,
          session_id: session.id, 
          event_type: data.idleTime > 300 ? 'idle' : 'system_activity',
          metadata: data
        });

      if (error) console.error("❌ DB Error:", error.message);
    });

    return () => {
      if (removeListener && typeof removeListener === 'function') {
        removeListener();
      }
    };
  } catch (err) {
    console.error("❌ Logger Setup Error:", err);
    return () => {}; 
  }
};