import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Sun, Moon, LogOut, Menu, X, ChevronDown, User,
  LayoutDashboard, Search, Trophy, Shield, GitCompare,
  BarChart2, Users, FilePlus, Calendar
} from 'lucide-react';
import { FootballIcon, ClassicSoccerBall } from '../common/FootballIcons';

const Navbar = () => {
  const { user, logout, hasRole } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const getNavLinks = () => {
    if (hasRole('PLAYER')) {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/tournaments', label: 'Tournaments', icon: Trophy },
        { path: '/my-applications', label: 'Applications', icon: Users },
        { path: '/player/stats', label: 'Match Stats', icon: BarChart2 },
        { path: '/player/card-studio', label: 'Card Studio', icon: FootballIcon },
        { path: '/profile', label: 'GPI Profile', icon: User }
      ];
    }
    if (hasRole('ORGANIZER')) {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/my-tournaments', label: 'Tournaments', icon: Trophy },
        { path: '/tournaments/create', label: 'New Tournament', icon: FilePlus },
        { path: '/matches', label: 'Matches & Scoring', icon: Calendar }
      ];
    }
    if (hasRole('SCOUT')) {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/search', label: 'Player Search', icon: Search },
        { path: '/compare', label: 'Comparison', icon: GitCompare },
        { path: '/shortlist', label: 'Shortlist', icon: Users },
        { path: '/alerts', label: 'Alerts', icon: Shield },
        { path: '/profile', label: 'Scout Dossier', icon: User }
      ];
    }
    if (hasRole('ADMIN')) {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/users', label: 'Users', icon: Users },
        { path: '/corrections', label: 'Corrections', icon: Shield },
        { path: '/audit-log', label: 'Audit Log', icon: FilePlus },
        { path: '/gpi-config', label: 'GPI Config', icon: BarChart2 }
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  const getRoleBadgeClasses = (role) => {
    switch (role) {
      case 'PLAYER':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'SCOUT':
        return 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30';
      case 'ORGANIZER':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'ADMIN':
        return 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';
      default:
        return 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#04120a]/95 backdrop-blur-md border-b border-emerald-200 dark:border-emerald-950/80 shadow-md transition-colors duration-200">
      {/* Top lawn grass turf stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-green-600" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-1.5 text-white shadow-md shadow-emerald-950/20 flex items-center justify-center transform transition-transform group-hover:scale-110">
                <ClassicSoccerBall className="w-7 h-7 group-hover:rotate-180 transition-transform duration-500" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">SSSP</span>
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                </div>
                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600 dark:text-emerald-400 block leading-none">
                  Scouting Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const active = isActive(link.path);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 btn-micro-press active:scale-[0.98] ${
                      active
                        ? 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mr-1.5 transition-transform duration-200 ${active ? 'text-emerald-500 scale-105' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>{link.label}</span>
                    {active && (
                      <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full animate-scale-in" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Controls: Theme Switcher + Role + Profile */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Pitch Light Mode" : "Switch to Stadium Night Mode"}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-emerald-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors focus:outline-none"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* User & Role */}
            {user && (
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-200 dark:border-slate-800">
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getRoleBadgeClasses(user.role)}`}>
                  {user.role}
                </span>

                <div className="relative">
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 focus:outline-none py-1.5 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-emerald-950/70 border border-slate-300 dark:border-emerald-700/40 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-emerald-300">
                      {user.username ? user.username.substring(0, 2).toUpperCase() : 'U'}
                    </div>
                    <span>{user.username}</span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  </button>

                  {dropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#0b1e2d] rounded-xl shadow-xl border border-slate-200 dark:border-emerald-900/40 py-1.5 text-slate-700 dark:text-slate-200 z-50 animate-in fade-in slide-in-from-top-1"
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-400 uppercase font-semibold">Signed in as</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user.username}</p>
                      </div>

                      {(hasRole('PLAYER') || hasRole('SCOUT')) && (
                        <Link 
                          to="/profile" 
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                        >
                          <User className="w-4 h-4 mr-2.5 text-slate-400" /> {hasRole('SCOUT') ? 'Scout Dossier' : 'My Profile'}
                        </Link>
                      )}

                      <button 
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }} 
                        className="flex items-center w-full px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2.5" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Mobile hamburger menu & Theme Toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-[#071622] border-b border-slate-200 dark:border-emerald-950/60 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                  active 
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 mr-2.5" />
                {link.label}
              </Link>
            );
          })}

          {user && (
            <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-1">
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getRoleBadgeClasses(user.role)}`}>
                  {user.role}
                </span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.username}</span>
              </div>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="text-sm text-rose-600 dark:text-rose-400 flex items-center font-medium"
              >
                <LogOut className="w-4 h-4 mr-1" /> Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
