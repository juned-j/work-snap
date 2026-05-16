const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron')
const path = require('path')
const activityLogger = require('../renderer/src/services/activityLogger')

let currentSession = null
let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true
    }
  })

  mainWindow.removeMenu()

  // Load the React app from the development server
  const isDev = process.env.NODE_ENV === 'development'
  if (isDev) {
    mainWindow.loadURL('http://localhost:5177')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/dist/index.html'))
  }
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// SESSION START
ipcMain.handle('start-session', async () => {
  currentSession = {
    id: Date.now(),
    start_time: new Date().toISOString(),
    status: 'active'
  }

  console.log('Session started', currentSession)

  try {
    await activityLogger.logActivity({
      session_id: currentSession.id,
      event_type: 'start-session',
      metadata: { start_time: currentSession.start_time },
    })
  } catch (error) {
    console.error('Failed to log start-session activity:', error)
  }

  return currentSession
})

// PAUSE
ipcMain.handle('pause-session', async () => {
  if (currentSession) {
    currentSession.status = 'paused'
    console.log('Session paused')

    try {
      await activityLogger.logActivity({
        session_id: currentSession.id,
        event_type: 'pause-session',
        metadata: { status: 'paused' },
      })
    } catch (error) {
      console.error('Failed to log pause-session activity:', error)
    }
  }
})

// RESUME
ipcMain.handle('resume-session', async () => {
  if (currentSession) {
    currentSession.status = 'active'
    console.log('Session resumed')

    try {
      await activityLogger.logActivity({
        session_id: currentSession.id,
        event_type: 'resume-session',
        metadata: { status: 'active' },
      })
    } catch (error) {
      console.error('Failed to log resume-session activity:', error)
    }
  }
})

// STOP
ipcMain.handle('stop-session', async () => {
  console.log('Session stopped')

  if (currentSession) {
    try {
      await activityLogger.logActivity({
        session_id: currentSession.id,
        event_type: 'stop-session',
        metadata: { status: 'stopped' },
      })
    } catch (error) {
      console.error('Failed to log stop-session activity:', error)
    }
  }

  currentSession = null
})

// SCREENSHOT
ipcMain.handle('capture-screenshot', async (event, sessionId) => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 }
    })

    const primaryScreen = sources[0]
    if (!primaryScreen) {
      throw new Error('No screen source found')
    }

    const screenshot = primaryScreen.thumbnail
    const pngBuffer = screenshot.toPNG()
    const base64 = pngBuffer.toString('base64')

    console.log(`Screenshot captured for session ${sessionId}`)
    return base64
  } catch (error) {
    console.error('Failed to capture screenshot:', error)
    throw error
  }
})