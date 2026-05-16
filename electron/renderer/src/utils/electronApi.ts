export interface ElectronApi {
  startSession: () => Promise<any>
  stopSession: () => Promise<any>
  captureScreenshot: () => Promise<any>
  getSystemIdleTime: () => Promise<number>
  getSystemActivityStatus: () => Promise<any>
  onActivityUpdate: (callback: (data: any) => void) => () => void
  onActivityDetected: (callback: (data: any) => void) => () => void
  onActivityIdle: (callback: (data: any) => void) => () => void
  onActivityStatusChanged: (callback: (data: any) => void) => () => void
}

export const electronApi =
  typeof window !== 'undefined' && (window as any).electron
    ? ((window as any).electron as ElectronApi)
    : null

export function hasElectronApi(): boolean {
  return !!electronApi?.onActivityUpdate
}
