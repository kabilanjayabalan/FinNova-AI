import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp, Activity, Star, Zap, ArrowUpRight, ArrowDownRight,
  ChevronRight, RefreshCw, BarChart2, DollarSign, Briefcase,
  BookOpen, PlusCircle, Newspaper,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import api from '../services/api';

// ─────────────────────────────────────────────
// Skeleton loader helper
// ─────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

// ─────────────────────────────────────────────
// Live Market Ticker Banner
// ─────────────────────────────────────────────
const TickerBanner = () => {
  const [items, setItems] = useState([
    { label: 'GOLD',      price: '—',      change: '—',      up: true,  symbol: 'GC=F'   },
    { label: 'SILVER',    price: '—',      change: '—',      up: false, symbol: 'SI=F'   },
    { label: 'BTC',       price: '—',      change: '—',      up: true,  symbol: 'Bitcoin' },
    { label: 'ETH',       price: '—',      change: '—',      up: true,  symbol: 'Ethereum'},
    { label: 'S&P 500',   price: '—',      change: '—',      up: true,  symbol: '^GSPC'  },
    { label: 'NASDAQ',    price: '—',      change: '—',      up: false, symbol: '^IXIC'  },
    { label: 'USD/INR',   price: '83.72',  change: '+0.05%', up: true,  symbol: 'Forex'  },
    { label: 'CRUDE OIL', price: '—',      change: '—',      up: false, symbol: 'CL=F'   },
  ]);

  useEffect(() => {
    // Fetch live commodities & indices from yfinance via our AI service
    const TICKERS = ['GLD', 'SLV', '^GSPC', '^IXIC', 'USO'];
    const labelMap = { 'GLD': 'GOLD', 'SLV': 'SILVER', '^GSPC': 'S&P 500', '^IXIC': 'NASDAQ', 'USO': 'CRUDE OIL' };

    const fetchYfinance = async () => {
      for (const ticker of TICKERS) {
        try {
          const res = await fetch(`http://localhost:8002/analysis/stock/${encodeURIComponent(ticker)}`);
          if (!res.ok) continue;
          const data = await res.json();
          // Adjust for API structure: it returns { current_price: X, change: Y, change_percent: Z } at root or info
          const info = data?.data?.info || data?.info || data;
          const price = info?.currentPrice || info?.regularMarketPrice || info?.price || info?.current_price;
          const changePct = info?.regularMarketChangePercent ?? info?.changePercent ?? info?.change_percent ?? null;
          const change = info?.regularMarketChange ?? info?.change ?? null;
          if (!price) continue;
          const label = labelMap[ticker];
          if (!label) continue;
          const pctVal = changePct !== null ? parseFloat(changePct).toFixed(2) : null;
          setItems(prev => prev.map(item =>
            item.label === label
              ? {
                  ...item,
                  price: parseFloat(price).toLocaleString('en-US', { maximumFractionDigits: 2 }),
                  change: pctVal !== null ? `${pctVal > 0 ? '+' : ''}${pctVal}%` : item.change,
                  up: pctVal !== null ? pctVal > 0 : item.up,
                }
              : item
          ));
        } catch { /* keep default */ }
      }
    };

    // Fetch BTC/ETH from CoinGecko (no API key)
    const fetchCrypto = async () => {
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true');
        const data = await res.json();
        setItems(prev => prev.map(item => {
          if (item.label === 'BTC' && data.bitcoin) {
            const pct = data.bitcoin.usd_24h_change?.toFixed(2) || '0';
            return { ...item, price: data.bitcoin.usd.toLocaleString(), change: `${pct > 0 ? '+' : ''}${pct}%`, up: pct > 0 };
          }
          if (item.label === 'ETH' && data.ethereum) {
            const pct = data.ethereum.usd_24h_change?.toFixed(2) || '0';
            return { ...item, price: data.ethereum.usd.toLocaleString(), change: `${pct > 0 ? '+' : ''}${pct}%`, up: pct > 0 };
          }
          return item;
        }));
      } catch { /* keep defaults */ }
    };

    fetchYfinance();
    fetchCrypto();
  }, []);

  const doubled = [...items, ...items]; // duplicate for seamless marquee loop

  return (
    <div className="relative overflow-hidden bg-blue-900 rounded-2xl border border-blue-800 py-3 mb-6">
      <div className="flex gap-0 animate-marquee" style={{ width: 'max-content' }}>
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-6 border-r border-slate-700">
            <span className="text-xs font-bold text-slate-300">{item.label}</span>
            <span className="text-sm font-semibold text-white">
              {item.price === '—' ? '—' : (item.label === 'USD/INR' ? '₹' : '$') + item.price}
            </span>
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${item.up ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
              {item.change === '—' ? '—' : (item.up ? '▲' : '▼') + ' ' + item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────
// Summary Card
// ─────────────────────────────────────────────
const SummaryCard = ({ title, value, subValue, icon: Icon, color, bgColor, positive, loading }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-card hover:shadow-card-hover card-hover">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bgColor}`}>
        <Icon size={22} className={color} />
      </div>
      {positive !== undefined && subValue && (
        <span className={`flex items-center gap-1 text-xs font-semibold ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {subValue}
        </span>
      )}
    </div>
    <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
    {loading ? (
      <Skeleton className="h-8 w-24 mt-1" />
    ) : (
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    )}
  </div>
);

// ─────────────────────────────────────────────
// Empty state helper
// ─────────────────────────────────────────────
const EmptyState = ({ icon: Icon, title, description, actionLabel, actionTo }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
      <Icon size={24} className="text-gray-400" />
    </div>
    <p className="font-semibold text-gray-700">{title}</p>
    {description && <p className="text-sm text-gray-500 max-w-xs">{description}</p>}
    {actionLabel && actionTo && (
      <Link
        to={actionTo}
        className="mt-1 inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline"
      >
        {actionLabel} <ChevronRight size={14} />
      </Link>
    )}
  </div>
);

// ─────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────
const DashboardPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [chatInput, setChatInput] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Data states
  const [portfolios, setPortfolios] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [aiHistory, setAiHistory] = useState([]);

  // Loading states
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [loadingWatchlist, setLoadingWatchlist] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // ── Clock tick ──────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // ── Fetch portfolio ──────────────────────────
  useEffect(() => {
    api.get('/portfolio')
      .then(res => {
        const data = res.data?.data || res.data || [];
        setPortfolios(Array.isArray(data) ? data : []);
      })
      .catch(() => setPortfolios([]))
      .finally(() => setLoadingPortfolio(false));
  }, []);

  // ── Fetch watchlist ──────────────────────────
  useEffect(() => {
    api.get('/watchlist')
      .then(res => {
        const data = res.data?.data || res.data || [];
        setWatchlist(Array.isArray(data) ? data : []);
      })
      .catch(() => setWatchlist([]))
      .finally(() => setLoadingWatchlist(false));
  }, []);

  // ── Fetch AI history (last 3 queries) ────────
  useEffect(() => {
    api.get('/ai/history?size=3')
      .then(res => {
        // support both {data: [...]} and {data: {content: [...]}} shapes
        const raw = res.data?.data;
        const items = Array.isArray(raw)
          ? raw
          : (Array.isArray(raw?.content) ? raw.content : []);
        setAiHistory(items.slice(0, 3));
      })
      .catch(() => setAiHistory([]))
      .finally(() => setLoadingHistory(false));
  }, []);

  // ── Derived values ───────────────────────────
  const totalHoldings = portfolios.reduce(
    (sum, p) => sum + (p.holdingsCount ?? p.holdings?.length ?? 0), 0
  );

  const handleAskAI = () => {
    if (chatInput.trim()) {
      navigate('/chat', { state: { initialMessage: chatInput } });
    } else {
      navigate('/chat');
    }
  };

  const greeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleRefresh = () => window.location.reload();

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Ticker Banner ────────────────────────── */}
      <TickerBanner />

      {/* ── Header ───────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {greeting()}, {user?.fullName?.split(' ')[0] || 'Investor'} 👋
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">Here's your investment overview for today</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
        >
          <RefreshCw size={14} />
          <span className="hidden sm:block">Refresh</span>
        </button>
      </div>

      {/* ── Summary Cards ────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Portfolios"
          value={loadingPortfolio ? '—' : `${portfolios.length}`}
          subValue={totalHoldings > 0 ? `${totalHoldings} holdings` : undefined}
          icon={Briefcase}
          color="text-emerald-600"
          bgColor="bg-emerald-50"
          loading={loadingPortfolio}
        />
        <SummaryCard
          title="Total Holdings"
          value={loadingPortfolio ? '—' : `${totalHoldings}`}
          icon={BarChart2}
          color="text-primary"
          bgColor="bg-blue-50"
          loading={loadingPortfolio}
        />
        <SummaryCard
          title="Watchlist"
          value={loadingWatchlist ? '—' : `${watchlist.length} Stocks`}
          icon={Star}
          color="text-amber-500"
          bgColor="bg-amber-50"
          loading={loadingWatchlist}
        />
        <SummaryCard
          title="AI Queries"
          value={loadingHistory ? '—' : `${aiHistory.length} Recent`}
          icon={Zap}
          color="text-violet-500"
          bgColor="bg-violet-50"
          loading={loadingHistory}
        />
      </div>

      {/* ── Main Grid ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Portfolio Summary Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Portfolio Summary</h3>
              <p className="text-sm text-gray-500">Your active portfolios</p>
            </div>
            <button
              onClick={() => navigate('/portfolio')}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Manage <ChevronRight size={12} />
            </button>
          </div>

          {loadingPortfolio ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : portfolios.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No portfolios yet"
              description="Create your first portfolio to start tracking your investments."
              actionLabel="Create a portfolio"
              actionTo="/portfolio"
            />
          ) : (
            <div className="space-y-2">
              {portfolios.map((p, i) => (
                <div
                  key={p.id || i}
                  onClick={() => navigate(`/portfolio/${p.id || ''}`)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-blue-50/30 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 bg-[#0F172A] rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(p.name || 'P').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{p.name || `Portfolio ${i + 1}`}</p>
                    <p className="text-gray-500 text-xs">
                      {p.holdingsCount ?? p.holdings?.length ?? 0} holdings
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-gray-400" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Insights */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recent AI Queries</h3>
            <button
              onClick={() => navigate('/chat')}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Open Chat <ChevronRight size={12} />
            </button>
          </div>

          {loadingHistory ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                  <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : aiHistory.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No recent AI insights"
              description="Try researching a stock to get AI-powered analysis."
              actionLabel="Research a stock"
              actionTo="/research"
            />
          ) : (
            <div className="space-y-3">
              {aiHistory.map((item, i) => {
                const query = item.query || item.message || item.question || 'Query';
                const response = item.response || item.answer || '';
                const ticker = item.ticker || item.stockTicker || '';
                return (
                  <div
                    key={item.id || i}
                    onClick={() => navigate('/chat')}
                    className="flex gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50/50 transition-colors cursor-pointer"
                  >
                    <div className="w-9 h-9 bg-[#0F172A] rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {ticker ? ticker.slice(0, 2).toUpperCase() : 'AI'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 line-clamp-1">{query}</p>
                      {response && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{response}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Grid ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* AI Ask Panel */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#0F172A] to-[#1E3A5F] rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">AI Research Assistant</h3>
              <p className="text-slate-400 text-xs">Powered by Gemini</p>
            </div>
          </div>
          <p className="text-slate-300 text-sm mb-5">
            Ask about any stock, sector, or get portfolio recommendations.
          </p>
          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
              type="text"
              placeholder="e.g., What is the growth potential of NVDA?"
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-white placeholder:text-slate-400 text-sm"
            />
            <button
              onClick={handleAskAI}
              className="bg-primary hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-500/30"
            >
              Ask AI
            </button>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {['Analyze AAPL', 'Best sectors 2025', 'My portfolio risk'].map((s) => (
              <button
                key={s}
                onClick={() => setChatInput(s)}
                className="text-xs text-slate-300 bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-full transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Watchlist / Top Movers */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">My Watchlist</h3>
            <button
              onClick={() => navigate('/watchlist')}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View all <ChevronRight size={12} />
            </button>
          </div>

          {loadingWatchlist ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : watchlist.length === 0 ? (
            <EmptyState
              icon={Star}
              title="No watchlist stocks"
              description="Add stocks to your watchlist to track them here."
              actionLabel="Go to Watchlist"
              actionTo="/watchlist"
            />
          ) : (
            <div className="space-y-1">
              {watchlist.slice(0, 5).map((stock, i) => {
                const ticker = stock.ticker || stock.symbol || stock;
                const name = stock.companyName || stock.name || ticker;
                return (
                  <div
                    key={ticker || i}
                    onClick={() => navigate(`/stocks/${ticker}`)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="w-9 h-9 bg-[#0F172A] rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {String(ticker).slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-xs">{ticker}</p>
                      <p className="text-gray-500 text-xs truncate">{name}</p>
                    </div>
                    <ChevronRight size={12} className="text-gray-400" />
                  </div>
                );
              })}
              {watchlist.length > 5 && (
                <p className="text-xs text-gray-400 text-center pt-2">
                  +{watchlist.length - 5} more in watchlist
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
