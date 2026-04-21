const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron')
const path = require('path')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    autoHideMenuBar: true,
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  })


  mainWindow.loadURL('http://localhost:5176')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('capture-screenshot', async () => {
  const sources = await desktopCapturer.getSources({ types: ['screen'] })
  return sources[0].thumbnail.toPNG().toString('base64')
})

// ✅ START SESSION
ipcMain.handle('start-session', async () => {
  console.log('✅ Session started')

  // yaha future me screenshot interval laga sakte ho
  return { success: true }
})

// ✅ STOP SESSION
ipcMain.handle('stop-session', async () => {
  console.log('🛑 Session stopped')

  return { success: true }
})