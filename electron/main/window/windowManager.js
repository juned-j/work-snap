// Window management for Electron main process
const { BrowserWindow } = require('electron');
const path = require('path');

let mainWindow = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: true,
    fullscreen: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload.js'),
      contextIsolation: true
    }
  });
  mainWindow.loadURL('http://localhost:5176');
  return mainWindow;
}

function getMainWindow() {
  return mainWindow;
}

module.exports = { createMainWindow, getMainWindow };
