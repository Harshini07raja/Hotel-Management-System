import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Building2, Tag, Calendar, Users, UserCog,
  Sparkles, Receipt, BarChart2, Activity, Cpu, Settings,
  LogOut as LogOutIcon, Menu, X, ChevronDown, Shield
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  section?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Business Overview',  href: '/admin',                   icon: LayoutDashboard, section: 'BUSINESS' },
  { label: 'Hotels & Rooms',     href: '/admin/hotels',            icon: Building2,       section: 'BUSINESS' },
  { label: 'Pricing & Offers',   href: '/admin/pricing',           icon: Tag,             section: 'BUSINESS' },
  { label: 'Bookings',           href: '/admin/bookings',          icon: Calendar,        section: 'BUSINESS' },
  { label: 'Guests',             href: '/admin/guests',            icon: Users,           section: 'BUSINESS' },
  { label: 'Housekeeping',       href: '/admin/housekeeping',      icon: Sparkles,        section: 'OPERATIONS' },
  { label: 'Billing & Invoices', href: '/admin/billing',          icon: Receipt,         section: 'OPERATIONS' },
  { label: 'Reports',            href: '/admin/reports',           icon: BarChart2,       section: 'OPERATIONS' },
  { label: 'System Health',      href: '/admin/system-health',     icon: Activity,        section: 'ENGINEERING' },
  { label: 'System Design',      href: '/admin/system-design',     icon: Cpu,             section: 'ENGINEERING' },
  { label: 'Settings',           href: '/admin/settings',          icon: Settings,        section: 'ENGINEERING' },
];

const SECTIONS = ['BUSINESS', 'OPERATIONS', 'ENGINEERING'];
const SECTION_LABELS: Record<string, string> = {
  BUSINESS: 'Business',
  OPERATIONS: 'Operations',
  ENGINEERING: 'Engineering',
};

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const currentItem = [...NAV_ITEMS].reverse().find(item =>
    item.href === '/admin'
      ? location.pathname === '/admin'
      : location.pathname.startsWith(item.href)
  );
  const pageTitle = currentItem?.label ?? 'Admin';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-aurevia-gold rounded-lg flex items-center justify-center font-display text-lg font-bold text-aurevia-forest shrink-0">
            A
          </div>
          <div className="min-w-0">
            <p className="text-white font-display text-base leading-tight">Aurevia</p>
            <p className="text-aurevia-gold/60 text-[10px] uppercase tracking-widest">Management Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation grouped by section */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-4">
        {SECTIONS.map(section => {
          const items = NAV_ITEMS.filter(i => i.section === section);
          return (
            <div key={section}>
              <p className="text-[10px] font-bold text-white/25 uppercase tracking-widest px-3 mb-1">
                {SECTION_LABELS[section]}
              </p>
              <div className="space-y-0.5">
                {items.map(item => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      end={item.href === '/admin'}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-aurevia-gold/20 text-aurevia-gold'
                            : 'text-white/60 hover:text-white hover:bg-white/5'
                        }`
                      }
                    >
                      <Icon style={{ width: '16px', height: '16px' }} className="shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-2">
        {user && (
          <div className="bg-white/5 rounded-xl px-3 py-2.5 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.name?.charAt(0).toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-white/80 text-xs font-semibold truncate">{user.name}</p>
              <p className="text-white/40 text-[11px]">Administrator</p>
            </div>
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

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0f1f18] border-r border-white/5 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0f1f18] flex flex-col md:hidden transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <span className="text-white font-display">Admin Portal</span>
          <button onClick={() => setMobileOpen(false)} className="text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent />
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
            <Shield className="w-4 h-4 text-purple-600 shrink-0" />
            <h1 className="font-semibold text-slate-800 text-sm">{pageTitle}</h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:block text-xs text-slate-400 font-medium">{user?.name}</span>
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
              {user?.name?.charAt(0).toUpperCase() ?? 'A'}
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
