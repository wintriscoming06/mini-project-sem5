import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { WhistleIcon, FootballIcon } from '../components/common/FootballIcons';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#06131b] flex flex-col items-center justify-center px-4 relative">
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("/assets/design-system/patterns/pitch_grid.svg")` }}
      />
      <div className="text-center max-w-md w-full relative z-10 p-8 bg-white dark:bg-[#0b1e2d] border border-slate-200 dark:border-emerald-950/40 rounded-3xl shadow-xl">
        <div className="flex justify-center mb-6">
          <div className="bg-amber-500/10 dark:bg-amber-500/20 p-4 rounded-2xl border border-amber-500/30">
            <WhistleIcon className="w-16 h-16 text-amber-500 animate-pulse" />
          </div>
        </div>
        <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest mb-3">
          Out of Bounds
        </div>
        <h1 className="text-6xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">404</h1>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Off the Pitch</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          The tactical formation or match page you are looking for does not exist on this fixture list.
        </p>
        <Link to="/dashboard">
          <Button variant="primary" icon={<Home className="w-4 h-4" />}>
            Return to Match Center
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
