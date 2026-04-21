const axios = require('axios');
const FormData = require('form-data');

const API_BASE_URL = 'http://127.0.0.1:8000/api';
const REQUEST_TIMEOUT_MS = 30000;

function buildHeaders(token) {
  const headers = {
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function login(email, password) {
  const response = await axios.post(
    `${API_BASE_URL}/api/auth/login`,
    { email, password },
    {
      headers: {
        'Content-Type': 'application/json',
        ...buildHeaders(),
      },
      timeout: REQUEST_TIMEOUT_MS,
    }
  );

  return response.data;
}

async function register(name, email, password) {
  const response = await axios.post(
    `${API_BASE_URL}/api/auth/register`,
    { name, email, password },
    {
      headers: {
        'Content-Type': 'application/json',
        ...buildHeaders(),
      },
      timeout: REQUEST_TIMEOUT_MS,
    }
  );

  return response.data;
}

async function logout(token) {
  return axios.post(
    `${API_BASE_URL}/api/auth/logout`,
    null,
    {
      headers: buildHeaders(token),
      timeout: REQUEST_TIMEOUT_MS,
    }
  );
}

async function getCurrentSession(token) {
  const response = await axios.get(`${API_BASE_URL}/api/session/current`, {
    headers: buildHeaders(token),
    timeout: REQUEST_TIMEOUT_MS,
  });

  return response.data;
}

async function validateToken(token) {
  return getCurrentSession(token);
}

async function startSession(token) {
  const response = await axios.post(`${API_BASE_URL}/api/session/start`, null, {
    headers: buildHeaders(token),
    timeout: REQUEST_TIMEOUT_MS,
  });

  return response.data;
}

async function pauseSession(token, sessionId) {
  const response = await axios.post(`${API_BASE_URL}/api/session/pause/${sessionId}`, null, {
    headers: buildHeaders(token),
    timeout: REQUEST_TIMEOUT_MS,
  });

  return response.data;
}

async function resumeSession(token, sessionId) {
  const response = await axios.post(`${API_BASE_URL}/api/session/resume/${sessionId}`, null, {
    headers: buildHeaders(token),
    timeout: REQUEST_TIMEOUT_MS,
  });

  return response.data;
}

async function stopSession(token, sessionId) {
  const response = await axios.post(`${API_BASE_URL}/api/session/stop/${sessionId}`, null, {
    headers: buildHeaders(token),
    timeout: REQUEST_TIMEOUT_MS,
  });

  return response.data;
}

async function uploadScreenshot(token, sessionId, buffer) {
  const form = new FormData();
  form.append('session_id', sessionId);
  form.append('image_file', buffer, {
    filename: `screenshot-${Date.now()}.png`,
    contentType: 'image/png',
  });

  const response = await axios.post(`${API_BASE_URL}/api/screenshot`, form, {
    headers: {
      ...form.getHeaders(),
      ...buildHeaders(token),
    },
    timeout: 60000,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

  return response.data;
}

module.exports = {
  login,
  register,
  logout,
  validateToken,
  getCurrentSession,
  startSession,
  pauseSession,
  resumeSession,
  stopSession,
  uploadScreenshot,
};
