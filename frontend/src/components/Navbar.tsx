import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Bell, User, LogOut, ChevronDown, Menu, X, Shield } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, quickSwitchRole } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const userMenuRef = useRef<HTMLDivElement>(null);
  const demoMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
      if (demoMenuRef.current && !demoMenuRef.current.contains(target)) {
        setDemoMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unread notifications count when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      api.get('/api/v1/notifications')
        .then((res) => {
          if (Array.isArray(res.data)) {
            const unread = res.data.filter((n: any) => !n.read).length;
            setUnreadCount(unread);
          }
        })
        .catch(() => setUnreadCount(0));
    } else {
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const handleDemoSwitch = async (role: 'GUEST' | 'RECEPTIONIST' | 'HOUSEKEEPING' | 'ADMIN') => {
    setDemoMenuOpen(false);
    await quickSwitchRole(role);
    if (role === 'RECEPTIONIST') {
      navigate('/staff/reception');
    } else if (role === 'HOUSEKEEPING') {
      navigate('/staff/housekeeping');
    } else if (role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/my-account/bookings');
    }
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Explore Hotels', href: '/hotels' },
    { label: 'Offers', href: '/offers' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const truncatedName = user?.name
    ? user.name.length > 16
      ? `${user.name.slice(0, 16)}…`
      : user.name
    : 'Account';

  return (
    <header className="bg-aurevia-forest sticky top-0 z-50 shadow-md border-b border-white/10">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* LOGO (left): Link to '/' */}
        <Link to="/" className="flex items-center" onClick={() => setMobileOpen(false)}>
          <div className="w-[38px] h-[38px] rounded-lg bg-aurevia-gold text-aurevia-forest flex items-center justify-center font-display text-xl font-bold mr-3 shadow-sm select-none">
            A
          </div>
          <div>
            <span className="font-display text-white text-lg font-semibold block leading-tight">
              Aurevia
            </span>
            <span className="text-aurevia-gold/70 text-[11px] block -mt-0.5 tracking-wide">
              Hotels &amp; Resorts
            </span>
          </div>
        </Link>

        {/* NAV LINKS (center, hidden md:flex gap-1) */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-white/80 hover:text-aurevia-gold text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="text-white/80 hover:text-aurevia-gold text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-aurevia-gold text-aurevia-forest text-sm font-semibold px-4 py-2 rounded-lg hover:bg-aurevia-gold-dark transition"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {/* Notification bell */}
              <Link
                to="/my-account/notifications"
                className="relative p-2 text-white/70 hover:text-aurevia-gold rounded-lg hover:bg-white/5 transition"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Role-specific quick link */}
              {user?.role === 'RECEPTIONIST' && (
                <Link
                  to="/staff/reception"
                  className="bg-emerald-700/80 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition font-medium"
                >
                  Front Desk
                </Link>
              )}
              {user?.role === 'HOUSEKEEPING' && (
                <Link
                  to="/staff/housekeeping"
                  className="bg-amber-700/80 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-amber-600 transition font-medium"
                >
                  Housekeeping
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="bg-purple-700/80 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-purple-600 transition font-medium"
                >
                  Admin Panel
                </Link>
              )}

              {/* User dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-white/90 hover:text-white hover:bg-white/5 border border-white/10 transition"
                  aria-expanded={userMenuOpen}
                >
                  <User className="w-4 h-4 text-aurevia-gold" />
                  <span className="font-medium max-w-[120px] sm:max-w-none truncate">{truncatedName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-white/60 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-aurevia-forest border border-white/10 rounded-xl shadow-xl py-2 z-50 text-sm">
                    {/* User info header */}
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-white font-semibold truncate">{user?.name}</p>
                      <p className="text-xs text-white/60 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-aurevia-gold/20 text-aurevia-gold border border-aurevia-gold/30">
                        {user?.role}
                      </span>
                    </div>

                    {/* Role-specific menu options */}
                    {user?.role === 'GUEST' && (
                      <div className="py-1">
                        <Link
                          to="/my-account/bookings"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-white/80 hover:text-aurevia-gold hover:bg-white/5 transition"
                        >
                          My Bookings
                        </Link>
                        <Link
                          to="/my-account/profile"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-white/80 hover:text-aurevia-gold hover:bg-white/5 transition"
                        >
                          My Profile
                        </Link>
                        <div className="my-1 border-t border-white/10" />
                      </div>
                    )}

                    {(user?.role === 'RECEPTIONIST' || user?.role === 'HOUSEKEEPING') && (
                      <div className="py-1">
                        <Link
                          to={user?.role === 'RECEPTIONIST' ? '/staff/reception' : '/staff/housekeeping'}
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-white/80 hover:text-aurevia-gold hover:bg-white/5 transition"
                        >
                          {user?.role === 'RECEPTIONIST' ? 'Front Desk Dashboard' : 'Housekeeping Dashboard'}
                        </Link>
                        <div className="my-1 border-t border-white/10" />
                      </div>
                    )}

                    {user?.role === 'ADMIN' && (
                      <div className="py-1">
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-white/80 hover:text-aurevia-gold hover:bg-white/5 transition"
                        >
                          Business Dashboard
                        </Link>
                        <Link
                          to="/admin/system-design"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-white/80 hover:text-aurevia-gold hover:bg-white/5 transition"
                        >
                          System Design
                        </Link>
                        <div className="my-1 border-t border-white/10" />
                      </div>
                    )}

                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-rose-400 hover:text-rose-300 hover:bg-white/5 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/5 transition ml-1"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden bg-aurevia-forest-dark border-t border-white/10 px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-white/80 hover:text-aurevia-gold text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5 transition"
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-2 border-t border-white/10 space-y-2">
            {!isAuthenticated ? (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center text-white/80 hover:text-aurevia-gold text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5 transition border border-white/10"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center bg-aurevia-gold text-aurevia-forest text-sm font-semibold px-4 py-2 rounded-lg hover:bg-aurevia-gold-dark transition"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="px-3 py-2 bg-white/5 rounded-lg">
                  <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
                  <p className="text-xs text-white/60 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-aurevia-gold/20 text-aurevia-gold border border-aurevia-gold/30">
                    Role: {user?.role}
                  </span>
                </div>

                <Link
                  to="/my-account/notifications"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between text-white/80 hover:text-aurevia-gold text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5 transition"
                >
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-rose-500 text-white rounded-full text-xs font-bold">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {user?.role === 'GUEST' && (
                  <>
                    <Link
                      to="/my-account/bookings"
                      onClick={() => setMobileOpen(false)}
                      className="block text-white/80 hover:text-aurevia-gold text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5 transition"
                    >
                      My Bookings
                    </Link>
                    <Link
                      to="/my-account/profile"
                      onClick={() => setMobileOpen(false)}
                      className="block text-white/80 hover:text-aurevia-gold text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5 transition"
                    >
                      My Profile
                    </Link>
                  </>
                )}

                {user?.role === 'RECEPTIONIST' && (
                  <Link
                    to="/staff/reception"
                    onClick={() => setMobileOpen(false)}
                    className="block text-white/80 hover:text-aurevia-gold text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5 transition"
                  >
                    Front Desk Dashboard
                  </Link>
                )}

                {user?.role === 'HOUSEKEEPING' && (
                  <Link
                    to="/staff/housekeeping"
                    onClick={() => setMobileOpen(false)}
                    className="block text-white/80 hover:text-aurevia-gold text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5 transition"
                  >
                    Housekeeping Dashboard
                  </Link>
                )}

                {user?.role === 'ADMIN' && (
                  <>
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="block text-white/80 hover:text-aurevia-gold text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5 transition"
                    >
                      Business Dashboard
                    </Link>
                    <Link
                      to="/admin/system-design"
                      onClick={() => setMobileOpen(false)}
                      className="block text-white/80 hover:text-aurevia-gold text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5 transition"
                    >
                      System Design
                    </Link>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-rose-400 hover:text-rose-300 hover:bg-white/5 rounded-lg transition text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DEMO SWITCHER: Small floating 'Demo' pill button fixed bottom-4 right-4 z-40 */}
      <div className="fixed bottom-4 right-4 z-40" ref={demoMenuRef}>
        <button
          onClick={() => setDemoMenuOpen((prev) => !prev)}
          className="bg-aurevia-forest border border-aurevia-gold/50 text-aurevia-gold text-xs px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 hover:bg-aurevia-forest-light transition-all cursor-pointer"
          title="Switch demonstration role instantly"
        >
          <Shield className="w-3.5 h-3.5 text-aurevia-gold" />
          <span>Demo: <strong>{user?.role || 'Guest'}</strong></span>
          <ChevronDown className={`w-3 h-3 transition-transform ${demoMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {demoMenuOpen && (
          <div className="absolute bottom-10 right-0 w-56 bg-aurevia-forest border border-aurevia-gold/30 rounded-xl shadow-2xl py-2 text-xs text-white z-50">
            <div className="px-3 py-1.5 text-aurevia-gold/70 font-semibold uppercase tracking-wider text-[10px] border-b border-white/10">
              Switch Demo Role
            </div>
            {(['GUEST', 'RECEPTIONIST', 'HOUSEKEEPING', 'ADMIN'] as const).map((r) => (
              <button
                key={r}
                onClick={() => handleDemoSwitch(r)}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-white/10 transition cursor-pointer ${
                  user?.role === r ? 'text-aurevia-gold font-semibold bg-white/5' : 'text-white/80'
                }`}
              >
                <span>{r}</span>
                {user?.role === r && (
                  <span className="w-1.5 h-1.5 rounded-full bg-aurevia-gold" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
