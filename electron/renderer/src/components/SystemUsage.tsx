import React, { useEffect, useState, useCallback } from 'react'
import { supabase } from '../api/supabase'

interface ActivityItem {
  name: string
  app: string
  url: string
  minutes: number
  progress: number
  color: string
}

const colors = ['#6366f1', '#10b981', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4']

const Icons = {
  Monitor: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="16" height="11" x="4" y="3" rx="2" />
      <path d="M12 15v4" /><path d="M8 21h8" />
    </svg>
  )
}

const getActivityInfo = (metadata: any) => {
  if (!metadata) return { key: 'Other', app: 'System', url: '' }

  const appName = metadata.app || 'Unknown'
  const title = metadata.title || ''
  
  if (appName.includes('visual studio code') || title.toLowerCase().includes('visual studio code')) {
    return { key: 'VS Code', app: 'Visual Studio Code', url: title.split(' - ')[0] }
  }

  if (appName.includes('chrome') || appName.includes('edge') || appName.includes('browser')) {
    return { key: title.split(' - ')[0] || 'Browser', app: appName, url: title }
  }

  return { key: appName.charAt(0).toUpperCase() + appName.slice(1), app: appName, url: title }
}

const SystemUsage: React.FC<{ sessionId?: string | number; userId?: string }> = ({ sessionId, userId }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([])

  const processData = useCallback((logs: any[]) => {
    console.log("🛠️ DEBUG: Processing logs array:", logs);
    const grouped: Record<string, ActivityItem> = {}

    logs.forEach((log, index) => {
      const info = getActivityInfo(log.metadata)
      const durationSeconds = log.metadata?.duration || 0
      
      console.log(`🔹 Log #${index} | App: ${info.app} | Duration: ${durationSeconds}s`);

      if (!grouped[info.key]) {
        grouped[info.key] = {
          name: info.key,
          app: info.app,
          url: info.url,
          minutes: 0,
          progress: 0,
          color: colors[Object.keys(grouped).length % colors.length]
        }
      }
      grouped[info.key].minutes += (durationSeconds / 60)
    })

    const totalMinutes = Object.values(grouped).reduce((sum, item) => sum + item.minutes, 0)
    console.log("📊 DEBUG: Total calculated minutes:", totalMinutes);

    const formatted = Object.values(grouped)
      .map((item) => ({
        ...item,
        progress: totalMinutes > 0 ? (item.minutes / totalMinutes) * 100 : 0
      }))
      .sort((a, b) => b.minutes - a.minutes)

    console.log("✅ DEBUG: Formatted activities for UI:", formatted);
    setActivities(formatted)
  }, [])

  const fetchLogs = useCallback(async () => {
  if (!sessionId || !userId) return;

  console.log(`📡 DD: Fetching for Session #${sessionId}`);

  // 1. Pehle exact match try karo
  let { data, error } = await supabase
    .from('activity_logs')
    .select('metadata, user_id, session_id')
    .eq('session_id', Number(sessionId))
    .eq('user_id', userId);

  // 2. FALLBACK: Agar exact session ka data nahi hai, toh latest 50 logs uthao is user ke
  if (!error && (!data || data.length === 0)) {
    console.warn(`⚠️ DD: Session #${sessionId} not found. Falling back to latest user activity.`);
    
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('activity_logs')
      .select('metadata, user_id, session_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    data = fallbackData;
    error = fallbackError;
  }

  if (error) {
    console.error("❌ DD: Fetch Error:", error.message);
    return;
  }

  if (data && data.length > 0) {
    console.log(`📥 DD: Success! Showing ${data.length} rows (Session: ${data[0].session_id})`);
    processData(data);
  } else {
    console.error("❌ DD: No data found even in fallback!");
  }
}, [sessionId, userId, processData]);
  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  useEffect(() => {
    if (!sessionId || !userId) return

    console.log(`🔌 DEBUG: Setting up Realtime Channel for Session #${sessionId}`);
    const channel = supabase
      .channel(`activity_realtime_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_logs',
          filter: `session_id=eq.${Number(sessionId)}`
        },
        (payload) => {
          console.log("⚡ DEBUG: Realtime Change Detected!", payload.eventType);
          fetchLogs()
        }
      )
      .subscribe((status) => {
        console.log(`📡 DEBUG: Realtime Subscription Status: ${status}`);
      })

    return () => { 
      console.log("🔌 DEBUG: Cleaning up Realtime Channel");
      supabase.removeChannel(channel) 
    }
  }, [sessionId, userId, fetchLogs])

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
          <Icons.Monitor />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">System Usage</h3>
          <p className="text-[10px] text-slate-500 font-mono tracking-wider">SESSION #{sessionId}</p>
        </div>
      </div>

      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
        {activities.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs italic border border-dashed border-slate-300 rounded-xl bg-slate-50">
             {/* Debug status indicator in UI */}
             No activity detected for session #{sessionId}
             <br />
             <span className="text-[10px] opacity-60">UID: {userId?.substring(0,8)}...</span>
          </div>
        ) : (
          activities.map((item) => (
            <div key={item.name} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="min-w-0">
                  <h4 className="text-[13px] font-bold text-slate-900 truncate">{item.name}</h4>
                  <p className="text-[10px] text-slate-500 truncate uppercase">{item.app}</p>
                </div>
                <div className="text-right">
                  <span className="text-[13px] font-black text-indigo-600 tabular-nums">
                    {item.minutes < 1 ? `${(item.minutes * 60).toFixed(0)}s` : `${item.minutes.toFixed(1)}m`}
                  </span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full transition-all duration-500" style={{ width: `${item.progress}%`, backgroundColor: item.color }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
export default SystemUsage