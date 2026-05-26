import { authService } from './authService'
import { sessionService } from './sessionService'
import {
  archiveActiveSessionIfStale,
  loadSessionState
} from './sessionHelpers'

export type SessionStatus =
  | 'idle'
  | 'active'
  | 'paused'
  | 'stopped'

 type SessionState = {
  session: any
  status: SessionStatus
  elapsedTime: number
}

export async function checkDailySessionAndArchive(setters: {
  setSession: (s: any) => void
  setStatus: (s: SessionStatus) => void
  setElapsedTime: (n: number) => void
}) {
  try {
    const currentSession =
      await authService.getCurrentSession()

    const userId =
      currentSession?.user?.id

    if (!userId) return

    const latest =
      await sessionService.getLatestSession(
        userId
      )

    if (!latest) return

    const wasArchived =
      await archiveActiveSessionIfStale(
        latest
      )

    if (wasArchived) {
      setters.setSession(null)
      setters.setStatus('idle')
      setters.setElapsedTime(0)
    }

  } catch (err) {

    console.error(
      'checkDailySessionAndArchive error:',
      err
    )
  }
}

export async function initializeSessionState(
  setters: {
    setSession: (s: any) => void
    setStatus: (s: SessionStatus) => void
    setElapsedTime: (n: number) => void
  }
): Promise<SessionState | null> {

  try {

    const currentSession =
      await authService.getCurrentSession()

    const userId =
      currentSession?.user?.id

    if (!userId) {
      return null
    }

    const state =
      await loadSessionState(
        userId
      ) as SessionState

    setters.setSession(state.session)
    setters.setStatus(state.status)
    setters.setElapsedTime(state.elapsedTime)

    return state

  } catch (err) {

    console.error(
      'initializeSessionState error:',
      err
    )

    return null
  }
}

export default {
  checkDailySessionAndArchive,
  initializeSessionState
}