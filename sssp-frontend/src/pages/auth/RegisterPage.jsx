import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, AtSign, UserPlus, Eye, EyeOff } from 'lucide-react';
import { authService, getErrorMessage } from '../../services/api';
import { Alert, ClassicSoccerBall } from '../../components/common';
import AuthLayout from '../../components/auth/AuthLayout';
import RoleSelectDropdown from '../../components/auth/RoleSelectDropdown';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
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
      const { confirmPassword, fullName, ...registerPayload } = formData;
      // Derive valid fallback email if not provided, ensuring seamless API compatibility
      const sanitizedUsername = formData.username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
      const payloadWithEmail = {
        ...registerPayload,
        username: formData.username.trim(),
        email: `${sanitizedUsername || 'user'}@sssp.org`,
      };
      await authService.register(payloadWithEmail);
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
      <div className="relative overflow-hidden bg-slate-900/95 dark:bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-md">
        {/* Top Trim */}
        <div className="h-2.5 bg-blue-600 rounded-t-3xl -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 mb-4" />

        {/* Goal Net Texture Watermark */}
        <div className="absolute inset-0 goal-net-texture opacity-15 pointer-events-none" />

        {/* Form Header */}
        <div className="text-left mb-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-400/40 text-blue-300 text-xs font-black uppercase tracking-widest mb-3 shadow-md">
            <ClassicSoccerBall className="w-4 h-4" />
            <span>OFFICIAL ROSTER CONTRACT DRAFT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-between">
            <span>Sign Contract</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-800/40 text-blue-200 border border-blue-500/30 uppercase tracking-wider">
              {formData.role}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
            Register your official credentials in SSSP
          </p>
        </div>

        {/* Alerts */}
        {error && <Alert type="error" message={error} className="mb-4 relative z-10" />}
        {success && <Alert type="success" message={success} className="mb-4 relative z-10" />}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 relative z-10">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Full Name <span className="text-blue-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Username <span className="text-blue-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <AtSign className="w-4 h-4" />
              </div>
              <input
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username (for signing in)"
                required
                className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Password & Confirm Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Password <span className="text-blue-400">*</span>
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
                  className="w-full pl-9 pr-8 py-2 bg-slate-950/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
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
                Confirm Password <span className="text-blue-400">*</span>
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
                  className="w-full pl-9 pr-8 py-2 bg-slate-950/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200"
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
            className="group w-full py-3.5 mt-3 rounded-xl bg-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-blue-500/25 flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none btn-micro-press active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
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
        <div className="mt-5 pt-4 border-t border-slate-700/60 text-center text-xs text-slate-300 relative z-10">
          Already registered in the official registry?{' '}
          <Link
            to="/login"
            className="font-bold text-blue-400 hover:text-white ml-1 underline decoration-blue-400/60 hover:decoration-white transition-all"
          >
            Sign In to Account
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
