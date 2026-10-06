import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Trophy, Shield, Search, Bell } from 'lucide-react';

const Sidebar = () => {
  const { hasRole } = useAuth();
  const location = useLocation();

  const getLinks = () => {
    if (hasRole('PLAYER')) {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/tournaments', label: 'Tournaments', icon: Trophy },
        { path: '/my-applications', label: 'My Applications', icon: Users },
      ];
    }
    if (hasRole('ORGANIZER')) {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/my-tournaments', label: 'My Tournaments', icon: Trophy },
        { path: '/matches', label: 'Matches', icon: Shield },
      ];
    }
    if (hasRole('SCOUT')) {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/search', label: 'Search Players', icon: Search },
        { path: '/shortlist', label: 'Shortlist', icon: Users },
        { path: '/alerts', label: 'Alerts', icon: Bell },
      ];
    }
    if (hasRole('ADMIN')) {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/users', label: 'Users', icon: Users },
        { path: '/corrections', label: 'Corrections', icon: Shield },
      ];
    }
    return [];
  };

  const links = getLinks();

  return (
    <div className="w-64 bg-white border-r h-full min-h-[calc(100vh-4rem)] p-4 shadow-sm hidden md:block">
      <ul className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname.startsWith(link.path);
          return (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
                  isActive ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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
