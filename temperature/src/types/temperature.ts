export interface TemperatureReading {
  temperature_c: number
  status: TempStatus
  timestamp: string
}

// Matches Arduino exactly: Normal / WARNING / DANGER
export type TempStatus = 'Normal' | 'WARNING' | 'DANGER'

export interface TempThreshold {
  label: TempStatus
  min: number
  max: number
  color: string
  bgColor: string
  borderColor: string
  textColor: string
}

// Arduino thresholds: #define TEMP_WARNING 50.0 / #define TEMP_DANGER 70.0
export const THRESHOLDS: TempThreshold[] = [
  {
    label: 'Normal',
    min: -Infinity,
    max: 50,
    color: '#22c55e',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500',
    textColor: 'text-green-400',
  },
  {
    label: 'WARNING',
    min: 50,
    max: 70,
    color: '#eab308',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-400',
  },
  {
    label: 'DANGER',
    min: 70,
    max: Infinity,
    color: '#ef4444',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500',
    textColor: 'text-red-400',
  },
]

export function getThreshold(temp: number): TempThreshold {
  return THRESHOLDS.find((t) => temp >= t.min && temp < t.max) ?? THRESHOLDS[0]
}

export function deriveStatus(temp: number): TempStatus {
  return getThreshold(temp).label
}
