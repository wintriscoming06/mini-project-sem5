import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tournamentService } from '../../services/api';
import { Card, Button, FormInput, Alert, TrophyIcon } from '../../components/common';
import { Save, ArrowLeft, Trophy, Calendar, MapPin } from 'lucide-react';
import PitchHero from '../../components/common/PitchHero';
import { ClassicSoccerBall, GrassBladesTrim, CornerFlag } from '../../components/common/FootballIcons';

const CreateTournament = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    ageGroup: 'Open',
    genderCategory: 'Mixed',
    location: '',
    venue: '',
    startDate: '',
    endDate: '',
    format: 'League',
    registrationDeadline: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "Tournament name is required.";
    if (!formData.startDate) return "Start date is required.";
    if (!formData.endDate) return "End date is required.";
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      return "End date cannot be before start date.";
    }
    if (formData.registrationDeadline && new Date(formData.registrationDeadline) > new Date(formData.startDate)) {
      return "Registration deadline must be before the start date.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await tournamentService.create(formData);
      navigate(`/tournaments/${response.data.id}/manage`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create tournament. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Stadium Pitch Hero Banner */}
      <PitchHero
        title="Sanction New Competition"
        subtitle="Set up league specifications, knockout stages, host stadiums, and official registration windows."
        badgeText="COMPETITION SANCTIONING"
        actionButtons={
          <Button 
            variant="outline" 
            onClick={() => navigate('/my-tournaments')}
            icon={<ArrowLeft className="w-4 h-4 mr-1.5" />}
          >
            Back to Tournaments
          </Button>
        }
      />

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <Card className="relative overflow-hidden border-2 border-emerald-900/30">
        <div className="h-1.5 bg-gradient-to-r from-emerald-600 via-emerald-400 to-green-600 -mx-6 -mt-6 mb-6" />
        <div className="absolute inset-0 goal-net-texture opacity-10 pointer-events-none" />
        
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          
          {/* General Details */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center">
              <Trophy className="w-4 h-4 mr-2 text-amber-500" /> Competition Specifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <FormInput
                  label="Competition / Tournament Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. National Scouting Championship 2026"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Age Category *
                </label>
                <select
                  name="ageGroup"
                  value={formData.ageGroup}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#081b29] text-slate-900 dark:text-white"
                >
                  <option value="U13">Under 13 (U13)</option>
                  <option value="U15">Under 15 (U15)</option>
                  <option value="U17">Under 17 (U17)</option>
                  <option value="U19">Under 19 (U19)</option>
                  <option value="U21">Under 21 (U21)</option>
                  <option value="Open">Open Senior</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Division Gender *
                </label>
                <select
                  name="genderCategory"
                  value={formData.genderCategory}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#081b29] text-slate-900 dark:text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Tournament Format *
                </label>
                <select
                  name="format"
                  value={formData.format}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-[#081b29] text-slate-900 dark:text-white"
                >
                  <option value="League">Standard League (Round Robin Points)</option>
                  <option value="Knockout">Single Elimination Knockout</option>
                  <option value="Group+Knockout">Group Stage + Knockout Championship</option>
                  <option value="Round Robin">Round Robin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location & Dates */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-teal-500" /> Host Stadium & Fixture Schedule
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="City / Region"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Manchester, UK"
              />
              <FormInput
                label="Host Stadium / Venue Name"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="e.g. Etihad Academy Stadium"
              />
              
              <FormInput
                label="Tournament Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
              <FormInput
                label="Tournament End Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
              
              <div className="md:col-span-2">
                <FormInput
                  label="Team Registration Deadline"
                  name="registrationDeadline"
                  type="date"
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => navigate('/my-tournaments')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              icon={Save}
              loading={loading}
            >
              Launch Competition
            </Button>

          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateTournament;
