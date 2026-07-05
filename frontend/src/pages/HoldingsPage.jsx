import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ArrowUpDown, TrendingUp, DollarSign, Award, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import { PageLoader } from '../components/common/Loader';
import { getPortfolios } from '../services/portfolioService';
import { getHoldings, addHolding, updateHolding, deleteHolding } from '../services/holdingService';

const MOCK_PRICES = {
  AAPL: 192.30, MSFT: 415.20, NVDA: 875.40, GOOGL: 178.90,
  AMZN: 178.90, TSLA: 248.60, META: 510.20, BRK: 398.20,
};

const MOCK_PORTFOLIOS = [
  { id: 1, name: 'Long Term Growth' },
  { id: 2, name: 'Dividend Income' },
];

const MOCK_HOLDINGS = [
  { id: 1, ticker: 'AAPL', companyName: 'Apple Inc', shares: 50, averageCost: 155.20, sector: 'Technology' },
  { id: 2, ticker: 'MSFT', companyName: 'Microsoft Corp', shares: 30, averageCost: 310.00, sector: 'Technology' },
  { id: 3, ticker: 'NVDA', companyName: 'NVIDIA Corp', shares: 15, averageCost: 650.00, sector: 'Semiconductors' },
  { id: 4, ticker: 'GOOGL', companyName: 'Alphabet Inc', shares: 20, averageCost: 128.00, sector: 'Technology' },
];

const SECTORS = ['Technology', 'Finance', 'Healthcare', 'Energy', 'Consumer Goods', 'Industrials', 'Semiconductors', 'Real Estate', 'Other'];

