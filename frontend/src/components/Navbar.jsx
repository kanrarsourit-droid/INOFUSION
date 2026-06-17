import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Activity, ShieldAlert, LogOut, LogIn, LayoutDashboard, UserCheck, Menu, X, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Detect if on the dark landing page
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    if (isLanding) {
      if (isDark) {
        return location.pathname === path
          ? 'text-cyan-400 font-semibold'
          : 'text-slate-300 hover:text-cyan-400';
      } else {
        return location.pathname === path
          ? 'text-cyan-600 font-semibold'
          : 'text-slate-600 hover:text-cyan-600';
      }
    }
    if (isDark) {
      return location.pathname === path
        ? 'text-cyan-400 font-semibold'
        : 'text-slate-300 hover:text-cyan-400';
    }
    return location.pathname === path
      ? 'text-primary-600 font-semibold'
      : 'text-slate-600 hover:text-primary-500';
  };

  // Dynamic styles based on landing page + scroll position + theme
  const navBg = isLanding
    ? isDark
      ? scrolled
        ? 'bg-[#030014]/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20 text-white'
        : 'bg-transparent border-b border-transparent text-white'
      : scrolled
        ? 'bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/80 shadow-lg shadow-slate-200/20 text-slate-800'
        : 'bg-transparent border-b border-transparent text-slate-800'
    : isDark
      ? 'bg-[#030014]/80 backdrop-blur-md border-b border-white/5 text-white'
      : 'bg-white/80 backdrop-blur-md border-b border-slate-200/80 text-slate-800';

  const logoTextClass = isLanding
    ? isDark
      ? 'bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent'
      : 'bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent'
    : 'bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent';

  const logoIconBg = isLanding
    ? 'bg-gradient-to-tr from-cyan-500 to-purple-600 shadow-cyan-500/20'
    : 'bg-gradient-to-tr from-primary-500 to-secondary-500 shadow-primary-500/20';

  return (
    <nav className={`sticky top-0 z-50 px-6 py-4 transition-all duration-500 ${navBg}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <div className={`w-10 h-10 rounded-xl ${logoIconBg} flex items-center justify-center text-white shadow-md`}>
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <span className={`font-heading font-extrabold text-xl tracking-tight ${logoTextClass}`}>
            MediRoute AI
          </span>
        </Link>

        {/* Mid Navigation Links — Desktop */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/" className={`${isActive('/')} transition-colors`}>Home</Link>
          <Link to="/triage" className={`${isActive('/triage')} transition-colors`}>Symptom Checker</Link>
          <Link to="/hospitals" className={`${isActive('/hospitals')} transition-colors`}>Find Hospital</Link>
          <Link
            to="/emergency"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
              isLanding
                ? isDark
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                  : 'bg-red-50 text-red-600 hover:bg-red-100/80'
                : isDark
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Emergency
          </Link>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all duration-300 hover:scale-105 ${
              isLanding
                ? isDark
                  ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                  : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-sm'
                : isDark
                  ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-sm'
            }`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400 animate-pulse" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Dashboard pill */}
              <Link
                to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  isLanding
                    ? isDark
                      ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                      : 'bg-slate-100 border-slate-200/50 hover:bg-slate-200 text-slate-700'
                    : isDark
                      ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/50'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                {user?.role === 'admin' ? 'Admin Panel' : 'My Dashboard'}
              </Link>

              {/* User avatar pill */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                isLanding
                  ? isDark
                    ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
                    : 'bg-cyan-50 border border-cyan-100 text-cyan-700'
                  : isDark
                    ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400'
                    : 'bg-primary-50 border border-primary-100/50 text-primary-700 shadow-primary-500/5'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
                  isLanding && isDark ? 'bg-cyan-500/20 text-cyan-300' : 'bg-primary-200 text-primary-800'
                }`}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="max-w-[100px] truncate">
                  {user?.name ? user.name.split(' ')[0] : 'User'}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className={`p-2 rounded-xl transition-colors ${
                  isLanding
                    ? isDark
                      ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
                      : 'text-slate-500 hover:text-red-650 hover:bg-red-50'
                    : isDark
                      ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
                      : 'text-slate-500 hover:text-red-500 hover:bg-red-50'
                }`}
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/login"
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  isLanding
                    ? isDark
                      ? 'text-slate-300 hover:text-cyan-400'
                      : 'text-slate-650 hover:text-cyan-600'
                    : isDark
                      ? 'text-slate-300 hover:text-cyan-400'
                      : 'text-slate-700 hover:text-primary-600'
                }`}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-md hover:-translate-y-0.5 ${
                  isLanding
                    ? isDark
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/25 hover:shadow-cyan-500/40'
                      : 'bg-gradient-to-r from-cyan-650 to-blue-600 shadow-cyan-650/25 hover:shadow-cyan-650/40'
                    : 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/25'
                }`}
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isLanding
                ? isDark
                  ? 'text-slate-300 hover:bg-white/5'
                  : 'text-slate-600 hover:bg-slate-100'
                : isDark
                  ? 'text-slate-300 hover:bg-white/5'
                  : 'text-slate-600 hover:bg-slate-100'
            }`}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className={`md:hidden mt-4 rounded-xl p-4 flex flex-col gap-3 text-sm font-medium ${
          isLanding
            ? isDark
              ? 'bg-[#0f0c29]/90 backdrop-blur-xl border border-white/5'
              : 'bg-white border border-slate-200 shadow-xl'
            : isDark
              ? 'bg-[#0f0c29]/90 backdrop-blur-xl border border-white/5'
              : 'bg-white border border-slate-200 shadow-xl'
        }`}>
          <Link to="/" className={`${isActive('/')} transition-colors py-2`}>Home</Link>
          <Link to="/triage" className={`${isActive('/triage')} transition-colors py-2`}>Symptom Checker</Link>
          <Link to="/hospitals" className={`${isActive('/hospitals')} transition-colors py-2`}>Find Hospital</Link>
          <Link to="/emergency" className={`flex items-center gap-1.5 py-2 ${isLanding && isDark ? 'text-red-400' : 'text-red-650'}`}>
            <ShieldAlert className="w-4 h-4" />
            Emergency
          </Link>
          {!isAuthenticated && (
            <>
              <hr className={isLanding && isDark ? 'border-white/5' : 'border-slate-100'} />
              <Link to="/login" className={`py-2 ${isActive('/login')} transition-colors`}>Sign In</Link>
              <Link
                to="/signup"
                className={`py-2.5 text-center rounded-xl font-bold text-white ${
                  isLanding
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600'
                    : 'bg-primary-500'
                }`}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
