import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Shield, Search, Bell } from 'lucide-react';
import { TrophyIcon, StadiumIcon, WhistleIcon, FootballIcon, ScoutTargetIcon } from '../common/FootballIcons';

const Sidebar = () => {
  const { hasRole } = useAuth();
  const location = useLocation();

  const getLinks = () => {
    if (hasRole('PLAYER')) {
      return [
        { path: '/dashboard', label: 'Match Dashboard', icon: LayoutDashboard },
        { path: '/tournaments', label: 'Tournaments', icon: TrophyIcon },
        { path: '/my-applications', label: 'My Applications', icon: Users },
        { path: '/player/stats', label: 'Match Stats', icon: WhistleIcon },
        { path: '/player/card-studio', label: 'Card Studio', icon: FootballIcon },
      ];
    }
    if (hasRole('ORGANIZER')) {
      return [
        { path: '/dashboard', label: 'Match Operations', icon: LayoutDashboard },
        { path: '/my-tournaments', label: 'Competitions', icon: TrophyIcon },
        { path: '/matches', label: 'Fixtures & Scores', icon: StadiumIcon },
      ];
    }
    if (hasRole('SCOUT')) {
      return [
        { path: '/dashboard', label: 'Tactical Desk', icon: LayoutDashboard },
        { path: '/search', label: 'Scout Talent', icon: ScoutTargetIcon },
        { path: '/shortlist', label: 'Shortlist', icon: Users },
        { path: '/alerts', label: 'Alerts Feed', icon: Bell },
      ];
    }
    if (hasRole('ADMIN')) {
      return [
        { path: '/dashboard', label: 'Administration', icon: LayoutDashboard },
        { path: '/users', label: 'User Directory', icon: Users },
        { path: '/corrections', label: 'Data Corrections', icon: Shield },
      ];
    }
    return [];
  };

  const links = getLinks();

  return (
    <div className="w-64 bg-white dark:bg-[#0b1e2d] border-r border-slate-200 dark:border-emerald-950/40 h-full min-h-[calc(100vh-4rem)] p-4 shadow-sm hidden md:block">
      <ul className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname.startsWith(link.path);
          return (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-colors font-medium text-sm ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Sidebar;
