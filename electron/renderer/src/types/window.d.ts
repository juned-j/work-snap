export {}

declare global {
  interface Window {
    electron: {
      startSession: () => Promise<void>
      pauseSession: () => void
      stopSession: () => Promise<void>
      captureScreenshot: () => Promise<string> // ✅ FIXED
    }
  }
}