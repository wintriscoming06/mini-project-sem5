import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { Settings, Save, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const POSITIONS = ['FORWARD', 'MIDFIELDER', 'DEFENDER', 'GOALKEEPER'];

const defaultWeights = {
  FORWARD: { contribution: 40, matchContrib: 20, consistency: 15, recentForm: 15, participation: 5, other: 5 },
  MIDFIELDER: { contribution: 30, matchContrib: 30, consistency: 15, recentForm: 15, participation: 5, other: 5 },
  DEFENDER: { contribution: 35, matchContrib: 25, consistency: 15, recentForm: 15, participation: 5, other: 5 },
  GOALKEEPER: { contribution: 45, matchContrib: 15, consistency: 15, recentForm: 15, participation: 5, other: 5 }
};

export default function GPIConfig() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [activeTab, setActiveTab] = useState('FORWARD');
  
  const [globalSettings, setGlobalSettings] = useState({
    quantWeight: 70,
    obsWeight: 30,
    minMatches: 5
  });
  
  const [weights, setWeights] = useState(defaultWeights);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await adminService.getGPIConfig().catch(() => ({ data: null }));
      if (res.data) {
        setGlobalSettings(res.data.global || globalSettings);
        setWeights(res.data.weights || defaultWeights);
      }
    } catch (err) {
      setError('Failed to fetch GPI config. Using defaults.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate sums
    for (const pos of POSITIONS) {
      const sum = Object.values(weights[pos]).reduce((a, b) => Number(a) + Number(b), 0);
      if (sum !== 100) {
        setError(`Total weight for ${pos} must equal 100%. Currently ${sum}%.`);
        return;
      }
    }
    
    if (Number(globalSettings.quantWeight) + Number(globalSettings.obsWeight) !== 100) {
      setError('Global Quantitative and Observation weights must sum to 100%.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await adminService.updateGPIConfig({ global: globalSettings, weights });
      setSuccess('GPI Configuration algorithm parameters saved.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleWeightChange = (pos, field, value) => {
    setWeights(prev => ({
      ...prev,
      [pos]: { ...prev[pos], [field]: Number(value) }
    }));
  };

  const currentSum = Object.values(weights[activeTab]).reduce((a, b) => Number(a) + Number(b), 0);

  if (loading) return <div className="p-10 flex justify-center"><LoadingSpinner /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-6 bg-white dark:bg-[#0b1e2d] rounded-2xl border border-slate-200 dark:border-emerald-950/40 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center">
            <Settings className="w-7 h-7 mr-3 text-emerald-500" /> GPI Algorithmic Weight Matrix
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Configure mathematical weightings across positions and quantitative vs qualitative scouting ratios.
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-xl flex items-center text-sm font-semibold">
          <CheckCircle className="w-5 h-5 mr-2"/>{success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Global Settings */}
        <Card className="md:col-span-1 p-5 h-fit">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
            Global Algorithm Ratios
          </h3>
          
          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Quantitative Match Stats Weight (%)
              </label>
              <input 
                type="number" min="0" max="100" 
                value={globalSettings.quantWeight} 
                onChange={e => setGlobalSettings({...globalSettings, quantWeight: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:ring-emerald-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Scout Field Observation Weight (%)
              </label>
              <input 
                type="number" min="0" max="100" 
                value={globalSettings.obsWeight} 
                onChange={e => setGlobalSettings({...globalSettings, obsWeight: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:ring-emerald-500 font-bold"
              />
              <p className="text-xs text-slate-400 mt-1">Must equal 100% total combined weight.</p>
            </div>
            
            <hr className="my-3 border-slate-200 dark:border-slate-800"/>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Min Matches for Official GPI
              </label>
              <input 
                type="number" min="1" 
                value={globalSettings.minMatches} 
                onChange={e => setGlobalSettings({...globalSettings, minMatches: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:ring-emerald-500 font-bold"
              />
              <p className="text-xs text-slate-400 mt-1">Players with fewer matches receive "Provisional" index.</p>
            </div>
          </div>
        </Card>

        {/* Positional Weights */}
        <Card className="md:col-span-2 overflow-hidden">
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            {POSITIONS.map(pos => (
              <button 
                key={pos} 
                onClick={() => setActiveTab(pos)}
                className={`flex-1 py-3 text-xs font-black text-center tracking-wider border-b-2 transition-all ${
                  activeTab === pos 
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-[#0b1e2d]' 
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
          
          <div className="p-6 space-y-6">
            <div className={`flex items-center justify-between p-3 rounded-xl border ${
              currentSum === 100 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
            }`}>
              <div className="flex items-center">
                {currentSum !== 100 && <AlertTriangle className="w-5 h-5 mr-2" />}
                <span className="font-bold text-sm">Positional Attribute Sum</span>
              </div>
              <span className="text-xl font-black">{currentSum}%</span>
            </div>

            <div className="space-y-4">
              {[
                { key: 'contribution', label: activeTab === 'GOALKEEPER' ? 'Clean Sheets & Saves Contribution' : activeTab === 'DEFENDER' ? 'Defensive Interceptions & Tackles' : 'Goal Contribution (G+A)' },
                { key: 'matchContrib', label: 'Match Contribution (Minutes & Starts)' },
                { key: 'consistency', label: 'Rating Consistency Index' },
                { key: 'recentForm', label: 'Recent Form (Last 5 Fixtures)' },
                { key: 'participation', label: 'Tournament Participation Rate' },
                { key: 'other', label: 'Disciplinary Record & Fair Play' }
              ].map(field => (
                <div key={field.key} className="flex items-center space-x-4">
                  <label className="w-1/3 text-xs font-semibold text-slate-600 dark:text-slate-300">{field.label}</label>
                  <input 
                    type="range" min="0" max="100" 
                    value={weights[activeTab][field.key]} 
                    onChange={e => handleWeightChange(activeTab, field.key, e.target.value)}
                    className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex items-center space-x-1">
                    <input 
                      type="number" min="0" max="100"
                      value={weights[activeTab][field.key]} 
                      onChange={e => handleWeightChange(activeTab, field.key, e.target.value)}
                      className="w-16 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 text-center text-xs font-bold text-slate-900 dark:text-white"
                    />
                    <span className="text-slate-400 text-xs">%</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </Card>
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <Button 
          variant="secondary"
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={() => { setWeights(defaultWeights); setGlobalSettings({ quantWeight: 70, obsWeight: 30, minMatches: 5 }); }} 
        >
          Reset Defaults
        </Button>
        <Button 
          variant="primary"
          icon={<Save className="w-4 h-4" />}
          onClick={handleSave} 
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Algorithm Config'}
        </Button>
      </div>
    </div>
  );
}
