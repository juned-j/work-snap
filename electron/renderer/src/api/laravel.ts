import { apiClient } from './client'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export interface SessionData {
  id: number
  user_id: number
  start_time: string
  end_time: string | null
  total_duration: number
  status: 'active' | 'paused' | 'stopped'
  created_at: string
  updated_at: string
}

export interface ScreenshotData {
  id: number
  session_id: number
  image_path: string
  idle_detected: boolean
  captured_at: string
}

// ===========================
// SESSION API CALLS (Secured)
// ===========================

export async function getCurrentSession(): Promise<SessionData> {
  return apiClient.get('/session/current')
}

export async function createSession(): Promise<SessionData> {
  return apiClient.post('/session/start', {
    start_time: new Date().toISOString()
  })
}

export async function updateSession(
  sessionId: number,
  data: Partial<SessionData>
): Promise<SessionData> {
  return apiClient.put(`/session/${sessionId}`, data)
}

export async function pauseSession(sessionId: number): Promise<SessionData> {
  return apiClient.post(`/session/pause/${sessionId}`, {})
}

export async function stopSession(sessionId: number): Promise<SessionData> {
  return apiClient.post(`/session/stop/${sessionId}`, {})
}

export async function resumeSession(sessionId: number): Promise<SessionData> {
  return apiClient.post(`/session/resume/${sessionId}`, {})
}

export async function getSession(sessionId: number): Promise<SessionData> {
  return apiClient.get(`/session/${sessionId}`)
}

// ============================
// SCREENSHOT API CALLS (Secured)
// ============================

export async function uploadScreenshot(
  sessionId: number,
  imageData: string,
  idleDetected: boolean = false
): Promise<ScreenshotData> {
  return apiClient.post('/screenshot', {
    session_id: sessionId,
    image_data: imageData,
    idle_detected: idleDetected,
    captured_at: new Date().toISOString()
  })
}

export async function getScreenshots(sessionId?: number, limit = 50): Promise<any> {
  const params = new URLSearchParams()
  if (sessionId) params.append('session_id', sessionId.toString())
  params.append('limit', limit.toString())

  return apiClient.get(`/screenshots?${params.toString()}`)
}

export async function getScreenshot(screenshotId: number): Promise<ScreenshotData> {
  return apiClient.get(`/screenshot/${screenshotId}`)
}

export async function downloadScreenshot(screenshotId: number): Promise<void> {
  return apiClient.downloadFile(`/screenshot/${screenshotId}/download`, `screenshot_${screenshotId}.png`)
}

export async function deleteScreenshot(screenshotId: number): Promise<any> {
  return apiClient.delete(`/screenshot/${screenshotId}`)
}

// =============================
// ACTIVITY LOG API CALLS (Secured)
// =============================

export async function getActivityLogs(sessionId?: number, limit = 50): Promise<any> {
  const params = new URLSearchParams()
  if (sessionId) params.append('session_id', sessionId.toString())
  params.append('limit', limit.toString())

  return apiClient.get(`/activities?${params.toString()}`)
}

export async function getActivitySummary(sessionId: number): Promise<any> {
  return apiClient.get(`/session/${sessionId}/activities/summary`)
}

export async function getAdminActivityLogs(userId?: string, limit = 50): Promise<any> {
  const params = new URLSearchParams()
  if (userId) params.append('user_id', userId)
  params.append('limit', limit.toString())

  return apiClient.get(`/activities/admin?${params.toString()}`)
}

// ===========================
// AUTH API CALLS (Public)
// ===========================

export async function login(email: string, password: string): Promise<{ token: string; user: any }> {
  const response = await apiClient.postPublic('/auth/login', {
    email,
    password
  })
  
  // Token should be stored in AuthContext, not here
  return response
}

export async function register(name: string, email: string, password: string): Promise<{ token: string; user: any }> {
  const response = await apiClient.postPublic('/auth/register', {
    name,
    email,
    password,
    password_confirmation: password
  })

  return response
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post('/auth/logout', {})
  } catch (error) {
    console.warn('Logout API error:', error)
  }

  // Session storage is cleared in AuthContext
}
