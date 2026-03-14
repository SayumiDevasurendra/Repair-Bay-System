import { THRESHOLDS } from '../types/temperature'

const ROWS = [
  { range: '< 50°C',    led: 'Green LED',  desc: 'Garage environment is safe',         ...THRESHOLDS[0] },
  { range: '50 – 70°C', led: 'Blue LED',   desc: 'High temperature — inspect garage',  ...THRESHOLDS[1] },
  { range: '≥ 70°C',    led: 'Red LED + Buzzer', desc: 'Danger — take immediate action', ...THRESHOLDS[2] },
]

export default function ThresholdTable() {
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
      <h3 className="text-white font-semibold mb-3">Temperature Thresholds</h3>
      <div className="flex flex-col gap-2">
        {ROWS.map((row) => (
          <div
            key={row.label}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 border ${row.bgColor} ${row.borderColor}/30`}
          >
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
            <div className="flex-1 min-w-0">
              <span className={`text-sm font-semibold ${row.textColor}`}>{row.label}</span>
              <span className="text-slate-500 text-xs ml-2">{row.range}</span>
            </div>
            <span className="text-slate-500 text-xs hidden sm:block">{row.led}</span>
            <span className="text-slate-400 text-xs hidden md:block">{row.desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
