import { BellOff, AlertTriangle, Flame } from 'lucide-react'
import type { TemperatureReading } from '../types/temperature'
import { formatTimestamp } from '../utils/temperatureUtils'

interface Props {
  alerts: Array<TemperatureReading & { id: number }>
  onClear: () => void
}

export default function AlertPanel({ alerts, onClear }: Props) {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {alerts.length > 0 && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                alerts.length > 0 ? 'bg-red-500' : 'bg-slate-600'
              }`}
            />
          </span>
          Alert Log
          {alerts.length > 0 && (
            <span className="ml-1 bg-red-500/20 text-red-400 border border-red-500/40 text-xs px-2 py-0.5 rounded-full">
              {alerts.length}
            </span>
          )}
        </h3>
        {alerts.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <BellOff className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
        {alerts.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">No alerts — all clear</p>
        ) : (
          alerts.map((alert) => {
            const isFire = alert.status === 'DANGER'
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-3 rounded-lg p-3 text-sm border
                  ${isFire
                    ? 'bg-red-500/10 border-red-500/30 text-red-300'
                    : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                  }`}
              >
                {isFire ? (
                  <Flame className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-blue-400" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{alert.status}</p>
                  <p className="text-xs opacity-80">
                    {alert.temperature_c.toFixed(1)}°C · {formatTimestamp(alert.timestamp)}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
