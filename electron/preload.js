const { contextBridge, ipcRenderer } = require('electron')

const log = (...args) => {
  console.log('[PRELOAD]', ...args)
}

const warn = (...args) => {
  console.warn('[PRELOAD WARN]', ...args)
}

/**
 * SECURITY: Check if user is authenticated before allowing IPC calls
 * This prevents unauthorized scripts from using sensitive IPC endpoints
 */
const checkAuth = () => {
  const token = sessionStorage.getItem('auth_token')
  if (!token) {
    warn('Unauthorized IPC call - No authentication token')
    throw new Error('Not authenticated')
  }
  return token
}

/**
 * SECURITY: Validate IPC message structure to prevent injection
 */
const validatePayload = (payload, allowedKeys = []) => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid payload')
  }

  if (allowedKeys.length > 0) {
    for (const key of Object.keys(payload)) {
      if (!allowedKeys.includes(key)) {
        warn(`Unauthorized payload key: ${key}`)
        throw new Error('Invalid payload structure')
      }
    }
  }

  return true
}

const electronApi = {
  /**
   * SESSION MANAGEMENT - Requires Authentication
   */
  startSession: async () => {
    try {
      checkAuth()
      log('startSession called')
      const res = await ipcRenderer.invoke('start-session')
      log('startSession response:', res)
      return res
    } catch (error) {
      warn('startSession error:', error.message)
      throw error
    }
  },

  stopSession: async () => {
    try {
      checkAuth()
      log('stopSession called')
      const res = await ipcRenderer.invoke('stop-session')
      log('stopSession response:', res)
      return res
    } catch (error) {
      warn('stopSession error:', error.message)
      throw error
    }
  },

  /**
   * SCREENSHOT CAPTURE - No Authentication Required
   * Screenshots work even without active auth session
   */
  captureScreenshot: async (metadata = {}) => {
    try {
      log('captureScreenshot called', metadata)
      return ipcRenderer.invoke('capture-screenshot', metadata)
    } catch (error) {
      warn('captureScreenshot error:', error.message)
      throw error
    }
  },

  /**
   * SYSTEM MONITORING - Requires Authentication
   */
  getSystemIdleTime: async () => {
    try {
      checkAuth()
      const res = await ipcRenderer.invoke('get-system-idle-time')
      log('idle time received:', res)
      return res
    } catch (error) {
      warn('getSystemIdleTime error:', error.message)
      throw error
    }
  },

  getSystemActivityStatus: async () => {
    try {
      checkAuth()
      const res = await ipcRenderer.invoke('get-system-activity-status')
      log('activity status received:', res)
      return res
    } catch (error) {
      warn('getSystemActivityStatus error:', error.message)
      throw error
    }
  },

  /**
   * EVENT LISTENERS - For real-time updates
   * These are read-only and don't require special auth
   */
  onActivityUpdate: (callback) => {
    log('listener registered: activity-update')

    const listener = (_event, value) => {
      log('activity-update event:', value)
      if (!value?.appName || value.idleTime === undefined || value.isActive === undefined) {
        console.warn('Invalid activity payload', value)
        return
      }
      callback(value)
    }

    ipcRenderer.on('activity-update', listener)
    return () => {
      ipcRenderer.removeListener('activity-update', listener)
      log('listener removed: activity-update')
    }
  },

  onActivityDetected: (callback) => {
    log('listener registered: system-activity-detected')
    const listener = (_event, value) => {
      log('system-activity-detected event:', value)
      callback(value)
    }
    ipcRenderer.on('system-activity-detected', listener)
    return () => {
      ipcRenderer.removeListener('system-activity-detected', listener)
      log('listener removed: system-activity-detected')
    }
  },

  onActivityIdle: (callback) => {
    log('listener registered: system-idle-started')
    const listener = (_event, value) => {
      log('system-idle-started event:', value)
      callback(value)
    }
    ipcRenderer.on('system-idle-started', listener)
    return () => {
      ipcRenderer.removeListener('system-idle-started', listener)
      log('listener removed: system-idle-started')
    }
  },

  onActivityStatusChanged: (callback) => {
    log('listener registered: system-activity-update')
    const listener = (_event, value) => {
      log('system-activity-update event:', value)
      callback(value)
    }
    ipcRenderer.on('system-activity-update', listener)
    return () => {
      ipcRenderer.removeListener('system-activity-update', listener)
      log('listener removed: system-activity-update')
    }
  },

  onAppSwitch: (callback) => {
    log('listener registered: app-switch')
    const listener = (_event, value) => {
      log('app-switch event:', value)
      callback(value)
    }
    ipcRenderer.on('app-switch', listener)
    return () => {
      ipcRenderer.removeListener('app-switch', listener)
      log('listener removed: app-switch')
    }
  },

  /**
   * SECURITY: Check if authenticated
   */
  isAuthenticated: () => {
    return !!sessionStorage.getItem('auth_token')
  },

  /**
   * SECURITY: Clear auth on logout
   */
  clearAuth: () => {
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_user')
    log('Auth cleared')
  }
}

// ========================
// SECURE CONTEXT BRIDGE
// ========================
contextBridge.exposeInMainWorld('electron', electronApi)

console.log('[PRELOAD] ✅ Secure electronApi exposed to main world', {
  captureScreenshot: typeof electronApi.captureScreenshot,
  startSession: typeof electronApi.startSession,
  stopSession: typeof electronApi.stopSession,
  isAuthenticated: typeof electronApi.isAuthenticated
})
