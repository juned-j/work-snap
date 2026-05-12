export const TrackingCard = ({
  children,
  status,
}: {
  children: React.ReactNode
  status: string
}) => {
  return (
    <div className="relative group lg:sticky lg:top-8">
      <div
        className={`absolute -inset-0.5 bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000`}
      ></div>

      <div className="relative bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm overflow-hidden">
        
        {/* Status Badge */}
        <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200">
          <span
            className={`w-2 h-2 rounded-full ${
              status === 'active'
                ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.35)]'
                : 'bg-slate-400'
            }`}
          ></span>

          <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
            {status}
          </span>
        </div>

        {children}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-end">
          <div className="text-[10px] font-bold text-slate-400 uppercase">
            Secured by WorkSnap
          </div>
        </div>
      </div>
    </div>
  )
}