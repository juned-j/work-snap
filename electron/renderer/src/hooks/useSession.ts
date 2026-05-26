import { useState, useEffect, useRef } from 'react'
import { sessionService } from '../services/sessionService'
import { electronActivityService } from '../services/electronActivityService'
import { useNotifications } from './useNotifications'
import { captureScreenshotAndUpload } from '../services/sessionHelpers'
import {
  checkDailySessionAndArchive,
  initializeSessionState
} from '../services/sessionTasks'
import {
  startSessionAction,
  stopSessionAction,
  pauseToggleAction
} from '../services/sessionActions'

type SessionStatus = 'idle' | 'active' | 'paused' | 'stopped'

export const useSession = () => {
  const [session, setSession] = useState<any>(null)
  const [status, setStatus] = useState<SessionStatus>('idle')
  const [elapsedTime, setElapsedTime] = useState(0)

  const sessionRef = useRef<any>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const screenshotRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const manualPauseRef = useRef(false)
  const previousPauseReasonRef = useRef<'manual' | 'idle' | null>(null)

  const statusRef = useRef<SessionStatus>('idle')
  const savedElapsedRef = useRef(0)
  const elapsedTimeRef = useRef(0) 

  const { sendNotification, requestPermission } = useNotifications()

  const stopTimers = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (screenshotRef.current) {
      clearInterval(screenshotRef.current)
      screenshotRef.current = null
    }
  }

  const syncSessionState = (
    nextStatus: SessionStatus,
    extraSessionFields: Record<string, any> = {}
  ) => {
    setStatus(nextStatus)
    statusRef.current = nextStatus

    setSession((prev: any) => {
      if (!prev) return prev
      return {
        ...prev,
        ...extraSessionFields,
        status: nextStatus,
        is_active: nextStatus === 'active'
      }
    })
  }

  useEffect(() => {
    sessionRef.current = session
  }, [session])

  useEffect(() => {
    statusRef.current = status
  }, [status])

  useEffect(() => {
    elapsedTimeRef.current = elapsedTime
  }, [elapsedTime])

  useEffect(() => {
    requestPermission()
    initializeSession()
  }, [])

  useEffect(() => {
    const performCheck = async () => {
      await checkDailySessionAndArchive({
        setSession,
        setStatus,
        setElapsedTime
      })
    }

    performCheck()
    const interval = setInterval(performCheck, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

 const initializeSession = async () => {
    console.log('🔍 [INIT SESSION] Fetching dynamic computed data from backend...')

    const data = await initializeSessionState({
      setSession,
      setStatus,
      setElapsedTime
    })

    if (!data?.session) return
    
    const dbStatus = data.status as 'idle' | 'active' | 'paused' | 'stopped'

    if (dbStatus === 'stopped') {
      setStatus('stopped')
      setElapsedTime(0)
      savedElapsedRef.current = 0
      elapsedTimeRef.current = 0
      stopTimers()
      return
    }

    // ✅ NO UI CALCULATION: Direct backend ki dynamic value ko ref me daala
    // `duration_seconds` direct aapke Laravel/Supabase se calculated aa raha hai
    const dynamicSeconds = data.session.duration_seconds ?? data.elapsedTime ?? 0
    
    console.log('🎯 [INIT SESSION] Dynamic Seconds from Backend:', dynamicSeconds)

    savedElapsedRef.current = dynamicSeconds
    elapsedTimeRef.current = dynamicSeconds

    // State aur UI sync karein
    setStatus(dbStatus as SessionStatus)
    statusRef.current = dbStatus as SessionStatus
    setElapsedTime(dynamicSeconds)

    setSession((prev: any) => {
      if (!prev) return data.session
      return {
        ...prev,
        ...data.session,
        status: dbStatus,
        is_active: dbStatus === 'active'
      }
    })
  }

  const uploadScreenshot = async () => {
    try {
      if (sessionRef.current) {
        await captureScreenshotAndUpload(sessionRef.current)
      }
    } catch (err: any) {
      console.error('Upload failed:', err?.message ?? err)
    }
  }

  const start = async () => {
    try {
      savedElapsedRef.current = 0
      setElapsedTime(0)
      await startSessionAction({
        setSession,
        setStatus,
        setElapsedTime
      })
    } catch (err: any) {
      alert(err.message)
    }
  }

  const stop = async () => {
    if (!session) return
    try {
      await stopSessionAction(
        {
          setSession,
          setStatus,
          setElapsedTime
        },
        session
      )

      savedElapsedRef.current = 0
      setElapsedTime(0)
      syncSessionState('stopped', {
        end_time: new Date().toISOString(),
        is_active: false
      })

      manualPauseRef.current = false
      previousPauseReasonRef.current = null
      stopTimers()
    } catch (err) {
      console.error('Stop session failed:', err)
    }
  }

  // Functional safe implementation for time tick accumulation
  useEffect(() => {
    if (!session || status !== 'active') {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [session, status])

  // Activity listener pattern with tracked references
  useEffect(() => {
    const removeStatusListener =
      electronActivityService.onActivityStatusChanged(
        async (payload: any) => {
          try {
            const currentStatus = statusRef.current
            const currentPauseReason = previousPauseReasonRef.current
            const currentSession = sessionRef.current

            if (!currentSession || currentStatus === 'stopped') return

            // 🟢 Handle Idle Trigger
            if (payload?.status === 'idle' && currentStatus === 'active') {
              if (previousPauseReasonRef.current === 'idle') return

              savedElapsedRef.current = elapsedTimeRef.current
              manualPauseRef.current = false
              previousPauseReasonRef.current = 'idle'

              syncSessionState('paused')

              // ✅ FIX: Update local state with the returned DB values
              const updatedDbSession = await sessionService.updateSession(currentSession.id, {
                is_active: false,
                status: 'paused',
                paused_at: new Date().toISOString()
              })
              if (updatedDbSession) setSession(updatedDbSession)

              sendNotification('WorkSnap', 'Paused due to inactivity')
              return
            }

            // 🟢 Handle Auto Resume Trigger
            if (
              payload?.status === 'active' &&
              currentStatus === 'paused' &&
              currentPauseReason === 'idle' &&
              !manualPauseRef.current
            ) {
              previousPauseReasonRef.current = null
              syncSessionState('active')

              savedElapsedRef.current = elapsedTimeRef.current

              // ✅ FIX: Update local state with the returned DB values (containing new calculated paused seconds)
              const updatedDbSession = await sessionService.updateSession(currentSession.id, {
                is_active: true,
                status: 'active',
                paused_at: null
              })
              if (updatedDbSession) setSession(updatedDbSession)

              sendNotification('WorkSnap', 'Resumed')
            }
          } catch (err) {
            console.error('❌ Activity listener error:', err)
          }
        }
      )

    return () => {
      removeStatusListener?.()
    }
  }, []) 

  useEffect(() => {
    if (status === 'active' && session) {
      uploadScreenshot()
      screenshotRef.current = setInterval(uploadScreenshot, 300000)
    } else {
      if (screenshotRef.current) {
        clearInterval(screenshotRef.current)
        screenshotRef.current = null
      }
    }

    return () => {
      if (screenshotRef.current) {
        clearInterval(screenshotRef.current)
        screenshotRef.current = null
      }
    }
  }, [status, session])

  const pause = async () => {
    if (!session) return

    if (statusRef.current === 'active') {
      savedElapsedRef.current = elapsedTimeRef.current
    }

    const res = await pauseToggleAction(
      session,
      statusRef,
      previousPauseReasonRef,
      manualPauseRef,
      sendNotification
    )

    if (res?.status) {
      syncSessionState(res.status as SessionStatus)
      // ✅ NOTE: Agar aapka `pauseToggleAction` andar se API hit karta hai, 
      // toh wahan se returned full session object ko `setSession()` me dalna zaroori hai.
      if (res?.session) {
        setSession(res.session)
      }
    }
  }

  return {
    start,
    stop,
    pause,
    session,
    status,
    elapsedTime
  }
}