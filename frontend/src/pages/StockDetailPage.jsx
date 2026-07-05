import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, TrendingUp, TrendingDown, Activity, AlertCircle, FileText } from 'lucide-react';
import api, { aiApi } from '../services/api';
import Loader from '../components/common/Loader';
import Badge from '../components/common/Badge';
import Alert from '../components/common/Alert';
import LineChart from '../components/charts/LineChart';
import toast from 'react-hot-toast';

const StockDetailPage = () => {
  const { ticker } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToWatchlist, setAddingToWatchlist] = useState(false);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        // Fetch history for the chart
        const histRes = await aiApi.get(`/analysis/history/${ticker}?period=1y`);
        if (histRes.data?.data) {
          setHistory(histRes.data.data || []);
        }

        // Fetch full analysis
        const analysisRes = await api.post(`/ai/analyze/${ticker}`);
        if (analysisRes.data?.success) {
          setData(analysisRes.data.data);
        } else {
          setError(analysisRes.data?.message || 'Failed to analyze stock');
        }
      } catch (err) {
        setError('Connection to AI service failed. Data may be limited.');
        // Mock data fallback
        setData({
          ticker: ticker.toUpperCase(),
          summary: {
            name: `${ticker.toUpperCase()} Corporation`,
            current_price: 150.25,
            change: 2.50,
            change_percent: 1.69,
            market_cap: 2500000000000,
            sector: 'Technology'
          },
          ratios: { pe_ratio: 28.5, eps: 5.27, dividend_yield: 0.5 },
          ai_analysis: 'This is a mock AI analysis for development purposes. The company shows strong fundamentals but valuation remains high.',
          recommendation: 'BUY',
          recommendation_confidence: 0.85
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStockData();
  }, [ticker]);

  const handleAddToWatchlist = async () => {
    setAddingToWatchlist(true);
    try {
      await api.post('/watchlist', { ticker, companyName: data?.summary?.name });
      toast.success(`${ticker} added to watchlist!`);
    } catch (err) {
      toast.error('Failed to add to watchlist. It might already exist.');
    } finally {
      setAddingToWatchlist(false);
    }
  };

  if (loading) return <Loader fullPage />;
  if (!data) return <div className="p-8 text-center"><Alert type="error" message="Stock data not found" /></div>;

  const isPositive = data.summary?.change >= 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-start gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="mt-1 text-gray-400 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{ticker.toUpperCase()}</h1>
              <span className="text-xl text-gray-500 font-medium">{data.summary?.name}</span>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-3xl font-bold text-gray-900">
                ${data.summary?.current_price?.toFixed(2) || '---'}
              </span>
              <div className={`flex items-center gap-1 font-semibold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                {isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                <span>{isPositive ? '+' : ''}{data.summary?.change?.toFixed(2)}</span>
                <span>({isPositive ? '+' : ''}{data.summary?.change_percent?.toFixed(2)}%)</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleAddToWatchlist}
            disabled={addingToWatchlist}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-50 text-primary rounded-xl font-medium hover:bg-blue-100 transition-colors"
          >
            <Star size={18} /> Watchlist
          </button>
        </div>
      </div>

      {error && <Alert type="warning" message={error} onClose={() => setError(null)} />}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {['overview', 'ai-analysis', 'financials'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 font-medium text-sm capitalize transition-colors border-b-2 ${
              activeTab === tab 
                ? 'border-primary text-primary' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-6">Price History (1Y)</h3>
              {history.length > 0 ? (
                <LineChart data={history.map(d => ({ date: d.date?.split('T')[0], close: d.close }))} color={isPositive ? '#10B981' : '#EF4444'} />
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400 border border-dashed rounded-xl">Chart data not available</div>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <h3 className="font-bold text-gray-900">Key Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Market Cap</span>
                  <span className="font-medium text-gray-900">${(data.summary?.market_cap / 1e9).toFixed(2)}B</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">P/E Ratio</span>
                  <span className="font-medium text-gray-900">{data.ratios?.pe_ratio?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">EPS</span>
                  <span className="font-medium text-gray-900">{data.ratios?.eps?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Div Yield</span>
                  <span className="font-medium text-gray-900">{data.ratios?.dividend_yield ? (data.ratios.dividend_yield * 100).toFixed(2) + '%' : 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-500">Sector</span>
                  <span className="font-medium text-gray-900">{data.summary?.sector || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai-analysis' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary p-2 rounded-xl text-white">
                  <Activity size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">AI Research Report</h2>
              </div>
              
              <div className="prose prose-blue max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                {data.ai_analysis || 'AI analysis could not be generated at this time.'}
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 text-center">AI Recommendation</h3>
                <div className="flex flex-col items-center justify-center py-6">
                  <Badge 
                    label={data.recommendation || 'HOLD'} 
                    variant={data.recommendation === 'BUY' ? 'BUY' : data.recommendation === 'SELL' ? 'SELL' : 'HOLD'} 
                  />
                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Confidence Score: <span className="font-bold text-gray-900">{(data.recommendation_confidence * 100 || 0).toFixed(0)}%</span>
                  </p>
                </div>
              </div>

              {data.sentiment && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4">News Sentiment</h3>
                  <Badge 
                    label={data.sentiment.sentiment} 
                    variant={data.sentiment.sentiment} 
                  />
                  <p className="text-sm text-gray-600 mt-3">{data.sentiment.summary}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'financials' && (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Financial Ratios & Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(data.ratios || {}).map(([key, value]) => (
                <div key={key} className="p-4 border border-gray-100 rounded-xl bg-gray-50">
                  <p className="text-sm text-gray-500 capitalize mb-1">{key.replace(/_/g, ' ')}</p>
                  <p className="text-xl font-bold text-gray-900">
                    {value !== null && value !== undefined 
                      ? (typeof value === 'number' && value < 100 ? value.toFixed(2) : value) 
                      : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockDetailPage;



