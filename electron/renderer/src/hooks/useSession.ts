import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'

export const useSession = () => {
  const [session, setSession] = useState<any>(null)
  const [status, setStatus] = useState<'idle' | 'active' | 'paused' | 'stopped'>('idle')
  const [elapsedTime, setElapsedTime] = useState(0)

  const timerRef = useRef<any>(null)
  const idleTimerRef = useRef<any>(null)
  const screenshotRef = useRef<any>(null)

  const IDLE_THRESHOLD = 60

  // ================= NOTIFICATION =================
  const sendNotification = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body })
    }
  }

  useEffect(() => {
    Notification.requestPermission()
  }, [])

  // ================= 📸 SCREENSHOT =================
  const uploadScreenshot = async () => {
    try {
      if (!session) return

      const base64: string = await window.electron.captureScreenshot()
      if (!base64) return

      const byteCharacters = atob(base64)
      const byteArray = new Uint8Array(
        [...byteCharacters].map(c => c.charCodeAt(0))
      )

      const blob = new Blob([byteArray], { type: 'image/png' })
      const fileName = `${session.id}/${Date.now()}.png`

      const { error } = await supabase.storage
        .from('screenshots')
        .upload(fileName, blob)

      if (error) return console.error('Upload Error:', error.message)

      await supabase.from('screenshots').insert({
        session_id: session.id,
        image_path: fileName
      })

    } catch (err) {
      console.error('Screenshot Error:', err)
    }
  }

  // ================= START =================
  const start = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData?.user) return alert('Login required')

      // 🔥 check existing active session first
      const { data: existing } = await supabase
        .from('work_sessions')
        .select('*')
        .eq('user_id', authData.user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)

      if (existing && existing.length > 0) {
        setSession(existing[0])
        setStatus('active')
        return
      }

      // 🔥 create new session
      const { data, error } = await supabase
        .from('work_sessions')
        .insert({
          user_id: authData.user.id,
          start_time: new Date().toISOString(),
          is_active: true
        })
        .select()
        .single()

      if (error) throw error

      setSession(data)
      setStatus('active')

      if (window.electron?.startSession) {
        await window.electron.startSession()
      }

    } catch (err: any) {
      console.error(err)
      alert(err.message)
    }
  }

  // ================= STOP =================
  const stop = async () => {
    if (!session) return

    try {
      await supabase
        .from('work_sessions')
        .update({
          end_time: new Date().toISOString(),
          is_active: false
        })
        .eq('id', session.id)

      setSession(null)
      setStatus('stopped')
      setElapsedTime(0)

      if (window.electron?.stopSession) {
        await window.electron.stopSession()
      }

    } catch (err: any) {
      console.error(err)
    }
  }

  // ================= LOAD ACTIVE SESSION =================
  useEffect(() => {
    const loadSession = async () => {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData?.user) return

      const { data } = await supabase
        .from('work_sessions')
        .select('*')
        .eq('user_id', authData.user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)

      const active = data?.[0]

      if (active) {
        const start = new Date(active.start_time).getTime()
        const now = Date.now()

        setElapsedTime(Math.floor((now - start) / 1000))
        setSession(active)
        setStatus('active')
      }
    }

    loadSession()
  }, [])

  // ================= TIMER =================
  useEffect(() => {
    if (!session || status !== 'active') {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    const updateTimer = () => {
      const start = new Date(session.start_time).getTime()
      const now = Date.now()
      setElapsedTime(Math.floor((now - start) / 1000))
    }

    updateTimer()
    timerRef.current = setInterval(updateTimer, 1000)

    return () => clearInterval(timerRef.current)
  }, [session, status])

  // ================= AUTO IDLE =================
  useEffect(() => {
    if (!session || status === 'stopped') return

    const resetIdle = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)

      idleTimerRef.current = setTimeout(async () => {
        if (status === 'active') {
          setStatus('paused')

          await supabase
            .from('work_sessions')
            .update({ is_active: false })
            .eq('id', session.id)

          sendNotification("WorkSnap", "Paused due to inactivity")
        }
      }, IDLE_THRESHOLD * 1000)
    }

    const activity = async () => {
      if (status === 'paused') {
        setStatus('active')

        await supabase
          .from('work_sessions')
          .update({ is_active: true })
          .eq('id', session.id)

        sendNotification("WorkSnap", "Resumed")
      }

      resetIdle()
    }

    resetIdle()

    window.addEventListener('mousemove', activity)
    window.addEventListener('keydown', activity)
    window.addEventListener('mousedown', activity)

    return () => {
      window.removeEventListener('mousemove', activity)
      window.removeEventListener('keydown', activity)
      window.removeEventListener('mousedown', activity)

      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    }
  }, [session, status])

  // ================= AUTO SCREENSHOT =================
  useEffect(() => {
    if (status === 'active' && session) {
      screenshotRef.current = setInterval(uploadScreenshot, 60000)
    } else {
      if (screenshotRef.current) clearInterval(screenshotRef.current)
    }

    return () => {
      if (screenshotRef.current) clearInterval(screenshotRef.current)
    }
  }, [status, session])

  return {
    start,
    stop,
    pause: () => setStatus(p => p === 'paused' ? 'active' : 'paused'),
    session,
    status,
    elapsedTime
  }
}