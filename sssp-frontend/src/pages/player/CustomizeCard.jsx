import React, { useEffect, useState } from 'react';
import { Sparkles, Shield, Check, Info } from 'lucide-react';
import { playerService, getErrorMessage } from '../../services/api';
import PlayerFUTCard from '../../components/common/PlayerFUTCard';
import { CARD_DESIGNS, CARD_DESIGN_NAMES } from '../../utils/cardDesigns';
import { LoadingSpinner, Alert, PitchHero } from '../../components/common';

export default function CustomizeCard() {
  const [player, setPlayer] = useState(null);
  const [design, setDesign] = useState('Bronze');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    playerService.getProfile()
      .then((res) => {
        const p = res.data?.player || res.data;
        setPlayer(p);
        const currentDesign = p?.card?.design || p?.cardDesign || 'Bronze';
        setDesign(currentDesign);
      })
      .catch((err) => {
        setError(getErrorMessage(err, 'Failed to load card profile.'));
      });
  }, []);

  const selectAndSaveDesign = async (chosenName) => {
    setDesign(chosenName);
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await playerService.updateCard({ design: chosenName, theme: 'light' });
      setMessage(`Card style updated to ${chosenName}.`);
      setPlayer((prev) => ({
        ...prev,
        card: { ...(prev?.card || {}), design: chosenName },
        cardDesign: chosenName
      }));
    } catch (err) {
      setError(getErrorMessage(err, 'Could not save card style.'));
    } finally {
      setSaving(false);
    }
  };

  if (!player && !error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" text="Loading player card studio..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-xs font-black tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>PLAYER CARD STUDIO</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
          Customize Your Card
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mt-1">
          Select from authentic European tournament, rare gold, and classic football aesthetic card designs.
        </p>
      </div>

      {message && <Alert type="success" message={message} onClose={() => setMessage('')} />}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visual Card Selection Gallery */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-[#071927] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-slate-900 dark:text-white text-base">
                Card Gallery
              </h2>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {CARD_DESIGN_NAMES.length} THEMES AVAILABLE
              </span>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {CARD_DESIGN_NAMES.map((name) => {
                const conf = CARD_DESIGNS[name];
                const isSelected = design === name;

                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => selectAndSaveDesign(name)}
                    className={`group relative rounded-xl p-3 text-left transition-all duration-300 ease-out border-2 overflow-hidden flex flex-col justify-between cursor-pointer card-elevate hover:-translate-y-1.5 hover:shadow-lg ${
                      isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-500/40 shadow-emerald-500/20 scale-[1.02] shadow-md'
                        : 'border-slate-200 dark:border-slate-700 hover:border-emerald-400/60'
                    }`}
                    style={{
                      background: conf.gradient,
                      color: conf.text,
                      minHeight: '115px',
                    }}
                  >
                    {/* Active checkmark badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow animate-scale-in">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}

                    {/* Top rating preview */}
                    <div className="flex items-baseline gap-1">
                      <span className="font-extrabold text-lg tracking-tight">
                        {player?.overall ?? player?.overallRating ?? 75}
                      </span>
                      <span
                        className="text-[9px] font-bold px-1 rounded uppercase opacity-90"
                        style={{ background: conf.badgeBg, color: conf.accent }}
                      >
                        {player?.primaryPosition || player?.position || 'CM'}
                      </span>
                    </div>

                    {/* Label */}
                    <div>
                      <div className="text-[9px] font-semibold uppercase tracking-wider opacity-75">
                        {conf.category}
                      </div>
                      <div className="font-black text-xs uppercase tracking-tight">
                        {conf.label}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cosmetic Disclaimer Box */}
          <div className="rounded-2xl p-4 bg-emerald-50/60 dark:bg-[#06241a] border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-slate-600 dark:text-emerald-200/80 flex gap-3 items-start">
            <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block mb-0.5">
                Cosmetic Customization Only
              </span>
              Card decoration has <strong className="text-slate-900 dark:text-white">ZERO</strong> effect on GPI, Overall Rating, PAC, SHO, PAS, DRI, DEF, PHY, or match statistics. It is purely cosmetic for your public profile and scouting card presentation.
            </div>
          </div>
        </div>

        {/* Right Column: Live Card Preview */}
        <div className="lg:col-span-5 flex flex-col items-center stagger-2">
          <div className="bg-white dark:bg-[#071927] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm w-full flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                Live Card Preview
              </span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 transition-all duration-300">
                {design}
              </span>
            </div>

            <div key={design} className="py-2 animate-role-morph">
              <PlayerFUTCard player={player} design={design} size="md" interactive={false} />
            </div>

            <p className="text-[11px] font-medium text-slate-400 mt-6 text-center">
              Card design is saved automatically upon selection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
