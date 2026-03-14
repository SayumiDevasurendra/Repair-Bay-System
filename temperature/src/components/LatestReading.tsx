import { Zap } from 'lucide-react'
import type { TemperatureReading } from '../types/temperature'
import { getThreshold } from '../types/temperature'
import { formatTimestamp, formatDate, toFahrenheit } from '../utils/temperatureUtils'
import StatusBadge from './StatusBadge'

interface Props {
  reading: TemperatureReading
  isLive: boolean
}

export default function LatestReading({ reading, isLive }: Props) {
  const t = getThreshold(reading.temperature_c)
  const isDanger = reading.status === 'DANGER'

  return (
    <div
      className={`rounded-2xl border p-5 flex flex-col sm:flex-row items-center gap-6
        bg-slate-800/60 transition-all duration-500
        ${isDanger ? 'border-red-500/60 shadow-red-900/30 shadow-xl' : `border-${t.borderColor.replace('border-', '')}/40`}`}
    >
      {/* Icon */}
      <div
        className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold
          ${isDanger ? 'bg-red-500/20' : 'bg-slate-700/60'}`}
        style={{ color: t.color }}
      >
        <Zap className="w-7 h-7" style={{ color: t.color }} />
      </div>

      {/* Temp */}
      <div className="flex-1 text-center sm:text-left">
        <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">
          {isLive ? 'Latest Arduino Reading' : 'Current Reading'}
        </p>
        <p
          className={`text-5xl font-bold leading-none ${isDanger ? 'animate-pulse' : ''}`}
          style={{ color: t.color }}
        >
          {reading.temperature_c.toFixed(1)}
          <span className="text-2xl ml-1">°C</span>
        </p>
        <p className="text-slate-500 text-sm mt-1">{toFahrenheit(reading.temperature_c)}°F</p>
      </div>

      {/* Status + time */}
      <div className="flex flex-col items-center sm:items-end gap-2">
        <StatusBadge status={reading.status} large />
        <p className="text-slate-400 text-xs">{formatDate(reading.timestamp)}</p>
        <p className="text-slate-300 text-sm font-mono">{formatTimestamp(reading.timestamp)}</p>
      </div>
    </div>
  )
}
