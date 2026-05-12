// IPC handlers for Electron main process
const { ipcMain, powerMonitor, desktopCapturer } = require('electron');
const { getMainWindow } = require('../window/windowManager');
const { SystemActivityMonitor } = require('../services/systemActivityMonitor.cjs');

let activityMonitor = null;

function setupIpcHandlers() {
  ipcMain.handle('capture-screenshot', async () => {
    const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 1280, height: 720 } });
    return sources[0].thumbnail.toPNG().toString('base64');
  });

  ipcMain.handle('start-session', async () => {
    if (!activityMonitor) {
      activityMonitor = new SystemActivityMonitor({
        powerMonitor,
        sendEvent: (channel, data) => {
          const win = getMainWindow();
          if (win && win.webContents) {
            win.webContents.send(channel, data);
          }
        }
      });
    }
    activityMonitor.start();
    return { success: true };
  });

  ipcMain.handle('stop-session', async () => {
    if (activityMonitor) activityMonitor.stop();
    return { success: true };
  });

  ipcMain.handle('get-system-activity-status', () => {
    if (activityMonitor) return activityMonitor.getStatus();
    return { idleTime: 0, isActive: false, status: 'idle' };
  });

  ipcMain.handle('get-system-idle-time', () => powerMonitor.getSystemIdleTime());
}

module.exports = { setupIpcHandlers };
