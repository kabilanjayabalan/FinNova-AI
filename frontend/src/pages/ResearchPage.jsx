import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, TrendingUp, AlertCircle, ChevronDown, ChevronUp, Star, ExternalLink, Activity, BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Badge from '../components/common/Badge';
import { getStockAnalysis } from '../services/stockService';
import { addToWatchlist } from '../services/watchlistService';

const MOCK_ANALYSIS = {
  ticker: 'AAPL',
  companyName: 'Apple Inc.',
  price: 192.30,
  change: 2.10,
  changePct: 1.11,
  marketCap: '2.96T',
  recommendation: 'BUY',
  confidence: 82,
  summary: 'Apple Inc. remains one of the most fundamentally sound companies in the technology sector. With its strong ecosystem lock-in, record services revenue, and the upcoming iPhone 16 supercycle, the stock offers an attractive risk-reward profile at current levels. The company\'s growing AI integration through Apple Intelligence positions it well for the next wave of consumer AI adoption. While valuation remains elevated relative to traditional peers, the premium is justified by consistent capital return programs, expanding margins, and an unparalleled brand moat.',
  highlights: [
    'Record $23.2B services revenue, up 14% YoY',
    'iPhone 16 launch with Apple Intelligence drives upgrade cycle',
    'Gross margin expansion to 46.2% — highest ever',
    'Active installed base exceeded 2.2 billion devices',
    '$90B buyback authorization demonstrates shareholder confidence',
  ],
  risks: [
    'China market headwinds — 17% revenue exposure',
    'Regulatory pressure from EU on App Store practices',
    'Premium valuation leaves little room for execution errors',
    'Dependency on iPhone (52% of revenue)',
  ],
  metrics: {
    peRatio: '28.5x',
    eps: '$6.42',
    dividendYield: '0.54%',
    beta: '1.24',
    roe: '147%',
    debtToEquity: '1.48',
    revenueGrowth: '+8.1%',
    earningsGrowth: '+11.2%',
  },
};

const MetricCard = ({ label, value }) => (
  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
    <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
    <p className="text-lg font-bold text-gray-900">{value}</p>
  </div>
);

