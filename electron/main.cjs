const { app, BrowserWindow, ipcMain, desktopCapturer, powerMonitor } = require('electron')
const path = require('path')
const activeWin = require('active-win')
const { SystemActivityMonitor } = require('./main/services/systemActivityMonitor.cjs')

let mainWindow
let activityMonitor = null
let isSessionActive = false

// ==========================
// 🧠 GLOBAL DEBUG LOGGER
// ==========================
const log = (...args) => {
  console.log('[MAIN]', new Date().toISOString(), ...args)
}

const warn = (...args) => {
  console.warn('[MAIN WARN]', new Date().toISOString(), ...args)
}

const error = (...args) => {
  console.error('[MAIN ERROR]', new Date().toISOString(), ...args)
}

// ==========================
// WINDOW CREATION
// ==========================
function createWindow() {
  log('Creating window...')

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: true,
    fullscreen: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  })

  log('BrowserWindow instance created')

  mainWindow.loadURL('http://localhost:5176')

  mainWindow.webContents.on('did-finish-load', () => {
    log('UI loaded successfully (did-finish-load)')
  })

  mainWindow.webContents.on('crashed', () => {
    error('Renderer crashed!')
  })

  mainWindow.on('closed', () => {
    warn('Window closed event fired')
  })

  // ==========================
  // ACTIVITY MONITOR INIT
  // ==========================
  if (!activityMonitor) {
    log('Initializing SystemActivityMonitor...')

    activityMonitor = new SystemActivityMonitor({
      powerMonitor,
      sendEvent: (channel, data) => {
        log('📡 EVENT EMIT REQUEST:', channel, data)

        if (!mainWindow) {
          error('mainWindow is NULL')
          return
        }

        if (mainWindow.isDestroyed()) {
          error('mainWindow is DESTROYED')
          return
        }

        try {
          log('➡️ Sending event to renderer:', channel)

          mainWindow.webContents.send(channel, {
            ...data,
            __debug_ts: Date.now()
          })

          log('✅ Event sent successfully:', channel)
        } catch (err) {
          error('Failed to send event:', err)
        }
      }
    })

    log('SystemActivityMonitor initialized successfully')
  }
}

// ==========================
// APP LIFECYCLE
// ==========================
app.whenReady().then(() => {
  log('App is READY')

  createWindow()

  log('Waiting 2s before starting activity monitor...')

  setTimeout(() => {
    log('🚀 Starting Activity Monitor')

    if (!activityMonitor) {
      error('activityMonitor is NULL')
      return
    }

    try {
      activityMonitor.start()
      log('✅ Activity Monitor STARTED successfully')
    } catch (err) {
      error('Failed to start activity monitor:', err)
    }
  }, 2000)
})

app.on('window-all-closed', () => {
  log('All windows closed')

  if (process.platform !== 'darwin') {
    log('Quitting app...')
    app.quit()
  }
})

app.on('activate', () => {
  log('App activated')

  if (BrowserWindow.getAllWindows().length === 0) {
    log('Recreating window...')
    createWindow()
  }
})

// ==========================
// SCREENSHOT IPC
// ==========================
ipcMain.handle('capture-screenshot', async () => {
  log('📸 capture-screenshot called')

  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1280, height: 720 }
    })

    const base64 = sources[0].thumbnail.toPNG().toString('base64')

    log('📸 Screenshot captured successfully')
    log('📦 Size:', base64.length)

    return base64
  } catch (err) {
    error('Screenshot capture failed:', err)
    return null
  }
})

// ==========================
// START SESSION
// ==========================
ipcMain.handle('start-session', async () => {
  log('✅ start-session IPC called')

  isSessionActive = true

  if (!activityMonitor) {
    warn('ActivityMonitor missing on start-session')
  } else {
    log('▶️ Starting ActivityMonitor via IPC')
    activityMonitor.start()
  }

  return { success: true }
})

// ==========================
// STOP SESSION
// ==========================
ipcMain.handle('stop-session', async () => {
  log('🛑 stop-session IPC called')

  isSessionActive = false

  if (activityMonitor) {
    log('⏹ Stopping ActivityMonitor...')
    activityMonitor.stop()
  }

  return { success: true }
})

// ==========================
// SYSTEM ACTIVITY STATUS
// ==========================
ipcMain.handle('get-system-activity-status', () => {
  log('📊 get-system-activity-status called')

  if (!activityMonitor) {
    warn('ActivityMonitor not initialized')
    return { idleTime: 0, isActive: false, status: 'idle' }
  }

  const status = activityMonitor.getStatus()

  log('📊 Current status:', status)

  return status
})

// ==========================
// IDLE TIME RAW
// ==========================
ipcMain.handle('get-system-idle-time', () => {
  const idle = powerMonitor.getSystemIdleTime()

  log('⏱ Raw idle time requested:', idle)

  return idle
})