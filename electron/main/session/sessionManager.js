// Session management service for Electron main process
let currentSession = null;

function startSession(sessionData) {
  currentSession = { ...sessionData, status: 'active' };
}

function pauseSession() {
  if (currentSession) currentSession.status = 'paused';
}

function resumeSession() {
  if (currentSession) currentSession.status = 'active';
}

function stopSession() {
  currentSession = null;
}

function getSession() {
  return currentSession;
}

module.exports = {
  startSession,
  pauseSession,
  resumeSession,
  stopSession,
  getSession
};
