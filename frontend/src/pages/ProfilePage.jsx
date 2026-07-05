import React, { useContext, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Phone, Shield, Lock, Eye, EyeOff, Save, Camera } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

/* ── Tab button ─────────────────────────────────────────────────── */
const Tab = ({ id, label, active, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-150 ${
      active
        ? 'bg-blue-50 text-blue-600'
        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
    }`}
  >
    {label}
  </button>
);

/* ── Personal Info Tab ──────────────────────────────────────────── */
const PersonalInfoTab = ({ user }) => {
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    mobileNumber: user?.mobileNumber || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/profile', {
        fullName: form.fullName,
        mobileNumber: form.mobileNumber,
      });
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-white";
  const disabledClass = "w-full pl-10 pr-4 py-3 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Full Name */}
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
          Full Name
        </label>
        <div className="relative">
          <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Your full name"
            className={inputClass}
          />
        </div>
      </div>

      {/* Email (read-only) */}
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
          Email Address
          <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-normal normal-case">Read only</span>
        </label>
        <div className="relative">
          <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className={disabledClass}
          />
        </div>
      </div>

      {/* Mobile */}
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
          Mobile Number
        </label>
        <div className="relative">
          <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="tel"
            name="mobileNumber"
            value={form.mobileNumber}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
            className={inputClass}
          />
        </div>
      </div>

      {/* Username (read-only) */}
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
          Username
          <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-normal normal-case">Read only</span>
        </label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-sm font-medium">@</span>
          <input
            type="text"
            value={user?.username || ''}
            disabled
            className={disabledClass}
          />
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-violet-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          <Save size={15} />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};


/* ── Profile Page ───────────────────────────────────────────────── */
const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [photo, setPhoto] = useState(() => localStorage.getItem('profile_photo') || null);
  const fileRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      localStorage.setItem('profile_photo', base64);
      setPhoto(base64);
      toast.success('Profile photo updated!');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account information and security.</p>
      </div>

      {/* Identity card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {photo ? (
            <img src={photo} alt="Profile" className="w-24 h-24 rounded-2xl object-cover shadow-md border-2 border-white" />
          ) : (
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.username || 'User')}&background=3B82F6&color=fff&size=96&rounded=true&bold=true`}
              alt="Profile"
              className="w-24 h-24 rounded-2xl object-cover shadow-md border-2 border-white"
            />
          )}
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-md transition-colors"
            title="Upload photo"
          >
            <Camera size={14} className="text-white" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-xl font-bold text-gray-900">
            {user?.fullName || 'Unknown User'}
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">{user?.email}</p>
          <p className="text-gray-400 text-sm mt-0.5 font-mono">@{user?.username}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
            <Shield size={12} />
            {user?.roles?.[0] || 'Investor'}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tab content (only Personal info remains) */}
        <div className="p-6">
          <PersonalInfoTab user={user} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
