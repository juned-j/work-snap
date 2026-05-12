import { formatTime } from '../utils/formatters'

interface TimerCardProps {
  elapsedTime: number
  status: string
}

export const TimerCard = ({ elapsedTime, status }: TimerCardProps) => {
  return (
    <div className="w-full flex flex-col items-center gap-4">

      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl font-bold tracking-tight">
          Work<span className="text-indigo-500">Snap</span>
        </h1>

        <div className="mt-2 inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          <span
            className={`w-2 h-2 rounded-full ${
              status === 'active'
                ? 'bg-emerald-500 animate-pulse'
                : 'bg-slate-400'
            }`}
          ></span>

          <span className="text-xs font-medium text-slate-600">
            {status === 'active' ? 'Live' : 'Idle'}
          </span>
        </div>
      </div>

      {/* TIMER (main focus) */}
      <div className="w-full bg-white rounded-2xl px-6 py-6 border border-slate-200 text-center shadow-sm">
        
        <div className="text-2xl md:text-3xl font-mono font-semibold text-slate-900 tracking-tight">
          {formatTime(elapsedTime)}
        </div>

        <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-wide">
          Active Time
        </p>

      </div>
    </div>
  )
}