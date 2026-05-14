const { contextBridge, ipcRenderer } = require('electron')

const log = (...args) => {
  console.log('[PRELOAD]', ...args)
}

contextBridge.exposeInMainWorld('electron', {
  startSession: async () => {
    log('startSession called')
    const res = await ipcRenderer.invoke('start-session')
    log('startSession response:', res)
    return res
  },

  stopSession: async () => {
    log('stopSession called')
    const res = await ipcRenderer.invoke('stop-session')
    log('stopSession response:', res)
    return res
  },

  captureScreenshot: async () => {
    log('captureScreenshot called')
    return ipcRenderer.invoke('capture-screenshot')
  },

  getSystemIdleTime: async () => {
    const res = await ipcRenderer.invoke('get-system-idle-time')
    log('idle time:', res)
    return res
  },

  getSystemActivityStatus: async () => {
    const res = await ipcRenderer.invoke('get-system-activity-status')
    log('activity status:', res)
    return res
  },

  onActivityUpdate: (callback) => {
    log('listener registered: activity-update')
    ipcRenderer.on('activity-update', (_event, value) => {
      log('activity-update received:', value)
      callback(value)
    })
  },

  onActivityDetected: (callback) => {
    log('listener registered: system-activity-detected')
    ipcRenderer.on('system-activity-detected', (_event, value) => {
      log('system-activity-detected:', value)
      callback(value)
    })
  },

  onActivityIdle: (callback) => {
    log('listener registered: system-idle-started')
    ipcRenderer.on('system-idle-started', (_event, value) => {
      log('system-idle-started:', value)
      callback(value)
    })
  },

  onActivityStatusChanged: (callback) => {
    log('listener registered: system-activity-update')
    ipcRenderer.on('system-activity-update', (_event, value) => {
      log('system-activity-update:', value)
      callback(value)
    })
  },
})