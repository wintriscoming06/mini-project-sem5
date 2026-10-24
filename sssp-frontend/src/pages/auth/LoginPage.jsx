import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../services/api';
import { Alert, ClassicSoccerBall } from '../../components/common';
import AuthLayout from '../../components/auth/AuthLayout';

const ROLE_THEMES = {
  PLAYER: {
    name: 'Player',
    icon: '⚽',
    tunnelLabel: 'ATHLETE PERFORMANCE DOSSIER',
    subheading: 'Access verified match statistics, rankings & scouting cards',
<<<<<<< HEAD
    actionText: 'Sign In / Player Portal',
=======
    actionText: 'Sign In / Access Dossier',
>>>>>>> 58fdbde63dca8b2cff201ba17a55a51755f9f73d
    loadingText: 'Authenticating Athlete...',
    cardBorder: 'border-blue-500/30',
    cardBg: 'bg-slate-900/95 dark:bg-slate-900/95',
    topTrim: 'bg-blue-600',
    buttonGrad: 'bg-blue-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/30 text-white',
    accentColor: 'text-blue-400',
    badgeBg: 'bg-blue-900/60 border-blue-400/40 text-blue-300',
    roleTag: 'bg-blue-800/40 text-blue-200 border-blue-500/30',
    inputRing: 'focus:ring-blue-500 focus:border-blue-500',
    focusGlow: 'shadow-blue-500/10',
<<<<<<< HEAD
  },
  COACH: {
    name: 'Coach',
    icon: '📋',
    tunnelLabel: 'TACTICAL MASTER & SQUAD COMMAND',
    subheading: 'Access squad management, tactical boards & formation strategies',
    actionText: 'Sign In / Coach Portal',
    loadingText: 'Authenticating Coach Credentials...',
    cardBorder: 'border-emerald-500/30',
    cardBg: 'bg-slate-900/95 dark:bg-slate-900/95',
    topTrim: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500',
    buttonGrad: 'bg-emerald-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/30 text-white font-bold',
    accentColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-900/60 border-emerald-400/40 text-emerald-300',
    roleTag: 'bg-emerald-800/40 text-emerald-200 border-emerald-500/30',
    inputRing: 'focus:ring-emerald-500 focus:border-emerald-500',
    focusGlow: 'shadow-emerald-500/10',
=======
>>>>>>> 58fdbde63dca8b2cff201ba17a55a51755f9f73d
  },
  SCOUT: {
    name: 'Scout',
    icon: '🔎',
<<<<<<< HEAD
    tunnelLabel: 'TALENT RADAR & PROSPECT DOSSIER',
    subheading: 'Access quantitative talent analytics, radar & prospect rankings',
    actionText: 'Sign In / Scout Portal',
    loadingText: 'Authenticating Scout Credentials...',
    cardBorder: 'border-cyan-500/30',
    cardBg: 'bg-slate-900/95 dark:bg-slate-900/95',
    topTrim: 'bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500',
    buttonGrad: 'bg-cyan-600 hover:from-cyan-500 hover:to-sky-500 shadow-cyan-500/30 text-white font-bold',
=======
    tunnelLabel: 'TACTICAL RECRUITMENT DOSSIER',
    subheading: 'Access quantitative talent analytics, scout notes & prospect rankings',
    actionText: 'Sign In / Scout Portal',
    loadingText: 'Consulting Tactical Board...',
    cardBorder: 'border-cyan-500/30',
    cardBg: 'bg-slate-900/95 dark:bg-slate-900/95',
    topTrim: 'bg-blue-600',
    buttonGrad: 'bg-blue-600 hover:from-cyan-500 hover:to-sky-500 shadow-cyan-500/30 text-white',
>>>>>>> 58fdbde63dca8b2cff201ba17a55a51755f9f73d
    accentColor: 'text-cyan-400',
    badgeBg: 'bg-cyan-900/60 border-cyan-400/40 text-cyan-300',
    roleTag: 'bg-cyan-800/40 text-cyan-200 border-cyan-500/30',
    inputRing: 'focus:ring-cyan-500 focus:border-cyan-500',
    focusGlow: 'shadow-cyan-500/10',
  },
  ORGANIZER: {
    name: 'Organizer',
    icon: '🏟',
    tunnelLabel: 'CHAMPIONSHIP ARENA CONTROL',
    subheading: 'Manage tournaments, fixtures, match scoring & official rankings',
    actionText: 'Sign In / Arena Control',
    loadingText: 'Connecting Matchday Systems...',
    cardBorder: 'border-amber-500/30',
    cardBg: 'bg-slate-900/95 dark:bg-slate-900/95',
    topTrim: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500',
    buttonGrad: 'bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-400 hover:to-yellow-400 shadow-amber-500/30 text-slate-950 font-black',
    accentColor: 'text-amber-400',
    badgeBg: 'bg-amber-900/60 border-amber-400/40 text-amber-300',
    roleTag: 'bg-amber-800/40 text-amber-200 border-amber-500/30',
    inputRing: 'focus:ring-amber-500 focus:border-amber-500',
    focusGlow: 'shadow-amber-500/10',
  }
};

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState('PLAYER');
  const [motionActive, setMotionActive] = useState(null); // 'PLAYER' | 'SCOUT' | 'ORGANIZER' | null

  const navigate = useNavigate();
  const { login } = useAuth();

  const currentTheme = ROLE_THEMES[activeRole] || ROLE_THEMES.PLAYER;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setMotionActive(activeRole);

    const isReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animationDelay = isReduced ? 0 : 480;

    try {
      await Promise.all([
        login({ identifier, password, role: activeRole }),
        new Promise((resolve) => setTimeout(resolve, animationDelay))
      ]);
      navigate('/dashboard');
    } catch (err) {
      setMotionActive(null);
      setError(getErrorMessage(err, 'Login failed. Please check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout activeRole={activeRole} onRoleChange={setActiveRole}>
      <div 
        key={activeRole}
        className={`relative overflow-hidden ${currentTheme.cardBg} border-2 ${currentTheme.cardBorder} rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-md animate-role-morph transition-colors duration-500`}
      >
        {/* Top Trim Highlight */}
        <div className={`h-2.5 ${currentTheme.topTrim} rounded-t-3xl -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 mb-4 transition-all duration-500`} />
        
<<<<<<< HEAD
        {/* Tactical Grid watermark for Coach / Scout */}
        {(activeRole === 'SCOUT' || activeRole === 'COACH') && (
=======
        {/* Tactical Grid watermark for Scout */}
        {activeRole === 'SCOUT' && (
>>>>>>> 58fdbde63dca8b2cff201ba17a55a51755f9f73d
          <div className="absolute inset-0 tactical-grid opacity-20 pointer-events-none" />
        )}

        {/* Goal Net Texture Watermark */}
        <div className="absolute inset-0 goal-net-texture opacity-15 pointer-events-none" />

        {/* Stadium Glow Overlay for Organizer */}
        {activeRole === 'ORGANIZER' && (
          <div className="absolute inset-0 stadium-glow opacity-30 pointer-events-none" />
        )}

        {/* ======================================================== */}
        {/* ROLE-SPECIFIC LOGIN MICRO-INTERACTIONS (ON SUBMIT) */}
        {/* ======================================================== */}
        
        {/* 1. PLAYER: Football Kick Across Login Area */}
        {motionActive === 'PLAYER' && (
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden flex items-center justify-center">
            {/* Speed Streak */}
            <div className="absolute bottom-20 left-10 h-1.5 bg-gradient-to-r from-blue-400 via-cyan-300 to-transparent rounded-full animate-kick-streak" />
            {/* Ball Trajectory */}
            <div className="absolute bottom-14 left-8 text-2xl animate-football-kick flex items-center justify-center">
              <ClassicSoccerBall className="w-10 h-10 drop-shadow-[0_8px_18px_rgba(37,99,235,0.7)]" />
            </div>
            {/* Target Area Goal Flare */}
            <div className="absolute top-12 right-12 w-28 h-28 rounded-full bg-blue-400/25 blur-xl animate-pulse" />
          </div>
        )}

        {/* 2. COACH: Tactical Formation Clipboard Pulse */}
        {motionActive === 'COACH' && (
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden flex items-center justify-center bg-emerald-950/30 backdrop-blur-[2px]">
            <div className="absolute w-32 h-32 rounded-full border-2 border-emerald-400/80 animate-ping" />
            <div className="relative p-4 rounded-2xl bg-emerald-900/90 border border-emerald-400/70 shadow-2xl animate-bounce flex items-center justify-center">
              <span className="text-4xl filter drop-shadow-[0_4px_12px_rgba(16,185,129,0.7)]">📋</span>
            </div>
          </div>
        )}

        {/* 3. SCOUT: Referee Whistle Acoustic Resonance Pulse */}
        {motionActive === 'SCOUT' && (
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden flex items-center justify-center bg-cyan-950/30 backdrop-blur-[2px]">
            {/* Acoustic Wave Rings */}
            <div className="absolute w-32 h-32 rounded-full border-2 border-cyan-400/80 animate-whistle-wave-1" />
            <div className="absolute w-32 h-32 rounded-full border-2 border-cyan-400/60 animate-whistle-wave-2" />
            {/* Whistle Icon with vibrate/pulse */}
            <div className="relative p-4 rounded-2xl bg-cyan-900/90 border border-cyan-400/70 shadow-2xl animate-whistle-vibrate flex items-center justify-center">
              <span className="text-4xl filter drop-shadow-[0_4px_12px_rgba(45,212,191,0.7)]">🪈</span>
            </div>
          </div>
        )}

        {/* 4. ORGANIZER: Stadium Matchday Floodlight Sweep */}
        {motionActive === 'ORGANIZER' && (
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
            {/* Beam Sweep */}
            <div className="absolute inset-y-0 -left-1/2 w-[160%] bg-gradient-to-r from-transparent via-amber-300/40 via-yellow-100/30 to-transparent animate-floodlight-sweep pointer-events-none" />
            {/* Central Flare */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-56 h-56 rounded-full bg-gradient-to-tr from-amber-400/35 via-yellow-300/45 to-transparent blur-2xl animate-stadium-flare" />
              <span className="text-5xl animate-stadium-flare filter drop-shadow-[0_0_24px_rgba(245,158,11,0.85)]">🏟️</span>
            </div>
          </div>
        )}

        {/* In-Card Role Quick Selector Pills */}
        <div className="relative z-10 flex items-center justify-between p-1 mb-5 rounded-xl bg-black/45 border border-white/10 backdrop-blur-md">
          {['PLAYER', 'COACH', 'SCOUT', 'ORGANIZER'].map((role) => {
            const isCur = activeRole === role;
            const rConf = ROLE_THEMES[role];
            return (
              <button
                key={role}
                type="button"
                onClick={() => setActiveRole(role)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-black transition-all duration-200 flex items-center justify-center gap-1.5 select-none ${
                  isCur
                    ? `${rConf.buttonGrad} text-slate-950 shadow-md`
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{rConf.icon}</span>
                <span className="tracking-wider">{rConf.name}</span>
              </button>
            );
          })}
        </div>

        {/* Form Header */}
        <div className="text-left mb-6 relative z-10">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${currentTheme.badgeBg} text-xs font-black uppercase tracking-widest mb-3 shadow-md transition-colors duration-300`}>
            <span>{currentTheme.icon}</span>
            <span>{currentTheme.tunnelLabel}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-between">
            <span>Kick Off / Sign In</span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${currentTheme.roleTag} uppercase tracking-wider`}>
              {activeRole}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium transition-colors duration-300">
            {currentTheme.subheading}
          </p>
        </div>

        {/* Error Alert */}
        {error && <Alert type="error" message={error} className="mb-5 relative z-10" />}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* Email or Username */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5 flex items-center justify-between">
              <span>{activeRole === 'PLAYER' ? 'Player ID / Email or Username' : `${currentTheme.name} ID / Email or Username`}</span>
              <span className={currentTheme.accentColor}>*</span>
            </label>
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${currentTheme.accentColor}`}>
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={
                  activeRole === 'PLAYER' 
                    ? 'e.g. cr7@sssp.org or player username' 
                    : activeRole === 'COACH'
                    ? 'e.g. coach@sssp.org or coach username'
                    : activeRole === 'SCOUT' 
                    ? 'e.g. scout@sssp.org or scout username' 
                    : 'e.g. organizer@sssp.org'
                }
                required
                className={`w-full pl-10 pr-4 py-2.5 bg-black/40 border border-slate-700/60 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 ${currentTheme.inputRing} transition-all duration-200`}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-200">
                Password <span className={currentTheme.accentColor}>*</span>
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Tactical password reset link has been dispatched to your email.');
                }}
                className={`text-xs ${currentTheme.accentColor} hover:underline font-semibold transition-colors`}
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${currentTheme.accentColor}`}>
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your confidential password"
                required
                className={`w-full pl-10 pr-10 py-2.5 bg-black/40 border border-slate-700/60 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 ${currentTheme.inputRing} transition-all duration-200`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center pt-1">
            <label className="flex items-center text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded border-slate-700 bg-black/40 text-blue-500 focus:ring-blue-500 mr-2"
              />
              Stay logged in on matchdays
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`group w-full py-3.5 mt-2 rounded-xl ${currentTheme.buttonGrad} text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none btn-micro-press`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {currentTheme.loadingText}
              </span>
            ) : (
              <span className="flex items-center">
                <LogIn className="w-4 h-4 mr-2" />
                <span>{currentTheme.actionText}</span>
              </span>
            )}
          </button>
        </form>

        {/* Footer Link to Register */}
        <div className="mt-6 pt-5 border-t border-white/10 text-center text-xs text-slate-300 relative z-10">
          Not yet scouted on the platform?{' '}
          <Link
            to="/register"
            className={`font-black ${currentTheme.accentColor} hover:underline ml-1 transition-all`}
          >
            Sign Player / Scout Contract
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
