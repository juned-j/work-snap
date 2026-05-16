// IPC handlers for Electron main process
const { ipcMain } = require('electron');
const { startActivityMonitor, stopActivityMonitor, getActivityStatus } = require('../services/activityMonitorManager.cjs');
const { captureFullScreen } = require('../services/screenshotService.js');
const { getSystemIdleTime } = require('../services/idleDetectionService.js');

function setupIpcHandlers({ powerMonitor }) {
  ipcMain.handle('capture-screenshot', async () => {
    try {
      const buffer = await captureFullScreen()
      return buffer.toString('base64')
    } catch (error) {
      console.error('[IPC] capture-screenshot failed:', error)
      return null
    }
  })

  ipcMain.handle('start-session', async () => {
    try {
      if (!powerMonitor) {
        console.error('[IPC] start-session failed: powerMonitor unavailable')
        return { success: false }
      }
      startActivityMonitor(powerMonitor)
      return { success: true }
    } catch (err) {
      console.error('[IPC] start-session error:', err)
      return { success: false }
    }
  })

  ipcMain.handle('stop-session', async () => {
    try {
      stopActivityMonitor()
      return { success: true }
    } catch (err) {
      console.error('[IPC] stop-session error:', err)
      return { success: false }
    }
  })

  ipcMain.handle('get-system-activity-status', () => {
    try {
      return getActivityStatus()
    } catch (err) {
      console.error('[IPC] get-system-activity-status error:', err)
      return null
    }
  })

  ipcMain.handle('get-system-idle-time', () => {
    try {
      return getSystemIdleTime()
    } catch (err) {
      console.error('[IPC] get-system-idle-time error:', err)
      return null
    }
  })
}

module.exports = { setupIpcHandlers };
