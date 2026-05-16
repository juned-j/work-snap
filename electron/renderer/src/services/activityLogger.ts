import { electronApi, hasElectronApi } from '../utils/electronApi'
import { startLocalActivityTracker } from './localActivityTracker'
import { insertActivityEvent, upsertAppUsage } from '../db/activityLogs'
import { buildActivityMetadata } from '../utils/activityUtils'

export const setupActivityLogger = (
  userSession: any,
  session: any,
  status: string
) => {
  const userId = userSession?.user?.id
  const sessionId = Number(session?.id)

  console.log('🧠 TRACKER INIT:', {
    userId,
    sessionId,
    status,
    hasElectron: hasElectronApi()
  })

  if (!userId || !sessionId || status !== 'active' || !hasElectronApi()) {
    console.warn('⚠️ Activity logger skipped due to missing session, status, or Electron API')
    return () => {}
  }

  if (!electronApi?.onActivityUpdate) {
    console.warn('❌ Electron IPC activity API unavailable')
    return () => {}
  }

  let currentSystemState = {
    appName: 'Unknown',
    windowTitle: 'Unknown',
    idleTime: 0,
    isActive: true,
    status: 'active'
  }

  const logSystemPayload = async (payload: any) => {
    currentSystemState = payload
    const metadata = buildActivityMetadata(payload)

    if (payload.eventType === 'idle' || payload.eventType === 'resume' || payload.eventType === 'app_switch') {
      await insertActivityEvent({
        userId,
        sessionId,
        eventType: payload.eventType,
        metadata
      })
      console.log('📌 Logged event:', payload.eventType, metadata)
    }

    if (payload.isActive) {
      await upsertAppUsage({
        userId,
        sessionId,
        appName: metadata.app,
        title: metadata.title,
        idleTime: payload.idleTime,
        isActive: payload.isActive,
        status: payload.status,
        durationSeconds: payload.durationSeconds ?? 5
      })
    }
  }

  const activityUpdateCleanup = electronApi.onActivityUpdate(async (payload: any) => {
    try {
      await logSystemPayload(payload)
    } catch (error) {
      console.error('❌ Failed to handle activity update:', error)
    }
  })

  const appSwitchCleanup = electronApi.onAppSwitch(async (payload: any) => {
    try {
      await logSystemPayload(payload)
    } catch (error) {
      console.error('❌ Failed to handle app switch:', error)
    }
  })

  const idleCleanup = electronApi.onActivityIdle(async (payload: any) => {
    try {
      await logSystemPayload({ ...payload, eventType: 'idle' })
    } catch (error) {
      console.error('❌ Failed to handle idle event:', error)
    }
  })

  const resumeCleanup = electronApi.onActivityDetected(async (payload: any) => {
    try {
      await logSystemPayload({ ...payload, eventType: 'resume' })
    } catch (error) {
      console.error('❌ Failed to handle resume event:', error)
    }
  })

  const statusCleanup = electronApi.onActivityStatusChanged((payload: any) => {
    currentSystemState = payload
  })

  const localTrackerCleanup = startLocalActivityTracker({
    userId,
    sessionId,
    getSystemState: () => currentSystemState
  })

  return () => {
    activityUpdateCleanup()
    appSwitchCleanup()
    idleCleanup()
    resumeCleanup()
    statusCleanup()
    localTrackerCleanup()
    console.log('🛑 Activity logger cleanup complete')
  }
}
