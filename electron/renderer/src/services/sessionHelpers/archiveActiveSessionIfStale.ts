import { isSameCalendarDay } from './isSameCalendarDay'
import { getEndOfDayISOString } from './getEndOfDayISOString'
import { sessionService } from '../sessionService'

export async function archiveActiveSessionIfStale(latest: any): Promise<boolean> {
  if (!latest || !latest.is_active) return false

  const sessionDate = new Date(latest.start_time)
  const today = new Date()
  if (isSameCalendarDay(sessionDate, today)) return false

  await sessionService.updateSession(latest.id, {
    end_time: getEndOfDayISOString(sessionDate),
    is_active: false,
    status: 'stopped'
  })

  return true
}
