const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron')
const path = require('path')

let currentSession = null
let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true
    }
  })

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
  return currentSession
})

// PAUSE
ipcMain.handle('pause-session', () => {
  if (currentSession) {
    currentSession.status = 'paused'
    console.log('Session paused')
  }
})

// RESUME
ipcMain.handle('resume-session', () => {
  if (currentSession) {
    currentSession.status = 'active'
    console.log('Session resumed')
  }
})

// STOP
ipcMain.handle('stop-session', () => {
  console.log('Session stopped')
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