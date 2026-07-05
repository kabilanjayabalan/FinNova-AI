import React, { useState, useEffect, useContext } from 'react';
import {
  Users, BarChart2, Activity, Server, ShieldOff, Search, RefreshCw,
  ChevronLeft, ChevronRight, UserCheck, UserX, Database, Wifi, WifiOff,
  Key, Eye, EyeOff, Wrench, Check, AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

/* ── Helpers ────────────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, sub, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-violet-50 text-violet-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
};

const Badge = ({ label, variant }) => {
  const styles = {
    ADMIN: 'bg-red-100 text-red-700',
    USER: 'bg-blue-100 text-blue-700',
    INVESTOR: 'bg-green-100 text-green-700',
    ACTIVE: 'bg-green-100 text-green-700',
    OK: 'bg-green-100 text-green-700',
    DOWN: 'bg-red-100 text-red-700',
    UNKNOWN: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[variant] || styles.UNKNOWN}`}>
      {label}
    </span>
  );
};

const Tab = ({ id, label, icon, active, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
      active ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
    }`}
  >
    {icon}
    {label}
  </button>
);

/* ── Overview Tab ───────────────────────────────────────────────── */
const OverviewTab = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/auth/admin/stats');
        setStats(res.data.data);
      } catch {
        setStats({ totalUsers: 0, totalQueries: 0, activeSessions: 0, systemStatus: 'OK' });
        setNote('Could not load live stats. Showing placeholder data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1,2,3,4].map(i => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse h-28" />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {note && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-xl p-3.5 text-sm">
          {note}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={22}/>} label="Total Users" value={stats?.totalUsers ?? 0} color="blue" />
        <StatCard icon={<BarChart2 size={22}/>} label="AI Queries" value={stats?.totalQueries ?? 0} color="purple" />
        <StatCard icon={<Activity size={22}/>} label="Active Sessions" value={stats?.activeSessions ?? 0} color="green" />
        <StatCard icon={<Server size={22}/>} label="System Status" value={stats?.systemStatus ?? 'OK'} color="amber" />
      </div>
    </div>
  );
};

