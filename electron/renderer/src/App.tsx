import { useState, useEffect } from 'react'
import { useSession } from './hooks/useSession'
import Auth from './Auth'
import { supabase } from './api/supabase'
import { TimerCard } from './components/TimerCard'
import { SessionControls } from './components/SessionControls'

export default function App() {
  const [userSession, setUserSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // Custom hook for session logic
  const { start, pause, stop, session, status, elapsedTime } = useSession()

  useEffect(() => {
    // Current session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserSession(session)
      setLoading(false)
    })

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    // Logout se pehle session stop karna production ke liye best hai
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
        
        {/* Timer UI Component */}
        <TimerCard elapsedTime={elapsedTime} status={status} />

        {/* Buttons Component */}
        <SessionControls 
          session={session} 
          status={status} 
          onStart={start} 
          onPause={pause} 
          onStop={stop} 
        />

        {/* Footer Info */}
        {session && (
          <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between text-[11px] text-slate-500 font-medium uppercase tracking-wider">
            <span>Session ID: #{session.id.toString().slice(-6)}</span>
            <span>Started: {new Date(session.start_time).toLocaleTimeString()}</span>
          </div>
        )}
      </div>
    </div>
  )
}