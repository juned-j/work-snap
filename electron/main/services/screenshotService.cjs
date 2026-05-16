// Screenshot capture service for Electron main process
const screenshotDesktop = require('screenshot-desktop');

async function captureFullScreen(format = 'png') {
  return screenshotDesktop({ format });
}

module.exports = { captureFullScreen };
