/**
 * SystemActivityMonitor
 * Tracks global system-wide activity independently of Electron app focus.
 * Monitors idle time using powerMonitor and detects system activity across the entire OS.
 * 
 * Activity Detection Methods:
 * 1. Primary: powerMonitor.getSystemIdleTime() - Detects all keyboard/mouse activity OS-wide
 * 2. Secondary: Raw idle time transitions for real-time responsiveness
 */

class SystemActivityMonitor {
  constructor({ powerMonitor, sendEvent }) {
    this.powerMonitor = powerMonitor;
    this.sendEvent = sendEvent;
    this.monitorInterval = null;
    this.previousIdleTime = 0;
    this.isSystemActive = true;
    this.IDLE_THRESHOLD_SECONDS = 60; // Idle after 60 seconds of no keyboard/mouse activity
    this.CHECK_INTERVAL_MS = 500; // Check every 500ms for more responsive detection
    this.activityDebounceMs = 0; // No debounce for immediate detection
    this.lastActivityTransitionTime = 0;
    this.lastActivityState = 'active';
  }

  /**
   * Start monitoring global system activity
   * Uses powerMonitor.getSystemIdleTime() which is OS-level idle detection
   * This detects ALL keyboard and mouse input across the entire operating system
   */
  start() {
    if (this.monitorInterval) {
      return; // Already running
    }

    console.log('✅ SystemActivityMonitor started - Monitoring OS-level idle time');
    console.log(`   • Idle threshold: ${this.IDLE_THRESHOLD_SECONDS} seconds`);
    console.log('   • Detects: keyboard + mouse activity system-wide');

    this.monitorInterval = setInterval(() => {
      this.checkSystemActivity();
    }, this.CHECK_INTERVAL_MS);

    // Initial check
    this.checkSystemActivity();
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
      console.log('🛑 SystemActivityMonitor stopped');
    }
  }

  /**
   * Check system idle time and detect activity changes
   * powerMonitor.getSystemIdleTime() returns milliseconds since last user input
   * across the entire operating system (keyboard OR mouse)
   */
  checkSystemActivity() {
    try {
      const currentIdleTime = this.powerMonitor.getSystemIdleTime();
      const currentTimeMs = Date.now();
      const timeSinceLastTransition = currentTimeMs - this.lastActivityTransitionTime;

      // ACTIVITY DETECTION: Idle time decreased = User was inactive, now active again
      const activityDetected = currentIdleTime < this.previousIdleTime;

      if (activityDetected) {
        // User activity detected (keyboard/mouse input)
        this.previousIdleTime = 0;
        
        if (this.lastActivityState !== 'active') {
          this.lastActivityState = 'active';
          this.lastActivityTransitionTime = currentTimeMs;

          console.log('🟢 [SYSTEM ACTIVITY] Keyboard/Mouse detected - User is now ACTIVE');
          this.sendEvent('system-activity-detected', {
            timestamp: new Date().toISOString(),
            idleTime: 0,
            status: 'active',
            source: 'keyboard_or_mouse'
          });

          // Always send status update on transition
          this.sendEvent('system-activity-update', {
            timestamp: new Date().toISOString(),
            idleTime: 0,
            isActive: true,
            status: 'active',
            reason: 'activity_detected'
          });
        }
      } else {
        // User is inactive (no new input detected)
        this.previousIdleTime = currentIdleTime;

        // Check if crossed idle threshold
        const isNowIdle = currentIdleTime >= this.IDLE_THRESHOLD_SECONDS * 1000;

        if (isNowIdle && this.lastActivityState !== 'idle') {
          // Just crossed idle threshold
          this.lastActivityState = 'idle';
          this.lastActivityTransitionTime = currentTimeMs;

          console.log(`🔴 [SYSTEM IDLE] No activity for ${currentIdleTime / 1000}s - User is now IDLE`);
          this.sendEvent('system-idle-started', {
            timestamp: new Date().toISOString(),
            idleTime: Math.round(currentIdleTime / 1000),
            status: 'idle',
            reason: 'threshold_exceeded'
          });

          // Always send status update on transition
          this.sendEvent('system-activity-update', {
            timestamp: new Date().toISOString(),
            idleTime: Math.round(currentIdleTime / 1000),
            isActive: false,
            status: 'idle',
            reason: 'idle_threshold_exceeded'
          });
        } else if (!isNowIdle && this.lastActivityState !== 'active') {
          // Below threshold but was marked idle, transition back
          this.lastActivityState = 'active';
          this.lastActivityTransitionTime = currentTimeMs;

          console.log('🟢 [ACTIVITY RESUMED] Below idle threshold - User is ACTIVE again');
          this.sendEvent('system-activity-update', {
            timestamp: new Date().toISOString(),
            idleTime: Math.round(currentIdleTime / 1000),
            isActive: true,
            status: 'active',
            reason: 'activity_resumed'
          });
        }
      }
    } catch (error) {
      console.error('❌ SystemActivityMonitor error:', error);
    }
  }

  /**
   * Get current system activity status
   */
  getStatus() {
    const idleTimeMs = this.powerMonitor.getSystemIdleTime();
    const idleSeconds = Math.round(idleTimeMs / 1000);
    return {
      idleTime: idleSeconds,
      idleTimeMs: idleTimeMs,
      isActive: idleSeconds < this.IDLE_THRESHOLD_SECONDS,
      status: idleSeconds < this.IDLE_THRESHOLD_SECONDS ? 'active' : 'idle',
      threshold: this.IDLE_THRESHOLD_SECONDS,
      percentToIdle: Math.min(100, Math.round((idleSeconds / this.IDLE_THRESHOLD_SECONDS) * 100))
    };
  }

  /**
   * Set idle threshold (in seconds)
   */
  setIdleThreshold(seconds) {
    this.IDLE_THRESHOLD_SECONDS = Math.max(10, seconds); // Minimum 10 seconds
    console.log(
      `⚙️ Idle threshold set to ${this.IDLE_THRESHOLD_SECONDS} seconds`
    );
  }
}

module.exports = { SystemActivityMonitor };
