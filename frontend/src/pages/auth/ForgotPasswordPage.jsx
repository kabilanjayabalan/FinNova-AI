import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate a brief loading delay, no actual API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <TrendingUp size={22} className="text-white" />
          </div>
          <span className="text-xl font-bold">FinNova AI</span>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-8 border border-blue-400/20">
            <Mail size={40} className="text-blue-300" />
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Password<br />Recovery
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed max-w-sm">
            No worries — it happens to the best of us. Enter your email and we'll help you get back in.
          </p>
        </div>

        <p className="text-blue-300/60 text-sm relative z-10">
          © {new Date().getFullYear()} FinNova AI
        </p>
      </div>

      {/* Right form panel */}
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
            {!submitted ? (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
                  <p className="text-gray-500">
                    Enter your registered email address and we'll send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

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
                        Sending...
                      </span>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Success state */
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <CheckCircle size={36} className="text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Check Your Email</h2>
                <p className="text-gray-500 text-sm mb-2">
                  Reset link sent to your email!
                </p>
                <p className="text-gray-400 text-sm mb-8">
                  <span className="font-medium text-gray-700">{email}</span>
                  <br />
                  If you don't see it, check your spam folder.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setEmail(''); }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Try a different email
                </button>
              </div>
            )}

            {/* Back to login */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium"
              >
                <ArrowLeft size={14} />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

