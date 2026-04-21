import { useState, useEffect } from 'react'
import { useSession } from './hooks/useSession'
import Auth from './Auth'
import { supabase } from './api/supabase'
import { TimerCard } from './components/TimerCard'
import { SessionControls } from './components/SessionControls'
import { setupActivityLogger } from './services/activityLogger'
import SystemUsage from './components/SystemUsage'
import { Sidebar } from './components/Sidebar'
import { DashboardLayout } from './components/Layout'
import { TrackingCard } from './components/TrackingCard'

const ActivityIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);

export default function App() {
  const [userSession, setUserSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { start, pause, stop, session, status, elapsedTime } = useSession()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserSession(session);
      setLoading(false);
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setUserSession(s)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const cleanup = setupActivityLogger(userSession, session, status)
    return () => cleanup?.()
  }, [userSession, session, status])

  const handleLogout = () => {
    const performLogout = async () => {
      if (session) await stop();
      await supabase.auth.signOut();
    };
    performLogout();
  }

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center font-mono text-indigo-500 animate-pulse">
      &gt; Initializing_WorkSnap_Core...
    </div>
  )

  if (!userSession) return <Auth />

  return (
  <div className="h-screen bg-[#020617] text-slate-200 flex overflow-hidden">
    <Sidebar onLogout={handleLogout} />
    
    <DashboardLayout email={userSession?.user?.email ?? 'User'}>
      
      {/* 🔥 container compact */}
      <div className="max-w-3xl mx-auto flex flex-col gap-4 px-4 py-4">
        
        <div className="w-full flex justify-center">
          <div className="w-full max-w-lg">
            <TrackingCard status={status} sessionId={session?.id}>
              
              {/* 🔥 reduced spacing */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-2 p-2">
                
                <div className="w-full md:w-1/3">
                  <TimerCard elapsedTime={elapsedTime} status={status} />
                </div>

                <div className="w-full md:w-2/3">
                  <SessionControls 
                    session={session} 
                    status={status} 
                    onStart={start} 
                    onPause={pause} 
                    onStop={stop} 
                  />

                  <p className="mt-1 text-[9px] text-slate-500 font-mono uppercase tracking-wide text-center md:text-left">
                    Active
                  </p>
                </div>

              </div>
            </TrackingCard>
          </div>
        </div>

        {/* Row 2 */}
        <div className="w-full">
          {session?.id ? (
            <div className="bg-[#0f172a]/40 border border-slate-800/50 rounded-2xl overflow-hidden shadow-md">
              
              {/* 🔥 compact header */}
              <div className="p-3 border-b border-slate-800/50 flex justify-between items-center">
                <h3 className="text-[11px] font-bold uppercase tracking-wide text-indigo-400">
                  Application Usage
                </h3>

                <span className="text-[9px] text-green-400 font-semibold">
                  ● Live
                </span>
              </div>

              <div className="p-2">
                <SystemUsage sessionId={session.id} />
              </div>

            </div>
          ) : (
            <div className="h-[220px] border border-dashed border-slate-800/40 rounded-2xl flex flex-col items-center justify-center text-center p-6">
              
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center mb-3 text-slate-700 border border-slate-800">
                <ActivityIcon />
              </div>

              <h4 className="text-slate-400 font-semibold text-[11px] uppercase tracking-wide">
                Awaiting Data
              </h4>

              <p className="text-[10px] text-slate-600 mt-1">
                Start session to see insights
              </p>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  </div>
)
}