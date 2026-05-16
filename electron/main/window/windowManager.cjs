// Window management for Electron main process
const { BrowserWindow } = require('electron')
const path = require('path')

let mainWindow = null

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: true,
    fullscreen: false,
    webPreferences: {
      preload: path.join(__dirname, '../../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  const isDev = process.env.NODE_ENV !== 'production'

  if (isDev) {
    mainWindow.loadURL('http://localhost:5176')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../renderer/dist/index.html'))
  }

  return mainWindow
}

function getMainWindow() {
  return mainWindow
}

module.exports = { createMainWindow, getMainWindow }
