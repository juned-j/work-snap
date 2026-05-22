import { useState, useEffect, useRef } from 'react'
import { sessionService } from '../services/sessionService'
import { electronActivityService } from '../services/electronActivityService'
import { useNotifications } from './useNotifications'
import { captureScreenshotAndUpload } from '../services/sessionHelpers'
import { checkDailySessionAndArchive, initializeSessionState } from '../services/sessionTasks'
import { startSessionAction, stopSessionAction, pauseToggleAction } from '../services/sessionActions'

// 1. YAHAN IMPORT KIYA HAI: useIdleTimer hook ko import karein (path check kar lein)
import { useIdleTimer } from './useIdleTimer' 

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

  // 2. YAHAN JODA HAI: Jab user 1 minute tak koi activity na kare (Idle ho jaye)
  const handleAutoPause = async () => {
    const currentStatus = statusRef.current;
    
    if (currentStatus === 'active' && sessionRef.current) {
      setStatus('paused');
      manualPauseRef.current = false;
      previousPauseReasonRef.current = 'idle';
      
      await sessionService.updateSession(sessionRef.current.id, { is_active: false });
      sendNotification('WorkSnap', 'Paused due to inactivity');
    }
  };

  // 3. YAHAN JODA HAI: Jab user wapas mouse hilaye ya keypress kare (Active ho jaye)
  const handleAutoResume = async () => {
    const currentStatus = statusRef.current;
    const currentPauseReason = previousPauseReasonRef.current;

    if (
      currentStatus === 'paused' &&
      currentPauseReason === 'idle' &&
      !manualPauseRef.current &&
      sessionRef.current
    ) {
      setStatus('active');
      previousPauseReasonRef.current = null;
      
      await sessionService.updateSession(sessionRef.current.id, { is_active: true });
      sendNotification('WorkSnap', 'Resumed');
    }
  };

  // 4. YAHAN CALL KIYA HAI: Custom hook jo hamne banaya hai use call kiya
  useIdleTimer(handleAutoPause, handleAutoResume);

  useEffect(() => {
    if (!session || status !== 'active') {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    // Use the current `elapsedTime` as the base so that when resuming from a
    // pause we continue from the paused duration instead of recalculating
    // from `session.start_time` which would include the paused interval.
    const baseElapsed = elapsedTime
    const tickStart = Date.now()

    timerRef.current = setInterval(() => {
      const run = baseElapsed + Math.floor((Date.now() - tickStart) / 1000)
      setElapsedTime(run)
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [session, status])

  // Purana Electron code (Aap chahein to ise hata bhi sakte hain agar browser activity hi use karni hai)
 useEffect(() => {

  // Listener sirf ek baar register hoga
  const removeStatusListener =
    electronActivityService.onActivityStatusChanged(
      async (payload: any) => {

        try {

          console.log(
            'ACTIVITY PAYLOAD:',
            payload
          )

          const currentStatus =
            statusRef.current

          const currentPauseReason =
            previousPauseReasonRef.current

          const currentSession =
            sessionRef.current

          // Session nahi hai to ignore
          if (!currentSession) {
            return
          }

          // =====================================
          // AUTO PAUSE
          // =====================================
          if (
            payload?.status === 'idle' &&
            currentStatus === 'active'
          ) {

            console.log('🛑 AUTO PAUSE')

            // duplicate pause prevent
            if (
              previousPauseReasonRef.current === 'idle'
            ) {
              return
            }

            setStatus('paused')

            manualPauseRef.current = false

            previousPauseReasonRef.current =
              'idle'

            // IMPORTANT:
            // local ref immediately update
            statusRef.current = 'paused'

            await sessionService.updateSession(
              currentSession.id,
              {
                is_active: false
              }
            )

            sendNotification(
              'WorkSnap',
              'Paused due to inactivity'
            )
          }

          // =====================================
          // AUTO RESUME
          // =====================================
          else if (
            payload?.status === 'active' &&
            currentStatus === 'paused' &&
            currentPauseReason === 'idle' &&
            !manualPauseRef.current
          ) {

            console.log('▶️ AUTO RESUME')

            setStatus('active')

            previousPauseReasonRef.current =
              null

            // IMPORTANT:
            // local ref immediately update
            statusRef.current = 'active'

            await sessionService.updateSession(
              currentSession.id,
              {
                is_active: true
              }
            )

            sendNotification(
              'WorkSnap',
              'Resumed'
            )
          }

        } catch (err) {

          console.error(
            '❌ Activity listener error:',
            err
          )
        }
      }
    )

  return () => {
    removeStatusListener?.()
  }

}, []) // IMPORTANT: EMPTY DEPENDENCY

  useEffect(() => {
    if (status === 'active' && session) {
      uploadScreenshot()
      screenshotRef.current = setInterval(uploadScreenshot, 300000)    
    } else {
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