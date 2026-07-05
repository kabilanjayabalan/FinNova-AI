import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { TrendingUp, User, Mail, Phone, Lock, Eye, EyeOff, X, LineChart, Sparkles } from 'lucide-react';

/* ── Google G SVG ──────────────────────────────────────────────── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <g>
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </g>
  </svg>
);

/* ── Google Completion Modal ───────────────────────────────────── */
const GoogleProfileModal = ({ onClose, onSubmit, loading }) => {
  const [data, setData] = useState({ username: '', mobileNumber: '', password: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (data.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setError('');
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-violet-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-3 mb-1">
            <Sparkles size={20} className="text-blue-200" />
            <h2 className="text-xl font-bold">Complete Your Profile</h2>
          </div>
          <p className="text-blue-100 text-sm">
            Just a few more details to finish setting up your account.
          </p>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Username *</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  required
                  value={data.username}
                  onChange={handleChange}
                  placeholder="e.g. john_doe"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mobile Number</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  name="mobileNumber"
                  value={data.mobileNumber}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password *</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  required
                  value={data.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm Password *</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={data.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-blue-500 to-violet-600 text-white py-3 rounded-xl font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

/* ── Register Page ─────────────────────────────────────────────── */
const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '', username: '', email: '', mobileNumber: '', password: '', confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const payload = { ...formData };
      delete payload.confirmPassword;
      const res = await api.post('/auth/register', payload);
      if (res.data.success) {
        navigate('/login');
      }
    } catch (err) {
      if (err.response?.data?.data) {
        setError(Object.values(err.response.data.data)[0]);
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleComplete = async (profileData) => {
    setLoading(true);
    try {
      // In a real app this would combine OAuth token with profile data
      // Here we simulate: call register endpoint with google-provided fields
      const payload = {
        fullName: 'Google User', // Would come from OAuth
        email: 'google@example.com', // Would come from OAuth
        username: profileData.username,
        mobileNumber: profileData.mobileNumber,
        password: profileData.password,
      };
      const res = await api.post('/auth/register', payload);
      if (res.data.success) {
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
      setShowGoogleModal(false);
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors";

  return (
    <>
      {showGoogleModal && (
        <GoogleProfileModal
          onClose={() => setShowGoogleModal(false)}
          onSubmit={handleGoogleComplete}
          loading={loading}
        />
      )}

      <div className="flex min-h-screen">
        {/* ── Left branding panel ─────────────────────────────── */}
        <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/3 -left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <TrendingUp size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">FinNova AI</span>
          </div>

          <div className="relative z-10">
            <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-8 border border-blue-400/20">
              <LineChart size={40} className="text-blue-300" />
            </div>
            <h1 className="text-4xl font-black leading-tight mb-4">
              Start Your<br />
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                Journey
              </span>
            </h1>
            <p className="text-blue-200 text-lg leading-relaxed max-w-xs">
              Join thousands of investors using AI to make smarter investment decisions.
            </p>
          </div>

          <p className="text-blue-300/50 text-sm relative z-10">
            © {new Date().getFullYear()} FinNova AI
          </p>
        </div>

        {/* ── Right form panel ────────────────────────────────── */}
        <div className="w-full lg:w-3/5 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
          <div className="w-full max-w-lg py-8">
            {/* Mobile logo */}
            <div className="flex items-center justify-center gap-2.5 mb-8 lg:hidden">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center">
                <TrendingUp size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">FinNova AI</span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="mb-7">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                <p className="text-gray-500">Sign up to start your investment journey.</p>
              </div>

              {/* Google sign-up button */}
              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 shadow-sm mb-6"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400 font-medium">OR REGISTER WITH EMAIL</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Row 1: Full Name + Username */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name *</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange}
                        placeholder="John Doe" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Username *</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">@</span>
                      <input type="text" name="username" required value={formData.username} onChange={handleChange}
                        placeholder="johndoe" className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Row 2: Email + Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email *</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="email" name="email" required value={formData.email} onChange={handleChange}
                        placeholder="you@example.com" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Mobile Number</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange}
                        placeholder="+1 (555) 000-0000" className={inputClass} />
                    </div>
                  </div>
                </div>

                {/* Row 3: Password + Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password *</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password" required value={formData.password} onChange={handleChange}
                        placeholder="Min 8 characters"
                        className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      />
                      <button type="button" onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Confirm Password *</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange}
                        placeholder="Repeat password" className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" required className="mt-0.5 rounded border-gray-300 text-blue-500 focus:ring-blue-500/20" />
                    <span>
                      I agree to the{' '}
                      <a href="#" className="text-blue-600 hover:underline">Terms & Conditions</a>
                      {' '}and{' '}
                      <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-violet-600 text-white py-3 rounded-xl font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              <p className="text-center mt-6 text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 hover:underline font-semibold transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;

