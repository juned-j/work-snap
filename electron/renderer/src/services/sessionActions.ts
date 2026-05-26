import { authService } from './authService'
import { sessionService } from './sessionService'
import { startOrResumeSession, stopActiveSession } from './sessionHelpers'
import { electronSessionService } from './electronSessionService'

export async function startSessionAction(setters: {
  setSession: (s: any) => void
  setStatus: (s: any) => void
  setElapsedTime: (n: number) => void
}) {
  const currentSession = await authService.getCurrentSession()
  const userId = currentSession?.user?.id
  if (!userId) throw new Error('Login required')

  const latest = await sessionService.getLatestSession(userId)
  const result = await startOrResumeSession(userId, latest)

  setters.setSession(result.session)
  setters.setStatus(result.status)
  setters.setElapsedTime(result.elapsedTime)

  try {
    await electronSessionService.startSession()
  } catch (err) {
    console.warn('Electron startSession not available:', err)
  }
}

export async function stopSessionAction(setters: {
  setSession: (s: any) => void
  setStatus: (s: any) => void
  setElapsedTime: (n: number) => void
}, currentSession: any) {
  if (!currentSession) return

  const result = await stopActiveSession(currentSession)

  setters.setSession(result.session)
  setters.setStatus(result.status)
  setters.setElapsedTime(result.elapsedTime)

  try {
    await electronSessionService.stopSession()
  } catch (err) {
    console.warn('Electron stopSession not available:', err)
  }
}

// ✅ FIX: Return type me '; session?: any' add kiya taaki useSession.ts me error na aaye
export async function pauseToggleAction(
  currentSession: any, 
  statusRef: any, 
  previousPauseRef: any, 
  manualPauseRef: any, 
  sendNotification: (t: string, b: string) => void
): Promise<{ status: 'paused' | 'active' | null; session?: any }> {
  
  if (!currentSession) return { status: null }

  if (statusRef.current === 'active') {
    manualPauseRef.current = true
    previousPauseRef.current = 'manual'
    
    // ✅ FIX: DB se aaya hua updated session (jisme paused_at aur totals save hue hain) catch kiya
    const updatedSession = await sessionService.updateSession(currentSession.id, { is_active: false })
    
    sendNotification('WorkSnap', 'Paused')
    
    // ✅ FIX: Status ke sath updated session data bhi bhej diya
    return { status: 'paused', session: updatedSession }

  } else if (statusRef.current === 'paused') {
    manualPauseRef.current = false
    previousPauseRef.current = null
    
    // ✅ FIX: DB se aaya hua updated session (jisme total_paused_seconds add ho chuka hai) catch kiya
    const updatedSession = await sessionService.updateSession(currentSession.id, { is_active: true })
    
    sendNotification('WorkSnap', 'Resumed')
    
    // ✅ FIX: Status ke sath updated session data bhi bhej diya
    return { status: 'active', session: updatedSession }
  }

  return { status: null }
}

export default {
  startSessionAction,
  stopSessionAction,
  pauseToggleAction
}