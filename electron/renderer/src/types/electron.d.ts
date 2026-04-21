declare global {
  interface Window {
    electron: {
      startSession: () => Promise<any>
      stopSession: () => Promise<any>
      captureScreenshot: (sessionId: string) => Promise<string>
    }
  }
}

export {}