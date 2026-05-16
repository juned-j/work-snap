const { setupIpcHandlers } = require('./ipc/ipcHandlers.js')

function initializeApp({ powerMonitor }) {
  setupIpcHandlers({ powerMonitor })
}

module.exports = {
  initializeApp,
};
