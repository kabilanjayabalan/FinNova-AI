import api from './api';

export const getPortfolios = () => api.get('/portfolio');
export const getPortfolio = (id) => api.get(`/portfolio/${id}`);
export const createPortfolio = (data) => api.post('/portfolio', data);
export const updatePortfolio = (id, data) => api.put(`/portfolio/${id}`, data);
export const deletePortfolio = (id) => api.delete(`/portfolio/${id}`);
