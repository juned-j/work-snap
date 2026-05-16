// Environment configuration utility
require('dotenv').config();

function getEnv(key, fallback = undefined) {
  return process.env[key] || fallback;
}

module.exports = { getEnv };
