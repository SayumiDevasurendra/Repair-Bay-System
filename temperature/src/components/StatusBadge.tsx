import { Flame, AlertCircle, ShieldCheck } from 'lucide-react'
import type { TempStatus } from '../types/temperature'

interface Props {
  status: TempStatus
  large?: boolean
}

const icons: Record<TempStatus, React.ReactNode> = {
  Normal:  <ShieldCheck className="w-5 h-5" />,
  WARNING: <AlertCircle className="w-5 h-5" />,
  DANGER:  <Flame className="w-5 h-5" />,
}

// Yellow LED = WARNING, Red LED = DANGER (matches Arduino hardware)
const classMap: Record<TempStatus, string> = {
  Normal:  'border-green-500  text-green-400  bg-green-500/10',
  WARNING: 'border-yellow-500 text-yellow-400 bg-yellow-500/10',
  DANGER:  'border-red-500    text-red-400    bg-red-500/10',
}

export default function StatusBadge({ status, large }: Props) {
  const pulse = status === 'DANGER' ? 'animate-pulse' : ''

  return (
    <span
      className={`inline-flex items-center gap-2 border rounded-full font-semibold tracking-wide
        ${classMap[status]} ${pulse}
        ${large ? 'px-5 py-2 text-base' : 'px-3 py-1 text-sm'}`}
    >
      {icons[status]}
      {status}
    </span>
  )
}
