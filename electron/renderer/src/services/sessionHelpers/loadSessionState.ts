import { sessionService } from '../sessionService'
import { isSameCalendarDay } from './isSameCalendarDay'
import { getEndOfDayISOString } from './getEndOfDayISOString'
import { calculateSessionElapsedSeconds } from './calculateSessionElapsedSeconds'

export async function loadSessionState(userId: string) {
  console.log('🟡 =================================')
  console.log('🟡 LOAD SESSION STATE START')
  console.log('👤 userId:', userId)

  const latest = await sessionService.getLatestSession(userId)

  console.log('📦 latest session:', latest)

  // ✅ NO SESSION
  if (!latest) {
    console.log('⚪ No session found')

    return {
      session: null,
      status: 'idle' as const,
      elapsedTime: 0
    }
  }

  // ✅ DATE CHECK
  const sessionDate = new Date(latest.start_time)
  const today = new Date()

  console.log('📅 sessionDate:', sessionDate.toISOString())
  console.log('📅 today:', today.toISOString())

  const isToday = isSameCalendarDay(sessionDate, today)

  console.log('✅ isSameCalendarDay:', isToday)

  // ✅ DEBUG LOGS
  console.log('🔎 latest.id:', latest.id)
  console.log('🔎 latest.user_id:', latest.user_id)
  console.log('🔎 latest.status:', latest.status)
  console.log('🔎 latest.is_active:', latest.is_active)
  console.log('🔎 latest.start_time:', latest.start_time)
  console.log('🔎 latest.end_time:', latest.end_time)
  console.log('🔎 latest.paused_at:', latest.paused_at)
  console.log('🔎 latest.updated_at:', latest.updated_at)
  console.log(
    '🔎 latest.total_paused_seconds:',
    latest.total_paused_seconds
  )

  // ✅ AUTO STOP OLD SESSION
  if (!isToday) {
    console.log('🛑 Session is from previous day')

    const endOfDay = getEndOfDayISOString(sessionDate)

    console.log('🕛 endOfDay:', endOfDay)

    await sessionService.updateSession(latest.id, {
      end_time: endOfDay,
      is_active: false,
      status: 'stopped'
    })

    console.log('✅ Old session stopped')

    return {
      session: null,
      status: 'idle' as const,
      elapsedTime: 0
    }
  }

  // ✅ TIMER FIX
  // paused => freeze
  // active => continue live

  let safeEndTime: string | undefined = undefined

  if (latest.status === 'paused' && !latest.is_active) {
    console.log('⏸️ PAUSED SESSION DETECTED')

    const pausedSource =
      latest.paused_at ||
      latest.updated_at ||
      latest.end_time

    console.log('🧩 pausedSource:', pausedSource)

    // ✅ IMPORTANT
    // DO NOT use toISOString()
    // timezone shift causes negative seconds

    if (pausedSource) {
      safeEndTime = pausedSource
    }

    console.log('🛡️ USING PAUSED TIME:', safeEndTime)
  } else {
    console.log('▶️ ACTIVE SESSION - USING LIVE TIMER')

    // active session => live running timer
    safeEndTime = undefined
  }

  console.log('🛡️ FINAL safeEndTime:', safeEndTime)

  // ✅ ELAPSED TIME
  const elapsedTime = calculateSessionElapsedSeconds(
    latest.start_time,
    safeEndTime
  )

  console.log('⏱️ calculated elapsedTime:', elapsedTime)

  // ✅ FINAL STATUS
  let status: 'active' | 'paused' | 'idle'

  if (latest.status === 'paused' && !latest.is_active) {
    status = 'paused'
  } else if (latest.is_active) {
    status = 'active'
  } else {
    status = 'idle'
  }

  console.log('🎯 final status:', status)

  const result = {
    session: latest,
    status,
    elapsedTime
  }

  console.log('✅ returning session state:', result)
  console.log('🟡 =================================')

  return result
}