import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Home } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-violet-50 flex flex-col items-center justify-center p-6 text-center">
      {/* Branding */}
      <div className="flex items-center gap-2.5 mb-12">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
          <TrendingUp size={20} className="text-white" />
        </div>
        <span className="text-xl font-bold text-gray-900">FinNova AI</span>
      </div>

      {/* 404 Number */}
      <h1 className="text-[10rem] sm:text-[14rem] font-black leading-none bg-gradient-to-r from-blue-500 via-violet-500 to-purple-600 bg-clip-text text-transparent select-none">
        404
      </h1>

      {/* Decorative line */}
      <div className="w-24 h-1 rounded-full bg-gradient-to-r from-blue-400 to-violet-500 my-6" />

      {/* Message */}
      <h2 className="text-3xl font-bold text-gray-900 mb-3">Page Not Found</h2>
      <p className="text-gray-500 text-lg max-w-md mb-10">
        The page you are looking for doesn't exist or has been moved.
      </p>

      {/* CTA Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center gap-2.5 bg-gradient-to-r from-blue-500 to-violet-600 text-white px-8 py-3.5 rounded-2xl font-semibold text-base shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200"
      >
        <Home size={18} />
        Back to Dashboard
      </button>

      {/* Footer note */}
      <p className="mt-16 text-sm text-gray-400">
        © {new Date().getFullYear()} FinNova AI. All rights reserved.
      </p>
    </div>
  );
};

export default NotFoundPage;

