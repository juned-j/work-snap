// Manual SVG Icons to prevent Hook Errors
const SidebarIcons = {
  Dashboard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="15" rx="1"/></svg>,
  Activity: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Logout: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  Zap: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
}

export const Sidebar = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <aside className="w-20 lg:w-64 border-r border-slate-800/60 bg-[#020617] flex flex-col p-6 h-screen overflow-y-auto flex-shrink-0 custom-scrollbar">
      <div className="flex items-center gap-3 mb-10 px-2 text-indigo-500">
        <SidebarIcons.Zap />
        <span className="text-xl font-bold hidden lg:block tracking-tighter text-white">WorkSnap</span>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto">
        <NavItem icon={<SidebarIcons.Dashboard />} label="Dashboard" active />
        <NavItem icon={<SidebarIcons.Activity />} label="Insights" />
        <NavItem icon={<SidebarIcons.Settings />} label="Settings" />
      </nav>

      <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 transition-colors flex-shrink-0">
        <SidebarIcons.Logout />
        <span className="font-bold text-xs uppercase tracking-widest hidden lg:block">Logout</span>
      </button>
    </aside>
  );
};


const NavItem = ({ icon, label, active = false }: { icon: any; label: string; active?: boolean }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-indigo-500/10 text-indigo-400' : 'text-slate-500 hover:text-slate-200'}`}>
    {icon}
    <span className="font-bold text-sm hidden lg:block">{label}</span>
  </div>
);