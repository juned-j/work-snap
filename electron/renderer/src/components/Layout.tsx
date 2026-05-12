export const DashboardLayout = ({
  children,
  name,
  email
}: {
  children: React.ReactNode
  name?: string
  email: string
}) => {

  const displayName = name || email

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-100">
      <header className="h-20 border-b border-slate-200 flex items-center justify-between px-8 bg-white shadow-sm sticky top-0 z-20 flex-shrink-0">
        <div>
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">
            System Monitoring
          </h2>

          <p className="text-sm font-bold text-slate-800 hidden md:block">
            Productivity Hub
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-100 p-1.5 pr-4 rounded-full border border-slate-200">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-black shadow-sm text-white">
            {displayName?.[0]?.toUpperCase()}
          </div>

          <span className="text-xs font-bold text-slate-700 hidden sm:block">
            {displayName}
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 custom-scrollbar">
        {children}
      </main>
    </div>
  )
}