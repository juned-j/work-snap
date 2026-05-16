const { app, BrowserWindow, powerMonitor } = require('electron')
const { createMainWindow } = require('./window/windowManager')
const { setupIpcHandlers } = require('./ipc/ipcHandlers')
const { startActivityMonitor } = require('./services/activityMonitorManager.cjs')
const { log, warn, error } = require('./utils/logger.js')

let mainWindow = null

function initializeMainWindow() {
  mainWindow = createMainWindow()

  mainWindow.webContents.on('did-finish-load', () => {
    log('Renderer process finished loading')
  })

  mainWindow.webContents.on('crashed', () => {
    error('Renderer process crashed')
  })

  mainWindow.on('closed', () => {
    warn('Main window closed')
    mainWindow = null
  })
}

function bootstrapApp() {
  log('Application starting')

  initializeMainWindow()
  setupIpcHandlers({ powerMonitor })

  log('Waiting for system activity monitor to warm up...')
  setTimeout(() => {
    startActivityMonitor(powerMonitor)
  }, 2000)
}

app.whenReady().then(bootstrapApp)

app.on('window-all-closed', () => {
  log('All windows closed')
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  log('Application activated')
  if (BrowserWindow.getAllWindows().length === 0) {
    initializeMainWindow()
  }
})
