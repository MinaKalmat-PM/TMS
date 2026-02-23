
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'loads', label: 'Loads', icon: '📦' },
    { id: 'fleet', label: 'Fleet', icon: '🚛' },
    { id: 'drivers', label: 'Drivers', icon: '👤' },
    { id: 'orientation', label: 'Orientation AI', icon: '🎓' },
    { id: 'reminders', label: 'Reminders', icon: '🔔' },
    { id: 'accounting', label: 'Accounting', icon: '💰' },
    { id: 'vault', label: 'Reports Vault', icon: '📂' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'schema', label: 'System Schema', icon: '📋' },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="text-blue-500">Swift</span>Link TMS
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold">SL</div>
            <div>
              <p className="text-sm font-medium">Ops Manager</p>
              <p className="text-xs text-slate-500">Fleet HQ</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-slate-800 capitalize">{activeTab.replace(/([A-Z])/g, ' $1').trim()}</h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600">🔔</button>
            <div className="h-8 w-px bg-slate-200"></div>
            <span className="text-sm font-bold text-slate-600">May 20, 2024</span>
          </div>
        </header>
        <div className="p-8 flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
