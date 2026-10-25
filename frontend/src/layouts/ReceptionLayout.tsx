import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Location } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import {
  LayoutDashboard, LogIn, LogOut as LogOutIcon, Calendar, Search,
  BedDouble, DollarSign, ChevronLeft, ChevronRight, Clock, Menu, Hotel
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',           href: '/staff/reception',              icon: LayoutDashboard },
  { label: "Today's Arrivals",    href: '/staff/reception/arrivals',     icon: LogIn },
  { label: "Today's Departures",  href: '/staff/reception/departures',   icon: LogOutIcon },
  { label: 'All Reservations',    href: '/staff/reception/reservations', icon: Calendar },
  { label: 'Guest Lookup',        href: '/staff/reception/guests',       icon: Search },
  { label: 'Room Availability',   href: '/staff/reception/rooms',        icon: BedDouble },
  { label: 'Billing & Payments',  href: '/staff/reception/billing',      icon: DollarSign },
];

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="text-center">
      <div className="font-mono text-sm text-white/80 tabular-nums">
        {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </div>
      <div className="text-white/40 text-[11px] mt-0.5">
        {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
      </div>
    </div>
  );
}

interface ReceptionSidebarContentProps {
  collapsed: boolean;
  user: User | null;
  location: Location;
  setMobileOpen: (open: boolean) => void;
  handleLogout: () => void;
}

const ReceptionSidebarContent: React.FC<ReceptionSidebarContentProps> = ({
  collapsed,
  user,
  location,
  setMobileOpen,
  handleLogout,
}) => (
  <div className="flex flex-col h-full">
    {/* Brand header */}
    <div className="px-4 py-5 border-b border-white/10 flex items-center gap-3">
      <div className="w-9 h-9 bg-aurevia-gold rounded-lg flex items-center justify-center font-display text-lg font-bold text-aurevia-forest shrink-0">
        A
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p className="text-white font-display text-base leading-tight">Aurevia</p>
          <p className="text-aurevia-gold/60 text-[10px] uppercase tracking-widest">Front Desk</p>
        </div>
      )}
    </div>

    {/* Navigation */}
    <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
      {NAV_ITEMS.map(item => {
        const Icon = item.icon;
        const isActive = collapsed
          ? location.pathname === item.href
          : location.pathname === item.href || (item.href !== '/staff/reception' && location.pathname.startsWith(item.href));

        return (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/staff/reception'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive: na }) => {
              const active = na || isActive;
              return `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? 'bg-aurevia-gold/20 text-aurevia-gold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`;
            }}
            title={collapsed ? item.label : undefined}
          >
            <Icon className={`shrink-0 ${collapsed ? 'mx-auto' : ''}`} style={{ width: '18px', height: '18px' }} />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        );
      })}
    </nav>

    {/* Footer */}
    <div className="px-3 py-4 border-t border-white/10 space-y-3">
      {!collapsed && <LiveClock />}

      {!collapsed && user && (
        <div className="bg-white/5 rounded-xl px-3 py-2.5">
          <p className="text-white/80 text-xs font-semibold truncate">{user.name}</p>
          <p className="text-white/40 text-[11px] mt-0.5">Receptionist</p>
        </div>
      )}

      <button
        onClick={handleLogout}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-white/50 hover:text-rose-400 hover:bg-rose-500/10 text-sm transition-all"
        title={collapsed ? 'Logout' : undefined}
      >
        <LogOutIcon className="shrink-0" style={{ width: '16px', height: '16px' }} />
        {!collapsed && 'Logout'}
      </button>
    </div>
  </div>
);

export const ReceptionLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Find current page title
  const currentItem = [...NAV_ITEMS].reverse().find(item =>
    location.pathname === item.href || location.pathname.startsWith(item.href + '/')
  );
  const pageTitle = currentItem?.label ?? 'Reception';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop sidebar with relative wrapper for clean collapse toggle */}
      <div className="relative hidden md:flex shrink-0">
        <aside
          className={`flex flex-col bg-aurevia-forest border-r border-white/10 transition-all duration-300 ${
            collapsed ? 'w-16' : 'w-60'
          }`}
        >
          <ReceptionSidebarContent
            collapsed={collapsed}
            user={user}
            location={location}
            setMobileOpen={setMobileOpen}
            handleLogout={handleLogout}
          />
        </aside>
        {/* Collapse toggle — anchored to right edge of the sidebar */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-aurevia-forest border border-white/30 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:border-white/60 transition z-10 shadow-md"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-aurevia-forest flex flex-col md:hidden transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <ReceptionSidebarContent
          collapsed={false}
          user={user}
          location={location}
          setMobileOpen={setMobileOpen}
          handleLogout={handleLogout}
        />
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-4 shrink-0">
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <Hotel className="w-4 h-4 text-aurevia-forest shrink-0" />
            <h1 className="font-semibold text-slate-800 text-sm truncate">{pageTitle}</h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:block text-xs text-slate-400 font-medium">
              {user?.name}
            </span>
            <div className="w-8 h-8 rounded-full bg-aurevia-gold text-aurevia-forest text-xs font-bold flex items-center justify-center">
              {user?.name?.charAt(0).toUpperCase() ?? 'R'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
