import { useState, useEffect } from 'react'
import { useSession } from './hooks/useSession'
import { useAuthContext } from './hooks/useAuthContext'
import Auth from './Auth'
import { TimerCard } from './components/TimerCard'
import { SessionControls } from './components/SessionControls'
import { setupActivityLogger } from './services/activityLogger'
import SystemUsage from './components/SystemUsage'
import { Sidebar } from './components/Sidebar'
import { DashboardLayout } from './components/Layout'
import { TrackingCard } from './components/TrackingCard'
import TimesheetsPage from './pages/TimesheetsPage'
import ActivityPage from './pages/ActivityPage'
import ProfilePage from './pages/ProfilePage'

const ActivityIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
  </svg>
);

export default function App() {
  const { authState, logout } = useAuthContext()
  const [activePage, setActivePage] = useState<'dashboard' | 'timesheets' | 'activity' | 'profile'>('dashboard')
  const { start, pause, stop, session, status, elapsedTime } = useSession()

  // 🔥 FIX: Added session?.id to dependencies to restart logger correctly
  useEffect(() => {
    if (authState.isAuthenticated && session?.id && status === 'active') {
      const cleanup = setupActivityLogger(authState, session, status)
      return () => cleanup?.()
    }
  }, [authState.isAuthenticated, session?.id, status])

  const handleLogout = async () => {
    if (session) await stop()
    await logout()
  }

  const renderActivePage = () => {
    switch (activePage) {
      case 'timesheets':
        return <TimesheetsPage userId={authState.user?.id} />
      case 'activity':
        return <ActivityPage userId={authState.user?.id} sessionId={session?.id} />
      case 'profile':
        return <ProfilePage userId={authState.user?.id} />
      default:
        return (
          <>
            <div className="w-full flex justify-center">
              <div className="w-full">
                <TrackingCard status={status}>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-2 p-2 w-full">
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
                        Engine Status:{' '}
                        <span className={status === 'active' ? 'text-green-500' : 'text-slate-400'}>
                          {status.toUpperCase()}
                        </span>
                      </p>
                    </div>
                  </div>
                </TrackingCard>
              </div>
            </div>

            <div className="w-full">
              {session?.id ? (
                <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-3 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
                      Application Usage
                    </h3>
                    <span className="text-[9px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      LIVE_DB_SYNC
                    </span>
                  </div>

                  <div className="p-2">
                    <SystemUsage key={session.id} sessionId={session.id} userId={authState.user?.id} />
                  </div>
                </div>
              ) : (
                <div className="h-[220px] border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-white">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-3 text-slate-600 border border-slate-200">
                    <ActivityIcon />
                  </div>
                  <h4 className="text-slate-600 font-semibold text-[11px] uppercase tracking-wide">
                    Awaiting Data
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Start session to see insights from your local activity
                  </p>
                </div>
              )}
            </div>
          </>
        )
    }
  }

  if (authState.isLoading) return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center font-mono text-slate-700 animate-pulse">
      &gt; Initializing_WorkSnap_Core...
    </div>
  )

  if (!authState.isAuthenticated || !authState.user) return <Auth />

  const userEmail = authState.user.email ?? 'User'
  const userName = authState.user.name ?? userEmail.split('@')[0]

  return (
    <div className="h-screen bg-slate-100 text-slate-900 flex overflow-hidden">
      <Sidebar onLogout={handleLogout} activePage={activePage} onNavigate={setActivePage} />
      
      <DashboardLayout email={userEmail} name={userName}>
        <div className="max-w-3xl mx-auto flex flex-col gap-4 px-4 py-4 w-full">
          {renderActivePage()}
        </div>
      </DashboardLayout>
    </div>
  )
}