import { Thermometer, TrendingDown, TrendingUp, Activity, Pause, Play, Wifi } from 'lucide-react'
import { useTemperatureData } from '../hooks/useTemperatureData'
import { calcStats, formatDate, formatTimestamp, toFahrenheit } from '../utils/temperatureUtils'
import { getThreshold } from '../types/temperature'
import TemperatureGauge from './TemperatureGauge'
import StatusBadge from './StatusBadge'
import TemperatureChart from './TemperatureChart'
import AlertPanel from './AlertPanel'
import StatCard from './StatCard'
import ThresholdTable from './ThresholdTable'
import LatestReading from './LatestReading'

export default function Dashboard() {
  const { current, history, alerts, paused, setPaused, clearAlerts, connected, isLive } =
    useTemperatureData()

  const stats     = calcStats(history)
  const threshold = getThreshold(current.temperature_c)
  const isDanger  = current.status === 'DANGER'
  const isWarning = current.status === 'WARNING'

  const headerIcon = isDanger ? 'text-red-400' : isWarning ? 'text-blue-400' : 'text-green-400'
  const headerBg   = isDanger ? 'bg-red-500/20' : isWarning ? 'bg-blue-500/20' : 'bg-green-500/20'

  return (
    <div className={`min-h-screen bg-slate-900 text-white transition-colors duration-500
      ${isDanger ? 'ring-4 ring-red-600 ring-inset' : ''}`}>

      {isDanger && (
        <div className="fixed inset-0 pointer-events-none z-10 animate-pulse bg-red-900/10" />
      )}

      {/* ── Header ── */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${headerBg}`}>
              <Thermometer className={`w-5 h-5 ${headerIcon}`} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white leading-tight">
                Repair Bay Temperature Monitor
              </h1>
              <p className="text-slate-500 text-xs">Smart Automotive Repair Bay · IT4021</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="relative flex h-2 w-2">
                {!paused && connected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2
                  ${paused ? 'bg-slate-500' : connected ? 'bg-green-500' : 'bg-red-500'}`} />
              </span>
              <span className={paused ? 'text-slate-500' : connected ? 'text-green-400' : 'text-red-400'}>
                {paused ? 'Paused' : isLive ? (connected ? 'Firebase · DS18B20' : 'Disconnected') : 'Demo Mode'}
              </span>
            </div>

            <button
              onClick={() => setPaused((p) => !p)}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 transition-colors rounded-lg px-3 py-1.5 text-sm"
            >
              {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              <span className="hidden sm:inline">{paused ? 'Resume' : 'Pause'}</span>
            </button>

            <div className="text-right hidden md:block">
              <p className="text-slate-400 text-xs">{formatDate(current.timestamp)}</p>
              <p className="text-slate-300 text-xs font-mono">{formatTimestamp(current.timestamp)}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">

        {/* ── Latest arrival banner ── */}
        <LatestReading reading={current} isLive={isLive} />

        {/* ── Gauge + Stats ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Gauge */}
          <div className={`bg-slate-800/60 border rounded-2xl p-6 flex flex-col items-center gap-4 transition-all duration-500
            ${isDanger ? 'border-red-500/60 shadow-red-900/40 shadow-2xl' : isWarning ? 'border-blue-500/40' : 'border-slate-700'}`}>
            <div className="flex items-center justify-between w-full">
              <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-wider">Gauge</h2>
              <Wifi className={`w-4 h-4 ${paused ? 'text-slate-600' : connected ? 'text-green-400' : 'text-red-400'}`} />
            </div>
            <TemperatureGauge temperature={current.temperature_c} />
            <StatusBadge status={current.status} large />
            {isLive && <p className="text-slate-600 text-xs">Arduino uploads every 60 s</p>}
          </div>

          {/* Stats */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                label="Current"
                value={`${current.temperature_c.toFixed(1)}°C`}
                subValue={`${toFahrenheit(current.temperature_c)}°F`}
                icon={<Thermometer className="w-5 h-5" style={{ color: threshold.color }} />}
                colorClass={isDanger ? 'border-red-500/30' : isWarning ? 'border-blue-500/30' : 'border-green-500/30'}
              />
              <StatCard
                label="Min (all readings)"
                value={`${stats.min.toFixed(1)}°C`}
                subValue={`${toFahrenheit(stats.min)}°F`}
                icon={<TrendingDown className="w-5 h-5 text-cyan-400" />}
                colorClass="border-cyan-500/30"
              />
              <StatCard
                label="Max (all readings)"
                value={`${stats.max.toFixed(1)}°C`}
                subValue={`${toFahrenheit(stats.max)}°F`}
                icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
                colorClass="border-purple-500/30"
              />
            </div>

            <StatCard
              label="Average (all readings)"
              value={`${stats.avg.toFixed(1)}°C`}
              subValue={`Total readings: ${history.length}`}
              icon={<Activity className="w-5 h-5 text-slate-400" />}
              colorClass="border-slate-600/30"
            />

            <ThresholdTable />
          </div>
        </div>

        {/* ── History chart (all DB data) ── */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-white font-semibold">Temperature History</h2>
              <p className="text-slate-500 text-xs mt-0.5">All readings from Firebase database</p>
            </div>
            <span className="text-slate-500 text-xs">{history.length} readings</span>
          </div>
          <TemperatureChart history={history} />
        </div>

        {/* ── Alert log ── */}
        <AlertPanel alerts={alerts} onClear={clearAlerts} />

        <footer className="text-center text-slate-600 text-xs pb-2">
          VAUED · Smart Automotive Repair Bay · IT4021 Group Assignment
        </footer>
      </main>
    </div>
  )
}
