import { useState, useEffect } from 'react'
import { useSession } from './hooks/useSession'
import Auth from './Auth'
import { supabase } from './api/supabase'

const formatTime = (s: number) => {
  const h = Math.floor(s / 3600).toString().padStart(2, '0')
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${h}:${m}:${sec}`
}

export default function App() {
  // --- Naya Code (Auth Logic) ---
  const [userSession, setUserSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Current session check karein
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserSession(session)
      setLoading(false)
    })

    // Auth state change listen karein
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }
  // ------------------------------

  const { start, pause, stop, session, status, elapsedTime } = useSession()

  // Loading state jab tak auth check ho raha ho
  if (loading) {
    return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white font-mono">Loading...</div>
  }

  // Agar user logged in nahi hai to Auth Component dikhao
  if (!userSession) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center font-sans">
      
      {/* Logout Button (Top Right) */}
      <button 
        onClick={handleLogout}
        className="absolute top-6 right-6 text-xs font-bold text-slate-500 hover:text-red-400 uppercase tracking-widest transition-colors"
      >
        Logout Account
      </button>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tighter italic">
            Work<span className="text-indigo-500">Snap</span> 🚀
          </h1>
          <div className="mt-4 inline-flex items-center gap-2 bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700">
            <span className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
              {status === 'active' ? 'Live Tracking' : 'Not Active'}
            </span>
          </div>
        </div>

        {/* Timer */}
        <div className="bg-slate-950/50 rounded-3xl p-8 border border-slate-800/50 mb-8 text-center">
          <div className="text-6xl font-mono font-bold tracking-tight text-indigo-100">
            {formatTime(elapsedTime)}
          </div>
          <p className="text-slate-500 text-[11px] mt-2 font-bold uppercase tracking-widest">Total Active Time</p>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          {!session ? (
            <button 
              onClick={start}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
            >
              START SESSION
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={pause}
                className={`py-4 rounded-2xl font-bold transition-all active:scale-95 border ${
                  status === 'paused' 
                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                  : 'bg-amber-500/10 border-amber-500 text-amber-500'
                }`}
              >
                {status === 'paused' ? 'RESUME' : 'PAUSE'}
              </button>
              <button 
                onClick={stop}
                className="py-4 bg-red-600/10 border border-red-600 text-red-500 rounded-2xl font-bold transition-all active:scale-95"
              >
                STOP
              </button>
            </div>
          )}
        </div>

        {/* Footer Data */}
        {session && (
          <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between text-[11px] text-slate-500 font-medium">
            <span>ID: #{session.id.toString().slice(-6)}</span>
            <span>ST: {new Date(session.start_time).toLocaleTimeString()}</span>
          </div>
        )}
      </div>
    </div>
  )
}