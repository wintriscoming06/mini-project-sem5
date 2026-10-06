import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Trophy, LayoutDashboard, Search, Users, Shield, 
  Bell, LogOut, Menu, X, ChevronDown, User, 
  Settings, FileText, Star, ClipboardList 
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, hasRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const renderNavLinks = () => {
    if (hasRole('PLAYER')) {
      return (
        <>
          <Link to="/dashboard" className="hover:text-primary-300">Dashboard</Link>
          <Link to="/tournaments" className="hover:text-primary-300">Tournaments</Link>
          <Link to="/my-applications" className="hover:text-primary-300">My Applications</Link>
          <Link to="/profile" className="hover:text-primary-300">My Profile</Link>
        </>
      );
    }
    if (hasRole('ORGANIZER')) {
      return (
        <>
          <Link to="/dashboard" className="hover:text-primary-300">Dashboard</Link>
          <Link to="/my-tournaments" className="hover:text-primary-300">My Tournaments</Link>
          <Link to="/matches" className="hover:text-primary-300">Matches</Link>
        </>
      );
    }
    if (hasRole('SCOUT')) {
      return (
        <>
          <Link to="/dashboard" className="hover:text-primary-300">Dashboard</Link>
          <Link to="/search" className="hover:text-primary-300">Player Search</Link>
          <Link to="/shortlist" className="hover:text-primary-300">Shortlist</Link>
          <Link to="/alerts" className="hover:text-primary-300">Alerts</Link>
        </>
      );
    }
    if (hasRole('ADMIN')) {
      return (
        <>
          <Link to="/dashboard" className="hover:text-primary-300">Dashboard</Link>
          <Link to="/users" className="hover:text-primary-300">Users</Link>
          <Link to="/corrections" className="hover:text-primary-300">Corrections</Link>
          <Link to="/audit-log" className="hover:text-primary-300">Audit Log</Link>
          <Link to="/gpi-config" className="hover:text-primary-300">GPI Config</Link>
        </>
      );
    }
    return null;
  };

  return (
    <nav className="bg-dark-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-primary-400" />
              <span className="font-bold text-xl hidden sm:block">SSSP</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {renderNavLinks()}
              </div>
            </div>
          </div>
          
          <div className="hidden md:block">
            {user && (
              <div className="relative flex items-center space-x-3">
                <span className="text-sm bg-primary-600 px-2 py-1 rounded-md">{user.role}</span>
                <div className="relative">
                  <button 
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-1 hover:text-primary-300 focus:outline-none"
                  >
                    <span>{user.username}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-gray-700 z-50">
                      <button onClick={logout} className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-left">
                        <LogOut className="h-4 w-4 mr-2" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="-mr-2 flex md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white p-2">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-dark-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            {renderNavLinks()}
            {user && (
              <button onClick={logout} className="text-left hover:text-primary-300 mt-2 text-red-400">
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
