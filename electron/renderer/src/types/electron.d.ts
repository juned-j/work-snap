export {}

declare global {
  interface Window {
    electron: {
      startSession: () => Promise<any>
      stopSession: () => Promise<any>
      captureScreenshot: () => Promise<string>

      // 🔥 ADD THIS
      getSystemIdleTime: () => Promise<number>
    }
  }
}