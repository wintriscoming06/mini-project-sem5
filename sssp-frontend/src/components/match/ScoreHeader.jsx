import React from 'react';
export const ScoreHeader = ({ home, away, homeScore, awayScore }) => (
  <div className="flex items-center justify-between p-4 bg-slate-900 text-white rounded-2xl">
    <span className="font-black">{home}</span>
    <span className="text-xl font-black text-amber-400">{homeScore} - {awayScore}</span>
    <span className="font-black">{away}</span>
  </div>
);
export default ScoreHeader;
