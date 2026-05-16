import { sessionService } from '../sessionService'
import { isSameCalendarDay } from './isSameCalendarDay'
import { getEndOfDayISOString } from './getEndOfDayISOString'
import { calculateSessionElapsedSeconds } from './calculateSessionElapsedSeconds'

export async function loadSessionState(userId: string) {
  const latest = await sessionService.getLatestSession(userId)
  if (!latest) {
    return {
      session: null,
      status: 'idle' as const,
      elapsedTime: 0
    }
  }

  const sessionDate = new Date(latest.start_time)
  const today = new Date()

  if (!isSameCalendarDay(sessionDate, today)) {
    await sessionService.updateSession(latest.id, {
      end_time: getEndOfDayISOString(sessionDate),
      is_active: false,
      status: 'stopped'
    })

    return {
      session: null,
      status: 'idle' as const,
      elapsedTime: 0
    }
  }

  return {
    session: latest,
    status: latest.is_active ? ('active' as const) : ('paused' as const),
    elapsedTime: calculateSessionElapsedSeconds(latest.start_time, latest.end_time)
  }
}
