import { electronApi } from '../../utils/electronApi'
import { sessionService } from '../sessionService'
import { insertActivityEvent } from '../../db/activityLogs'

export async function captureScreenshotAndUpload(currentSession: any): Promise<boolean> {
  if (!currentSession?.id) return false

  if (!electronApi?.captureScreenshot) {
    console.error('Upload failed: electron captureScreenshot API not available')
    return false
  }

  const base64: string = await electronApi.captureScreenshot()
  if (!base64) return false

  const response = await fetch(`data:image/png;base64,${base64}`)
  const blob = await response.blob()

  await sessionService.uploadScreenshot(Number(currentSession.id), currentSession.user_id, blob)
  await insertActivityEvent({
    userId: currentSession.user_id,
    sessionId: Number(currentSession.id),
    eventType: 'screenshot',
    metadata: {
      image_size: blob.size,
      image_type: blob.type,
      captured_at: new Date().toISOString()
    }
  })

  return true
}
