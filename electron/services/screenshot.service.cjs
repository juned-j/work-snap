const { desktopCapturer } = require('electron')

async function captureScreen() {
  const sources = await desktopCapturer.getSources({ types: ['screen'] })

  const screen = sources[0]

  return screen.thumbnail.toPNG()
}

module.exports = { captureScreen }