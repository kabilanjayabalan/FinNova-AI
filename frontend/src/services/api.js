import axios from 'axios';

// ─── Backend API (Spring Boot on :8080) ──────────────────────────────────────
// Handles auth, portfolios, watchlists, and proxies AI analysis requests.
// Real-time market data comes from yfinance (no API key needed).
// News comes from Google News RSS (no API key needed).

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const groqKey = localStorage.getItem('groq_api_key');
    if (groqKey) {
      config.headers['X-Groq-Api-Key'] = groqKey;
    }
    const geminiKey = localStorage.getItem('gemini_api_key');
    if (geminiKey) {
      config.headers['X-Gemini-Api-Key'] = geminiKey;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── AI Service API (FastAPI on :8001) ───────────────────────────────────────
// Handles AI analysis (Gemini narrative) and data endpoints.
// Stock data → yfinance (free, no key).
// News → Google News RSS (free, no key).
// AI narrative → Google Gemini (optional — falls back gracefully if no key).

export const aiApi = axios.create({
  baseURL: import.meta.env.VITE_AI_API_URL || 'http://localhost:8001',
});

aiApi.interceptors.request.use(
  (config) => {
    // Forward the Gemini key only for AI narrative/chat features.
    // Market data and news fetching do NOT require any API key.
    const geminiKey = localStorage.getItem('gemini_api_key');
    if (geminiKey) {
      config.headers['X-Gemini-Api-Key'] = geminiKey;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

