const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  startSession: () => ipcRenderer.invoke('start-session'),
  stopSession: () => ipcRenderer.invoke('stop-session'),

  captureScreenshot: () => ipcRenderer.invoke('capture-screenshot'),

  // System activity monitoring
  getSystemIdleTime: () => ipcRenderer.invoke('get-system-idle-time'),
  getSystemActivityStatus: () => ipcRenderer.invoke('get-system-activity-status'),

  // Activity event listeners (global system-wide monitoring)
  onActivityUpdate: (callback) => ipcRenderer.on('activity-update', (_event, value) => callback(value)),
  onActivityDetected: (callback) => ipcRenderer.on('system-activity-detected', (_event, value) => callback(value)),
  onActivityIdle: (callback) => ipcRenderer.on('system-idle-started', (_event, value) => callback(value)),
  onActivityStatusChanged: (callback) => ipcRenderer.on('system-activity-update', (_event, value) => callback(value)),
})