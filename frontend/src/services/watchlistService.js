import api from './api';

export const getWatchlist = () => api.get('/watchlist');
export const addToWatchlist = (data) => api.post('/watchlist', data);
export const removeFromWatchlist = (ticker) => api.delete(`/watchlist/${ticker}`);
export const isWatched = (ticker) => api.get(`/watchlist/${ticker}/status`);
