export function calculateSessionElapsedSeconds(startTime: string, endTime?: string): number {
  const startMs = new Date(startTime).getTime()
  const endMs = endTime ? new Date(endTime).getTime() : Date.now()
  return Math.max(0, Math.floor((endMs - startMs) / 1000))
}
