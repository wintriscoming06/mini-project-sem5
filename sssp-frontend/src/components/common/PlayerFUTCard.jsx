import React from 'react';
import { getCardDesign } from '../../utils/cardDesigns';

function initials(name) {
  if (!name) return 'GP';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

export default function PlayerFUTCard({ player, design, size = 'md', interactive = true }) {
  const chosenDesign = design || player?.card?.design || player?.cardDesign || 'Bronze';
  const theme = getCardDesign(chosenDesign);
  const attrs = player?.attributes?.current || player?.attributes;
  const isEligible = Boolean(player?.gpi?.eligible || player?.isGpiEligible);

  let overall = player?.overall ?? player?.overallRating;
  if (overall === undefined || overall === null) {
    if (isEligible && player?.gpi?.currentGPI != null) {
      overall = Math.round(player.gpi.currentGPI);
    } else if (attrs) {
      const vals = Object.values(attrs).filter((v) => typeof v === 'number');
      overall = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
    }
  }

  const gpiVal = isEligible && (player?.gpi?.currentGPI != null || player?.currentGpi != null)
    ? (player?.gpi?.currentGPI != null ? Number(player.gpi.currentGPI).toFixed(1) : Number(player.currentGpi).toFixed(1))
    : null;

  const scale = size === 'lg' ? 1.25 : size === 'sm' ? 0.75 : 1.0;
  const width = Math.round(260 * scale);
  const height = Math.round(390 * scale);

  const photo = player?.photoUrl || player?.profilePicture;
  const playerName = player?.fullName || player?.username || 'Player';
  const clubName = player?.teamAcademy || player?.club || 'Grassroots FC';
  const pos = player?.primaryPosition || player?.position || 'CM';

  return (
    <div
      className={`relative select-none ${
        interactive ? 'group card-elevate cursor-pointer' : ''
      }`}
      style={{
        width,
        height,
        filter: `drop-shadow(0 12px 24px ${theme.glow || 'rgba(0,0,0,0.25)'})`,
      }}
    >
      <div
        className="relative w-full h-full overflow-hidden flex flex-col items-center"
        style={{
          borderRadius: `${Math.round(22 * scale)}px`,
          background: theme.gradient,
          border: `${Math.max(2, Math.round(2.5 * scale))}px solid ${theme.border}`,
          boxShadow: `inset 0 0 0 1px ${theme.borderInner || 'rgba(255,255,255,0.3)'}, 0 8px 20px rgba(0,0,0,0.3)`,
          color: theme.text,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Subtle decorative background pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
          style={{ background: theme.pattern }}
        />

        {/* Diagonal metallic light sheen */}
        <div
          className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] pointer-events-none opacity-20"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.6) 0%, transparent 60%)',
          }}
        />

        {/* Top Header Row */}
        <div
          className="w-full flex items-start justify-between relative z-10"
          style={{
            padding: `${Math.round(14 * scale)}px ${Math.round(14 * scale)}px 0`,
          }}
        >
          {/* Rating & Position block */}
          <div className="flex flex-col items-center leading-none">
            <span
              className="font-extrabold tracking-tighter"
              style={{
                fontSize: `${Math.round(34 * scale)}px`,
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                color: theme.text,
              }}
            >
              {overall ?? '--'}
            </span>
            <span
              className="font-black uppercase tracking-wider mt-0.5 px-1.5 py-0.5 rounded"
              style={{
                fontSize: `${Math.round(11 * scale)}px`,
                backgroundColor: theme.badgeBg,
                color: theme.accent,
                border: `1px solid ${theme.borderInner || 'transparent'}`,
              }}
            >
              {pos}
            </span>
            <div className="flex items-center gap-0.5 mt-1 opacity-70">
              <span className="text-amber-400 text-xs">★</span>
              <span className="text-amber-400 text-xs">★</span>
              <span className="text-amber-400 text-xs">★</span>
            </div>
          </div>

          {/* Right Header: GPI Badge */}
          <div className="flex flex-col items-end leading-none">
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-md"
              style={{
                backgroundColor: theme.badgeBg,
                border: `1px solid ${theme.borderInner || 'transparent'}`,
              }}
            >
              <span className="font-extrabold tracking-wider" style={{ fontSize: `${Math.round(9 * scale)}px`, color: theme.accent }}>
                GPI
              </span>
              <span
                className="font-black tracking-tight"
                style={{ fontSize: `${Math.round(14 * scale)}px`, color: theme.text }}
              >
                {gpiVal != null ? gpiVal : '—'}
              </span>
            </div>
            <span
              className="text-[9px] font-semibold tracking-wider mt-1 uppercase opacity-75"
              style={{ color: theme.statLabel }}
            >
              {isEligible ? 'ELIGIBLE' : 'PENDING'}
            </span>
          </div>
        </div>

        {/* Player Portrait Container */}
        <div
          className="relative z-10 flex items-center justify-center rounded-full overflow-hidden"
          style={{
            marginTop: `${Math.round(4 * scale)}px`,
            width: `${Math.round(100 * scale)}px`,
            height: `${Math.round(100 * scale)}px`,
            border: `${Math.max(2, Math.round(2.5 * scale))}px solid ${theme.border}`,
            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(0,0,0,0.2) 100%)',
            boxShadow: `0 4px 14px rgba(0,0,0,0.25), inset 0 0 10px rgba(255,255,255,0.2)`,
          }}
        >
          {photo ? (
            <img
              src={photo}
              alt={playerName}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <span
                className="font-extrabold tracking-wider"
                style={{ fontSize: `${Math.round(30 * scale)}px`, color: theme.text }}
              >
                {initials(playerName)}
              </span>
            </div>
          )}
        </div>

        {/* Player Name Banner */}
        <div
          className="w-full text-center relative z-10"
          style={{ marginTop: `${Math.round(8 * scale)}px`, padding: `0 ${Math.round(12 * scale)}px` }}
        >
          <div
            className="font-black uppercase tracking-wider truncate"
            style={{
              fontSize: `${Math.round(14 * scale)}px`,
              letterSpacing: '0.05em',
              textShadow: '0 1px 4px rgba(0,0,0,0.3)',
              color: theme.text,
            }}
          >
            {playerName}
          </div>

          <div
            className="flex items-center justify-center gap-1.5 opacity-85 mt-0.5 truncate font-medium"
            style={{ fontSize: `${Math.round(10 * scale)}px`, color: theme.accent }}
          >
            <span>{clubName}</span>
            <span>•</span>
            <span>{player?.location || 'Grassroots'}</span>
          </div>
        </div>

        {/* Ornamental Divider */}
        <div
          className="flex items-center justify-center gap-2 relative z-10 opacity-70"
          style={{
            width: '84%',
            marginTop: `${Math.round(8 * scale)}px`,
            marginBottom: `${Math.round(6 * scale)}px`,
          }}
        >
          <div className="flex-1 h-px" style={{ background: theme.border }} />
          <span className="text-[10px]">⚽</span>
          <div className="flex-1 h-px" style={{ background: theme.border }} />
        </div>

        {/* Performance Attributes Grid (FIFA / FUT Style) */}
        <div
          className="grid grid-cols-2 gap-x-5 gap-y-1 relative z-10 font-bold"
          style={{
            fontSize: `${Math.round(11 * scale)}px`,
            padding: `0 ${Math.round(18 * scale)}px`,
          }}
        >
          {['PAC', 'DRI', 'SHO', 'DEF', 'PAS', 'PHY'].map((attr) => (
            <div key={attr} className="flex items-center justify-between gap-2">
              <span
                className="font-extrabold tracking-tight stat-number"
                style={{
                  fontSize: `${Math.round(13 * scale)}px`,
                  color: theme.text,
                  minWidth: `${Math.round(20 * scale)}px`,
                }}
              >
                {attrs && attrs[attr] != null ? attrs[attr] : '--'}
              </span>
              <span
                className="font-bold tracking-wider"
                style={{
                  fontSize: `${Math.round(10 * scale)}px`,
                  color: theme.statLabel || theme.accent,
                }}
              >
                {attr}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom Card Footer */}
        <div
          className="mt-auto w-full flex items-center justify-between px-3 relative z-10"
          style={{
            height: `${Math.round(26 * scale)}px`,
            borderTop: `1px solid ${theme.borderInner || 'rgba(255,255,255,0.15)'}`,
            background: 'rgba(0,0,0,0.18)',
            fontSize: `${Math.round(8 * scale)}px`,
          }}
        >
          <div className="flex items-center gap-1 font-bold uppercase tracking-widest opacity-80">
            <span>🛡</span>
            <span>{theme.category || 'CARD'}</span>
          </div>
          <div className="font-extrabold uppercase tracking-widest opacity-90" style={{ color: theme.accent }}>
            {theme.label}
          </div>
          <div className="font-semibold tracking-wider opacity-70">
            GPI 2026
          </div>
        </div>
      </div>
    </div>
  );
}
