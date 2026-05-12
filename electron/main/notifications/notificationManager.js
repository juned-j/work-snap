// Notification manager for Electron main process
const { showNotification } = require('../services/notificationService');

function notifySessionPaused() {
  showNotification('WorkSnap', 'Session paused due to inactivity');
}

function notifySessionResumed() {
  showNotification('WorkSnap', 'Session resumed — activity detected');
}

function notifySessionStopped() {
  showNotification('WorkSnap', 'Session stopped due to inactivity');
}

module.exports = {
  notifySessionPaused,
  notifySessionResumed,
  notifySessionStopped
};
