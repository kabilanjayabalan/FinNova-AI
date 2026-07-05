import React, { useState, useEffect, useContext } from 'react';
import { Plus, Pencil, Trash2, TrendingUp, BarChart2, ArrowUpRight, ArrowDownRight, X, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import { PageLoader } from '../components/common/Loader';
import { getPortfolios, createPortfolio, updatePortfolio, deletePortfolio } from '../services/portfolioService';
import { getHoldings } from '../services/holdingService';



const PortfolioForm = ({ initial, onSubmit, onCancel }) => {
  const [form, setForm] = useState(initial || { name: '', description: '' });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Name *</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
          placeholder="e.g., Long Term Growth"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm resize-none"
          placeholder="Optional description..."
          rows={3}
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors">
          Cancel
        </button>
        <button type="submit"
          className="flex-1 py-2.5 bg-primary text-white rounded-xl hover:bg-blue-600 text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">
          {initial ? 'Update' : 'Create Portfolio'}
        </button>
      </div>
    </form>
  );
};

const PortfolioPage = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [holdingsLoading, setHoldingsLoading] = useState(false);

  const loadPortfolios = async () => {
    setLoading(true);
    try {
      const res = await getPortfolios();
      setPortfolios(res.data.data || []);
    } catch {
      setPortfolios([]);
      toast.error('Failed to load portfolios');
    } finally {
      setLoading(false);
    }
  };

  const loadHoldings = async (portfolioId) => {
    setHoldingsLoading(true);
    try {
      const res = await getHoldings(portfolioId);
      setHoldings(res.data.data || []);
    } catch {
      setHoldings([]);
      toast.error('Failed to load holdings');
    } finally {
      setHoldingsLoading(false);
    }
  };

  useEffect(() => { loadPortfolios(); }, []);

  const handleExpand = (portfolio) => {
    if (expandedId === portfolio.id) {
      setExpandedId(null);
      setHoldings([]);
    } else {
      setExpandedId(portfolio.id);
      loadHoldings(portfolio.id);
    }
  };

  const handleCreate = async (form) => {
    try {
      const res = await createPortfolio(form);
      toast.success('Portfolio created!');
      setPortfolios(prev => [...prev, res.data.data]);
    } catch {
      toast.error('Failed to create portfolio');
    }
    setShowModal(false);
  };

  const handleUpdate = async (form) => {
    try {
      const res = await updatePortfolio(editing.id, form);
      toast.success('Portfolio updated!');
      setPortfolios(prev => prev.map(p => p.id === editing.id ? { ...p, ...form } : p));
    } catch {
      toast.error('Failed to update portfolio');
    }
    setEditing(null);
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this portfolio? All holdings will be lost.')) return;
    try {
      await deletePortfolio(id);
      setPortfolios(prev => prev.filter(p => p.id !== id));
      toast.success('Portfolio deleted');
    } catch {
      toast.error('Failed to delete portfolio');
    }
  };

  const calcPortfolioValue = (h = []) => {
    return h.reduce((sum, holding) => {
      const curr = holding.currentPrice || holding.averageCost;
      return sum + curr * holding.shares;
    }, 0);
  };

  const calcPortfolioPL = (h = []) => {
    return h.reduce((sum, holding) => {
      const curr = holding.currentPrice || holding.averageCost;
      return sum + (curr - holding.averageCost) * holding.shares;
    }, 0);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Portfolios</h2>
          <p className="text-sm text-gray-500">{portfolios.length} portfolio{portfolios.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl hover:bg-blue-600 text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus size={16} /> Create Portfolio
        </button>
      </div>

      {/* Empty State */}
      {portfolios.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={32} className="text-primary" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">No portfolios yet</h3>
          <p className="text-gray-500 text-sm mb-6">Create your first portfolio to start tracking investments</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors"
          >
            Create Portfolio
          </button>
        </div>
      )}

      {/* Portfolio Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {portfolios.map((portfolio) => {
          const value = portfolio.totalValue || 0;
          const pl = portfolio.totalPL || 0;
          const plPct = value > 0 ? (pl / (value - pl)) * 100 : 0;
          const positive = pl >= 0;

          return (
            <div key={portfolio.id} className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
              {/* Card header */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{portfolio.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{portfolio.description || 'No description'}</p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => { setEditing(portfolio); setShowModal(true); }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-primary hover:bg-blue-50 transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(portfolio.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Total Value</p>
                    <p className="text-lg font-bold text-gray-900">${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${positive ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    <p className="text-xs text-gray-500 mb-1">Total P&L</p>
                    <p className={`text-lg font-bold ${positive ? 'text-emerald-600' : 'text-red-600'}`}>
                      {positive ? '+' : ''}${Math.abs(pl).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </p>
                    <p className={`text-xs font-medium ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
                      {positive ? '+' : ''}{plPct.toFixed(2)}%
                    </p>
                  </div>
                </div>

                {/* Holdings count */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <BarChart2 size={14} />
                    <span className="text-xs">{portfolio.holdingsCount || 0} holdings</span>
                  </div>
                  <button
                    onClick={() => handleExpand(portfolio)}
                    className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                  >
                    {expandedId === portfolio.id ? 'Collapse' : 'View Holdings'}
                    <ChevronRight size={12} className={`transition-transform ${expandedId === portfolio.id ? 'rotate-90' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Expanded Holdings */}
              {expandedId === portfolio.id && (
                <div className="border-t border-gray-100 animate-fade-in">
                  {holdingsLoading ? (
                    <div className="p-6 text-center text-sm text-gray-400">Loading holdings...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2.5 text-left font-semibold text-gray-500">Ticker</th>
                            <th className="px-4 py-2.5 text-right font-semibold text-gray-500">Shares</th>
                            <th className="px-4 py-2.5 text-right font-semibold text-gray-500">Avg Cost</th>
                            <th className="px-4 py-2.5 text-right font-semibold text-gray-500">Current</th>
                            <th className="px-4 py-2.5 text-right font-semibold text-gray-500">P&L</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {holdings.map((h) => {
                            const curr = h.currentPrice || h.averageCost;
                            const pl = (curr - h.averageCost) * h.shares;
                            const positive = pl >= 0;
                            return (
                              <tr key={h.id} className="hover:bg-gray-50/50">
                                <td className="px-4 py-2.5">
                                  <div className="font-bold text-gray-900">{h.ticker}</div>
                                  <div className="text-gray-400 text-xs truncate max-w-[80px]">{h.companyName}</div>
                                </td>
                                <td className="px-4 py-2.5 text-right text-gray-700">{h.shares}</td>
                                <td className="px-4 py-2.5 text-right text-gray-700">${h.averageCost.toFixed(2)}</td>
                                <td className="px-4 py-2.5 text-right font-medium text-gray-900">${curr.toFixed(2)}</td>
                                <td className="px-4 py-2.5 text-right">
                                  <span className={`font-semibold ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {positive ? '+' : ''}${pl.toFixed(0)}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditing(null); }}
        title={editing ? 'Edit Portfolio' : 'Create Portfolio'}
      >
        <PortfolioForm
          initial={editing}
          onSubmit={editing ? handleUpdate : handleCreate}
          onCancel={() => { setShowModal(false); setEditing(null); }}
        />
      </Modal>
    </div>
  );
};

export default PortfolioPage;
