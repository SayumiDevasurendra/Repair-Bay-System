import type { TemperatureReading } from '../types/temperature'
import { deriveStatus } from '../types/temperature'

export function formatTimestamp(ts: string): string {
  const date = new Date(ts.replace(' ', 'T'))
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function formatDate(ts: string): string {
  const date = new Date(ts.replace(' ', 'T'))
  return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
}

export function toFahrenheit(c: number): number {
  return Math.round((c * 9) / 5 + 32)
}

export function calcStats(history: TemperatureReading[]) {
  if (history.length === 0) return { min: 0, max: 0, avg: 0 }
  const temps = history.map((r) => r.temperature_c)
  return {
    min: Math.min(...temps),
    max: Math.max(...temps),
    avg: Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10,
  }
}

let _prevTemp = 35.0

export function generateReading(): TemperatureReading {
  // Simulate realistic drift around thresholds (Normal <50, WARNING 50-70, DANGER ≥70)
  const spike = Math.random() < 0.05
  const delta = spike
    ? (Math.random() - 0.3) * 25
    : (Math.random() - 0.48) * 2

  _prevTemp = Math.min(Math.max(_prevTemp + delta, 20), 85)
  const temperature_c = Math.round(_prevTemp * 10) / 10

  const now = new Date()
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(
    2,
    '0'
  )}:${String(now.getSeconds()).padStart(2, '0')}`

  return { temperature_c, status: deriveStatus(temperature_c), timestamp }
}
