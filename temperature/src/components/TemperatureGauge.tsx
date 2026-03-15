import { getThreshold } from '../types/temperature'

interface Props {
  temperature: number
}

const MIN_TEMP = 20
const MAX_TEMP = 85

// Thermometer SVG layout constants
const TUBE_X = 60
const TUBE_TOP = 20
const TUBE_BOTTOM = 200
const TUBE_HEIGHT = TUBE_BOTTOM - TUBE_TOP
const TUBE_WIDTH = 18
const BULB_CY = 224
const BULB_R = 22

const ZONE_COLORS = [
  { min: 20, max: 50, color: '#22c55e' },
  { min: 50, max: 70, color: '#eab308' },
  { min: 70, max: 85, color: '#ef4444' },
]

function tempToY(temp: number): number {
  const clamped = Math.max(MIN_TEMP, Math.min(MAX_TEMP, temp))
  const ratio = (clamped - MIN_TEMP) / (MAX_TEMP - MIN_TEMP)
  return TUBE_BOTTOM - ratio * TUBE_HEIGHT
}

const TICK_MARKS = [20, 30, 40, 50, 60, 70, 80, 85]

export default function TemperatureGauge({ temperature }: Props) {
  const threshold = getThreshold(temperature)
  const fillY = tempToY(temperature)
  const fillHeight = TUBE_BOTTOM - fillY
  const isDanger = threshold.label === 'DANGER'

  return (
    <div className="flex flex-col items-center">
      <svg width="160" height="280" viewBox="0 0 160 280" className="overflow-visible">
        <defs>
          {/* Glass tube gradient */}
          <linearGradient id="tubeGlass" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#334155" stopOpacity="0.6" />
            <stop offset="30%" stopColor="#475569" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#1e293b" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.8" />
          </linearGradient>

          {/* Mercury fill gradient */}
          <linearGradient id="mercuryFill" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={threshold.color} stopOpacity="0.7" />
            <stop offset="50%" stopColor={threshold.color} stopOpacity="1" />
            <stop offset="100%" stopColor={threshold.color} stopOpacity="0.6" />
          </linearGradient>

          {/* Bulb gradient */}
          <radialGradient id="bulbGrad" cx="40%" cy="40%">
            <stop offset="0%" stopColor={threshold.color} stopOpacity="1" />
            <stop offset="100%" stopColor={threshold.color} stopOpacity="0.7" />
          </radialGradient>

          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Clip to tube interior */}
          <clipPath id="tubeClip">
            <rect
              x={TUBE_X - TUBE_WIDTH / 2 + 3}
              y={TUBE_TOP}
              width={TUBE_WIDTH - 6}
              height={TUBE_HEIGHT + BULB_R}
            />
          </clipPath>
        </defs>

        {/* Zone color bands behind tube */}
        {ZONE_COLORS.map((zone) => {
          const y1 = tempToY(zone.max)
          const y2 = tempToY(zone.min)
          return (
            <rect
              key={zone.color}
              x={TUBE_X + TUBE_WIDTH / 2 + 4}
              y={y1}
              width={6}
              height={y2 - y1}
              fill={zone.color}
              opacity="0.5"
              rx="2"
            />
          )
        })}

        {/* Tube background (dark track) */}
        <rect
          x={TUBE_X - TUBE_WIDTH / 2}
          y={TUBE_TOP}
          width={TUBE_WIDTH}
          height={TUBE_HEIGHT}
          rx={TUBE_WIDTH / 2}
          fill="#1e293b"
          stroke="#334155"
          strokeWidth="1.5"
        />

        {/* Mercury fill */}
        <rect
          x={TUBE_X - TUBE_WIDTH / 2 + 3}
          y={fillY}
          width={TUBE_WIDTH - 6}
          height={fillHeight}
          fill="url(#mercuryFill)"
          clipPath="url(#tubeClip)"
          style={{ transition: 'y 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          filter={isDanger ? 'url(#glow)' : undefined}
        />

        {/* Glass overlay on tube */}
        <rect
          x={TUBE_X - TUBE_WIDTH / 2}
          y={TUBE_TOP}
          width={TUBE_WIDTH}
          height={TUBE_HEIGHT}
          rx={TUBE_WIDTH / 2}
          fill="url(#tubeGlass)"
          stroke="#475569"
          strokeWidth="1"
        />

        {/* Glass shine */}
        <rect
          x={TUBE_X - TUBE_WIDTH / 2 + 3}
          y={TUBE_TOP + 4}
          width={4}
          height={TUBE_HEIGHT - 8}
          rx="2"
          fill="white"
          opacity="0.12"
        />

        {/* Bulb body */}
        <circle cx={TUBE_X} cy={BULB_CY} r={BULB_R} fill="#1e293b" stroke="#334155" strokeWidth="1.5" />

        {/* Mercury in bulb */}
        <circle
          cx={TUBE_X}
          cy={BULB_CY}
          r={BULB_R - 4}
          fill="url(#bulbGrad)"
          filter={isDanger ? 'url(#glow)' : undefined}
          style={{ transition: 'fill 0.5s' }}
          className={isDanger ? 'animate-pulse' : ''}
        />

        {/* Bulb glass shine */}
        <circle cx={TUBE_X - 7} cy={BULB_CY - 7} r={5} fill="white" opacity="0.15" />

        {/* Tick marks and labels */}
        {TICK_MARKS.map((tick) => {
          const y = tempToY(tick)
          const isMajor = tick % 10 === 0
          return (
            <g key={tick}>
              <line
                x1={TUBE_X + TUBE_WIDTH / 2}
                y1={y}
                x2={TUBE_X + TUBE_WIDTH / 2 + (isMajor ? 10 : 6)}
                y2={y}
                stroke={isMajor ? '#94a3b8' : '#475569'}
                strokeWidth={isMajor ? 1.5 : 1}
              />
              {isMajor && (
                <text
                  x={TUBE_X + TUBE_WIDTH / 2 + 14}
                  y={y}
                  dominantBaseline="middle"
                  fill="#64748b"
                  fontSize="9"
                >
                  {tick}°
                </text>
              )}
            </g>
          )
        })}

        {/* Threshold labels */}
        <text x={TUBE_X - TUBE_WIDTH / 2 - 6} y={tempToY(50)} dominantBaseline="middle" textAnchor="end" fill="#eab308" fontSize="8" opacity="0.8">50°</text>
        <text x={TUBE_X - TUBE_WIDTH / 2 - 6} y={tempToY(70)} dominantBaseline="middle" textAnchor="end" fill="#ef4444" fontSize="8" opacity="0.8">70°</text>

        {/* Temperature readout */}
        <text
          x={TUBE_X + 55}
          y={140}
          textAnchor="middle"
          fill={threshold.color}
          fontSize="26"
          fontWeight="bold"
          style={{ transition: 'fill 0.5s' }}
          className={isDanger ? 'animate-pulse' : ''}
        >
          {temperature.toFixed(1)}°C
        </text>
        <text x={TUBE_X + 55} y={164} textAnchor="middle" fill="#64748b" fontSize="11">
          {Math.round((temperature * 9) / 5 + 32)}°F
        </text>
      </svg>
    </div>
  )
}
