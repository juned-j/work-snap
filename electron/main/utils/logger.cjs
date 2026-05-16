function timestamp() {
  return new Date().toISOString()
}

function log(...args) {
  console.log('[MAIN]', timestamp(), ...args)
}

function warn(...args) {
  console.warn('[MAIN WARN]', timestamp(), ...args)
}

function error(...args) {
  console.error('[MAIN ERROR]', timestamp(), ...args)
}

module.exports = {
  log,
  warn,
  error
}
