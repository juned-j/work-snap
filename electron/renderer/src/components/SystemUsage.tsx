import React, { useEffect, useState } from 'react';
import { supabase } from '../api/supabase';

interface ActivityItem {
  name: string;
  minutes: number;
  progress: number;
  color: string;
}

// Fixed SVG Icons to prevent Hook Errors in Electron Build
const Icons = {
  Monitor: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
      <rect width="16" height="11" x="4" y="3" rx="2"/><path d="M12 15v4"/><path d="M8 21h8"/>
    </svg>
  ),
  Refresh: ({ className }: { className?: string }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>
    </svg>
  ),
  Clock: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )
};

const SystemUsage: React.FC<{ sessionId?: number }> = ({ sessionId }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRealData = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('metadata')
        .eq('session_id', sessionId);

      if (error) throw error;

      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((log: any) => {
          // metadata.app check
          const app = log.metadata?.app || 'Other';
          counts[app] = (counts[app] || 0) + 0.5; 
        });

        const totalMinutes = Object.values(counts).reduce((a, b) => a + b, 0);
        const colors = ['#6366f1', '#10b981', '#a855f7', '#f59e0b', '#ef4444'];

        const formatted = Object.entries(counts).map(([name, mins], index) => ({
          name,
          minutes: Math.round(mins),
          progress: totalMinutes > 0 ? (mins / totalMinutes) * 100 : 0,
          color: colors[index % colors.length]
        })).sort((a, b) => b.minutes - a.minutes);

        setActivities(formatted);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealData();
    const interval = setInterval(fetchRealData, 60000); 
    return () => clearInterval(interval);
  }, [sessionId]);

  return (
    <div className="w-full bg-[#0f172a]/40 border border-slate-800/50 rounded-[2rem] p-8 shadow-2xl min-h-[400px] backdrop-blur-xl">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Icons.Monitor />
          </div>
          <h3 className="text-white font-bold text-lg tracking-tight">App Insights</h3>
        </div>
        
        <button 
          onClick={fetchRealData}
          disabled={loading}
          className="group flex items-center gap-2 px-4 py-2 bg-slate-800/40 hover:bg-indigo-500/10 border border-slate-700/50 rounded-full transition-all duration-300"
        >
          <Icons.Refresh className={`${loading ? 'animate-spin text-indigo-400' : 'text-slate-400 group-hover:text-indigo-400'}`} />
          <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-400 uppercase tracking-widest">
            {loading ? 'Syncing...' : 'Refresh'}
          </span>
        </button>
      </div>

      <div className="space-y-8">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="w-12 h-12 bg-slate-800/30 rounded-full flex items-center justify-center text-slate-600">
               <Icons.Monitor />
            </div>
            <p className="text-slate-500 text-sm italic font-medium">No activity logs found for this session yet...</p>
          </div>
        ) : (
          activities.map((app, index) => (
            <div key={index} className="group space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: app.color, boxShadow: `0 0 8px ${app.color}` }}
                  />
                  <p className="text-sm font-bold text-slate-200 truncate max-w-[200px] group-hover:text-white transition-colors">
                    {app.name}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/5 rounded-md border border-indigo-500/10">
                  <Icons.Clock />
                  <span className="text-indigo-400 font-black text-[11px] uppercase tracking-tighter">
                    {app.minutes}m
                  </span>
                </div>
              </div>
              
              <div className="relative w-full h-2.5 bg-slate-800/50 rounded-full overflow-hidden border border-slate-700/30">
                <div 
                  className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                  style={{ width: `${app.progress}%`, backgroundColor: app.color }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SystemUsage;