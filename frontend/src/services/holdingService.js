import api from './api';

export const getHoldings = (portfolioId) => api.get(`/portfolio/${portfolioId}/holdings`);
export const addHolding = (portfolioId, data) => api.post(`/portfolio/${portfolioId}/holdings`, data);
export const updateHolding = (portfolioId, holdingId, data) => api.put(`/portfolio/${portfolioId}/holdings/${holdingId}`, data);
export const deleteHolding = (portfolioId, holdingId) => api.delete(`/portfolio/${portfolioId}/holdings/${holdingId}`);
export const getTransactions = (portfolioId, holdingId) => api.get(`/portfolio/${portfolioId}/holdings/${holdingId}/transactions`);
export const addTransaction = (portfolioId, holdingId, data) => api.post(`/portfolio/${portfolioId}/holdings/${holdingId}/transactions`, data);
