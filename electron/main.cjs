const { app, BrowserWindow, ipcMain, desktopCapturer, powerMonitor } = require('electron')
const path = require('path')
const activeWin = require('active-win')
const { SystemActivityMonitor } = require('./main/services/systemActivityMonitor.cjs')

let mainWindow
let activityMonitor = null
let isSessionActive = false

function createWindow() {
  mainWindow = new BrowserWindow({
  width: 1200,
  height: 800,

  frame: true, // ✅ default title bar
  fullscreen: false, // ✅ fullscreen off

  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true
  }
})

  mainWindow.loadURL('http://localhost:5176')

  // Initialize activity monitor with this window
  if (!activityMonitor) {
    activityMonitor = new SystemActivityMonitor({
      powerMonitor,
      sendEvent: (channel, data) => {
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send(channel, data)
        }
      }
    })
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ✅ SCREENSHOT LOGIC
ipcMain.handle('capture-screenshot', async () => {
  const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 1280, height: 720 } })
  return sources[0].thumbnail.toPNG().toString('base64')
})

// ✅ START SESSION - Begin system-wide activity tracking
ipcMain.handle('start-session', async () => {
  console.log('✅ Session started - System activity monitoring begins');
  isSessionActive = true
  
  if (activityMonitor) {
    activityMonitor.start()
  }

  return { success: true }
})

// ✅ STOP SESSION - Stop system-wide activity tracking
ipcMain.handle('stop-session', async () => {
  console.log('🛑 Session stopped - System activity monitoring paused');
  isSessionActive = false
  
  if (activityMonitor) {
    activityMonitor.stop()
  }

  return { success: true }
})

// 🔥 GET SYSTEM ACTIVITY STATUS
ipcMain.handle('get-system-activity-status', () => {
  if (activityMonitor) {
    return activityMonitor.getStatus()
  }
  return { idleTime: 0, isActive: false, status: 'idle' }
})

// 🔥 SYSTEM IDLE TIME
ipcMain.handle('get-system-idle-time', () => {
  return powerMonitor.getSystemIdleTime()
})