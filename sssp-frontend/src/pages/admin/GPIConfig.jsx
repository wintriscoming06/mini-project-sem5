import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/api';
import { Settings, Save, RefreshCw, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

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
      setSuccess('GPI Configuration updated successfully.');
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
    <div className="max-w-5xl mx-auto p-6 space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Settings className="w-6 h-6 mr-2 text-indigo-600" /> GPI Configuration
        </h1>
        <p className="text-gray-500 mt-1">Adjust the algorithm weights used to calculate the Global Performance Index.</p>
      </div>

      {error && <Alert type="error" message={error} />}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center"><CheckCircle className="w-5 h-5 mr-2"/>{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Global Settings */}
        <div className="md:col-span-1 bg-white p-5 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Global Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantitative Weight (%)</label>
              <input 
                type="number" min="0" max="100" 
                value={globalSettings.quantWeight} 
                onChange={e => setGlobalSettings({...globalSettings, quantWeight: e.target.value})}
                className="w-full border-gray-300 rounded p-2 text-sm focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observation Weight (%)</label>
              <input 
                type="number" min="0" max="100" 
                value={globalSettings.obsWeight} 
                onChange={e => setGlobalSettings({...globalSettings, obsWeight: e.target.value})}
                className="w-full border-gray-300 rounded p-2 text-sm focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">Must sum to 100% with Quant Weight.</p>
            </div>
            <hr className="my-4"/>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Matches for Eligibility</label>
              <input 
                type="number" min="1" 
                value={globalSettings.minMatches} 
                onChange={e => setGlobalSettings({...globalSettings, minMatches: e.target.value})}
                className="w-full border-gray-300 rounded p-2 text-sm focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">Players below this get 'Provisional' status.</p>
            </div>
          </div>
        </div>

        {/* Positional Weights */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200 bg-gray-50">
            {POSITIONS.map(pos => (
              <button 
                key={pos} 
                onClick={() => setActiveTab(pos)}
                className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === pos ? 'border-indigo-600 text-indigo-600 bg-white' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {pos}
              </button>
            ))}
          </div>
          
          <div className="p-6 space-y-6">
            <div className={`flex items-center justify-between p-3 rounded-lg border ${currentSum === 100 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              <div className="flex items-center">
                {currentSum !== 100 && <AlertTriangle className="w-5 h-5 mr-2" />}
                <span className="font-semibold">Total Weight</span>
              </div>
              <span className="text-xl font-bold">{currentSum}%</span>
            </div>

            <div className="space-y-4">
              {[
                { key: 'contribution', label: activeTab === 'GOALKEEPER' ? 'Save Contribution' : activeTab === 'DEFENDER' ? 'Defensive Contribution' : 'Goal Contribution' },
                { key: 'matchContrib', label: 'Match Contribution (Minutes)' },
                { key: 'consistency', label: 'Consistency' },
                { key: 'recentForm', label: 'Recent Form (Last 5)' },
                { key: 'participation', label: 'Tournament Participation' },
                { key: 'other', label: 'Discipline / Other' }
              ].map(field => (
                <div key={field.key} className="flex items-center space-x-4">
                  <label className="w-1/3 text-sm font-medium text-gray-700">{field.label}</label>
                  <input 
                    type="range" min="0" max="100" 
                    value={weights[activeTab][field.key]} 
                    onChange={e => handleWeightChange(activeTab, field.key, e.target.value)}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <input 
                    type="number" min="0" max="100"
                    value={weights[activeTab][field.key]} 
                    onChange={e => handleWeightChange(activeTab, field.key, e.target.value)}
                    className="w-20 border-gray-300 rounded p-1 text-center text-sm"
                  />
                  <span className="text-gray-500 text-sm">%</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 border-t border-gray-200 pt-6">
        <button 
          onClick={() => { setWeights(defaultWeights); setGlobalSettings({ quantWeight: 70, obsWeight: 30, minMatches: 5 }); }} 
          className="px-4 py-2 flex items-center text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 font-medium"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Reset Defaults
        </button>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="px-6 py-2 flex items-center bg-indigo-600 text-white rounded hover:bg-indigo-700 font-medium disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}

// Needed for successful notification
import { CheckCircle } from 'lucide-react';
