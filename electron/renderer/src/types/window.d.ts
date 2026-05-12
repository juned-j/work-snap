export {}

declare global {
  interface Window {
    electron: {
      startSession: () => Promise<void>
      stopSession: () => Promise<void>
      captureScreenshot: () => Promise<string>
      
      // System activity monitoring (global OS-level)
      getSystemIdleTime: () => Promise<number>
      getSystemActivityStatus: () => Promise<{
        idleTime: number
        isActive: boolean
        status: 'active' | 'idle'
        threshold: number
      }>
      
      // Global system activity listeners
      onActivityUpdate: (callback: (data: any) => void) => void
      onActivityDetected: (callback: (data: any) => void) => void
      onActivityIdle: (callback: (data: any) => void) => void
      onActivityStatusChanged: (callback: (data: { timestamp: string; idleTime: number; isActive: boolean; status: 'active' | 'idle' }) => void) => void
    }
  }
}