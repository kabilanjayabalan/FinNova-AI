import React, { useState, useEffect, useCallback } from 'react';
import {
  Newspaper, ExternalLink, TrendingUp, TrendingDown,
  Minus, ServerCrash, RefreshCw, Radio, Search, Clock,
  ChevronDown, ChevronUp, Eye,
} from 'lucide-react';
import { aiApi } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const clean = (s) => (s ? s.replace(/<[^>]+>/g, '').trim() : '');

const NEWS_HISTORY_KEY = 'news_history';
const MAX_HISTORY = 10;

function pushToHistory(article) {
  try {
    const existing = JSON.parse(localStorage.getItem(NEWS_HISTORY_KEY) || '[]');
    const entry = {
      title: article.title,
      link: article.link,
      publisher: article.publisher,
      published: article.published || article.publishedAt,
      viewedAt: new Date().toISOString(),
    };
    // Deduplicate by link
    const filtered = existing.filter((e) => e.link !== article.link);
    const next = [entry, ...filtered].slice(0, MAX_HISTORY);
    localStorage.setItem(NEWS_HISTORY_KEY, JSON.stringify(next));
  } catch {}
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(NEWS_HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

const NewsCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
    <div className="flex justify-between items-start">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
    <Skeleton className="h-6 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <div className="flex justify-between items-center pt-2 border-t border-gray-50 mt-auto">
      <Skeleton className="h-5 w-12 rounded-full" />
      <Skeleton className="h-4 w-24" />
    </div>
  </div>
);

// ─── Sentiment helpers ────────────────────────────────────────────────────────
const getSentimentIcon = (sentiment) => {
  switch (sentiment) {
    case 'BULLISH': return <TrendingUp size={16} className="text-emerald-500" />;
    case 'BEARISH': return <TrendingDown size={16} className="text-red-500" />;
    default:        return <Minus size={16} className="text-gray-400" />;
  }
};

// ─── NewsCard ─────────────────────────────────────────────────────────────────
const NewsCard = ({ article, onRead }) => {
  const pubDate = article.published || article.publishedAt;
  let timeAgo = 'Recently';
  if (pubDate) {
    try { timeAgo = formatDistanceToNow(new Date(pubDate), { addSuffix: true }); }
    catch { /* keep 'Recently' */ }
  }

  const summary = clean(article.summary || article.description || '');

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Header row */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          <Newspaper size={16} />
          <span className="truncate max-w-[140px]">{article.publisher || 'Financial News'}</span>
          <span>•</span>
          <span className="whitespace-nowrap">{timeAgo}</span>
        </div>
        {article.sentiment && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 rounded-full text-xs font-semibold border border-gray-100 ml-2 shrink-0">
            {getSentimentIcon(article.sentiment)}
            <span className={
              article.sentiment === 'BULLISH' ? 'text-emerald-600' :
              article.sentiment === 'BEARISH' ? 'text-red-600' : 'text-gray-600'
            }>
              {article.sentiment}
            </span>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug line-clamp-2">
        {article.title}
      </h3>

      {/* Clean summary — no HTML */}
      {summary && (
        <p className="text-gray-500 text-sm mb-4 flex-1 line-clamp-3">
          {summary}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
        <div className="flex gap-2">
          {article.ticker && (
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
              {article.ticker}
            </span>
          )}
        </div>
        {article.link && article.link !== '#' ? (
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onRead(article)}
            className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Read Article <ExternalLink size={14} />
          </a>
        ) : (
          <span className="text-xs text-gray-400">No link available</span>
        )}
      </div>
    </div>
  );
};

// ─── ServiceDownState ─────────────────────────────────────────────────────────
const ServiceDownState = ({ onRetry }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-16 text-center space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-6">
    <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
      <ServerCrash size={32} className="text-orange-400" />
    </div>
    <div>
      <h3 className="text-lg font-semibold text-gray-800">Market news is temporarily unavailable</h3>
      <p className="text-gray-500 text-sm mt-1 max-w-md">
        The AI service needs to be running to fetch live market news.
      </p>
    </div>
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left text-sm text-gray-600 max-w-md w-full">
      <p className="font-semibold text-gray-700 mb-2">To start the AI service:</p>
      <ol className="list-decimal list-inside space-y-1">
        <li>Open a terminal in the project root</li>
        <li>Run: <code className="bg-gray-100 px-1 rounded text-xs">cd ai-service && python main.py</code></li>
        <li>Refresh this page</li>
      </ol>
    </div>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm"
    >
      <RefreshCw size={15} /> Try Again
    </button>
  </div>
);

// ─── RecentlyViewed ───────────────────────────────────────────────────────────
const RecentlyViewed = ({ history, onRefresh }) => {
  const [open, setOpen] = useState(false);
  if (history.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Eye size={15} className="text-blue-500" />
          Recently Viewed
          <span className="ml-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
            {history.length}
          </span>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {open && (
        <div className="divide-y divide-gray-50 border-t border-gray-100">
          {history.slice(0, 5).map((item, idx) => {
            let timeAgo = 'Recently';
            try {
              timeAgo = formatDistanceToNow(new Date(item.viewedAt), { addSuffix: true });
            } catch {}

            return (
              <div key={idx} className="px-5 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                <Clock size={14} className="text-gray-300 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.publisher && <span>{item.publisher} · </span>}
                    {timeAgo}
                  </p>
                </div>
                {item.link && item.link !== '#' && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    Open <ExternalLink size={11} />
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── NewsPage ─────────────────────────────────────────────────────────────────
const NewsPage = () => {
  const [news, setNews]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [serviceDown, setServiceDown] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [search, setSearch]           = useState('');
  const [history, setHistory]         = useState(() => getHistory());

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setServiceDown(false);
    try {
      const res = await aiApi.get('/research/market-news');
      const data = res.data;
      const articles = data?.news || data?.data || [];
      setNews(Array.isArray(articles) ? articles : []);
      setLastUpdated(data?.retrieved_at ? new Date(data.retrieved_at) : new Date());
    } catch {
      setServiceDown(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const handleRead = (article) => {
    pushToHistory(article);
    setHistory(getHistory());
  };

  // Filter articles by search query
  const filtered = news.filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (a.title || '').toLowerCase().includes(q) ||
      (a.publisher || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Market News</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <Radio size={14} className="text-emerald-500 animate-pulse" />
            Latest financial updates via Google News
            {lastUpdated && (
              <span className="text-xs text-gray-400 ml-1">
                · Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchNews}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Search bar ─────────────────────────────────────────── */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles by title or publisher…"
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium"
          >
            Clear
          </button>
        )}
      </div>

      {/* ── Recently Viewed ────────────────────────────────────── */}
      <RecentlyViewed history={history} />

      {/* ── Results count (when searching) ────────────────────── */}
      {search && !loading && !serviceDown && (
        <p className="text-sm text-gray-500">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
        </p>
      )}

      {/* ── Grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Loading skeletons */}
        {loading && [1, 2, 3, 4, 5, 6].map((i) => <NewsCardSkeleton key={i} />)}

        {/* Service-down state */}
        {!loading && serviceDown && <ServiceDownState onRetry={fetchNews} />}

        {/* Empty — API succeeded but no articles */}
        {!loading && !serviceDown && news.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center space-y-3 bg-white rounded-2xl border border-gray-100">
            <Newspaper size={40} className="text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700">No articles available</h3>
            <p className="text-gray-400 text-sm">Check back later for market updates.</p>
          </div>
        )}

        {/* No search results */}
        {!loading && !serviceDown && news.length > 0 && filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center space-y-3 bg-white rounded-2xl border border-gray-100">
            <Search size={36} className="text-gray-300" />
            <h3 className="text-base font-semibold text-gray-700">No matching articles</h3>
            <p className="text-gray-400 text-sm">Try a different keyword.</p>
          </div>
        )}

        {/* News articles */}
        {!loading && !serviceDown && filtered.map((article, idx) => (
          <NewsCard
            key={article.id || article.link || idx}
            article={article}
            onRead={handleRead}
          />
        ))}
      </div>
    </div>
  );
};

export default NewsPage;
