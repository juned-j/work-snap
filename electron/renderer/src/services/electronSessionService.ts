import { electronApi } from '../utils/electronApi'

export const electronSessionService = {
  async startSession() {
    if (!electronApi?.startSession) {
      throw new Error('Electron startSession API not available')
    }
    return electronApi.startSession()
  },

  async stopSession() {
    if (!electronApi?.stopSession) {
      throw new Error('Electron stopSession API not available')
    }
    return electronApi.stopSession()
  },

  async captureScreenshot() {
    if (!electronApi?.captureScreenshot) {
      throw new Error('Electron captureScreenshot API not available')
    }
    return electronApi.captureScreenshot()
  }
}
