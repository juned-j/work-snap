const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  startSession: () => ipcRenderer.invoke('start-session'),
  stopSession: () => ipcRenderer.invoke('stop-session'),

  captureScreenshot: () => ipcRenderer.invoke('capture-screenshot'),

  getSystemIdleTime: () => ipcRenderer.invoke('get-system-idle-time')
})