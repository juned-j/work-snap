const { ipcMain } = require('electron');
const apiService = require('./services/apiService.cjs');
const { ScreenshotScheduler } = require('./services/captureService.cjs');

let mainWindow = null;
let powerMonitor = null;
let sessionScheduler = null;
const state = {
  apiToken: null,
  employee: null,
  sessionId: null,
  sessionStatus: 'idle',
};

function getMainWindow() {
  return mainWindow;
}

function getCurrentSessionId() {
  return state.sessionId;
}

function getCurrentToken() {
  return state.apiToken;
}

function sendToRenderer(channel, payload) {
  const window = getMainWindow();
  if (!window || !window.webContents) {
    return;
  }

  window.webContents.send(channel, payload);
}

function ensureScheduler() {
  if (!sessionScheduler) {
    sessionScheduler = new ScreenshotScheduler({
      getToken: getCurrentToken,
      getSessionId: getCurrentSessionId,
      uploadScreenshot: apiService.uploadScreenshot,
      sendEvent: sendToRenderer,
    });
  }

  return sessionScheduler;
}

function clearSessionState() {
  state.sessionId = null;
  state.sessionStatus = 'idle';
  const scheduler = ensureScheduler();
  scheduler.stop();
  sendToRenderer('worksnap-session-state', {
    sessionId: state.sessionId,
    sessionStatus: state.sessionStatus,
  });
}

function updateSessionState(session) {
  if (!session || !session.id) {
    return clearSessionState();
  }

  state.sessionId = session.id;
  state.sessionStatus = session.status || 'active';
  sendToRenderer('worksnap-session-state', {
    sessionId: state.sessionId,
    sessionStatus: state.sessionStatus,
  });
}

ipcMain.handle('worksnap-login', async (_, credentials) => {
  try {
    if (!credentials) {
      throw new Error('Missing credentials');
    }

    console.log('🔐 LOGIN CALLED:', credentials);

    // ================= EMAIL + PASSWORD LOGIN =================
    if (credentials.email && credentials.password) {
      const response = await apiService.login(
        credentials.email,
        credentials.password
      );

      console.log('🔐 LOGIN RESPONSE:', response);

      // ✅ Handle multiple possible token keys
      const token =
        response.token ||
        response.api_token ||
        response.access_token ||
        null;

      if (!token) {
        console.error('❌ TOKEN NOT FOUND IN RESPONSE');
        throw new Error('Login failed: API token not received from server');
      }

      // ✅ Save token
      state.apiToken = token;
      state.employee = response.employee || response.user || null;

      console.log('✅ TOKEN SET:', state.apiToken);

      // ✅ Sync session safely
      updateSessionState(response.session ?? null);

      return {
        token: state.apiToken,
        employee: state.employee,
        session: response.session ?? null,
      };
    }

    // ================= TOKEN LOGIN =================
    if (credentials.token) {
      console.log('🔐 TOKEN LOGIN:', credentials.token);

      const response = await apiService.validateToken(credentials.token);

      console.log('🔐 TOKEN VALIDATION RESPONSE:', response);

      state.apiToken = credentials.token;
      state.employee = null;

      updateSessionState(response.session ?? null);

      return {
        token: state.apiToken,
        session: response.session ?? null,
      };
    }

    throw new Error('Email/password or token is required');

  } catch (error) {
    console.error('❌ LOGIN ERROR:', error.message);

    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Login failed'
    );
  }
});

ipcMain.handle('worksnap-register', async (_, credentials) => {
  if (!credentials || !credentials.name || !credentials.email || !credentials.password) {
    throw new Error('Missing registration fields');
  }

  try {
    const response = await apiService.register(
      credentials.name,
      credentials.email,
      credentials.password
    );

    const token = response.token || response.api_token || response.access_token || null;
    if (!token) {
      throw new Error('Registration failed: API token not received');
    }

    state.apiToken = token;
    state.employee = response.employee || response.user || null;
    updateSessionState(response.session ?? null);

    return {
      token: state.apiToken,
      employee: state.employee,
      session: response.session ?? null,
    };
  } catch (error) {
    console.error('❌ REGISTER ERROR:', error.message);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Registration failed'
    );
  }
});

ipcMain.handle('worksnap-logout', async () => {
  if (state.apiToken) {
    try {
      await apiService.logout(state.apiToken);
    } catch (error) {
      // Logout is best-effort.
    }
  }

  state.apiToken = null;
  state.employee = null;
  clearSessionState();
  return { success: true };
});

ipcMain.handle('worksnap-get-current-session', async () => {
  if (!state.apiToken) {
    return { session: null };
  }

  const response = await apiService.getCurrentSession(state.apiToken);
  updateSessionState(response.session);
  return response;
});

ipcMain.handle('worksnap-start-session', async () => {
  if (!state.apiToken) {
    throw new Error('Missing API token');
  }

  const response = await apiService.startSession(state.apiToken);
  if (response && response.id) {
    state.sessionId = response.id;
    state.sessionStatus = 'active';
    ensureScheduler().start();
    sendToRenderer('worksnap-session-state', {
      sessionId: state.sessionId,
      sessionStatus: state.sessionStatus,
    });
  }

  return response;
});

ipcMain.handle('worksnap-pause-session', async () => {
  console.log('PAUSE SESSION ID:', state.sessionId);

  if (!state.apiToken || !state.sessionId) {
    throw new Error('No active session');
  }

  const response = await apiService.pauseSession(
    state.apiToken,
    state.sessionId
  );

  return response;
});

ipcMain.handle('worksnap-resume-session', async () => {
  if (!state.apiToken || !state.sessionId) {
    throw new Error('No paused session');
  }

  const response = await apiService.resumeSession(state.apiToken, state.sessionId);
  state.sessionStatus = 'active';
  ensureScheduler().start();
  sendToRenderer('worksnap-session-state', {
    sessionId: state.sessionId,
    sessionStatus: state.sessionStatus,
  });
  return response;
});

ipcMain.handle('worksnap-stop-session', async () => {
  if (!state.apiToken || !state.sessionId) {
    throw new Error('No active session to stop');
  }

  const response = await apiService.stopSession(state.apiToken, state.sessionId);
  clearSessionState();
  return response;
});

ipcMain.handle('worksnap-get-system-idle-time', () => {
  if (!powerMonitor) {
    return 0;
  }

  return powerMonitor.getSystemIdleTime();
});

function setupIpcHandlers({ mainWindow: windowInstance, powerMonitor: monitor }) {
  mainWindow = windowInstance;
  powerMonitor = monitor;
}

module.exports = {
  setupIpcHandlers,
};
