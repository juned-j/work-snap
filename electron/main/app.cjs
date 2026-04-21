const { setupIpcHandlers } = require('./ipcHandlers.cjs');

function initializeApp({ mainWindow, powerMonitor }) {
  setupIpcHandlers({ mainWindow, powerMonitor });
}

module.exports = {
  initializeApp,
};
