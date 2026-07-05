import { aiApi } from './api';

export const getMarketNews = () => aiApi.get('/research/market-news');
export const getTickerNews = (ticker) => aiApi.get(`/research/news/${ticker}`);
