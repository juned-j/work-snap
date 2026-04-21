export const TrackingCard = ({ children, status, sessionId }: { children: React.ReactNode, status: string, sessionId?: any }) => {
  return (
    <div className="relative group lg:sticky lg:top-8">
      <div className={`absolute -inset-0.5 bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000`}></div>
      <div className="relative bg-slate-900/80 border border-slate-800/50 backdrop-blur-2xl rounded-[2rem] p-8 shadow-2xl overflow-hidden">
        
        {/* Status Badge */}
        <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 border border-white/5">
          <span className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]' : 'bg-slate-500'}`}></span>
          <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">{status}</span>
        </div>

        {children}

        {sessionId && (
          <div className="mt-8 pt-6 border-t border-slate-800/50 flex items-center justify-between">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              Session <span className="text-indigo-400 font-bold">#{sessionId.toString().slice(-6)}</span>
            </div>
            <div className="text-[10px] font-bold text-indigo-500/50 uppercase">Secured by WorkSnap</div>
          </div>
        )}
      </div>
    </div>
  );
};