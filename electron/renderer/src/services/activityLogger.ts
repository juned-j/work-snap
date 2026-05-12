import { supabase } from '../api/supabase';

export const setupActivityLogger = (
  userSession: any,
  session: any,
  status: string
) => {

  console.log("🧠 LOGGER INIT:", {
    userId: userSession?.user?.id,
    sessionId: session?.id,
    status,
    hasElectron: !!window.electron
  });

  if (!userSession?.user?.id || !session?.id || status !== 'active' || !window.electron) {
    console.warn("⚠️ LOGGER BLOCKED BY GUARD CONDITION");
    return () => {};
  }

  const electronApi = (window as any).electron;

  if (!electronApi?.onActivityUpdate) {
    console.warn("❌ Electron IPC API NOT FOUND");
    return () => {};
  }

  console.log("🚀 Tracking Started for Session:", session.id);

  const sessionId = Number(session.id);

  console.log("🔎 Normalized sessionId:", sessionId);

  const removeListener = electronApi.onActivityUpdate(async (data: any) => {

    console.log("📡 RAW ELECTRON DATA:", data);

    if (status !== 'active') {
      console.warn("⛔ STATUS NOT ACTIVE:", status);
      return;
    }

    const appName = (data.appName || "Unknown Process").toLowerCase();
    const windowTitle = data.windowTitle || "No Active Window";

    console.log("🖥️ PROCESSED DATA:", {
      appName,
      windowTitle
    });

    try {

      console.log("🔍 CHECKING DB FOR EXISTING ENTRY...");

 // Activity rows update logic fix
const { data: existingLog, error: fetchError } = await supabase
  .from('activity_logs')
  .select('id, metadata')
  .eq('session_id', sessionId)
  .eq('user_id', userSession.user.id) // Security check add karein
  .eq('event_type', 'system_activity')
  .contains('metadata', { app: appName }) // Better JSON matching
  .maybeSingle();

      console.log("📦 FETCH RESULT:", {
        existingLog,
        fetchError
      });

      if (existingLog) {

        const currentDuration = existingLog.metadata?.duration || 0;
        const newDuration = currentDuration + 5;

        console.log("♻️ UPDATING EXISTING LOG:", {
          appName,
          oldDuration: currentDuration,
          newDuration
        });

        const { error: updateError } = await supabase
          .from('activity_logs')
          .update({
            metadata: {
              ...existingLog.metadata,
              app: appName,
              title: windowTitle,
              duration: newDuration,
              last_update: new Date().toISOString()
            }
          })
          .eq('id', existingLog.id);

        if (updateError) {
          console.error("❌ UPDATE ERROR:", updateError);
        } else {
          console.log(`📊 UPDATED SUCCESS: ${appName} → ${newDuration}s`);
        }

      } else {

        console.log("🆕 INSERTING NEW ACTIVITY ROW...");

        const { error: insertError } = await supabase
          .from('activity_logs')
          .insert({
            user_id: userSession.user.id,
            session_id: sessionId,
            event_type: 'system_activity',
            metadata: {
              app: appName,
              title: windowTitle,
              duration: 5,
              started_at: new Date().toISOString()
            }
          });

        if (insertError) {
          console.error("❌ INSERT ERROR:", insertError);
        } else {
          console.log(`✅ INSERTED: ${appName}`);
        }
      }

    } catch (err) {
      console.error("💥 CRITICAL SYNC ERROR:", err);
    }
  });

  return () => {
    if (typeof removeListener === 'function') {
      removeListener();
      console.log("🛑 TRACKING STOPPED CLEANLY");
    }
  };
};