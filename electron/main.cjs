const { app, BrowserWindow, ipcMain, desktopCapturer, powerMonitor } = require('electron')
const path = require('path')
const activeWin = require('active-win')
const { SystemActivityMonitor } = require('./main/services/systemActivityMonitor.cjs')

let mainWindow
let activityMonitor = null
let isSessionActive = false

// ===================================
// SECURITY: Environment Configuration
// ===================================
const isDev = process.env.NODE_ENV === 'development' || process.env.ELECTRON_IS_DEV === '1' || process.env.ELECTRON_IS_DEV === 'true'
const isProd = !isDev

// ===================================
// GLOBAL DEBUG LOGGER
// ===================================
const log = (...args) => {
  console.log('[MAIN]', new Date().toISOString(), ...args)
}

const warn = (...args) => {
  console.warn('[MAIN WARN]', new Date().toISOString(), ...args)
}

const error = (...args) => {
  console.error('[MAIN ERROR]', new Date().toISOString(), ...args)
}

// ===================================
// SECURITY: Disable remote module
// ===================================
if (isProd) {
  log('🔒 Production mode - remote module disabled')
}

// ===================================
// SECURITY: Validate IPC Messages
// ===================================
const validateIPCMessage = (channel) => {
  const allowedChannels = [
    'capture-screenshot',
    'start-session',
    'stop-session',
    'get-system-activity-status',
    'get-system-idle-time'
  ]
  if (!allowedChannels.includes(channel)) {
    error(`🔐 SECURITY: Unauthorized IPC channel: ${channel}`)
    return false
  }
  return true
}

// ===================================
// WINDOW CREATION WITH SECURITY
// ===================================
function createWindow() {
  log('Creating secure BrowserWindow...')

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: true,
    fullscreen: false,
    show: false,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      enableRemoteModule: false,
      sandbox: true,
      v8CacheOptions: 'none'
    }
  })

  log('✅ BrowserWindow created with security hardening')

  const productionIndexPath = path.join(__dirname, '../renderer/dist/index.html')
  if (!app.isPackaged || isDev) {
    mainWindow.loadURL('http://localhost:5176')
  } else {
    mainWindow.loadFile(productionIndexPath)
  }

  if (!app.isPackaged || isDev) {
    mainWindow.webContents.openDevTools()
  } else {
    log('🔒 DevTools disabled in production')
  }

  mainWindow.webContents.on('did-finish-load', () => {
    log('UI loaded successfully')
    if (!mainWindow.isVisible()) {
      mainWindow.show()
    }
  })

  mainWindow.webContents.on('crashed', () => {
    error('Renderer process crashed!')
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.reload()
    }
  })

  mainWindow.webContents.on('unresponsive', () => {
    warn('Renderer process unresponsive')
  })

  mainWindow.on('closed', () => {
    warn('Window closed')
    mainWindow = null
  })

  // ===================================
  // ACTIVITY MONITOR INITIALIZATION
  // ===================================
  if (!activityMonitor) {
    log('Initializing SystemActivityMonitor...')

    activityMonitor = new SystemActivityMonitor({
      powerMonitor,
      sendEvent: (channel, data) => {
        if (!mainWindow || mainWindow.isDestroyed()) {
          return
        }

        try {
          const transformedData = {
            appName: data.appName || 'System Activity',
            windowTitle: data.windowTitle || (data.isActive ? 'Active' : 'Idle'),
            idleTime: data.idleTime || 0,
            isActive: data.isActive !== undefined ? data.isActive : false,
            status: data.status || 'idle',
            timestamp: data.timestamp || new Date().toISOString()
          }

          mainWindow.webContents.send('activity-update', transformedData)
        } catch (err) {
          error('Failed to send event:', err.message)
        }
      }
    })

    log('✅ SystemActivityMonitor initialized')
  }
}

