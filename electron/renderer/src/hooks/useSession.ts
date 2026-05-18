import { useState, useEffect, useRef } from 'react'
import { sessionService } from '../services/sessionService'
import { electronActivityService } from '../services/electronActivityService'
import { useNotifications } from './useNotifications'
import { captureScreenshotAndUpload } from '../services/sessionHelpers'
import { checkDailySessionAndArchive, initializeSessionState } from '../services/sessionTasks'
import { startSessionAction, stopSessionAction, pauseToggleAction } from '../services/sessionActions'

export const useSession = () => {
  const [session, setSession] = useState<any>(null)
  const [status, setStatus] = useState<'idle' | 'active' | 'paused' | 'stopped'>('idle')
  const [elapsedTime, setElapsedTime] = useState(0)

  const sessionRef = useRef<any>(null)
  const timerRef = useRef<any>(null)
  const screenshotRef = useRef<any>(null)
  const manualPauseRef = useRef(false)
  const previousPauseReasonRef = useRef<'manual' | 'idle' | null>(null)
  const statusRef = useRef<'idle' | 'active' | 'paused' | 'stopped'>('idle')

  const { sendNotification, requestPermission } = useNotifications()

  useEffect(() => {
    sessionRef.current = session
  }, [session])

  useEffect(() => {
    statusRef.current = status
  }, [status])

  useEffect(() => {
    requestPermission()
    initializeSession()
  }, [])

  useEffect(() => {
    const performCheck = async () => {
      await checkDailySessionAndArchive({ setSession, setStatus, setElapsedTime })
    }

    performCheck()
    const interval = setInterval(performCheck, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const initializeSession = async () => {
    await initializeSessionState({ setSession, setStatus, setElapsedTime })
  }

  const uploadScreenshot = async () => {
    try {
      await captureScreenshotAndUpload(sessionRef.current)
    } catch (err: any) {
      console.error('Upload failed:', err?.message ?? err)
    }
  }

  const start = async () => {
    try {
      await startSessionAction({ setSession, setStatus, setElapsedTime })
    } catch (err: any) {
      alert(err.message)
    }
  }

  const stop = async () => {
    if (!session) return

    try {
      await stopSessionAction({ setSession, setStatus, setElapsedTime }, session)
    } catch (err) {
      console.error('Stop session failed:', err)
    }
  }

  useEffect(() => {
    if (!session || status !== 'active') {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      const startTime = new Date(session.start_time).getTime()
      const run = Math.floor((Date.now() - startTime) / 1000)
      setElapsedTime(run)
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [session, status])

  useEffect(() => {
    if (!session) return

    const removeStatusListener = electronActivityService.onActivityStatusChanged(async (payload: any) => {
      const currentStatus = statusRef.current
      const currentPauseReason = previousPauseReasonRef.current

      if (payload.status === 'idle' && currentStatus === 'active') {
        setStatus('paused')
        manualPauseRef.current = false
        previousPauseReasonRef.current = 'idle'
        await sessionService.updateSession(session.id, { is_active: false })
        sendNotification('WorkSnap', 'Paused due to inactivity')
      } else if (
        payload.status === 'active' &&
        currentStatus === 'paused' &&
        currentPauseReason === 'idle' &&
        !manualPauseRef.current
      ) {
        setStatus('active')
        previousPauseReasonRef.current = null
        await sessionService.updateSession(session.id, { is_active: true })
        sendNotification('WorkSnap', 'Resumed')
      }
    })

    return () => removeStatusListener?.()
  }, [session, sendNotification])

  useEffect(() => {
    if (status === 'active' && session) {
      uploadScreenshot()
screenshotRef.current = setInterval(uploadScreenshot, 300000)    } else {
      clearInterval(screenshotRef.current)
    }

    return () => clearInterval(screenshotRef.current)
  }, [status, session])

  const pause = async () => {
    if (!session) return
    const res = await pauseToggleAction(session, statusRef, previousPauseReasonRef, manualPauseRef, sendNotification)
    if (res.status) setStatus(res.status)
  }

  return { start, stop, pause, session, status, elapsedTime }
}
