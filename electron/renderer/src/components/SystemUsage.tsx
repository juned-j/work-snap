import React, { useEffect, useState } from 'react';
import { Cpu, Clock, RefreshCcw } from 'lucide-react';
import { supabase } from '../api/supabase';

interface ActivityItem {
  name: string;
  minutes: number;
  progress: number;
  color: string;
}

const SystemUsage: React.FC<{ sessionId?: number }> = ({ sessionId }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRealData = async () => {
    if (!sessionId) return;
    setLoading(true);

    try {
      // 1. DB se logs uthao is session ke liye
      const { data, error } = await supabase
        .from('activity_logs')
        .select('metadata')
        .eq('session_id', sessionId);

      if (error) throw error;

      if (data) {
        // 2. Data ko group karo (App name ke hisaab se time jodo)
        const counts: Record<string, number> = {};
        data.forEach((log: any) => {
          const app = log.metadata.app || 'Other';
          // Har log 30 seconds ka hai (kyunki main process ka interval 30s tha)
          counts[app] = (counts[app] || 0) + 0.5; 
        });

        // 3. Array mein convert karo aur progress calculate karo
        const totalMinutes = Object.values(counts).reduce((a, b) => a + b, 0);
        const colors = ['#6366f1', '#10b981', '#a855f7', '#f59e0b', '#ef4444'];

        const formatted = Object.entries(counts).map(([name, mins], index) => ({
          name,
          minutes: Math.round(mins),
          progress: totalMinutes > 0 ? (mins / totalMinutes) * 100 : 0,
          color: colors[index % colors.length]
        })).sort((a, b) => b.minutes - a.minutes); // Sabse zyada use hone wala upar

        setActivities(formatted);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Har 60 seconds mein refresh karega ya jab sessionId badlega
  useEffect(() => {
    fetchRealData();
    const interval = setInterval(fetchRealData, 60000); 
    return () => clearInterval(interval);
  }, [sessionId]);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl min-h-[400px]">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-white font-bold flex items-center gap-3 text-lg">
          <Cpu className="text-indigo-500" size={24} /> 
          App Insights
        </h3>
        <button 
          onClick={fetchRealData}
          className={`${loading ? 'animate-spin' : ''} text-slate-500 hover:text-indigo-400 transition-colors`}
        >
          <RefreshCcw size={18} />
        </button>
      </div>

      <div className="space-y-7">
        {activities.length === 0 ? (
          <p className="text-slate-600 text-sm text-center py-10 italic">No activity logs found for this session yet...</p>
        ) : (
          activities.map((app, index) => (
            <div key={index} className="space-y-3">
              <div className="flex justify-between items-end">
                <p className="text-sm font-bold text-slate-200 truncate max-w-[200px]">{app.name}</p>
                <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs">
                  <Clock size={12} />
                  <span>{app.minutes}m</span>
                </div>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-700"
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