import { sessionService } from '../sessionService'

export async function startOrResumeSession(userId: string, latest: any) {
  const today = new Date()

  if (latest) {
    const sessionDate = new Date(latest.start_time)
    const isSameDay =
      sessionDate.getDate() === today.getDate() &&
      sessionDate.getMonth() === today.getMonth() &&
      sessionDate.getFullYear() === today.getFullYear()

    if (isSameDay) {
      if (latest.is_active) {
        return {
          session: latest,
          status: 'active' as const,
          elapsedTime: Math.max(0, Math.floor((Date.now() - new Date(latest.start_time).getTime()) / 1000))
        }
      }

      const newStart = new Date().toISOString()
      await sessionService.updateSession(latest.id, {
        start_time: newStart,
        end_time: null,
        is_active: true,
        status: 'active'
      })

      return {
        session: { ...latest, start_time: newStart, end_time: null, is_active: true, status: 'active' },
        status: 'active' as const,
        elapsedTime: 0
      }
    }

    await sessionService.updateSession(latest.id, {
      end_time: new Date().toISOString(),
      is_active: false,
      status: 'stopped'
    })
  }

  const data = await sessionService.createSession(userId)
  return {
    session: data,
    status: 'active' as const,
    elapsedTime: 0
  }
}
