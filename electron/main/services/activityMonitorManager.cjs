const { SystemActivityMonitor } = require('./systemActivityMonitor.cjs')
const { getMainWindow } = require('../window/windowManager')
const { log, warn } = require('../utils/logger.js')

let activityMonitor = null

function createActivityMonitor(powerMonitor) {
  if (activityMonitor) {
    return activityMonitor
  }

  activityMonitor = new SystemActivityMonitor({
    powerMonitor,
    sendEvent: (channel, data) => {
      const mainWindow = getMainWindow()
      if (!mainWindow || mainWindow.isDestroyed()) {
        warn('Unable to send activity event, main window is unavailable')
        return
      }

      mainWindow.webContents.send(channel, data)
    }
  })

  log('Created SystemActivityMonitor instance')
  return activityMonitor
}

function startActivityMonitor(powerMonitor) {
  const monitor = createActivityMonitor(powerMonitor)
  monitor.start()
}

function stopActivityMonitor() {
  if (!activityMonitor) {
    warn('Activity monitor is not running')
    return
  }

  activityMonitor.stop()
}

function getActivityStatus() {
  if (!activityMonitor) {
    return {
      idleTime: 0,
      isActive: false,
      status: 'idle'
    }
  }

  return activityMonitor.getStatus()
}

module.exports = {
  startActivityMonitor,
  stopActivityMonitor,
  getActivityStatus
}
