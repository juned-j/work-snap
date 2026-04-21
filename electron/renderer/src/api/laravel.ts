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

// Session API calls
export async function createSession(): Promise<SessionData> {
  const response = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      start_time: new Date().toISOString()
    })
  })
  if (!response.ok) throw new Error('Failed to create session')
  return response.json()
}

export async function updateSession(
  sessionId: number,
  data: Partial<SessionData>
): Promise<SessionData> {
  const response = await fetch(`${API_BASE}/sessions/${sessionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to update session')
  return response.json()
}

export async function pauseSession(sessionId: number): Promise<SessionData> {
  return updateSession(sessionId, {
    status: 'paused',
    total_duration: Math.floor((Date.now() - new Date(localStorage.getItem('sessionStart') || Date.now()).getTime()) / 1000)
  })
}

export async function stopSession(sessionId: number): Promise<SessionData> {
  return updateSession(sessionId, {
    status: 'stopped',
    end_time: new Date().toISOString(),
    total_duration: Math.floor((Date.now() - new Date(localStorage.getItem('sessionStart') || Date.now()).getTime()) / 1000)
  })
}

export async function getSession(sessionId: number): Promise<SessionData> {
  const response = await fetch(`${API_BASE}/sessions/${sessionId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
  if (!response.ok) throw new Error('Failed to fetch session')
  return response.json()
}

// Screenshot API calls
export async function uploadScreenshot(
  sessionId: number,
  imageData: string,
  idleDetected: boolean = false
): Promise<ScreenshotData> {
  const response = await fetch(`${API_BASE}/screenshots`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      session_id: sessionId,
      image_data: imageData,
      idle_detected: idleDetected,
      captured_at: new Date().toISOString()
    })
  })
  if (!response.ok) throw new Error('Failed to upload screenshot')
  return response.json()
}

// Auth API calls
export async function login(email: string, password: string): Promise<{ token: string; user: any }> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  if (!response.ok) throw new Error('Login failed')
  const data = await response.json()
  localStorage.setItem('token', data.token)
  return data
}

export async function register(name: string, email: string, password: string): Promise<{ token: string; user: any }> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  })
  if (!response.ok) throw new Error('Registration failed')
  const data = await response.json()
  localStorage.setItem('token', data.token)
  return data
}

export async function logout(): Promise<void> {
  localStorage.removeItem('token')
  localStorage.removeItem('sessionStart')
}