const ResearchPage = () => {
  const [searchParams] = useSearchParams();
  const [ticker, setTicker] = useState(searchParams.get('ticker') || '');
  const [inputValue, setInputValue] = useState(searchParams.get('ticker') || '');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('recentSearches') || '[]'); } catch { return []; }
  });
  const navigate = useNavigate();
  const inputRef = useRef();

  useEffect(() => {
    if (searchParams.get('ticker')) {
      handleSearch(searchParams.get('ticker'));
    }
  }, []);

  const saveSearch = (t) => {
    const updated = [t, ...recentSearches.filter(r => r !== t)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleSearch = async (searchTicker) => {
    const t = (searchTicker || inputValue).toUpperCase().trim();
    if (!t) return;
    setLoading(true);
    setError('');
    setAnalysis(null);
    setTicker(t);
    try {
      const res = await getStockAnalysis(t);
      setAnalysis(res.data.data || res.data);
      saveSearch(t);
    } catch (err) {
      if (err.code === 'ERR_NETWORK' || err.response?.status >= 500) {
        // Use mock data when API is offline
        setAnalysis({ ...MOCK_ANALYSIS, ticker: t });
        saveSearch(t);
        toast('Using mock data — AI service offline', { icon: '⚠️' });
      } else {
        setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to analyze stock. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWatchlist = async () => {
    try {
      await addToWatchlist({ ticker: analysis.ticker, companyName: analysis.companyName });
      toast.success(`${analysis.ticker} added to watchlist!`);
    } catch {
      toast.error('Failed to add to watchlist');
    }
  };

  const popularTickers = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'AMZN', 'META', 'BRK.B'];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">AI Stock Research</h2>
        <p className="text-sm text-gray-500 mb-5">Search any stock ticker to get a comprehensive AI analysis powered by Gemini Pro</p>

        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary font-mono text-gray-900 placeholder:font-sans placeholder:text-gray-400"
              placeholder="Enter ticker (e.g., AAPL, GOOGL, TSLA)..."
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading || !inputValue}
            className="px-6 py-3.5 bg-primary text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20 min-w-[120px]"
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </span>
            ) : 'Analyze'}
          </button>
        </div>

        {/* Quick tickers */}
        <div className="flex flex-wrap gap-2 mt-4">
          {popularTickers.map(t => (
            <button
              key={t}
              onClick={() => { setInputValue(t); handleSearch(t); }}
              className="text-xs bg-gray-100 hover:bg-blue-100 hover:text-primary text-gray-600 px-3 py-1.5 rounded-full font-mono font-medium transition-colors"
            >
              {t}
            </button>
          ))}
        </div>

        {/* Recent searches */}
        {recentSearches.length > 0 && (
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
            <Clock size={14} className="text-gray-400 flex-shrink-0" />
            <span className="text-xs text-gray-400 font-medium">Recent:</span>
            {recentSearches.map(r => (
              <button
                key={r}
                onClick={() => { setInputValue(r); handleSearch(r); }}
                className="text-xs text-primary hover:underline font-mono font-semibold"
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-12 text-center">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-primary rounded-full animate-spin mx-auto mb-4" style={{ borderTopColor: '#3B82F6' }} />
          <p className="font-semibold text-gray-800">Analyzing {ticker}...</p>
          <p className="text-sm text-gray-500 mt-1">Gemini AI is processing financial data and market insights</p>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && !loading && (
        <div className="space-y-5 animate-fade-in">
          {/* Stock Header */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#0F172A] rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                  {analysis.ticker?.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-2xl font-bold text-gray-900">{analysis.ticker}</h2>
                    <Badge label={analysis.recommendation || 'HOLD'} />
                  </div>
                  <p className="text-gray-500 mt-0.5">{analysis.companyName}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xl font-bold text-gray-900">${analysis.price?.toFixed(2) || '—'}</span>
                    <span className={`text-sm font-semibold ${analysis.changePct >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {analysis.changePct >= 0 ? '+' : ''}{analysis.changePct?.toFixed(2) || 0}%
                    </span>
                    <span className="text-xs text-gray-400">Market Cap: {analysis.marketCap || '—'}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleWatchlist}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:border-amber-400 hover:text-amber-500 transition-colors"
                >
                  <Star size={15} /> Watchlist
                </button>
                <button
                  onClick={() => navigate(`/stocks/${analysis.ticker}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-medium hover:bg-primary hover:text-white transition-all"
                >
                  <ExternalLink size={15} /> Full Details
                </button>
              </div>
            </div>

            {/* Confidence Bar */}
            {analysis.confidence && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500">AI Confidence Score</span>
                  <span className="text-sm font-bold text-primary">{analysis.confidence}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full transition-all duration-700"
                    style={{ width: `${analysis.confidence}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard label="P/E Ratio" value={analysis.metrics?.peRatio || '—'} />
            <MetricCard label="EPS" value={analysis.metrics?.eps || '—'} />
            <MetricCard label="Dividend Yield" value={analysis.metrics?.dividendYield || '—'} />
            <MetricCard label="Beta" value={analysis.metrics?.beta || '—'} />
            <MetricCard label="ROE" value={analysis.metrics?.roe || '—'} />
            <MetricCard label="Debt/Equity" value={analysis.metrics?.debtToEquity || '—'} />
            <MetricCard label="Revenue Growth" value={analysis.metrics?.revenueGrowth || '—'} />
            <MetricCard label="Earnings Growth" value={analysis.metrics?.earningsGrowth || '—'} />
          </div>

          {/* Charts */}
          {analysis.priceHistory && analysis.priceHistory.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity size={18} className="text-primary" /> Price History (90 Days)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analysis.priceHistory}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" hide />
                      <YAxis domain={['auto', 'auto']} hide />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
                      />
                      <Area type="monotone" dataKey="close" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart2 size={18} className="text-primary" /> Volume (Last 30 Days)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysis.volumeHistory?.slice(-30) || analysis.priceHistory.slice(-30)}>
                      <XAxis dataKey="date" hide />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [(value / 1000000).toFixed(2) + 'M', 'Volume']}
                      />
                      <Bar dataKey="volume" fill="#94A3B8" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* AI Analysis */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">AI Analysis</h3>
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                {expanded ? <><ChevronUp size={14} /> Collapse</> : <><ChevronDown size={14} /> Expand</>}
              </button>
            </div>
            <p className={`text-sm text-gray-700 leading-relaxed ${!expanded ? 'line-clamp-4' : ''}`}>
              {analysis.summary || analysis.analysis}
            </p>
          </div>

          {/* Highlights & Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" /> Key Highlights
              </h3>
              <ul className="space-y-2.5">
                {(analysis.highlights || []).map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 flex-shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" /> Key Risks
              </h3>
              <ul className="space-y-2.5">
                {(analysis.risks || []).map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!analysis && !loading && !error && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={32} className="text-primary" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Search for a Stock</h3>
          <p className="text-gray-500 text-sm">Enter a ticker symbol above to get AI-powered analysis and recommendations</p>
        </div>
      )}
    </div>
  );
};

export default ResearchPage;
