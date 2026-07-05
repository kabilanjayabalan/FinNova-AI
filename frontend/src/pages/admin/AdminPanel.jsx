import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, ArrowUpRight, ArrowDownRight, ExternalLink, Star, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/common/Modal';
import { PageLoader } from '../components/common/Loader';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '../services/watchlistService';

const MOCK_WATCHLIST = [
  { id: 1, ticker: 'AAPL', companyName: 'Apple Inc', price: 192.30, change: 2.10, changePct: 1.11, sector: 'Technology' },
  { id: 2, ticker: 'NVDA', companyName: 'NVIDIA Corp', price: 875.40, change: 35.20, changePct: 4.19, sector: 'Semiconductors' },
  { id: 3, ticker: 'TSLA', companyName: 'Tesla Inc', price: 248.60, change: 6.80, changePct: 2.81, sector: 'Automotive' },
  { id: 4, ticker: 'MSFT', companyName: 'Microsoft Corp', price: 415.20, change: -1.30, changePct: -0.31, sector: 'Technology' },
  { id: 5, ticker: 'AMZN', companyName: 'Amazon Inc', price: 178.90, change: 1.60, changePct: 0.90, sector: 'E-Commerce' },
  { id: 6, ticker: 'META', companyName: 'Meta Platforms', price: 510.20, change: -7.30, changePct: -1.41, sector: 'Social Media' },
];

const AddWatchlistForm = ({ onSubmit, onCancel }) => {
  const [form, setForm] = useState({ ticker: '', companyName: '' });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Ticker Symbol *</label>
        <input
          required value={form.ticker}
          onChange={(e) => setForm({ ...form, ticker: e.target.value.toUpperCase() })}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono uppercase"
          placeholder="AAPL"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Company Name</label>
        <input value={form.companyName}
          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          placeholder="Apple Inc"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-sm font-medium transition-colors">
          Cancel
        </button>
        <button type="submit"
          className="flex-1 py-2.5 bg-primary text-white rounded-xl hover:bg-blue-600 text-sm font-semibold transition-colors">
          Add to Watchlist
        </button>
      </div>
    </form>
  );
};

const WatchlistPage = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await getWatchlist();
      setWatchlist(res.data.data || []);
    } catch {
      setWatchlist(MOCK_WATCHLIST);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (form) => {
    try {
      const res = await addToWatchlist(form);
      setWatchlist(prev => [...prev, res.data.data]);
      toast.success(`${form.ticker} added to watchlist!`);
    } catch {
      // Optimistic mock add
      const mockItem = {
        id: Date.now(),
        ticker: form.ticker,
        companyName: form.companyName || form.ticker,
        price: 100.00,
        change: 0,
        changePct: 0,
        sector: 'Unknown',
      };
      setWatchlist(prev => [...prev, mockItem]);
      toast.success(`${form.ticker} added to watchlist!`);
    }
    setShowModal(false);
  };

  const handleRemove = async (ticker) => {
    if (!window.confirm(`Remove ${ticker} from watchlist?`)) return;
    try {
      await removeFromWatchlist(ticker);
    } catch {
      // ignore API error
    }
    setWatchlist(prev => prev.filter(w => w.ticker !== ticker));
    toast.success(`${ticker} removed from watchlist`);
  };

  const filtered = watchlist.filter(w =>
    w.ticker.toLowerCase().includes(search.toLowerCase()) ||
    (w.companyName || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Watchlist</h2>
          <p className="text-sm text-gray-500">{watchlist.length} stocks tracked</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl hover:bg-blue-600 text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus size={16} /> Add Stock
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search watchlist..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
        />
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Star size={32} className="text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Your watchlist is empty</h3>
          <p className="text-gray-500 text-sm mb-6">Add stocks you want to follow and analyze</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors"
          >
            Add Your First Stock
          </button>
        </div>
      )}

      {/* Watchlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((stock) => {
          const positive = stock.changePct >= 0;
          return (
            <div
              key={stock.id || stock.ticker}
              className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 hover:shadow-card-hover card-hover group"
            >
              {/* Ticker row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center text-white text-xs font-bold">
                    {stock.ticker.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{stock.ticker}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[100px]">{stock.companyName}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(stock.ticker)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Price */}
              <div className="mb-3">
                <p className="text-2xl font-bold text-gray-900">${stock.price?.toFixed(2) || 'â€”'}</p>
                <div className={`flex items-center gap-1 mt-0.5 ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
                  {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  <span className="text-sm font-semibold">
                    {positive ? '+' : ''}{stock.change?.toFixed(2) || 0} ({positive ? '+' : ''}{stock.changePct?.toFixed(2) || 0}%)
                  </span>
                </div>
              </div>

              {/* Sector badge */}
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                {stock.sector || 'Uncategorized'}
              </span>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <button
                  onClick={() => navigate(`/research?ticker=${stock.ticker}`)}
                  className="flex items-center justify-center gap-1.5 py-2 bg-primary/10 text-primary rounded-xl text-xs font-semibold hover:bg-primary hover:text-white transition-all"
                >
                  <Search size={12} /> Analyze
                </button>
                <button
                  onClick={() => navigate(`/stocks/${stock.ticker}`)}
                  className="flex items-center justify-center gap-1.5 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-all"
                >
                  <ExternalLink size={12} /> Details
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add to Watchlist">
        <AddWatchlistForm onSubmit={handleAdd} onCancel={() => setShowModal(false)} />
      </Modal>
    </div>
  );
};

export default WatchlistPage;

