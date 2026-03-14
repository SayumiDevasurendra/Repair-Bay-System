import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import type { TemperatureReading } from '../types/temperature'
import { formatTimestamp } from '../utils/temperatureUtils'

interface Props {
  history: TemperatureReading[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const temp = payload[0].value as number
    const getColor = (t: number) =>
      t >= 70 ? '#ef4444' : t >= 50 ? '#3b82f6' : '#22c55e'
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl">
        <p className="text-slate-400 text-xs mb-1">{label}</p>
        <p className="font-bold text-sm" style={{ color: getColor(temp) }}>
          {temp.toFixed(1)}°C
        </p>
        <p className="text-slate-400 text-xs">{Math.round((temp * 9) / 5 + 32)}°F</p>
      </div>
    )
  }
  return null
}

function getGradientColor(temp: number) {
  if (temp >= 70) return '#ef4444'
  if (temp >= 50) return '#3b82f6'
  return '#22c55e'
}

type Filter = 'all' | 'alerts'

export default function TemperatureChart({ history }: Props) {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = filter === 'alerts'
    ? history.filter((r) => r.status === 'WARNING' || r.status === 'DANGER')
    : history

  const data = filtered.map((r) => ({
    time: formatTimestamp(r.timestamp),
    temp: r.temperature_c,
  }))

  const latestTemp = filtered[filtered.length - 1]?.temperature_c ?? 28
  const lineColor = getGradientColor(latestTemp)

  return (
    <div className="flex flex-col gap-3">
      {/* Filter toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            filter === 'all'
              ? 'bg-slate-600 border-slate-500 text-white'
              : 'bg-transparent border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
          }`}
        >
          All readings
        </button>
        <button
          onClick={() => setFilter('alerts')}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            filter === 'alerts'
              ? 'bg-slate-600 border-slate-500 text-white'
              : 'bg-transparent border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
          }`}
        >
          Warning &amp; Danger only
        </button>
        <span className="ml-auto text-slate-500 text-xs">{filtered.length} readings</span>
      </div>

      {filtered.length === 0 ? (
        <div className="h-52 flex items-center justify-center text-slate-500 text-sm">
          No warning or danger readings recorded
        </div>
      ) : (
        <div className="w-full h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={lineColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="time"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[20, 90]}
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}°`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={50} stroke="#3b82f6" strokeDasharray="4 4" strokeOpacity={0.6} label={{ value: 'WARNING 50°', fill: '#3b82f6', fontSize: 9, position: 'insideTopRight' }} />
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.6} label={{ value: 'DANGER 70°', fill: '#ef4444', fontSize: 9, position: 'insideTopRight' }} />
              <Area
                type="monotone"
                dataKey="temp"
                stroke={lineColor}
                strokeWidth={2}
                fill="url(#tempGradient)"
                dot={false}
                activeDot={{ r: 4, fill: lineColor }}
                animationDuration={300}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
