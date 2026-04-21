import { formatTime } from '../utils/formatters'
interface TimerCardProps {
  elapsedTime: number;
  status: string;
}

export const TimerCard = ({ elapsedTime, status }: TimerCardProps) => {
  return (
    <>
      {/* App Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black tracking-tighter italic">
          Work<span className="text-indigo-500">Snap</span> 🚀
        </h1>
        <div className="mt-4 inline-flex items-center gap-2 bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700">
          <span className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
            {status === 'active' ? 'Live Tracking' : 'Not Active'}
          </span>
        </div>
      </div>

      {/* Timer Box */}
      <div className="bg-slate-950/50 rounded-3xl p-8 border border-slate-800/50 mb-8 text-center">
        <div className="text-6xl font-mono font-bold tracking-tight text-indigo-100">
          {formatTime(elapsedTime)}
        </div>
        <p className="text-slate-500 text-[11px] mt-2 font-bold uppercase tracking-widest">Total Active Time</p>
      </div>
    </>
  )
}