const HoldingForm = ({ initial, onSubmit, onCancel }) => {
  const [form, setForm] = useState(initial || {
    ticker: '', companyName: '', shares: '', averageCost: '', sector: 'Technology'
  });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Ticker *</label>
          <input required value={form.ticker}
            onChange={(e) => setForm({ ...form, ticker: e.target.value.toUpperCase() })}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            placeholder="AAPL" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Sector</label>
          <select value={form.sector}
            onChange={(e) => setForm({ ...form, sector: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white">
            {SECTORS.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Company Name</label>
        <input value={form.companyName}
          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          placeholder="Apple Inc" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Shares *</label>
          <input required type="number" value={form.shares}
            onChange={(e) => setForm({ ...form, shares: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            placeholder="100" min="0" step="0.01" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Avg Cost ($) *</label>
          <input required type="number" value={form.averageCost}
            onChange={(e) => setForm({ ...form, averageCost: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            placeholder="150.00" min="0" step="0.01" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors">
          Cancel
        </button>
        <button type="submit"
          className="flex-1 py-2.5 bg-primary text-white rounded-xl hover:bg-blue-600 text-sm font-medium transition-colors">
          {initial ? 'Update Holding' : 'Add Holding'}
        </button>
      </div>
    </form>
  );
};

const HoldingsPage = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [holdingsLoading, setHoldingsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [sortKey, setSortKey] = useState('ticker');
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getPortfolios();
        const data = res.data.data || [];
        setPortfolios(data);
        if (data.length > 0) setSelectedPortfolioId(data[0].id);
      } catch {
        setPortfolios(MOCK_PORTFOLIOS);
        setSelectedPortfolioId(1);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedPortfolioId) return;
    const loadH = async () => {
      setHoldingsLoading(true);
      try {
        const res = await getHoldings(selectedPortfolioId);
        setHoldings(res.data.data || []);
      } catch {
        setHoldings(MOCK_HOLDINGS);
      } finally {
        setHoldingsLoading(false);
      }
    };
    loadH();
  }, [selectedPortfolioId]);

  const getCurrent = (ticker) => MOCK_PRICES[ticker] || 0;

  const enriched = holdings.map(h => {
    const curr = getCurrent(h.ticker) || h.averageCost * 1.1;
    const invested = h.averageCost * h.shares;
    const value = curr * h.shares;
    const pl = value - invested;
    const plPct = (pl / invested) * 100;
    return { ...h, curr, invested, value, pl, plPct };
  });

  const sorted = [...enriched].sort((a, b) => {
    const v1 = a[sortKey], v2 = b[sortKey];
    if (typeof v1 === 'string') return sortAsc ? v1.localeCompare(v2) : v2.localeCompare(v1);
    return sortAsc ? v1 - v2 : v2 - v1;
  });

  const totalInvested = enriched.reduce((s, h) => s + h.invested, 0);
  const totalValue = enriched.reduce((s, h) => s + h.value, 0);
  const totalPL = totalValue - totalInvested;
  const best = enriched.reduce((best, h) => !best || h.plPct > best.plPct ? h : best, null);
  const worst = enriched.reduce((worst, h) => !worst || h.plPct < worst.plPct ? h : worst, null);

  const handleSort = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const handleAdd = async (form) => {
    try {
      const res = await addHolding(selectedPortfolioId, form);
      setHoldings(prev => [...prev, res.data.data]);
      toast.success('Holding added!');
    } catch {
      toast.error('Failed to add holding');
    }
    setShowModal(false);
  };

  const handleUpdate = async (form) => {
    try {
      await updateHolding(selectedPortfolioId, editing.id, form);
      setHoldings(prev => prev.map(h => h.id === editing.id ? { ...h, ...form } : h));
      toast.success('Holding updated!');
    } catch {
      toast.error('Failed to update holding');
    }
    setEditing(null);
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this holding?')) return;
    try {
      await deleteHolding(selectedPortfolioId, id);
      setHoldings(prev => prev.filter(h => h.id !== id));
      toast.success('Holding removed');
    } catch {
      toast.error('Failed to delete holding');
    }
  };

  const SortTh = ({ label, k }) => (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-800 select-none"
      onClick={() => handleSort(k)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown size={10} className="text-gray-400" />
      </div>
    </th>
  );

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Holdings</h2>
          <p className="text-sm text-gray-500">Manage your stock positions</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl hover:bg-blue-600 text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus size={16} /> Add Holding
        </button>
      </div>

      {/* Portfolio Selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-600">Portfolio:</label>
        <div className="relative">
          <select
            value={selectedPortfolioId || ''}
            onChange={(e) => setSelectedPortfolioId(Number(e.target.value))}
            className="pl-4 pr-10 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white appearance-none font-medium text-gray-800"
          >
            {portfolios.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Invested', value: `$${totalInvested.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, icon: DollarSign, color: 'text-gray-600', bg: 'bg-gray-50' },
          { label: 'Current Value', value: `$${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, icon: TrendingUp, color: 'text-primary', bg: 'bg-blue-50' },
          { label: 'Best Performer', value: best ? `${best.ticker} (+${best.plPct.toFixed(1)}%)` : '-', icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Worst Performer', value: worst ? `${worst.ticker} (${worst.plPct.toFixed(1)}%)` : '-', icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
              <p className="text-sm font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Total P&L Banner */}
      <div className={`rounded-xl p-4 flex items-center justify-between ${totalPL >= 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
        <span className="text-sm font-semibold text-gray-700">Total Unrealized P&L</span>
        <div className="text-right">
          <span className={`text-xl font-bold ${totalPL >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
            {totalPL >= 0 ? '+' : ''}${totalPL.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </span>
          <span className={`text-sm font-semibold ml-2 ${totalPL >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            ({totalInvested > 0 ? ((totalPL / totalInvested) * 100).toFixed(2) : 0}%)
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
        {holdingsLoading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-blue-100 border-t-primary rounded-full animate-spin mx-auto mb-3" style={{ borderTopColor: '#3B82F6' }} />
            <p className="text-sm text-gray-400">Loading holdings...</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No holdings in this portfolio</p>
            <button onClick={() => setShowModal(true)} className="mt-4 text-primary text-sm hover:underline">Add your first holding</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <SortTh label="Ticker" k="ticker" />
                  <SortTh label="Company" k="companyName" />
                  <SortTh label="Sector" k="sector" />
                  <SortTh label="Shares" k="shares" />
                  <SortTh label="Avg Cost" k="averageCost" />
                  <SortTh label="Current" k="curr" />
                  <SortTh label="Value" k="value" />
                  <SortTh label="P&L" k="pl" />
                  <SortTh label="P&L%" k="plPct" />
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sorted.map((h) => (
                  <tr key={h.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-gray-900 text-sm">{h.ticker}</span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-700 text-sm max-w-[140px] truncate">{h.companyName}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{h.sector}</span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-700 text-sm">{h.shares}</td>
                    <td className="px-4 py-3.5 text-gray-700 text-sm">${Number(h.averageCost).toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-gray-900 font-semibold text-sm">${h.curr.toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-gray-900 font-semibold text-sm">${h.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-sm font-bold ${h.pl >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {h.pl >= 0 ? '+' : ''}${Math.abs(h.pl).toFixed(0)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${h.plPct >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                        {h.plPct >= 0 ? '+' : ''}{h.plPct.toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditing(h); setShowModal(true); }}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-primary hover:bg-blue-50 transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(h.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditing(null); }}
        title={editing ? 'Edit Holding' : 'Add Holding'}
      >
        <HoldingForm
          initial={editing}
          onSubmit={editing ? handleUpdate : handleAdd}
          onCancel={() => { setShowModal(false); setEditing(null); }}
        />
      </Modal>
    </div>
  );
};

export default HoldingsPage;
