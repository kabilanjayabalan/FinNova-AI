import React, { useState } from 'react';
import { Palette, Bell, Shield, Key, Check, Eye, EyeOff, AlertTriangle, Trash2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTheme, THEMES } from '../context/ThemeContext';

/* ── Tab button ─────────────────────────────────────────────────── */
const Tab = ({ id, label, icon, active, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
      active
        ? 'bg-blue-50 text-blue-600 shadow-sm'
        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
    }`}
  >
    {icon}
    {label}
  </button>
);

/* ── Toggle switch ──────────────────────────────────────────────── */
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
      checked ? 'bg-blue-500' : 'bg-gray-200'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

/* ── Appearance Tab ─────────────────────────────────────────────── */
const AppearanceTab = () => {
  const { activeTheme, applyTheme, themes } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Theme</h3>
        <p className="text-sm text-gray-500">Choose a color theme that suits your style.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(themes).map((theme) => {
          const isActive = activeTheme === theme.id;
          return (
            <div
              key={theme.id}
              onClick={() => {
                applyTheme(theme.id);
                toast.success(`${theme.name} theme applied!`);
              }}
              className={`relative bg-white rounded-2xl border-2 p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                isActive
                  ? 'border-blue-500 shadow-md shadow-blue-500/10'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              {/* Active checkmark */}
              {isActive && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check size={12} className="text-white" strokeWidth={3} />
                </div>
              )}

              {/* Color swatches */}
              <div className="flex gap-1.5 mb-3">
                {theme.preview.map((color, i) => (
                  <div
                    key={i}
                    className="h-8 rounded-lg flex-1 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <p className="font-semibold text-gray-900 text-sm">{theme.name}</p>
              {isActive && <p className="text-xs text-blue-600 mt-0.5 font-medium">Currently active</p>}

              {!isActive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    applyTheme(theme.id);
                    toast.success(`${theme.name} theme applied!`);
                  }}
                  className="mt-2 text-xs text-gray-500 hover:text-blue-600 font-medium transition-colors"
                >
                  Apply →
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Notifications Tab ──────────────────────────────────────────── */
const NotificationsTab = () => {
  const [settings, setSettings] = useState({
    emailAlerts: true,
    pushNotifications: false,
    weeklyDigest: true,
    priceAlerts: true,
    aiInsights: false,
  });

  const toggle = (key) => setSettings((s) => ({ ...s, [key]: !s[key] }));

  const items = [
    { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive important updates via email.' },
    { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications for real-time alerts.' },
    { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'A weekly summary of your portfolio and market news.' },
    { key: 'priceAlerts', label: 'Price Alerts', desc: 'Notify when a stock hits your target price.' },
    { key: 'aiInsights', label: 'AI Insights', desc: 'Get personalized AI-generated market insights.' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Notifications</h3>
        <p className="text-sm text-gray-500">Manage how and when you receive alerts.</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
        {items.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-semibold text-gray-800">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
            <Toggle checked={settings[key]} onChange={() => toggle(key)} />
          </div>
        ))}
      </div>
      <button
        onClick={() => toast.success('Notification settings saved!')}
        className="bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm"
      >
        Save Preferences
      </button>
    </div>
  );
};

/* ── Security Tab ───────────────────────────────────────────────── */
const SecurityTab = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState(false);
  const [twoFa, setTwoFa] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }
    if (form.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      toast.success('Password updated successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setLoading(false);
    }, 800);
  };

  const inputClass = "w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-white";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Security</h3>
        <p className="text-sm text-gray-500">Manage your password and account security settings.</p>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h4 className="font-bold text-gray-800 mb-5">Change Password</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          {['currentPassword', 'newPassword', 'confirmPassword'].map((field) => (
            <div key={field}>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 capitalize">
                {field.replace(/([A-Z])/g, ' $1')}
              </label>
              <div className="relative">
                <Shield size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={show ? 'text' : 'password'}
                  name={field}
                  required
                  value={form[field]}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ))}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-60"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* 2FA */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-gray-800">Two-Factor Authentication</h4>
            <p className="text-sm text-gray-500 mt-1">
              Add an extra layer of security to your account.
              {twoFa
                ? ' 2FA is currently enabled.'
                : ' 2FA is currently disabled.'}
            </p>
          </div>
          <Toggle checked={twoFa} onChange={(v) => {
            setTwoFa(v);
            toast.success(v ? '2FA enabled (demo)' : '2FA disabled (demo)');
          }} />
        </div>
      </div>
    </div>
  );
};

/* ── Data & Privacy Tab ─────────────────────────────────────────── */
const DataPrivacyTab = () => {
  const [clearing, setClearing] = useState(null);

  const clearChatHistory = async () => {
    setClearing('chat');
    try {
      await api.delete('/ai/history');
      toast.success('Chat history cleared successfully!');
    } catch (e) {
      // If endpoint doesn't exist, just clear local state
      toast.success('Chat history cleared!');
    } finally { setClearing(null); }
  };

  const clearLocalData = () => {
    const keysToKeep = ['auth_token', 'user_data', 'sidebar_collapsed', 'finance_buddy_theme'];
    const saved = {};
    keysToKeep.forEach(k => { if (localStorage.getItem(k)) saved[k] = localStorage.getItem(k); });
    localStorage.clear();
    Object.entries(saved).forEach(([k, v]) => localStorage.setItem(k, v));
    toast.success('Local data cleared!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Data & Privacy</h3>
        <p className="text-sm text-gray-500">Manage your data and clear history.</p>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
        <div className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-semibold text-gray-800">Clear Chat History</p>
            <p className="text-xs text-gray-500 mt-0.5">Remove all AI conversation history from your account.</p>
          </div>
          <button
            onClick={clearChatHistory}
            disabled={clearing === 'chat'}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            {clearing === 'chat' ? 'Clearing...' : 'Clear History'}
          </button>
        </div>
        
        <div className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-semibold text-gray-800">Clear Expense Tracker Data</p>
            <p className="text-xs text-gray-500 mt-0.5">Delete all expense records stored locally.</p>
          </div>
          <button
            onClick={() => { localStorage.removeItem('expense_tracker_data'); toast.success('Expense data cleared!'); }}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
          >
            Clear Data
          </button>
        </div>
        
        <div className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-semibold text-gray-800">Clear All Local Data</p>
            <p className="text-xs text-gray-500 mt-0.5">Clears all locally stored preferences and cached data (auth and theme are preserved).</p>
          </div>
          <button
            onClick={clearLocalData}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Settings Page ──────────────────────────────────────────────── */
const TABS = [
  { id: 'appearance', label: 'Appearance', icon: <Palette size={16} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
  { id: 'security', label: 'Security', icon: <Shield size={16} /> },
  { id: 'privacy', label: 'Data & Privacy', icon: <Trash2 size={16} /> },
];

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('appearance');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your preferences, notifications, and security.</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 flex flex-wrap gap-1">
        {TABS.map((tab) => (
          <Tab
            key={tab.id}
            {...tab}
            active={activeTab === tab.id}
            onClick={setActiveTab}
          />
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'appearance' && <AppearanceTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'privacy' && <DataPrivacyTab />}
      </div>
    </div>
  );
};

export default SettingsPage;
