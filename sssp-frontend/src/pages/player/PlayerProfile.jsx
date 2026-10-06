import React, { useState, useEffect } from 'react';
import { Camera, Edit2, Save, X, User, MapPin, Calendar, Activity, Shield } from 'lucide-react';
import { playerService, getErrorMessage } from '../../services/api';
import { LoadingSpinner, Alert, Card, Button, FormInput, StatusBadge } from '../../components/common';

const PlayerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({});
  const [extras, setExtras] = useState({ gpi: null, overallRank: null, totals: null });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await playerService.getProfile();
      setProfile(res.data);
      setFormData(res.data);
      setError(null);

      // System-generated / verified figures live in other endpoints; absence is normal for new players.
      const [gpiRes, rankRes, perfRes] = await Promise.all([
        playerService.getGPI().catch(() => null),
        playerService.getRanking().catch(() => null),
        playerService.getPerformance().catch(() => null)
      ]);
      const history = Array.isArray(perfRes?.data) ? perfRes.data : [];
      const overall = Array.isArray(rankRes?.data) ? rankRes.data.find((r) => r.context === 'OVERALL') : null;
      setExtras({
        gpi: gpiRes?.data || null,
        overallRank: overall?.rankValue ?? null,
        totals: {
          matches: history.reduce((n, h) => n + (h.totalMatches || 0), 0),
          goals: history.reduce((n, h) => n + (h.totalGoals || 0), 0),
          assists: history.reduce((n, h) => n + (h.totalAssists || 0), 0)
        }
      });
    } catch (err) {
      const status = err?.response?.status;
      setError(getErrorMessage(err, 'Failed to load profile.'));
      if (status === 404) setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => setIsEditing(true);
  
  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const payload = {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth || null,
        location: formData.location,
        preferredFoot: formData.preferredFoot,
        primaryPosition: formData.primaryPosition,
        secondaryPosition: formData.secondaryPosition,
        teamAcademy: formData.teamAcademy,
        photoUrl: formData.photoUrl,
        biography: formData.biography,
        visibility: formData.visibility
      };
      const res = await playerService.updateProfile(payload);
      setProfile(res.data);
      setFormData(res.data);
      setSuccess('Profile updated successfully.');
      setIsEditing(false);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update profile.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><LoadingSpinner size="large" /></div>;
  if (!profile) return <div className="p-6"><Alert type="error" message={error || 'Profile not found.'} /></div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        <div className="px-6 pb-6 relative">
          <div className="flex justify-between items-end -mt-12 mb-4">
            <div className="flex items-end space-x-4">
              <div className="relative h-24 w-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                {formData.photoUrl ? (
                  <img src={formData.photoUrl} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-gray-400" />
                )}
                {isEditing && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <div className="pb-2">
                <h1 className="text-2xl font-bold text-gray-900">{profile.fullName || 'Anonymous Player'}</h1>
                <p className="text-gray-500">{profile.primaryPosition || 'Position Not Set'} • {profile.location || 'Location Not Set'}</p>
              </div>
            </div>
            {!isEditing && (
              <Button onClick={handleEdit} variant="outline" className="flex items-center">
                <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card title="Personal Information">
            <div className="space-y-4">
              <FormInput label="Full Name" name="fullName" value={formData.fullName || ''} onChange={handleChange} disabled={!isEditing} />
              <FormInput label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth || ''} onChange={handleChange} disabled={!isEditing} />
              <FormInput label="Location" name="location" value={formData.location || ''} onChange={handleChange} disabled={!isEditing} />
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">Preferred Foot</label>
                <select name="preferredFoot" value={formData.preferredFoot || ''} onChange={handleChange} disabled={!isEditing} className="border border-gray-300 rounded-lg p-2 disabled:bg-gray-50 disabled:text-gray-500">
                  <option value="">Select...</option>
                  <option value="RIGHT">Right</option>
                  <option value="LEFT">Left</option>
                  <option value="BOTH">Both</option>
                </select>
              </div>
            </div>
          </Card>

          <Card title="Football Information">
            <div className="space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">Primary Position</label>
                <select name="primaryPosition" value={formData.primaryPosition || ''} onChange={handleChange} disabled={!isEditing} className="border border-gray-300 rounded-lg p-2 disabled:bg-gray-50 disabled:text-gray-500">
                  <option value="">Select...</option>
                  <option value="GK">Goalkeeper (GK)</option>
                  <option value="CB">Center Back (CB)</option>
                  <option value="LB">Left Back (LB)</option>
                  <option value="RB">Right Back (RB)</option>
                  <option value="DM">Defensive Mid (DM)</option>
                  <option value="CM">Center Mid (CM)</option>
                  <option value="AM">Attacking Mid (AM)</option>
                  <option value="LW">Left Wing (LW)</option>
                  <option value="RW">Right Wing (RW)</option>
                  <option value="ST">Striker (ST)</option>
                </select>
              </div>
              <FormInput label="Secondary Position" name="secondaryPosition" value={formData.secondaryPosition || ''} onChange={handleChange} disabled={!isEditing} />
              <FormInput label="Team/Academy" name="teamAcademy" value={formData.teamAcademy || ''} onChange={handleChange} disabled={!isEditing} />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Biography & Settings">
            <div className="space-y-4">
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">Biography</label>
                <textarea name="biography" rows="4" value={formData.biography || ''} onChange={handleChange} disabled={!isEditing} className="border border-gray-300 rounded-lg p-2 disabled:bg-gray-50 disabled:text-gray-500" placeholder="Tell us about yourself..."></textarea>
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">Visibility Setting</label>
                <select name="visibility" value={formData.visibility || 'PUBLIC'} onChange={handleChange} disabled={!isEditing} className="border border-gray-300 rounded-lg p-2 disabled:bg-gray-50 disabled:text-gray-500">
                  <option value="PUBLIC">Public</option>
                  <option value="RESTRICTED">Restricted</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>
            </div>
          </Card>

          <Card title={
            <div className="flex items-center text-gray-500">
              <Shield className="w-5 h-5 mr-2" />
              <span>Verified Stats (Organizer Verified)</span>
            </div>
          }>
            <div className="grid grid-cols-2 gap-4 opacity-75">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 uppercase">Matches</p>
                <p className="text-lg font-bold">{extras.totals?.matches ?? 0}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 uppercase">Goals</p>
                <p className="text-lg font-bold">{extras.totals?.goals ?? 0}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 uppercase">Assists</p>
                <p className="text-lg font-bold">{extras.totals?.assists ?? 0}</p>
              </div>
            </div>
          </Card>

          <Card title={
            <div className="flex items-center text-indigo-500">
              <Activity className="w-5 h-5 mr-2" />
              <span>System Generated</span>
            </div>
          }>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">GPI Score</span>
                <span className="font-bold text-gray-900">{extras.gpi ? Number(extras.gpi.gpi).toFixed(1) : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Ranking</span>
                <span className="font-bold text-gray-900">{extras.overallRank ? `#${extras.overallRank}` : 'Unranked'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Data Confidence</span>
                <StatusBadge status="INFO" label={extras.gpi?.dataConfidence || 'LOW'} />
              </div>
            </div>
          </Card>
        </div>
        
        {isEditing && (
          <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default PlayerProfile;
