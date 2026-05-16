// Active window tracking service for Electron main process
const activeWin = require('active-win');

async function getActiveWindowInfo() {
  return activeWin();
}

module.exports = { getActiveWindowInfo };
