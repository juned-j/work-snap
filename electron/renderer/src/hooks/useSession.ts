import { useState, useEffect, useRef } from 'react'
import { supabase } from '../api/supabase'
import { sessionService } from '../services/sessionService'
import { useNotifications } from './useNotifications'

export const useSession = () => {
  const [session, setSession] = useState<any>(null)
  const [status, setStatus] = useState<'idle' | 'active' | 'paused' | 'stopped'>('idle')
  const [elapsedTime, setElapsedTime] = useState(0)

  // Session ki latest state track karne ke liye Ref (Fix for Screenshot Interval)
  const sessionRef = useRef<any>(null)
  const timerRef = useRef<any>(null)
  const idleTimerRef = useRef<any>(null)
  const screenshotRef = useRef<any>(null)
  const systemIdleRef = useRef<any>(null)
  const manualPauseRef = useRef(false) // Track if pause was manual
  const previousPauseReasonRef = useRef<'manual' | 'idle' | null>(null) // Track previous pause state
  const statusRef = useRef<'idle' | 'active' | 'paused' | 'stopped'>('idle') // Avoid stale closures

  const { sendNotification, requestPermission } = useNotifications()
  const IDLE_THRESHOLD = 60

  // Jab bhi session update ho, ref ko bhi update karein
  useEffect(() => {
    sessionRef.current = session
  }, [session])

  // Track status in ref to avoid stale closures
  useEffect(() => {
    statusRef.current = status
  }, [status])

  useEffect(() => {
    requestPermission()
    loadSession()
  }, [])

const loadSession = async () => {
  try {
    const { data: authData } = await supabase.auth.getUser()
    if (!authData?.user?.id) return

    // Load latest session (active or stopped) for today
    const latest = await sessionService.getLatestSession(authData.user.id)
    if (!latest) return

    const sessionDate = new Date(latest.start_time)
    const today = new Date()

    const isSameDay =
      sessionDate.getDate() === today.getDate() &&
      sessionDate.getMonth() === today.getMonth() &&
      sessionDate.getFullYear() === today.getFullYear()

    if (!isSameDay) {
      // Close old session
      await sessionService.updateSession(latest.id, {
        end_time: new Date().toISOString(),
        is_active: false,
        status: 'stopped'
      })
      return
    }

    setSession(latest)

    // Restore correct status
    setStatus(latest.is_active ? 'active' : 'paused')

    // Compute elapsedTime from timestamps
    const startTime = new Date(latest.start_time).getTime()
    const endTime = latest.end_time ? new Date(latest.end_time).getTime() : Date.now()
    const elapsedSeconds = Math.floor((endTime - startTime) / 1000)
    setElapsedTime(elapsedSeconds)
  } catch (err) {
    console.error('Session Load Error:', err)
  }
}

  const uploadScreenshot = async () => {
    try {
      // Session ki latest value Ref se uthayein (Stale Closure Fix)
      const currentSession = sessionRef.current
      if (!currentSession?.id) return

      const base64: string = await window.electron.captureScreenshot()
      if (!base64) return

      const response = await fetch(`data:image/png;base64,${base64}`)
      const blob = await response.blob()

      await sessionService.uploadScreenshot(Number(currentSession.id), currentSession.user_id, blob)
      console.log("Screenshot synced successfully! 📸")
    } catch (err: any) {
      console.error("Upload failed:", err.message)
    }
  }

 const start = async () => {
  try {
    const { data: authData } = await supabase.auth.getUser()
    if (!authData?.user) return alert('Login required')

    // Check latest session for today (active or stopped)
    const latest = await sessionService.getLatestSession(authData.user.id)

    if (latest) {
      const sessionDate = new Date(latest.start_time)
      const today = new Date()

      const isSameDay =
        sessionDate.getDate() === today.getDate() &&
        sessionDate.getMonth() === today.getMonth() &&
        sessionDate.getFullYear() === today.getFullYear()

      if (isSameDay) {
        if (latest.is_active) {
          // Already active today - continue
          setSession(latest)
          setStatus('active')
          return
        } else {
          // Resume stopped session: clear end_time, reset start_time to now
          const newStart = new Date().toISOString()
          await sessionService.updateSession(latest.id, {
            start_time: newStart,
            end_time: null,
            is_active: true,
            status: 'active'
          })
          const resumed = { ...latest, start_time: newStart, end_time: null, is_active: true, status: 'active' }
          setSession(resumed)
          setStatus('active')
          setElapsedTime(0)
          if (window.electron?.startSession) await window.electron.startSession()
          return
        }
      } else {
        // Older day - close it
        await sessionService.updateSession(latest.id, {
          end_time: new Date().toISOString(),
          is_active: false,
          status: 'stopped'
        })
      }
    }

    // No session for today -> create new
    const data = await sessionService.createSession(authData.user.id)
    setSession(data)
    setStatus('active')
    setElapsedTime(0)

    if (window.electron?.startSession) await window.electron.startSession()

  } catch (err: any) {
    alert(err.message)
  }
}
//comment
  const stop = async () => {
    if (!session) return
    try {
      // Calculate total elapsed time from start to now
      const endTime = new Date().toISOString()
      const startTime = new Date(session.start_time).getTime()
      const totalDuration = Math.floor((Date.now() - startTime) / 1000)

      await sessionService.updateSession(session.id, {
        end_time: endTime,
        is_active: false,
        status: 'stopped'
      })

      // Update local state and freeze timer (do not reset to 0)
      setSession({ ...session, end_time: endTime, is_active: false, status: 'stopped' })
      setStatus('stopped')
      setElapsedTime(totalDuration)

      if (window.electron?.stopSession) await window.electron.stopSession()
    } catch (err) {
      console.error(err)
    }
  }

  // Timer Effect
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

  // Inactivity & Activity Listeners - only reset timer, don't auto-pause from here
  useEffect(() => {
    if (!session || statusRef.current === 'stopped') return

    const handleActivity = async () => {
      // Only reset inactivity timer; don't change state from here
      if (statusRef.current === 'active') {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
        idleTimerRef.current = setTimeout(async () => {
          // System idle check will handle pausing
        }, IDLE_THRESHOLD * 1000)
      }
    }

    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keydown', handleActivity)
    return () => {
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      clearTimeout(idleTimerRef.current)
    }
  }, [session])

  // System Idle Effect - check idle time and notify only on state transitions
  useEffect(() => {
    if (!session) return
    systemIdleRef.current = setInterval(async () => {
      const idleTime = await window.electron.getSystemIdleTime()
      const currentStatus = statusRef.current
      const currentPauseReason = previousPauseReasonRef.current

      // TRANSITION: Active -> Paused (idle)
      if (idleTime >= IDLE_THRESHOLD && currentStatus === 'active') {
        setStatus('paused')
        manualPauseRef.current = false
        previousPauseReasonRef.current = 'idle'
        await sessionService.updateSession(session.id, { is_active: false })
        sendNotification("WorkSnap", "Paused due to inactivity")
      }
      // TRANSITION: Paused (idle) -> Active
      else if (idleTime < IDLE_THRESHOLD && currentStatus === 'paused' && currentPauseReason === 'idle' && !manualPauseRef.current) {
        setStatus('active')
        previousPauseReasonRef.current = null
        await sessionService.updateSession(session.id, { is_active: true })
        sendNotification("WorkSnap", "Resumed")
      }
      // NO transition: stay paused if manually paused
      else if (currentStatus === 'paused' && manualPauseRef.current) {
        // Do nothing - manual pause stays paused
      }
    }, 5000)
    return () => clearInterval(systemIdleRef.current)
  }, [session])

  // Auto Screenshot Effect
  useEffect(() => {
    if (status === 'active' && session) {
      uploadScreenshot()
      
     
      screenshotRef.current = setInterval(uploadScreenshot, 60000)
    } else {
      clearInterval(screenshotRef.current)
    }
    return () => clearInterval(screenshotRef.current)
  }, [status, !!session])

  const pause = async () => {
    if (!session) return
    if (statusRef.current === 'active') {
      manualPauseRef.current = true // Mark as manual pause
      previousPauseReasonRef.current = 'manual'
      setStatus('paused')
      await sessionService.updateSession(session.id, { is_active: false })
      sendNotification("WorkSnap", "Paused")
    } else if (statusRef.current === 'paused') {
      manualPauseRef.current = false // Resumed manually
      previousPauseReasonRef.current = null
      setStatus('active')
      await sessionService.updateSession(session.id, { is_active: true })
      sendNotification("WorkSnap", "Resumed")
    }
  }

  return { start, stop, pause, session, status, elapsedTime }




  
}