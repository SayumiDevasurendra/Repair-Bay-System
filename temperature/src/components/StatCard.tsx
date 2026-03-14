interface Props {
  label: string
  value: string
  subValue?: string
  icon: React.ReactNode
  colorClass: string
}

export default function StatCard({ label, value, subValue, icon, colorClass }: Props) {
  return (
    <div className={`bg-slate-800/60 border rounded-xl p-4 flex items-center gap-4 ${colorClass}`}>
      <div className={`p-3 rounded-lg bg-slate-700/50 ${colorClass}`}>{icon}</div>
      <div>
        <p className="text-slate-400 text-xs uppercase tracking-wider">{label}</p>
        <p className="text-white text-xl font-bold leading-tight">{value}</p>
        {subValue && <p className="text-slate-500 text-xs">{subValue}</p>}
      </div>
    </div>
  )
}
