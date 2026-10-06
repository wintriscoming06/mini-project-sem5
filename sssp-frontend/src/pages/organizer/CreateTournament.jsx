import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tournamentService } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import FormInput from '../../components/common/FormInput';
import Alert from '../../components/common/Alert';
import { Save, ArrowLeft } from 'lucide-react';

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
      // Create tournament (status will likely be DRAFT by default from backend)
      const response = await tournamentService.create(formData);
      // Navigate to the management page of the newly created tournament
      navigate(`/organizer/tournaments/${response.data.id}`);
    } catch (err) {
      console.error("Create tournament error:", err);
      setError(err.response?.data?.message || "Failed to create tournament. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/organizer/tournaments')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Tournament</h1>
          <p className="text-gray-500">Set up a new sports event</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* General Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">General Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <FormInput
                  label="Tournament Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Summer Youth Cup 2024"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age Group *</label>
                <select
                  name="ageGroup"
                  value={formData.ageGroup}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="U13">Under 13</option>
                  <option value="U15">Under 15</option>
                  <option value="U17">Under 17</option>
                  <option value="U19">Under 19</option>
                  <option value="U21">Under 21</option>
                  <option value="Open">Open</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender Category *</label>
                <select
                  name="genderCategory"
                  value={formData.genderCategory}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format *</label>
                <select
                  name="format"
                  value={formData.format}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="League">League</option>
                  <option value="Knockout">Knockout</option>
                  <option value="Group+Knockout">Group + Knockout</option>
                  <option value="Round Robin">Round Robin</option>
                </select>
              </div>
            </div>
          </div>

          {/* Location & Dates */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Location & Schedule</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="City/Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. New York, NY"
              />
              <FormInput
                label="Venue Name"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="e.g. Central City Stadium"
              />
              
              <FormInput
                label="Start Date *"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
              <FormInput
                label="End Date *"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
              
              <FormInput
                label="Registration Deadline"
                name="registrationDeadline"
                type="date"
                value={formData.registrationDeadline}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/organizer/tournaments')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              icon={<Save size={18} />}
              isLoading={loading}
            >
              Create Tournament
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateTournament;
