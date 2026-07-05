import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { PortfolioProvider } from './context/PortfolioContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './routes/PrivateRoute';
import MainLayout from './layouts/MainLayout';

// ─── Auth pages ──────────────────────────────────────────────────────────────
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// ─── App pages ────────────────────────────────────────────────────────────────
import DashboardPage from './pages/DashboardPage';
import PortfolioPage from './pages/PortfolioPage';
import HoldingsPage from './pages/HoldingsPage';
import WatchlistPage from './pages/WatchlistPage';
import ResearchPage from './pages/ResearchPage';
import StockDetailPage from './pages/StockDetailPage';
import ChatPage from './pages/ChatPage';
import NewsPage from './pages/NewsPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';

// ─── Inline placeholder for pages not yet created ────────────────────────────
const PlaceholderPage = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
      <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    </div>
    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
    <p className="text-gray-400 text-sm max-w-xs">
      This page is coming soon. Check back shortly!
    </p>
  </div>
);

// ─── New pages (lazy-loaded so missing files don't block the app) ─────────────
const ForgotPasswordPage = lazy(() =>
  import('./pages/auth/ForgotPasswordPage').catch(() => ({ default: () => <PlaceholderPage title="Forgot Password" /> }))
);
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').catch(() => ({ default: () => <PlaceholderPage title="Settings" /> }))
);
const AdminPage = lazy(() =>
  import('./pages/admin/AdminPage').catch(() => ({ default: () => <PlaceholderPage title="Admin" /> }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').catch(() => ({ default: () => <PlaceholderPage title="404 — Page Not Found" /> }))
);
const CalculatorPage = lazy(() =>
  import('./pages/CalculatorPage').catch(() => ({ default: () => <PlaceholderPage title="Calculator" /> }))
);
const ExpensesPage = lazy(() =>
  import('./pages/ExpenseTrackerPage').catch(() => ({ default: () => <PlaceholderPage title="Expenses" /> }))
);

import PageLoader from './components/PageLoader';

// ─── App ──────────────────────────────────────────────────────────────────────
const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PortfolioProvider>
          <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: '#fff',
                  color: '#1e293b',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  fontSize: '14px',
                  fontFamily: 'Inter, sans-serif',
                },
                success: {
                  iconTheme: { primary: '#10B981', secondary: '#fff' },
                },
                error: {
                  iconTheme: { primary: '#EF4444', secondary: '#fff' },
                },
              }}
            />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* ── Public routes ─────────────────────────────────────── */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/404" element={<NotFoundPage />} />

                {/* ── Protected routes — wrapped in MainLayout ──────────── */}
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <MainLayout />
                    </PrivateRoute>
                  }
                >
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard"    element={<DashboardPage />} />
                  <Route path="portfolio"    element={<PortfolioPage />} />
                  <Route path="holdings"     element={<HoldingsPage />} />
                  <Route path="watchlist"    element={<WatchlistPage />} />
                  <Route path="research"     element={<ResearchPage />} />
                  <Route path="stocks/:ticker" element={<StockDetailPage />} />
                  <Route path="chat"         element={<ChatPage />} />
                  <Route path="news"         element={<NewsPage />} />
                  <Route path="reports"      element={<ReportsPage />} />
                  <Route path="profile"      element={<ProfilePage />} />
                  <Route path="settings"     element={<SettingsPage />} />
                  <Route path="admin"        element={<AdminPage />} />
                  <Route path="calculator"   element={<CalculatorPage />} />
                  <Route path="expenses"     element={<ExpensesPage />} />
                </Route>

                {/* ── Catch-all → 404 ───────────────────────────────────── */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </PortfolioProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
