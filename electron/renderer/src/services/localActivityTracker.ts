import { insertActivityEvents } from '../db/activityLogs'
import { buildActivityMetadata } from '../utils/activityUtils'

const MOUSE_THROTTLE_MS = 2000
const KEY_THROTTLE_MS = 2000
const FLUSH_INTERVAL_MS = 5000
const MAX_QUEUE_SIZE = 30

export interface LocalActivityTrackerOptions {
  userId: string
  sessionId: number
  getSystemState: () => any
}

export function startLocalActivityTracker({ userId, sessionId, getSystemState }: LocalActivityTrackerOptions) {
  let lastMouseAt = 0
  let lastKeyAt = 0
  let queue: any[] = []
  let flushTimer: ReturnType<typeof setTimeout> | null = null

  const flushQueue = async () => {
    if (flushTimer) {
      clearTimeout(flushTimer)
      flushTimer = null
    }

    if (queue.length === 0) {
      return
    }

    const payload = queue.splice(0)
    try {
      await insertActivityEvents(payload)
    } catch (error) {
      console.error('[LOCAL ACTIVITY] Failed to flush activity events:', error)
      queue = [...payload, ...queue]
    }
  }

  const scheduleFlush = () => {
    if (flushTimer || queue.length === 0) {
      return
    }
    flushTimer = setTimeout(flushQueue, FLUSH_INTERVAL_MS)
  }

  const enqueueLocalEvent = (eventType: string, metadata: Record<string, any>) => {
    const timestamp = new Date().toISOString()
    queue.push({
      user_id: userId,
      session_id: sessionId,
      event_type: eventType,
      metadata,
      created_at: timestamp,
      updated_at: timestamp
    })

    if (queue.length >= MAX_QUEUE_SIZE) {
      flushQueue()
      return
    }

    scheduleFlush()
  }

  const getContextMetadata = () => buildActivityMetadata(getSystemState())

  const handleMouseMove = (event: MouseEvent) => {
    const now = Date.now()
    if (now - lastMouseAt < MOUSE_THROTTLE_MS) {
      return
    }
    lastMouseAt = now

    enqueueLocalEvent('mouse_move', {
      x: event.clientX,
      y: event.clientY,
      input_type: 'mouse',
      ...getContextMetadata()
    })
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    const now = Date.now()
    if (now - lastKeyAt < KEY_THROTTLE_MS) {
      return
    }
    lastKeyAt = now

    enqueueLocalEvent('key_press', {
      key: event.key,
      code: event.code,
      input_type: 'keyboard',
      ...getContextMetadata()
    })
  }

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      enqueueLocalEvent('window_blur', {
        visibility: 'hidden',
        ...getContextMetadata()
      })
    }
  }

  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('keydown', handleKeyDown)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  return () => {
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    flushQueue()
  }
}
