import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Location } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import api from '../api/client';
import {
  LayoutDashboard, Sparkles, RefreshCw, CheckSquare, AlertTriangle,
  History, LogOut as LogOutIcon, Menu, Wrench
} from 'lucide-react';

interface TaskCounts {
  total: number;
  dirty: number;
  cleaning: number;
  clean: number;
  inspection: number;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  countKey?: keyof TaskCounts;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'My Tasks',       href: '/staff/housekeeping',              icon: LayoutDashboard },
  { label: 'Rooms to Clean', href: '/staff/housekeeping/to-clean',     icon: AlertTriangle,  countKey: 'dirty' },
  { label: 'In Progress',    href: '/staff/housekeeping/in-progress',  icon: RefreshCw,      countKey: 'cleaning' },
  { label: 'Clean & Ready',  href: '/staff/housekeeping/clean',        icon: CheckSquare,    countKey: 'clean' },
  { label: 'Maintenance',    href: '/staff/housekeeping/maintenance',  icon: Wrench },
  { label: 'History',        href: '/staff/housekeeping/history',      icon: History },
];

const STATUS_COLORS: Record<string, string> = {
  dirty: 'bg-rose-500',
  cleaning: 'bg-amber-500',
  clean: 'bg-emerald-500',
  inspection: 'bg-blue-500',
};

interface HousekeepingSidebarContentProps {
  user: User | null;
  counts: TaskCounts;
  location: Location;
  setMobileOpen: (open: boolean) => void;
  handleLogout: () => void;
}

const HousekeepingSidebarContent: React.FC<HousekeepingSidebarContentProps> = ({
  user,
  counts,
  location,
  setMobileOpen,
  handleLogout,
}) => (
  <div className="flex flex-col h-full">
    {/* Brand header */}
    <div className="px-4 py-5 border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-aurevia-gold rounded-lg flex items-center justify-center font-display text-lg font-bold text-aurevia-forest shrink-0">
          A
        </div>
        <div className="min-w-0">
          <p className="text-white font-display text-base leading-tight">Aurevia</p>
          <p className="text-aurevia-gold/60 text-[10px] uppercase tracking-widest">Housekeeping</p>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex gap-2 mt-4 flex-wrap">
        {[
          { label: 'Dirty',  count: counts.dirty,   color: 'bg-rose-500' },
          { label: 'Active', count: counts.cleaning, color: 'bg-amber-500' },
          { label: 'Done',   count: counts.clean,    color: 'bg-emerald-500' },
        ].map(b => (
          <div key={b.label} className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2 py-1">
            <span className={`w-2 h-2 rounded-full ${b.color}`} />
            <span className="text-white/70 text-[11px] font-medium">{b.count} {b.label}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Navigation */}
    <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
      {NAV_ITEMS.map(item => {
        const Icon = item.icon;
        const count = item.countKey ? counts[item.countKey] : 0;

        return (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/staff/housekeeping'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-aurevia-gold/20 text-aurevia-gold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon style={{ width: '18px', height: '18px' }} className="shrink-0" />
            <span className="flex-1 truncate">{item.label}</span>
            {item.countKey && count > 0 && (
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full text-white ${STATUS_COLORS[item.countKey] || 'bg-slate-500'}`}>
                {count}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>

    {/* Footer */}
    <div className="px-3 py-4 border-t border-white/10 space-y-2">
      {user && (
        <div className="bg-white/5 rounded-xl px-3 py-2.5">
          <p className="text-white/80 text-xs font-semibold truncate">{user.name}</p>
          <p className="text-white/40 text-[11px] mt-0.5">Housekeeping Staff</p>
        </div>
      )}
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-white/50 hover:text-rose-400 hover:bg-rose-500/10 text-sm transition-all"
      >
        <LogOutIcon style={{ width: '16px', height: '16px' }} className="shrink-0" />
        Logout
      </button>
    </div>
  </div>
);

export const HousekeepingLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [counts, setCounts] = useState<TaskCounts>({ total: 0, dirty: 0, cleaning: 0, clean: 0, inspection: 0 });

  const fetchCounts = useCallback(() => {
    api.get('/api/v1/housekeeping/tasks')
      .then(res => {
        const tasks: any[] = Array.isArray(res.data) ? res.data : [];
        setCounts({
          total: tasks.length,
          dirty: tasks.filter(t => t.status === 'DIRTY').length,
          cleaning: tasks.filter(t => t.status === 'CLEANING').length,
          clean: tasks.filter(t => t.status === 'CLEAN' || t.status === 'INSPECTION').length,
          inspection: tasks.filter(t => t.status === 'INSPECTION').length,
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const currentItem = [...NAV_ITEMS].reverse().find(item =>
    location.pathname === item.href || location.pathname.startsWith(item.href + '/')
  );
  const pageTitle = currentItem?.label ?? 'Housekeeping';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-aurevia-forest border-r border-white/10 shrink-0">
        <HousekeepingSidebarContent
          user={user}
          counts={counts}
          location={location}
          setMobileOpen={setMobileOpen}
          handleLogout={handleLogout}
        />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-aurevia-forest flex flex-col md:hidden transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <HousekeepingSidebarContent
          user={user}
          counts={counts}
          location={location}
          setMobileOpen={setMobileOpen}
          handleLogout={handleLogout}
        />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-4 shrink-0">
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-aurevia-forest shrink-0" />
            <h1 className="font-semibold text-slate-800 text-sm">{pageTitle}</h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:block text-xs text-slate-400 font-medium">{user?.name}</span>
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
              {user?.name?.charAt(0).toUpperCase() ?? 'H'}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
