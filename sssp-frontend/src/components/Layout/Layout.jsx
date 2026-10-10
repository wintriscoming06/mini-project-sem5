import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../../context/AuthContext';
import { 
  PitchMarkings, GrassBladesTrim, TournamentStadiumBackdrop, 
  TacticalBoardOverlay 
} from '../common';

const Layout = () => {
  const { user } = useAuth();
  const role = user?.role || 'PLAYER';

  // Role-specific background asset
  const getRoleBg = () => {
    switch (role) {
      case 'PLAYER':
        return '/assets/design-system/backgrounds/player-pitch.svg';
      case 'SCOUT':
        return '/assets/design-system/backgrounds/scout-tactics.svg';
      case 'ORGANIZER':
        return '/assets/design-system/backgrounds/organizer-stadium.svg';
      default:
        return '/assets/design-system/patterns/pitch_grid.svg';
    }
  };

  const bgImage = getRoleBg();

  return (
    <div className={`min-h-screen text-slate-900 dark:text-slate-100 flex flex-col relative transition-colors duration-300 overflow-x-hidden ${
      role === 'PLAYER' 
        ? 'role-atmosphere-player' 
        : role === 'SCOUT' 
          ? 'role-atmosphere-scout' 
          : 'role-atmosphere-organizer'
    }`}>
      
      {/* 1. Living Real Grass Lawn Mower Stripes Texture */}
      <div className="fixed inset-0 pointer-events-none z-0 living-real-grass opacity-90 dark:opacity-90" />

      {/* 2. Real Pitch Chalk Markings (Center circle, penalty boxes, touchlines) */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-25 dark:opacity-35">
        <PitchMarkings />
      </div>

      {/* 3. Role-Specific Lively Visual Engine */}

      {/* A. PLAYER: High-Energy Floodlights & Pitch Atmosphere */}
      {role === 'PLAYER' && (
        <>
          <div className="fixed top-0 inset-x-0 h-[520px] pointer-events-none z-0 opacity-70 dark:opacity-50 stadium-glow animate-floodlight" />
          <div className="fixed bottom-0 right-1/4 w-96 h-96 pointer-events-none z-0 opacity-30 pitch-glow" />
        </>
      )}


      {/* B. SCOUT / COACH: Tactical Coordination Chalkboard & Pitch Grid */}
      {role === 'SCOUT' && (
        <>
          <TacticalBoardOverlay className="fixed inset-0 pointer-events-none z-0 opacity-20 dark:opacity-30" />
        </>
      )}

      {/* C. ORGANIZER: Grand Tournament Stadium Amphitheater & Championship Spotlights */}
      {role === 'ORGANIZER' && (
        <>
          <TournamentStadiumBackdrop className="fixed inset-0 pointer-events-none z-0 opacity-40 dark:opacity-55" />
          <div className="fixed top-0 left-1/3 w-[600px] h-[600px] pointer-events-none z-0 opacity-25 bg-amber-400/10 rounded-full blur-3xl animate-stadium-sweep" />
          <div className="fixed -top-32 inset-x-0 h-[500px] pointer-events-none z-0 opacity-70 stadium-glow" />
        </>
      )}

      {/* 4. Role Atmosphere Watermark */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-15 dark:opacity-20 transition-opacity duration-700 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${bgImage}")` }}
      />

      {/* Persistent Football Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>


      {/* Grass Blades Trim along Top of Footer */}
      <div className="relative z-10 w-full overflow-hidden leading-none pointer-events-none">
        <GrassBladesTrim className="w-full h-4 text-emerald-500/40 dark:text-emerald-400/30" />
      </div>

      {/* Footer Branding */}
      <footer className="relative z-10 border-t border-emerald-900/30 bg-white/80 dark:bg-[#020c08]/90 backdrop-blur-md py-6 text-center text-xs text-slate-500 dark:text-emerald-300/60">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-black text-slate-800 dark:text-white">SSSP</span>
            <span>• Sports Stats & Scouting Platform</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping" />
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Matchday Engine • Real Grass Pitch Environment</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
