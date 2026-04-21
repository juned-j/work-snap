export const DashboardLayout = ({ children, email }: { children: React.ReactNode, email: string }) => {
  return (
    <div className="flex-1 flex flex-col h-screen bg-[#020617]">
      <header className="h-20 border-b border-slate-800/40 flex items-center justify-between px-8 bg-[#020617]/50 backdrop-blur-md sticky top-0 z-20 flex-shrink-0">
        <div>
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">System Monitoring</h2>
          <p className="text-sm font-bold text-white hidden md:block">Productivity Hub</p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-900/50 p-1.5 pr-4 rounded-full border border-slate-800">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-black shadow-lg">
            {email[0].toUpperCase()}
          </div>
          <span className="text-xs font-bold text-slate-300 hidden sm:block">{email}</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 custom-scrollbar">
        {children}
      </main>
    </div>
  );
};
