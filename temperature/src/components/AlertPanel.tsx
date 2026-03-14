import { useState } from 'react'
import { BellOff, AlertTriangle, Flame, ChevronLeft, ChevronRight } from 'lucide-react'
import type { TemperatureReading } from '../types/temperature'
import { formatTimestamp, formatDate } from '../utils/temperatureUtils'

interface Props {
  alerts: Array<TemperatureReading & { id: number }>
  onClear: () => void
}

const PAGE_SIZE = 10

export default function AlertPanel({ alerts, onClear }: Props) {
  const [page, setPage] = useState(1)
  const dangerCount = alerts.filter((a) => a.status === 'DANGER').length
  const warningCount = alerts.filter((a) => a.status === 'WARNING').length
  const totalPages = Math.max(1, Math.ceil(alerts.length / PAGE_SIZE))
  const paginated = alerts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Reset to page 1 if alerts change and current page is out of range
  if (page > totalPages) setPage(totalPages)

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {alerts.length > 0 && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${alerts.length > 0 ? 'bg-red-500' : 'bg-slate-600'}`} />
          </span>
          Alert Log
          {alerts.length > 0 && (
            <span className="ml-1 bg-slate-700 text-slate-300 border border-slate-600 text-xs px-2 py-0.5 rounded-full">
              {alerts.length} total
            </span>
          )}
          {warningCount > 0 && (
            <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {warningCount} WARNING
            </span>
          )}
          {dangerCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {dangerCount} DANGER
            </span>
          )}
        </h3>
        {alerts.length > 0 && (
          <button
            onClick={() => { onClear(); setPage(1) }}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <BellOff className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Alert rows */}
      <div className="flex flex-col gap-2">
        {alerts.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">No alerts — all clear</p>
        ) : (
          paginated.map((alert) => {
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
                    {alert.temperature_c.toFixed(1)}°C · {formatDate(alert.timestamp)} · {formatTimestamp(alert.timestamp)}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-slate-500 text-xs">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, alerts.length)} of {alerts.length}
          </p>
          <div className="flex items-center gap-1">
            {/* First */}
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-2 py-1 rounded text-xs text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              «
            </button>
            {/* Prev */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page numbers */}
            {pageNumbers.map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-7 h-7 rounded text-xs font-medium transition-colors
                  ${n === page
                    ? 'bg-slate-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
              >
                {n}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {/* Last */}
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-2 py-1 rounded text-xs text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
