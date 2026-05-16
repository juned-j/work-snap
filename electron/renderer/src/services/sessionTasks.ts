import { authService } from './authService'
import { sessionService } from './sessionService'
import { archiveActiveSessionIfStale, loadSessionState } from './sessionHelpers'

export async function checkDailySessionAndArchive(setters: {
  setSession: (s: any) => void
  setStatus: (s: any) => void
  setElapsedTime: (n: number) => void
}) {
  try {
    const currentSession = await authService.getCurrentSession()
    const userId = currentSession?.user?.id
    if (!userId) return

    const latest = await sessionService.getLatestSession(userId)
    if (!latest) return

    const wasArchived = await archiveActiveSessionIfStale(latest)
    if (wasArchived) {
      setters.setSession(null)
      setters.setStatus('idle')
      setters.setElapsedTime(0)
    }
  } catch (err) {
    console.error('checkDailySessionAndArchive error:', err)
  }
}

export async function initializeSessionState(setters: {
  setSession: (s: any) => void
  setStatus: (s: any) => void
  setElapsedTime: (n: number) => void
}) {
  try {
    const currentSession = await authService.getCurrentSession()
    const userId = currentSession?.user?.id
    if (!userId) return

    const state = await loadSessionState(userId)
    setters.setSession(state.session)
    setters.setStatus(state.status)
    setters.setElapsedTime(state.elapsedTime)
  } catch (err) {
    console.error('initializeSessionState error:', err)
  }
}

export default {
  checkDailySessionAndArchive,
  initializeSessionState
}
