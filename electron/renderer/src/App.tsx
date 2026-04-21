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
        {/* Container ko max-width-5xl rakha hai taaki content bahut zyada stretch na ho, par full row cover kare */}
        <div className="max-w-5xl mx-auto flex flex-col gap-8 w-full">
          
          {/* Row 1: Timer & Controls (Ab ye Full Width hai) */}
          <div className="w-full">
            <TrackingCard status={status} sessionId={session?.id}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
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
                  <p className="mt-4 text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] text-center md:text-left">
                    Session Management Protocol Active
                  </p>
                </div>
              </div>
            </TrackingCard>
          </div>

          {/* Row 2: Insights (Ye Timer ke niche aayega) */}
          <div className="w-full">
            {session?.id ? (
              <div className="bg-[#0f172a]/40 border border-slate-800/50 rounded-[2.5rem] overflow-hidden shadow-xl backdrop-blur-md">
                <div className="p-6 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/20 px-8">
                   <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400">Application Usage Analytics</h3>
                   <div className="flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
                     <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Live Feed</span>
                   </div>
                </div>
                <div className="p-2">
                   <SystemUsage sessionId={session.id} />
                </div>
              </div>
            ) : (
              <div className="h-[300px] border-2 border-dashed border-slate-800/40 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12 bg-slate-900/10">
                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mb-4 text-slate-700 border border-slate-800">
                  <ActivityIcon />
                </div>
                <h4 className="text-slate-400 font-bold uppercase text-xs tracking-widest">Awaiting Data Stream</h4>
                <p className="text-xs text-slate-600 mt-2">Start a session to visualize real-time application insights.</p>
              </div>
            )}
          </div>

        </div>
      </DashboardLayout>
    </div>
  )
}