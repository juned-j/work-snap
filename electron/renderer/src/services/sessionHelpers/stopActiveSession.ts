import { calculateSessionElapsedSeconds } from './calculateSessionElapsedSeconds'
import { sessionService } from '../sessionService'

export async function stopActiveSession(session: any) {
  const endTime = new Date().toISOString()
  await sessionService.updateSession(session.id, {
    end_time: endTime,
    is_active: false,
    status: 'stopped'
  })

  return {
    session: { ...session, end_time: endTime, is_active: false, status: 'stopped' },
    status: 'stopped' as const,
    elapsedTime: calculateSessionElapsedSeconds(session.start_time, endTime)
  }
}
