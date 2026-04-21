import { useState, useEffect } from 'react'
import { useSession } from './hooks/useSession'
import Auth from './Auth'
import { supabase } from './api/supabase'
import { TimerCard } from './components/TimerCard'
import { SessionControls } from './components/SessionControls'
import { setupActivityLogger } from './services/activityLogger'

export default function App() {
  const [userSession, setUserSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const { start, pause, stop, session, status, elapsedTime } = useSession()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Activity Tracking
  useEffect(() => {
    const cleanup = setupActivityLogger(userSession, session, status);
    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, [userSession, session, status]);

  const handleLogout = async () => {
    if (session) await stop()
    await supabase.auth.signOut()
  }

  if (loading) {
    return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white font-mono">Loading...</div>
  }

  if (!userSession) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center font-sans p-4">
      
      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        className="absolute top-6 right-6 text-xs font-bold text-slate-500 hover:text-red-400 uppercase tracking-widest transition-colors"
      >
        Logout Account
      </button>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
        
        {/* ✅ Timer logic: elapsedTime stop hone par reset nahi hona chahiye hook ke andar */}
        <TimerCard elapsedTime={elapsedTime} status={status} />

        <SessionControls 
          session={session} 
          status={status} 
          onStart={start} 
          onPause={pause} 
          onStop={stop} 
        />

        {/* ✅ Footer: Stop hone par End Time dikhayenge bajaye sirf Start Time ke */}
        {session && (
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col gap-2 text-[11px] text-slate-500 font-medium uppercase tracking-wider">
            <div className="flex justify-between">
                <span>Session ID: #{session.id?.toString().slice(-6)}</span>
                <span className={status === 'active' ? "text-green-400 animate-pulse" : ""}>
                    ● {status}
                </span>
            </div>
            
            <div className="flex justify-between border-t border-slate-800/50 pt-2 text-[9px]">
                <span>Start: {new Date(session.start_time).toLocaleTimeString()}</span>
                {/* Agar end_time DB mein aa chuka hai (Stop click ke baad), toh wo dikhao */}
                {session.end_time && (
                    <span className="text-red-400">End: {new Date(session.end_time).toLocaleTimeString()}</span>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}