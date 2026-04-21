import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { sessionService } from '../services/sessionService'
import { useNotifications } from './useNotifications'

export const useSession = () => {
  const [session, setSession] = useState<any>(null)
  const [status, setStatus] = useState<'idle' | 'active' | 'paused' | 'stopped'>('idle')
  const [elapsedTime, setElapsedTime] = useState(0)

  const timerRef = useRef<any>(null)
  const idleTimerRef = useRef<any>(null)
  const screenshotRef = useRef<any>(null)
  const systemIdleRef = useRef<any>(null)

  const { sendNotification, requestPermission } = useNotifications()
  const IDLE_THRESHOLD = 60

  useEffect(() => {
    requestPermission()
    loadSession()
  }, [])

  const loadSession = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData?.user?.id) return

      const active = await sessionService.getActiveSession(authData.user.id)
      if (active) {
        setSession(active)
        setStatus('active')
        const startTime = new Date(active.start_time).getTime()
        const diffInSeconds = Math.floor((Date.now() - startTime) / 1000)
        setElapsedTime(diffInSeconds > 0 ? diffInSeconds : 0)
      }
    } catch (err) {
      console.error("Session Load Error:", err)
    }
  }

  const uploadScreenshot = async () => {
    try {
      if (!session?.id) return
      const base64: string = await window.electron.captureScreenshot()
      if (!base64) return

      const response = await fetch(`data:image/png;base64,${base64}`)
      const blob = await response.blob()

      await sessionService.uploadScreenshot(Number(session.id), session.user_id, blob)
      console.log("Screenshot synced successfully! 📸")
    } catch (err: any) {
      console.error("Upload failed:", err.message)
    }
  }

  const start = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData?.user) return alert('Login required')

      const existing = await sessionService.getActiveSession(authData.user.id)
      if (existing) {
        setSession(existing); setStatus('active'); return
      }

      const data = await sessionService.createSession(authData.user.id)
      setSession(data); setStatus('active')
      if (window.electron?.startSession) await window.electron.startSession()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const stop = async () => {
    if (!session) return
    try {
      await sessionService.updateSession(session.id, {
        end_time: new Date().toISOString(),
        is_active: false
      })
      setSession(null); setStatus('stopped'); setElapsedTime(0)
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
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [session, status])

  // Inactivity & Activity Listeners
  useEffect(() => {
    if (!session || status === 'stopped') return

    const handleActivity = async () => {
      if (status === 'paused') {
        setStatus('active')
        await sessionService.updateSession(session.id, { is_active: true })
        sendNotification("WorkSnap", "Resumed")
      }
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      idleTimerRef.current = setTimeout(async () => {
        if (status === 'active') {
          setStatus('paused')
          await sessionService.updateSession(session.id, { is_active: false })
          sendNotification("WorkSnap", "Paused due to inactivity")
        }
      }, IDLE_THRESHOLD * 1000)
    }

    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keydown', handleActivity)
    return () => {
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      clearTimeout(idleTimerRef.current)
    }
  }, [session, status])

  // System Idle Effect
  useEffect(() => {
    if (!session) return
    systemIdleRef.current = setInterval(async () => {
      const idleTime = await window.electron.getSystemIdleTime()
      if (idleTime >= IDLE_THRESHOLD && status === 'active') {
        setStatus('paused')
        await sessionService.updateSession(session.id, { is_active: false })
        sendNotification("WorkSnap", "Paused (System Idle)")
      } else if (idleTime < IDLE_THRESHOLD && status === 'paused') {
        setStatus('active')
        await sessionService.updateSession(session.id, { is_active: true })
        sendNotification("WorkSnap", "Resumed (System Active)")
      }
    }, 5000)
    return () => clearInterval(systemIdleRef.current)
  }, [session, status])

  // Auto Screenshot Effect
  useEffect(() => {
    if (status === 'active' && session) {
      screenshotRef.current = setInterval(uploadScreenshot, 60000)
    } else {
      clearInterval(screenshotRef.current)
    }
    return () => clearInterval(screenshotRef.current)
  }, [status, session])

  return { start, stop, pause: () => setStatus(p => p === 'paused' ? 'active' : 'paused'), session, status, elapsedTime }
}