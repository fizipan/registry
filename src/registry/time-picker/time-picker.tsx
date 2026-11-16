export type Time = { hour: number; minute: number }

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/

export function parseTime(value: string): Time | null {
  const match = TIME_PATTERN.exec(value)
  if (!match) return null
  return { hour: Number(match[1]), minute: Number(match[2]) }
}

export function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

export function getMinuteOptions(step: number): number[] {
  const safeStep = Number.isInteger(step) && step > 0 ? step : 1
  const options: number[] = []
  for (let minute = 0; minute < 60; minute += safeStep) options.push(minute)
  return options
}

const toMinutes = (time: Time) => time.hour * 60 + time.minute

export function isTimeInRange(time: Time, min?: string, max?: string): boolean {
  const lower = min ? parseTime(min) : null
  const upper = max ? parseTime(max) : null
  const minutes = toMinutes(time)
  if (lower && minutes < toMinutes(lower)) return false
  if (upper && minutes > toMinutes(upper)) return false
  return true
}