// ===================================
// APP LIFECYCLE
// ===================================
app.whenReady().then(() => {
  log('🚀 App is READY')

  // SECURITY: Set CSP and navigation rules
  app.on('web-contents-created', (_event, contents) => {
    contents.on('will-attach-webview', (_event, webPreferences, _params) => {
      delete webPreferences.preload
      webPreferences.nodeIntegration = false
    })

    contents.on('will-navigate', (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl)
      const allowedOrigins = ['http://localhost:5176', 'http://localhost:8000']
      if (parsedUrl.protocol === 'file:') {
        return
      }
      if (!allowedOrigins.some(url => parsedUrl.origin === url)) {
        event.preventDefault()
        warn(`🔐 Prevented navigation to: ${navigationUrl}`)
      }
    })

    contents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith('http:') || url.startsWith('https:')) {
        return { action: 'deny' }
      }
      return { action: 'allow' }
    })
  })

  createWindow()

  setTimeout(() => {
    log('Starting Activity Monitor')
    if (!activityMonitor) {
      error('ActivityMonitor is NULL')
      return
    }
    try {
      activityMonitor.start()
      log('✅ Activity Monitor STARTED')
    } catch (err) {
      error('Failed to start activity monitor:', err)
    }
  }, 2000)
})

app.on('window-all-closed', () => {
  log('All windows closed')
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// ===================================
// SECURITY: Handle app crashes
// ===================================
process.on('uncaughtException', (err) => {
  error('Uncaught Exception:', err)
})

// ===================================
// IPC HANDLERS (Secured)
// ===================================

/**
 * SCREENSHOT IPC - Captures desktop screenshot
 */
ipcMain.handle('capture-screenshot', async (_event) => {
  try {
    log('📸 Screenshot capture requested')
    if (!validateIPCMessage('capture-screenshot')) {
      throw new Error('Unauthorized IPC call')
    }
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1280, height: 720 }
    })
    if (!sources || sources.length === 0) {
      throw new Error('No screen sources available')
    }
    const base64 = sources[0].thumbnail.toPNG().toString('base64')
    log('📸 Screenshot captured')
    return base64
  } catch (err) {
    error('Screenshot error:', err.message)
    throw err
  }
})

/**
 * START SESSION IPC
 */
ipcMain.handle('start-session', async (_event) => {
  try {
    log('▶️ Session start requested')
    if (!validateIPCMessage('start-session')) {
      throw new Error('Unauthorized IPC call')
    }
    isSessionActive = true
    if (activityMonitor) {
      activityMonitor.start()
    }
    return { success: true, message: 'Session started' }
  } catch (err) {
    error('Start session error:', err.message)
    return { success: false, error: err.message }
  }
})

/**
 * STOP SESSION IPC
 */
ipcMain.handle('stop-session', async (_event) => {
  try {
    log('⏹️ Session stop requested')
    if (!validateIPCMessage('stop-session')) {
      throw new Error('Unauthorized IPC call')
    }
    isSessionActive = false
    if (activityMonitor) {
      activityMonitor.stop()
    }
    return { success: true, message: 'Session stopped' }
  } catch (err) {
    error('Stop session error:', err.message)
    return { success: false, error: err.message }
  }
})

/**
 * GET SYSTEM ACTIVITY STATUS IPC
 */
ipcMain.handle('get-system-activity-status', async (_event) => {
  try {
    if (!validateIPCMessage('get-system-activity-status')) {
      throw new Error('Unauthorized IPC call')
    }
    if (!activityMonitor) {
      return { idleTime: 0, isActive: false, status: 'idle' }
    }
    return activityMonitor.getStatus()
  } catch (err) {
    error('Get activity status error:', err.message)
    return { idleTime: 0, isActive: false, status: 'idle' }
  }
})

/**
 * GET SYSTEM IDLE TIME IPC
 */
ipcMain.handle('get-system-idle-time', async (_event) => {
  try {
    if (!validateIPCMessage('get-system-idle-time')) {
      throw new Error('Unauthorized IPC call')
    }
    return powerMonitor.getSystemIdleTime()
  } catch (err) {
    error('Get idle time error:', err.message)
    return 0
  }
})

log('✅ Electron main process loaded with security hardening')