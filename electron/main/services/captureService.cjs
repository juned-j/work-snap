const screenshotDesktop = require('screenshot-desktop');

const SCREENSHOT_INTERVAL_MS = parseInt(process.env.WORKSNAP_SCREENSHOT_INTERVAL_MS || '300000', 10);
const RETRY_INTERVAL_MS = parseInt(process.env.WORKSNAP_RETRY_INTERVAL_MS || '15000', 10);
const MAX_UPLOAD_ATTEMPTS = 3;
const SCREENSHOT_FORMAT = 'png';

class ScreenshotScheduler {
  constructor({ getToken, getSessionId, uploadScreenshot, sendEvent }) {
    this.getToken = getToken;
    this.getSessionId = getSessionId;
    this.uploadScreenshot = uploadScreenshot;
    this.sendEvent = sendEvent;
    this.queue = [];
    this.captureTimer = null;
    this.retryTimer = null;
    this.isUploading = false;
  }

  start() {
    if (this.captureTimer) {
      return;
    }

    this.captureTimer = setInterval(() => this.capture(), SCREENSHOT_INTERVAL_MS);
    this.retryTimer = setInterval(() => this.flushQueue(), RETRY_INTERVAL_MS);
    this.capture();
  }

  stop() {
    if (this.captureTimer) {
      clearInterval(this.captureTimer);
      this.captureTimer = null;
    }

    if (this.retryTimer) {
      clearInterval(this.retryTimer);
      this.retryTimer = null;
    }

    this.queue = [];
  }

  async capture() {
    if (this.isUploading) {
      return;
    }

    const token = this.getToken();
    const sessionId = this.getSessionId();

    if (!token || !sessionId) {
      return;
    }

    this.isUploading = true;

    try {
      const buffer = await screenshotDesktop({ format: SCREENSHOT_FORMAT });

      if (!buffer || !Buffer.isBuffer(buffer)) {
        throw new Error('Screenshot capture returned invalid buffer');
      }

      await this.upload(buffer);
    } catch (error) {
      this.queueFailedUpload(error.buffer || null, 1);
      this.sendEvent('worksnap-upload-result', {
        success: false,
        message: error.message || 'Screenshot capture failed',
      });
    } finally {
      this.isUploading = false;
    }
  }

  async upload(buffer, attempt = 1) {
    const token = this.getToken();
    const sessionId = this.getSessionId();

    if (!token || !sessionId) {
      throw new Error('Session or API token unavailable');
    }

    try {
      const response = await this.uploadScreenshot(token, sessionId, buffer);

      this.sendEvent('worksnap-upload-result', {
        success: true,
        data: response,
      });

      return response;
    } catch (error) {
      if (attempt < MAX_UPLOAD_ATTEMPTS) {
        this.queueFailedUpload(buffer, attempt + 1);
      }

      throw error;
    }
  }

  queueFailedUpload(buffer, attempt = 1) {
    if (!buffer || attempt > MAX_UPLOAD_ATTEMPTS) {
      return;
    }

    this.queue.push({ buffer, attempt });
    this.sendEvent('worksnap-upload-result', {
      success: false,
      message: `Upload queued for retry (attempt ${attempt})`,
    });
  }

  async flushQueue() {
    if (this.queue.length === 0 || this.isUploading) {
      return;
    }

    const queue = [...this.queue];
    this.queue = [];

    for (const item of queue) {
      try {
        await this.upload(item.buffer, item.attempt);
      } catch (error) {
        if (item.attempt < MAX_UPLOAD_ATTEMPTS) {
          this.queueFailedUpload(item.buffer, item.attempt + 1);
        }
      }
    }
  }
}

module.exports = {
  ScreenshotScheduler,
};