/* ── Users Tab ──────────────────────────────────────────────────── */
const UsersTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/auth/admin/users');
        setUsers(res.data.data || []);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/auth/admin/users/${userId}/role`, { role: newRole });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, roles: [newRole] } : u));
      toast.success(`Role updated to ${newRole}`);
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/auth/admin/users/${userId}`);
      setUsers((prev) => prev.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const filtered = users.filter((u) =>
    [u.fullName, u.email, u.username].some((v) =>
      (v || '').toLowerCase().includes(search.toLowerCase())
    )
  );
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  if (loading) return <div className="bg-white rounded-2xl border border-gray-100 p-8 animate-pulse h-64" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          />
        </div>
        <span className="text-sm text-gray-500">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {pageData.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Users size={40} className="text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-700">No users found</h3>
          <p className="text-sm text-gray-400 mt-1">
            {search ? 'Try a different search term.' : 'No users have registered yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name', 'Email', 'Username', 'Role', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pageData.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {(u.fullName || u.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900">{u.fullName || '—'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{u.email}</td>
                    <td className="px-5 py-4 text-gray-500 font-mono text-xs">@{u.username}</td>
                    <td className="px-5 py-4">
                      <Badge label={u.roles?.[0] || 'USER'} variant={u.roles?.[0] || 'USER'} />
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {u.roles?.[0] !== 'ADMIN' ? (
                          <button
                            onClick={() => handleRoleChange(u.id, 'ADMIN')}
                            title="Promote to Admin"
                            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-semibold"
                          >
                            <UserCheck size={12} /> Promote
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRoleChange(u.id, 'USER')}
                            title="Demote to User"
                            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors font-semibold"
                          >
                            <UserX size={12} /> Demote
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          title="Delete User"
                          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-semibold"
                        >
                          <UserX size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-500">
                Page {page + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── AI Queries Tab ─────────────────────────────────────────────── */
const AiQueriesTab = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 10;

  const load = async (pg = 0) => {
    setLoading(true);
    try {
      const res = await api.get(`/ai/history?page=${pg}&size=${PAGE_SIZE}`);
      const data = res.data.data;
      setQueries(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch {
      setQueries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page]);

  if (loading) return <div className="bg-white rounded-2xl border border-gray-100 p-8 animate-pulse h-64" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Recent AI queries across all users</span>
        <button onClick={() => load(page)} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1.5">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {queries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <BarChart2 size={40} className="text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-700">No queries yet</h3>
          <p className="text-sm text-gray-400 mt-1">AI queries will appear here once users start researching stocks.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Ticker', 'Query', 'Type', 'Date'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {queries.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg font-mono">
                        {q.ticker || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-700 max-w-xs">
                      <p className="truncate">{q.query || '—'}</p>
                    </td>
                    <td className="px-5 py-4">
                      <Badge label={q.queryType || 'ANALYSIS'} variant="ACTIVE" />
                    </td>
                    <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                      {q.createdAt ? format(new Date(q.createdAt), 'MMM d, yyyy HH:mm') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
              <p className="text-xs text-gray-500">Page {page + 1} of {totalPages}</p>
              <div className="flex gap-2">
                <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── System Tab ─────────────────────────────────────────────────── */
const SystemTab = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/system/metrics');
      setMetrics(res.data?.data);
    } catch {
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const ProgressBar = ({ label, percent, detail, colorClass }) => (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-gray-900 text-sm">{label}</span>
        <span className="text-xs text-gray-500">{detail}</span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${Math.min(100, Math.max(0, percent || 0))}%` }}
        />
      </div>
      <div className="text-right mt-1">
        <span className="text-xs font-semibold text-gray-700">{percent || 0}%</span>
      </div>
    </div>
  );

  const getStatusColor = (val) => val > 80 ? 'bg-red-500' : val > 60 ? 'bg-amber-500' : 'bg-green-500';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">System Status</h3>
          <p className="text-sm text-gray-500">Live overview of platform resources.</p>
        </div>
        <button onClick={loadMetrics} className="flex items-center gap-1.5 text-sm text-blue-600 font-semibold hover:underline">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {!metrics ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Server size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm">Metrics temporarily unavailable.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ProgressBar 
            label="CPU Usage" 
            percent={metrics.cpuUsage} 
            detail="System CPU"
            colorClass={getStatusColor(metrics.cpuUsage)}
          />
          <ProgressBar 
            label="Memory Usage" 
            percent={metrics.memoryPercent} 
            detail={`${metrics.memoryUsed || 0}MB / ${metrics.memoryTotal || 0}MB`}
            colorClass={getStatusColor(metrics.memoryPercent)}
          />
          <ProgressBar 
            label="Disk Usage" 
            percent={metrics.diskPercent} 
            detail={`${metrics.diskUsed || 0}GB / ${metrics.diskTotal || 0}GB`}
            colorClass={getStatusColor(metrics.diskPercent)}
          />
        </div>
      )}
      
      {metrics?.uptime && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex justify-between items-center shadow-sm">
          <span className="text-sm font-semibold text-gray-700">System Uptime</span>
          <Badge label={metrics.uptime} variant="OK" />
        </div>
      )}
    </div>
  );
};

const TABS = [

  { id: 'overview', label: 'Overview', icon: <BarChart2 size={16} /> },
  { id: 'users', label: 'Users', icon: <Users size={16} /> },
  { id: 'queries', label: 'AI Queries', icon: <Activity size={16} /> },
  { id: 'system', label: 'System', icon: <Server size={16} /> },
  { id: 'apikeys', label: 'API Keys', icon: <Key size={16} /> },
  { id: 'logs', label: 'Logs', icon: <Activity size={16} /> },
  { id: 'maintenance', label: 'Maintenance', icon: <Wrench size={16} /> },
];

const AdminPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const isAdmin = user?.roles?.includes('ADMIN');

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <ShieldOff size={36} className="text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500 mb-8 max-w-sm">
          You don't have permission to view this page. Admin access is required.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-500 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors shadow-sm"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Platform management and monitoring.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-xs font-bold border border-red-100">
          <ShieldOff size={12} /> Admin Access
        </span>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 flex flex-wrap gap-1">
        {TABS.map((tab) => (
          <Tab key={tab.id} {...tab} active={activeTab === tab.id} onClick={setActiveTab} />
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'queries' && <AiQueriesTab />}
        {activeTab === 'system' && <SystemTab />}
        {activeTab === 'apikeys' && <ApiKeysAdminTab />}
        {activeTab === 'logs' && <LogsTab />}
        {activeTab === 'maintenance' && <MaintenanceTab />}
      </div>
    </div>
  );
};

/* ── API Keys Admin Tab ─────────────────────────────────────────── */
const ApiKeysAdminTab = () => {
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem('groq_api_key') || '');
  const [showGroq, setShowGroq] = useState(false);
  const [testing, setTesting] = useState(null);

  const saveKey = () => {
    if (!groqKey.trim()) { toast.error('Enter a valid Groq API key'); return; }
    localStorage.setItem('groq_api_key', groqKey.trim());
    toast.success('Groq API key saved! (Used for AI Chat & Data Analysis)');
  };

  const testKey = async () => {
    setTesting('groq');
    try {
      await api.get('/ai/health');
      toast.success(`Groq service is reachable!`);
    } catch (e) {
      toast.error('AI service not reachable. Make sure it is running.');
    } finally { setTesting(null); }
  };

  const inputClass = "w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500";

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
        <div><p className="text-sm font-semibold text-amber-800">Admin Only</p>
        <p className="text-sm text-amber-700 mt-0.5">API keys configured here are stored in the browser. For production, set them in the server .env file.</p></div>
      </div>

      {/* Groq Key */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center"><Key size={16} className="text-orange-600" /></div>
          <div><p className="font-bold text-gray-900">Groq API Key</p><p className="text-xs text-gray-500">Used for AI Chat and Stock Analysis</p></div>
        </div>
        <div className="relative mt-4 mb-3">
          <input type={showGroq ? 'text' : 'password'} value={groqKey} onChange={e=>setGroqKey(e.target.value)} placeholder="gsk_..." className={inputClass} />
          <button type="button" onClick={()=>setShowGroq(v=>!v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">{showGroq?<EyeOff size={15}/>:<Eye size={15}/>}</button>
        </div>
        <div className="flex gap-2">
          <button onClick={saveKey} className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors">Save Groq Key</button>
          <button onClick={testKey} disabled={testing==='groq'} className="border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">{testing==='groq'?'Testing...':'Test'}</button>
          {groqKey && <button onClick={()=>{setGroqKey('');localStorage.removeItem('groq_api_key');toast.success('Cleared');}} className="border border-red-200 px-4 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50">Clear</button>}
        </div>
        {groqKey && <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><Check size={12}/>Groq key configured</p>}
      </div>
    </div>
  );
};

/* ── Logs Tab ─────────────────────────────────────────────────── */
const LogsTab = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/system/logs');
      const data = res.data?.data || [];
      setLogs(Array.isArray(data) ? data : []);
    } catch { setLogs([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, []);
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(fetchLogs, 10000);
    return () => clearInterval(id);
  }, [autoRefresh]);

  const filtered = logs.filter(l => filter === 'ALL' || l.level === filter);
  
  const isError = (log) => log.level === 'ERROR';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-bold">{logs.length} logs</span>
          <select value={filter} onChange={e=>setFilter(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none">
            <option value="ALL">All Levels</option>
            <option value="INFO">INFO</option>
            <option value="DEBUG">DEBUG</option>
            <option value="ERROR">ERROR</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <span className="text-gray-600">Auto-refresh</span>
            <div onClick={()=>setAutoRefresh(v=>!v)} className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${autoRefresh?'bg-green-500':'bg-gray-200'}`}>
              <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform shadow-sm ${autoRefresh?'translate-x-5':'translate-x-0.5'}`}/>
            </div>
          </label>
          <button onClick={fetchLogs} className="flex items-center gap-1.5 text-sm text-blue-600 font-semibold hover:underline">
            <RefreshCw size={14}/>Refresh
          </button>
        </div>
      </div>

      {loading ? <div className="text-center py-8"><div className="w-6 h-6 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"/></div> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {filtered.length === 0 ? <div className="text-center py-12 text-gray-400"><Activity size={40} className="mx-auto mb-3 opacity-50"/><p>No logs found</p></div> : (
            <div className="divide-y divide-gray-50">
              {filtered.map((log,i) => (
                <div key={i} className={`px-5 py-3.5 flex items-center gap-4 text-sm hover:bg-gray-50/50 ${isError(log)?'border-l-2 border-red-400':''}`}>
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isError(log)?'bg-red-400': log.level === 'DEBUG' ? 'bg-amber-400' : 'bg-green-400'}`}/>
                  <span className="text-gray-400 text-xs font-mono w-48 flex-shrink-0">{log.timestamp}</span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-bold" style={{background: log.level==='ERROR'?'#FEE2E2': log.level === 'DEBUG' ? '#FEF3C7' : '#D1FAE5', color: log.level==='ERROR'?'#991B1B': log.level === 'DEBUG' ? '#92400E' : '#065F46'}}>{log.level}</span>
                  <span className="text-gray-700 flex-1 truncate">{log.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Maintenance Tab ─────────────────────────────────────────────────── */
const MaintenanceTab = () => {
  const [enabled, setEnabled] = useState(() => localStorage.getItem('maintenance_mode') === 'true');
  const [message, setMessage] = useState(() => localStorage.getItem('maintenance_message') || 'FinNova AI is currently undergoing scheduled maintenance. We will be back shortly!');
  const [duration, setDuration] = useState(() => localStorage.getItem('maintenance_duration') || 'A few hours');

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem('maintenance_mode', String(next));
    window.dispatchEvent(new StorageEvent('storage', { key: 'maintenance_mode', newValue: String(next) }));
    toast[next ? 'error' : 'success'](next ? '🔧 Maintenance mode ENABLED — users will see the maintenance page' : '✅ Maintenance mode DISABLED — app is live again');
  };

  const saveSettings = () => {
    localStorage.setItem('maintenance_message', message);
    localStorage.setItem('maintenance_duration', duration);
    toast.success('Maintenance settings saved!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">Maintenance Mode</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {enabled ? <span className="text-red-600 font-semibold">🔴 Currently ACTIVE — users see maintenance page</span> : <span className="text-green-600 font-semibold">🟢 App is LIVE — users can access normally</span>}
            </p>
          </div>
          <button onClick={toggle} className={`relative w-16 h-8 rounded-full transition-colors shadow-inner ${enabled?'bg-red-500':'bg-gray-200'}`}>
            <div className={`absolute w-6 h-6 bg-white rounded-full top-1 shadow transition-transform ${enabled?'translate-x-9':'translate-x-1'}`}/>
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Preview (What users will see)</p>
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-blue-500/20 rounded-2xl flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 32 32"><rect x="4" y="8" width="4" height="16" rx="1" fill="#3B82F6"/><rect x="14" y="4" width="4" height="20" rx="1" fill="#10B981"/><rect x="24" y="10" width="4" height="14" rx="1" fill="#F59E0B"/></svg>
          </div>
          <h2 className="text-xl font-bold">Under Maintenance</h2>
          <p className="text-slate-400 mt-2 text-sm">{message}</p>
          <p className="text-slate-500 mt-3 text-xs">Estimated downtime: {duration}</p>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-bold text-gray-900">Maintenance Message</h3>
        <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" />
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Estimated Duration</label>
          <input value={duration} onChange={e=>setDuration(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g., 2 hours" />
        </div>
        <button onClick={saveSettings} className="bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors">Save Settings</button>
      </div>
    </div>
  );
};

export default AdminPage;


