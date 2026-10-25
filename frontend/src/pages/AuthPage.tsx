import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BRAND } from '../brand';
import {
  Shield,
  CheckCircle2,
  Mail,
  KeyRound,
  User as UserIcon,
  Phone,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [isLogin, setIsLogin] = useState<boolean>(() => {
    if (initialMode === 'register') return false;
    if (location.pathname === '/register') return false;
    const params = new URLSearchParams(location.search);
    return params.get('mode') !== 'register';
  });

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password, phone);
      }

      // After login/register, read role from localStorage
      const savedUser = JSON.parse(localStorage.getItem('hotel_user') || '{}');
      const role = savedUser.role || 'GUEST';

      if (role === 'RECEPTIONIST') {
        navigate('/staff/reception');
      } else if (role === 'HOUSEKEEPING') {
        navigate('/staff/housekeeping');
      } else if (role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/my-account');
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'Authentication failed. Please verify your credentials and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setIsLogin(true);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-aurevia-ivory">
      {/* LEFT COLUMN (hidden on mobile, lg:flex) */}
      <div className="hidden lg:flex lg:w-1/2 bg-aurevia-forest p-12 flex-col justify-between relative overflow-hidden select-none">
        {/* Decorative background accent */}
        <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-aurevia-gold/5 blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -top-24 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        {/* Top: Logo & Brand */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-lg bg-aurevia-gold text-aurevia-forest font-display text-2xl font-bold flex items-center justify-center shadow-gold group-hover:scale-105 transition-transform">
              {BRAND.monogram}
            </div>
            <div>
              <span className="font-display text-2xl text-white font-semibold block leading-tight">
                {BRAND.name}
              </span>
              <span className="text-aurevia-gold/70 text-xs tracking-wider uppercase block">
                {BRAND.descriptor}
              </span>
            </div>
          </Link>
          <p className="text-white/60 text-sm mt-3 max-w-sm leading-relaxed font-sans">
            {BRAND.tagline}
          </p>
        </div>

        {/* Middle: Brand Benefits */}
        <div className="relative z-10 space-y-6 my-12 max-w-md">
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-full bg-aurevia-gold/20 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5 text-aurevia-gold" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Exclusive Member Rates</h3>
              <p className="text-white/60 text-xs mt-0.5 leading-relaxed">
                Save up to 25% on direct bookings across all signature properties and resorts.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-full bg-aurevia-gold/20 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5 text-aurevia-gold" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Priority Check-in</h3>
              <p className="text-white/60 text-xs mt-0.5 leading-relaxed">
                Skip the front desk queue with our dedicated Aurevia member arrival lanes.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-full bg-aurevia-gold/20 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5 text-aurevia-gold" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Personal Concierge</h3>
              <p className="text-white/60 text-xs mt-0.5 leading-relaxed">
                Dedicated assistance throughout your entire stay for transfers, dining, and spa.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom: Trust note */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
          <span>Trusted by 50,000+ travellers worldwide</span>
          <Link to="/" className="text-aurevia-gold/70 hover:text-aurevia-gold flex items-center gap-1 transition">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="w-full lg:w-1/2 bg-aurevia-ivory flex items-center justify-center p-6 sm:p-10 min-h-screen">
        <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-aurevia w-full max-w-md border border-aurevia-border">
          {/* Mobile Back / Monogram Header */}
          <div className="lg:hidden flex items-center justify-between mb-6 pb-4 border-b border-aurevia-border">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-aurevia-gold text-aurevia-forest font-display text-lg font-bold flex items-center justify-center">
                {BRAND.monogram}
              </div>
              <span className="font-display font-semibold text-aurevia-charcoal text-lg">
                {BRAND.name}
              </span>
            </Link>
            <Link to="/" className="text-xs text-aurevia-muted hover:text-aurevia-forest flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Home
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <h1 className="font-display text-2xl font-semibold text-aurevia-charcoal">
              {isLogin ? 'Welcome to Aurevia' : 'Join Aurevia'}
            </h1>
            <p className="text-xs text-aurevia-muted mt-1">
              {isLogin
                ? 'Sign in to access your bookings, preferences, and member privileges.'
                : 'Create your guest account for preferential rates and instant reservations.'}
            </p>
          </div>

          {/* Login / Register Tabs */}
          <div className="flex border-b border-aurevia-gold/30 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError(null);
              }}
              className={`flex-1 pb-3 text-sm font-semibold transition text-center ${
                isLogin
                  ? 'border-b-2 border-aurevia-forest text-aurevia-forest font-semibold'
                  : 'border-transparent text-aurevia-muted hover:text-aurevia-forest'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError(null);
              }}
              className={`flex-1 pb-3 text-sm font-semibold transition text-center ${
                !isLogin
                  ? 'border-b-2 border-aurevia-forest text-aurevia-forest font-semibold'
                  : 'border-transparent text-aurevia-muted hover:text-aurevia-forest'
              }`}
            >
              Register
            </button>
          </div>

          {/* Demo Credentials Quick-Fill Card */}
          <div className="bg-aurevia-ivory rounded-xl border border-aurevia-gold/30 p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-aurevia-forest" />
              <h2 className="text-xs font-semibold text-aurevia-forest tracking-wide uppercase">
                Demo Credentials
              </h2>
            </div>
            <p className="text-[11px] text-aurevia-muted mb-2.5">
              Click any role to populate credentials (password: <code>Password123!</code>):
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('guest@hotel.com')}
                className="bg-white border border-aurevia-border hover:bg-aurevia-ivory text-xs text-left p-2 rounded-lg transition flex items-center justify-between"
              >
                <span className="font-medium text-aurevia-charcoal">Guest</span>
                <span className="text-[10px] text-aurevia-muted">Alice</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('receptionist@hotel.com')}
                className="bg-white border border-aurevia-border hover:bg-aurevia-ivory text-xs text-left p-2 rounded-lg transition flex items-center justify-between"
              >
                <span className="font-medium text-aurevia-charcoal">Receptionist</span>
                <span className="text-[10px] text-aurevia-muted">Bob</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('housekeeping@hotel.com')}
                className="bg-white border border-aurevia-border hover:bg-aurevia-ivory text-xs text-left p-2 rounded-lg transition flex items-center justify-between"
              >
                <span className="font-medium text-aurevia-charcoal">Housekeeping</span>
                <span className="text-[10px] text-aurevia-muted">Charlie</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('admin@hotel.com')}
                className="bg-white border border-aurevia-border hover:bg-aurevia-ivory text-xs text-left p-2 rounded-lg transition flex items-center justify-between"
              >
                <span className="font-medium text-aurevia-charcoal">Admin</span>
                <span className="text-[10px] text-aurevia-muted">Diana</span>
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-xl p-3 flex items-start gap-2.5 text-xs mb-5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="input-label">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3.5 top-3.5 text-aurevia-muted pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="input-field pl-10"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-aurevia-muted pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-aurevia-muted pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="input-label">Phone Number (Optional)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-aurevia-muted pointer-events-none" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="input-field pl-10"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-sm py-3 mt-2"
            >
              {loading
                ? 'Processing...'
                : isLogin
                ? 'Sign In to Account'
                : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
