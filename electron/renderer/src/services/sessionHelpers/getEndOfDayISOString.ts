export function getEndOfDayISOString(date: Date): string {
  return new Date(date.setHours(23, 59, 59, 999)).toISOString()
}
