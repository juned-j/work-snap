import React, { useEffect, useState } from 'react'
import { supabase } from '../api/supabase'

interface ActivityItem {
  name: string
  minutes: number
  progress: number
  color: string
}

const Icons = {
  Monitor: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect width="16" height="11" x="4" y="3" rx="2"/>
      <path d="M12 15v4"/><path d="M8 21h8"/>
    </svg>
  )
}

// ✅ FIXED helper (appName + title support)
const getDisplayName = (metadata: any) => {
  if (!metadata) return 'Other'

  const app = metadata.appName || ''   // 🔥 MAIN FIX
  const title = metadata.title || ''

  // ✅ Clean VS Code name
  if (app.toLowerCase().includes('visual studio code')) {
    return 'VS Code'
  }

  // ✅ Browser detection (Chrome, Edge, etc.)
  if (
    app.toLowerCase().includes('chrome') ||
    app.toLowerCase().includes('edge')
  ) {
    if (title) {
      return title.split('-')[0].trim()
    }
  }

  // fallback
  return app || title || 'Other'
}

const SystemUsage: React.FC<{ sessionId?: number }> = ({ sessionId }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([])

  const processData = (data: any[]) => {
    const counts: Record<string, number> = {}

    data.forEach((log: any) => {
      const name = getDisplayName(log.metadata)
      counts[name] = (counts[name] || 0) + 0.5
    })

    const total = Object.values(counts).reduce((a, b) => a + b, 0)

    const colors = ['#6366f1', '#10b981', '#a855f7', '#f59e0b', '#ef4444']

    const formatted = Object.entries(counts)
      .map(([name, mins], i) => ({
        name,
        minutes: Math.round(mins),
        progress: total > 0 ? (mins / total) * 100 : 0,
        color: colors[i % colors.length]
      }))
      .sort((a, b) => b.minutes - a.minutes)

    setActivities(formatted)
  }

  const fetchInitial = async () => {
    if (!sessionId) return

    const { data, error } = await supabase
      .from('activity_logs')
      .select('metadata')
      .eq('session_id', sessionId)

    if (!error && data) {
      processData(data)
    }
  }

  useEffect(() => {
    if (!sessionId) return

    fetchInitial()

    const channel = supabase
      .channel('activity-live')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          setActivities((prev) => {
            const updated = [...prev]

            const name = getDisplayName(payload.new.metadata)
            const index = updated.findIndex(a => a.name === name)

            if (index !== -1) {
              updated[index].minutes += 1
            } else {
              updated.push({
                name,
                minutes: 1,
                progress: 0,
                color: '#6366f1'
              })
            }

            const total = updated.reduce((a, b) => a + b.minutes, 0)

            return updated
              .map(item => ({
                ...item,
                progress: total > 0 ? (item.minutes / total) * 100 : 0
              }))
              .sort((a, b) => b.minutes - a.minutes)
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  return (
    <div className="w-full bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-5 shadow-lg">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
          <Icons.Monitor />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">
          Live App Usage
        </h3>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">
            No activity yet...
          </div>
        ) : (
          activities.map((app, i) => (
            <div key={i} className="space-y-2">

              {/* NAME + TIME + % */}
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 truncate max-w-[160px]">
                  {app.name}
                </span>

                <span className="text-indigo-400 font-semibold">
                  {app.minutes}m • {Math.round(app.progress)}%
                </span>
              </div>

              {/* PROGRESS BAR */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${app.progress}%`,
                    backgroundColor: app.color
                  }}
                />
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  )
}

export default SystemUsage