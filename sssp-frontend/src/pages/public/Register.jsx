import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trophy, Mail, Lock, User, UserPlus, Eye, EyeOff } from 'lucide-react';
import { authService, getErrorMessage } from '../../services/api';
import { Alert, ClassicSoccerBall, GrassBladesTrim } from '../../components/common';
import AuthLayout from '../../components/auth/AuthLayout';
import RoleSelectDropdown from '../../components/auth/RoleSelectDropdown';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'PLAYER',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (newRole) => {
    setFormData((prev) => ({
      ...prev,
      role: newRole,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerPayload } = formData;
      await authService.register(registerPayload);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout activeRole={formData.role} onRoleChange={handleRoleChange}>
      <div className="relative overflow-hidden bg-emerald-950/90 dark:bg-[#071c14]/95 border-2 border-emerald-500/40 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-md">
        {/* Pitch Grass Top Trim */}
        <div className="h-2.5 bg-gradient-to-r from-emerald-600 via-emerald-400 to-green-600 rounded-t-3xl -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 mb-4" />
        
        {/* Grass Blades Trim */}
        <div className="overflow-hidden leading-none -mx-6 sm:-mx-8 mb-4 pointer-events-none opacity-40">
          <GrassBladesTrim className="w-full h-3 text-emerald-400" />
        </div>

        {/* Goal Net Texture Watermark */}
        <div className="absolute inset-0 goal-net-texture opacity-15 pointer-events-none" />

        {/* Form Header */}
        <div className="text-left mb-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/80 border border-emerald-400/50 text-emerald-300 text-xs font-black uppercase tracking-widest mb-3 shadow-md">
            <ClassicSoccerBall className="w-4 h-4" />
            <span>OFFICIAL ROSTER CONTRACT DRAFT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-between">
            <span>Sign Contract</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-800/60 text-emerald-200 border border-emerald-500/30 uppercase tracking-wider">
              {formData.role}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-emerald-200/80 mt-1 font-medium">
            Register your official player or scouting credentials in SSSP
          </p>
        </div>

        {/* Alerts */}
        {error && <Alert type="error" message={error} className="mb-4 relative z-10" />}
        {success && <Alert type="success" message={success} className="mb-4 relative z-10" />}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 relative z-10">
          {/* Full Name / Username */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Full Name / Username <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your name or username"
                required
                className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Email Address <span className="text-emerald-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                required
                className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Password & Confirm Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Password <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 chars"
                  required
                  className="w-full pl-9 pr-8 py-2 bg-slate-950/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Confirm Password <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                  className="w-full pl-9 pr-8 py-2 bg-slate-950/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Custom Modern Role Dropdown */}
          <RoleSelectDropdown
            value={formData.role}
            onChange={handleChange}
            name="role"
            disabled={loading || success}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !!success}
            className="group w-full py-3.5 mt-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/30 flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none btn-micro-press active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registering Contract...
              </span>
            ) : (
              <span className="flex items-center">
                <UserPlus className="w-4 h-4 mr-2" />
                <span>Confirm & Sign Roster Contract</span>
              </span>
            )}
          </button>

        </form>

        {/* Footer Link to Login */}
        <div className="mt-5 pt-4 border-t border-emerald-800/60 text-center text-xs text-emerald-200/80 relative z-10">
          Already registered in the official registry?{' '}
          <Link
            to="/login"
            className="font-black text-emerald-300 hover:text-white ml-1 underline decoration-emerald-400/60 hover:decoration-white transition-all"
          >
            Sign In to Locker Room
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
