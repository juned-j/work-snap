const { getActiveWindowInfo } = require('./activeWindowService.cjs')

/**
 * SystemActivityMonitor
 * Tracks OS-level idle state, active application, and app switching.
 * Emits structured events for renderer tracking and database logging.
 */
class SystemActivityMonitor {
  constructor({ powerMonitor, sendEvent }) {
    this.powerMonitor = powerMonitor
    this.sendEvent = sendEvent
    this.monitorInterval = null
    this.IDLE_THRESHOLD_SECONDS = 60
    this.CHECK_INTERVAL_MS = 5000
    this.lastActivityState = 'active'
    this.lastAppName = null
    this.lastWindowTitle = null
    this.lastPayload = null
  }

  start() {
    if (this.monitorInterval) {
      return
    }

    console.log('✅ SystemActivityMonitor started')
    console.log(`   • Idle threshold: ${this.IDLE_THRESHOLD_SECONDS}s`)
    console.log(`   • Check interval: ${this.CHECK_INTERVAL_MS}ms`)

    this.monitorInterval = setInterval(() => {
      this.checkSystemActivity()
    }, this.CHECK_INTERVAL_MS)

    this.checkSystemActivity()
  }

  stop() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval)
      this.monitorInterval = null
      console.log('🛑 SystemActivityMonitor stopped')
    }
  }

  async checkSystemActivity() {
    try {
      const idleSeconds = this.powerMonitor.getSystemIdleTime()
      const isNowIdle = idleSeconds >= this.IDLE_THRESHOLD_SECONDS
      const currentState = isNowIdle ? 'idle' : 'active'
      const activeWindow = await getActiveWindowInfo().catch(() => null)

      const appName = isNowIdle
        ? 'System Idle'
        : activeWindow?.owner?.name || 'Unknown App'
      const windowTitle = isNowIdle
        ? 'User Idle'
        : activeWindow?.title || 'Unknown Window'
      const eventType = isNowIdle ? 'idle' : 'heartbeat'
      const stateChanged = currentState !== this.lastActivityState
      const appChanged = !isNowIdle && (
        this.lastAppName !== appName ||
        this.lastWindowTitle !== windowTitle
      )

      const payload = {
        timestamp: new Date().toISOString(),
        idleTime: idleSeconds,
        isActive: !isNowIdle,
        status: currentState,
        eventType,
        appName,
        windowTitle,
        owner: activeWindow?.owner,
        reason: stateChanged
          ? isNowIdle
            ? 'idle_threshold_exceeded'
            : 'activity_detected'
          : appChanged
            ? 'app_switched'
            : 'steady_state',
        durationSeconds: this.CHECK_INTERVAL_MS / 1000
      }

      if (stateChanged) {
        this.lastActivityState = currentState
        if (isNowIdle) {
          console.log(`🔴 User idle after ${idleSeconds}s`)
          this.sendEvent('system-idle-started', { ...payload, eventType: 'idle' })
        } else {
          console.log('🟢 User resumed activity')
          this.sendEvent('system-activity-detected', { ...payload, eventType: 'resume' })
        }
      }

      if (appChanged && !isNowIdle) {
        console.log(`🔁 App switched to ${appName} — ${windowTitle}`)
        this.sendEvent('app-switch', { ...payload, eventType: 'app_switch' })
      }

      this.sendEvent('system-activity-update', payload)
      this.lastAppName = appName
      this.lastWindowTitle = windowTitle
      this.lastPayload = payload
    } catch (error) {
      console.error('❌ SystemActivityMonitor error:', error)
    }
  }

  getStatus() {
    const idleSeconds = this.powerMonitor.getSystemIdleTime()
    return {
      idleTime: idleSeconds,
      isActive: idleSeconds < this.IDLE_THRESHOLD_SECONDS,
      status: idleSeconds < this.IDLE_THRESHOLD_SECONDS ? 'active' : 'idle',
      threshold: this.IDLE_THRESHOLD_SECONDS,
      percentToIdle: Math.min(100, Math.round((idleSeconds / this.IDLE_THRESHOLD_SECONDS) * 100))
    }
  }

  setIdleThreshold(seconds) {
    this.IDLE_THRESHOLD_SECONDS = Math.max(10, seconds)
    console.log(`⚙️ Idle threshold set to ${this.IDLE_THRESHOLD_SECONDS} seconds`)
  }
}

module.exports = { SystemActivityMonitor }
