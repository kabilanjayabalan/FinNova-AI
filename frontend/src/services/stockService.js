import api, { aiApi } from './api';

export const getStockSummary = (ticker) => aiApi.get(`/analysis/stock/${ticker}`);
export const getStockAnalysis = (ticker) => aiApi.get(`/research/analyze/${ticker}`, {
  headers: {
    'X-Groq-Api-Key': localStorage.getItem('groq_api_key') || ''
  }
});
export const getStockHistory = (ticker, period = '1y') => aiApi.get(`/analysis/history/${ticker}?period=${period}`);
export const getStockNews = (ticker) => aiApi.get(`/research/news/${ticker}`);
export const getMarketNews = () => aiApi.get('/research/market-news');
export const getStockSentiment = (ticker) => aiApi.get(`/analysis/sentiment/${ticker}`);
export const getStockRatios = (ticker) => aiApi.get(`/analysis/ratios/${ticker}`);

// Legacy exports kept for backward compatibility
export const chatWithAI = (data) => api.post('/ai/chat', data);
export const getAIHistory = (page = 0, queryType = '') =>
  api.get(`/ai/history?page=${page}${queryType ? `&queryType=${queryType}` : ''}`);
export const getStockQuote = (ticker) => aiApi.get(`/analysis/stock/${ticker}`);
