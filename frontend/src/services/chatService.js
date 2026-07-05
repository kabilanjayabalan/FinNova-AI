import api from './api';

export const sendMessage = (data) => api.post('/ai/chat', data);
export const getChatHistory = () => api.get('/ai/history');
export const deleteChatHistory = () => api.delete('/ai/history');
