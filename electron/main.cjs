const { app, BrowserWindow, ipcMain, desktopCapturer, powerMonitor } = require('electron')
const path = require('path')
const activeWin = require('active-win'); 

let mainWindow
let activityInterval = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
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

// ✅ SCREENSHOT LOGIC
ipcMain.handle('capture-screenshot', async () => {
  const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 1280, height: 720 } })
  return sources[0].thumbnail.toPNG().toString('base64')
})

ipcMain.handle('start-session', async () => {
  console.log('✅ Session started');
  
  if (!activityInterval) {
    activityInterval = setInterval(async () => {
      try {
        const window = await activeWin();
        const idleTime = powerMonitor.getSystemIdleTime();

        if (window && mainWindow) {
          const activityData = {
            appName: window.owner.name,   
            title: window.title,         
            idleTime: idleTime,
            timestamp: new Date().toISOString()
          };

          mainWindow.webContents.send('activity-update', activityData);
        }
      } catch (err) {
        console.error('Activity Capture Error:', err);
      }
    }, 30000); 
  }

  return { success: true }
})

// ✅ STOP SESSION
ipcMain.handle('stop-session', async () => {
  console.log('🛑 Session stopped');
  if (activityInterval) {
    clearInterval(activityInterval);
    activityInterval = null;
  }
  return { success: true }
})

// 🔥 SYSTEM IDLE TIME
ipcMain.handle('get-system-idle-time', () => {
  return powerMonitor.getSystemIdleTime()
})