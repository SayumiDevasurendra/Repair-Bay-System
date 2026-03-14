import { getThreshold } from '../types/temperature'

interface Props {
  temperature: number
}

const MIN_TEMP = 20
const MAX_TEMP = 85
const START_ANGLE = 225
const END_ANGLE = -45

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const s = polarToXY(cx, cy, r, startAngle)
  const e = polarToXY(cx, cy, r, endAngle)
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`
}

// Matches Arduino: Normal <50, WARNING 50-70, DANGER ≥70
const ZONES = [
  { min: 20, max: 50, color: '#22c55e' }, // Normal  — green
  { min: 50, max: 70, color: '#3b82f6' }, // WARNING — blue (matches Arduino blue LED)
  { min: 70, max: 85, color: '#ef4444' }, // DANGER  — red  (matches Arduino red LED)
]

function tempToAngle(temp: number) {
  const clamped = Math.max(MIN_TEMP, Math.min(MAX_TEMP, temp))
  const ratio = (clamped - MIN_TEMP) / (MAX_TEMP - MIN_TEMP)
  const totalArc = (START_ANGLE - END_ANGLE + 360) % 360 || 270
  return START_ANGLE - ratio * totalArc
}

export default function TemperatureGauge({ temperature }: Props) {
  const CX = 120
  const CY = 120
  const R = 90
  const threshold = getThreshold(temperature)
  const needleAngle = tempToAngle(temperature)
  const needle = polarToXY(CX, CY, R - 10, needleAngle)
  const isDanger = threshold.label === 'DANGER'

  return (
    <div className="flex flex-col items-center">
      <svg width="240" height="200" viewBox="0 0 240 200" className="overflow-visible">
        {/* Background track */}
        <path
          d={describeArc(CX, CY, R, START_ANGLE, END_ANGLE)}
          fill="none"
          stroke="#1e293b"
          strokeWidth="18"
          strokeLinecap="round"
        />

        {/* Colored zone arcs */}
        {ZONES.map((zone) => {
          const zoneStart = tempToAngle(zone.min)
          const zoneEnd = tempToAngle(zone.max)
          return (
            <path
              key={zone.color}
              d={describeArc(CX, CY, R, zoneStart, zoneEnd)}
              fill="none"
              stroke={zone.color}
              strokeWidth="18"
              strokeLinecap="butt"
              opacity="0.85"
            />
          )
        })}

        {/* Threshold marker lines at 50°C and 70°C */}
        {[50, 70].map((tick) => {
          const angle = tempToAngle(tick)
          const inner = polarToXY(CX, CY, R - 26, angle)
          const outer = polarToXY(CX, CY, R - 8, angle)
          return (
            <line key={tick} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
              stroke="#0f172a" strokeWidth="2.5" />
          )
        })}

        {/* Tick marks */}
        {[20, 35, 50, 60, 70, 80, 85].map((tick) => {
          const angle = tempToAngle(tick)
          const inner = polarToXY(CX, CY, R - 22, angle)
          const outer = polarToXY(CX, CY, R - 10, angle)
          const label = polarToXY(CX, CY, R - 34, angle)
          return (
            <g key={tick}>
              <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#64748b" strokeWidth="2" />
              <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" fill="#64748b" fontSize="9">
                {tick}°
              </text>
            </g>
          )
        })}

        {/* Needle */}
        <line
          x1={CX}
          y1={CY}
          x2={needle.x}
          y2={needle.y}
          stroke={threshold.color}
          strokeWidth="3"
          strokeLinecap="round"
          style={{ transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />
        <circle cx={CX} cy={CY} r="6" fill={threshold.color} />
        <circle cx={CX} cy={CY} r="3" fill="#0f172a" />

        {/* Center temperature display */}
        <text
          x={CX}
          y={CY + 30}
          textAnchor="middle"
          fill={threshold.color}
          fontSize="28"
          fontWeight="bold"
          style={{ transition: 'fill 0.5s' }}
          className={isDanger ? 'animate-pulse' : ''}
        >
          {temperature.toFixed(1)}°C
        </text>
        <text x={CX} y={CY + 50} textAnchor="middle" fill="#64748b" fontSize="11">
          {Math.round((temperature * 9) / 5 + 32)}°F
        </text>
      </svg>
    </div>
  )
}
