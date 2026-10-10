import React from 'react';
import { Trophy, Star } from 'lucide-react';
import { getClubTheme, ClubCrest, PlayerSilhouette } from '../../utils/clubTheme';

export const PlayerCard = ({ player, onClick }) => {
  const theme = getClubTheme(player?.team || player?.teamAcademy);
  return (
    <div 
      onClick={onClick}
      className={`group cursor-pointer rounded-2xl border-2 ${theme.border} bg-gradient-to-br ${theme.bgGradient} p-4 text-white shadow-xl card-elevate hover:border-emerald-400/80 hover:shadow-2xl hover:shadow-emerald-950/40 transition-all duration-300 select-none relative overflow-hidden`}
    >
      <div className="flex justify-between items-center mb-2 relative z-10">
        <div className="transition-transform duration-300 group-hover:scale-110">
          <ClubCrest club={theme} className="w-6 h-6" />
        </div>
        <span className="text-xs font-black text-amber-300">GPI {player?.gpi || '82.0'}</span>
      </div>
      <div className="text-center py-2 relative z-10">
        <h4 className="font-black text-sm tracking-tight">{player?.name || 'Prospect'}</h4>
        <p className="text-[10px] text-slate-300">{player?.position || 'FWD'} • {theme.name}</p>
      </div>
      {/* Subtle hover background sheen */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.04] transition-colors duration-300 pointer-events-none" />
    </div>
  );
};
export default PlayerCard;
