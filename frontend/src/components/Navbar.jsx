import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, ShieldAlert, LogOut, LogIn, LayoutDashboard, UserCheck } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-primary-600 font-semibold' : 'text-slate-600 hover:text-primary-500';
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 transition-all">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-90">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-500 to-secondary-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <span className="font-heading font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            MediRoute AI
          </span>
        </Link>

        {/* Mid Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/triage" className={isActive('/triage')}>Symptom Checker</Link>
          <Link to="/hospitals" className={isActive('/hospitals')}>Find Hospital</Link>
          <Link to="/emergency" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
            <ShieldAlert className="w-4 h-4" />
            Emergency
          </Link>
        </div>

        {/* Right Auth controls */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Dashboard redirection pill based on user role */}
              <Link 
                to={user?.role === 'admin' ? '/admin' : '/dashboard'} 
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200/50 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                {user?.role === 'admin' ? 'Admin Panel' : 'My Dashboard'}
              </Link>
              
              {/* User avatar greeting pill */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100/50 text-primary-700 text-sm font-bold shadow-sm shadow-primary-500/5">
                <div className="w-6 h-6 rounded-full bg-primary-200 flex items-center justify-center text-primary-800 text-xs font-extrabold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="max-w-[100px] truncate">
                  {user?.name ? user.name.split(' ')[0] : 'User'}
                </span>
              </div>

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                to="/login" 
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-primary-600 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="px-4 py-2 text-sm font-bold text-white bg-primary-500 hover:bg-primary-600 shadow-md shadow-primary-500/25 rounded-xl transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
