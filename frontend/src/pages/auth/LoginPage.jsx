import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { TrendingUp, Lock, User, Eye, EyeOff, BarChart2, Shield, Zap } from 'lucide-react';

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

const LoginPage = () => {
  const [formData, setFormData] = useState({ usernameOrEmail: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', formData);
      if (res.data.success) {
        const token = res.data.data.accessToken;
        localStorage.setItem('token', token);
        const profileRes = await api.get('/auth/profile');
        login(token, profileRes.data.data);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Left branding panel ───────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <TrendingUp size={22} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">FinNova AI</span>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-5xl font-black leading-tight mb-4">
              Intelligent<br />
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                Investing
              </span>
            </h1>
            <p className="text-blue-200 text-lg leading-relaxed max-w-sm">
              Harness the power of AI to analyze markets, track portfolios, and make smarter investment decisions.
            </p>
          </div>

          {/* Feature chips */}
          <div className="space-y-3">
            {[
              { icon: <BarChart2 size={16} />, text: 'Real-time stock analysis' },
              { icon: <Shield size={16} />, text: 'Portfolio risk management' },
              { icon: <Zap size={16} />, text: 'AI-powered insights' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-blue-200">
                <div className="w-7 h-7 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-300 border border-blue-400/20">
                  {icon}
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-300/50 text-sm relative z-10">
          © {new Date().getFullYear()} FinNova AI
        </p>
      </div>

      {/* ── Right form panel ──────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">FinNova AI</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-500">Sign in to continue your research</p>
            </div>

            {/* Google button */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-xl bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 shadow-sm mb-6"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">OR CONTINUE WITH EMAIL</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username/Email field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Username or Email
                </label>
                <div className="relative">
                  <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="usernameOrEmail"
                    required
                    value={formData.usernameOrEmail}
                    onChange={handleChange}
                    placeholder="Enter username or email"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Remember me & forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-500 focus:ring-blue-500/20" />
                  Remember me
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-violet-600 text-white py-3 rounded-xl font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p className="text-center mt-8 text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 hover:underline font-semibold transition-colors">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

