// Idle detection service for Electron main process
const { powerMonitor } = require('electron');

function getSystemIdleTime() {
  return powerMonitor.getSystemIdleTime();
}

module.exports = { getSystemIdleTime };
