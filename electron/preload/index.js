const { contextBridge, ipcRenderer } = require('electron')

const log = (...args) => {
  console.log('[PRELOAD]', ...args)
}

const electronApi = {
  startSession: async () => {
    log('startSession called')
    try {
      const res = await ipcRenderer.invoke('start-session')
      log('startSession response:', res)
      return res
    } catch (err) {
      log('startSession error:', err && err.message ? err.message : err)
      return null
    }
  },

  stopSession: async () => {
    log('stopSession called')
    try {
      const res = await ipcRenderer.invoke('stop-session')
      log('stopSession response:', res)
      return res
    } catch (err) {
      log('stopSession error:', err && err.message ? err.message : err)
      return null
    }
  },

  captureScreenshot: async () => {
    log('captureScreenshot called')
    try {
      return await ipcRenderer.invoke('capture-screenshot')
    } catch (err) {
      log('captureScreenshot error:', err && err.message ? err.message : err)
      return null
    }
  },

  getSystemIdleTime: async () => {
    try {
      const res = await ipcRenderer.invoke('get-system-idle-time')
      log('idle time received:', res)
      return res
    } catch (err) {
      log('getSystemIdleTime error:', err && err.message ? err.message : err)
      return null
    }
  },

  getSystemActivityStatus: async () => {
    try {
      const res = await ipcRenderer.invoke('get-system-activity-status')
      log('activity status received:', res)
      return res
    } catch (err) {
      log('getSystemActivityStatus error:', err && err.message ? err.message : err)
      return null
    }
  },

  onActivityUpdate: (callback) => {
    log('listener registered: activity-update')

    const listener = (_event, value) => {
      try {
        log('activity-update event:', value)
        if (!value?.appName || value.idleTime === undefined || value.isActive === undefined) {
          console.warn('Invalid activity payload', value)
          return
        }
        try { callback(value) } catch (cbErr) { log('activity callback error:', cbErr) }
      } catch (err) {
        log('onActivityUpdate listener error:', err)
      }
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
      try {
        log('system-activity-detected event:', value)
        try { callback(value) } catch (cbErr) { log('system-activity-detected callback error:', cbErr) }
      } catch (err) {
        log('onActivityDetected listener error:', err)
      }
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
      try {
        log('system-idle-started event:', value)
        try { callback(value) } catch (cbErr) { log('system-idle-started callback error:', cbErr) }
      } catch (err) {
        log('onActivityIdle listener error:', err)
      }
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
      try {
        log('system-activity-update event:', value)
        try { callback(value) } catch (cbErr) { log('system-activity-update callback error:', cbErr) }
      } catch (err) {
        log('onActivityStatusChanged listener error:', err)
      }
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
      try {
        log('app-switch event:', value)
        try { callback(value) } catch (cbErr) { log('app-switch callback error:', cbErr) }
      } catch (err) {
        log('onAppSwitch listener error:', err)
      }
    }
    ipcRenderer.on('app-switch', listener)
    return () => {
      ipcRenderer.removeListener('app-switch', listener)
      log('listener removed: app-switch')
    }
  }
}

contextBridge.exposeInMainWorld('electron', electronApi)
console.log('[PRELOAD] ✅ electronApi exposed to main world', {
  captureScreenshot: typeof electronApi.captureScreenshot,
  startSession: typeof electronApi.startSession,
  stopSession: typeof electronApi.stopSession
})

