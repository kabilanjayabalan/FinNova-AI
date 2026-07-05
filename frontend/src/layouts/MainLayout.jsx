import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  TrendingUp,
  BarChart2,
  Star,
  Search,
  MessageSquare,
  Newspaper,
  FileText,
  Settings,
  LogOut,
  Bell,
  ChevronRight,
  ChevronLeft,
  Activity,
  Menu,
  User,
  CheckCheck,
  TrendingDown,
  Zap,
  AlertCircle,
  X,
  Calculator,
  Receipt,
} from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/portfolio',  icon: TrendingUp,       label: 'Portfolio'  },
  { to: '/holdings',   icon: BarChart2,        label: 'Holdings'   },
  { to: '/watchlist',  icon: Star,             label: 'Watchlist'  },
  { to: '/research',   icon: Search,           label: 'Research'   },
  { to: '/chat',       icon: MessageSquare,    label: 'AI Chat'    },
  { to: '/news',       icon: Newspaper,        label: 'News'       },
  { to: '/reports',    icon: FileText,         label: 'Reports'    },
  { to: '/calculator', icon: Calculator,       label: 'Calculator' },
  { to: '/expenses',   icon: Receipt,          label: 'Expenses'   },
];

const PAGE_TITLES = {
  '/dashboard':  'Dashboard',
  '/portfolio':  'My Portfolios',
  '/holdings':   'Holdings',
  '/watchlist':  'Watchlist',
  '/research':   'AI Research',
  '/chat':       'AI Chat',
  '/news':       'Market News',
  '/reports':    'Reports',
  '/profile':    'Profile',
  '/settings':   'Settings',
  '/admin':      'Admin',
  '/calculator': 'Financial Calculator',
  '/expenses':   'Expense Tracker',
};

const STATIC_NOTIFICATIONS = [
  {
    id: 1,
    icon: Zap,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50',
    title: 'New AI analysis ready',
    body: 'Your NVDA deep-dive report is complete.',
    time: '2 min ago',
    read: false,
  },
  {
    id: 2,
    icon: TrendingUp,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50',
    title: 'Portfolio update available',
    body: 'Your portfolio rebalance suggestions are in.',
    time: '18 min ago',
    read: false,
  },
  {
    id: 3,
    icon: AlertCircle,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-50',
    title: 'Market alert: NVDA +5%',
    body: 'NVIDIA surged after earnings beat estimates.',
    time: '1 hr ago',
    read: true,
  },
];

const SIDEBAR_STORAGE_KEY = 'sidebar_collapsed';

// ─── Reusable: close dropdown on outside click ──────────────────────────────
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}

// ─── MainLayout ──────────────────────────────────────────────────────────────
const MainLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // ── Maintenance mode ──────────────────────────────────────────────────────
  const [maintenance, setMaintenance] = useState(
    () => localStorage.getItem('maintenance_mode') === 'true'
  );
  useEffect(() => {
    const handle = () =>
      setMaintenance(localStorage.getItem('maintenance_mode') === 'true');
    window.addEventListener('storage', handle);
    return () => window.removeEventListener('storage', handle);
  }, []);

  const isAdmin =
    user?.roles?.includes('ADMIN') || user?.role === 'ADMIN';

  // ── Sidebar collapse state (persisted) ──────────────────────────────────
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // ── Mobile drawer ────────────────────────────────────────────────────────
  const [mobileOpen, setMobileOpen] = useState(false);

  // ── Notification dropdown ─────────────────────────────────────────────────
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(STATIC_NOTIFICATIONS);
  const notifRef = useRef(null);
  useClickOutside(notifRef, () => setNotifOpen(false));

  // ── Admin dropdown ────────────────────────────────────────────────────────
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  // ── Main Menu dropdown (for Admin) ────────────────────────────────────────
  const [mainMenuOpen, setMainMenuOpen] = useState(false);

  // ── Profile dropdown ───────────────────────────────────────────────────────
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  useClickOutside(profileRef, () => setProfileOpen(false));

  // ── Persist sidebar collapse ───────────────────────────────────────────────
  const toggleSidebar = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate('/login');
  };

  // ── Page title ─────────────────────────────────────────────────────────────
  const pageTitle =
    Object.entries(PAGE_TITLES).find(([path]) =>
      location.pathname.startsWith(path)
    )?.[1] || 'FinNova AI';

  // ── Unread count ──────────────────────────────────────────────────────────
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  // ── User initials / avatar ─────────────────────────────────────────────────
  const userInitial = user?.fullName?.charAt(0)?.toUpperCase() || 'U';
  const userName = user?.fullName || 'User';
  const userEmail = user?.email || '';
  const userRole = user?.roles?.[0] || 'Investor';

  // ── Maintenance screen ────────────────────────────────────────────────────
  if (maintenance && !isAdmin) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900 text-white">
        <svg width="80" height="80" viewBox="0 0 32 32" fill="none">
          <rect x="4" y="8" width="4" height="16" rx="1" fill="#3B82F6" />
          <rect x="3" y="12" width="6" height="2" rx="0.5" fill="#3B82F6" />
          <rect x="14" y="4" width="4" height="20" rx="1" fill="#10B981" />
          <rect x="13" y="8" width="6" height="2" rx="0.5" fill="#10B981" />
          <rect x="24" y="10" width="4" height="14" rx="1" fill="#F59E0B" />
          <rect x="23" y="14" width="6" height="2" rx="0.5" fill="#F59E0B" />
        </svg>
        <h1 className="text-3xl font-bold mt-6">Under Maintenance</h1>
        <p className="text-slate-400 mt-3 max-w-sm text-center">
          {localStorage.getItem('maintenance_message') ||
            'FinNova AI is currently undergoing scheduled maintenance. We will be back shortly!'}
        </p>
        <div className="mt-8 flex items-center gap-2 text-slate-500 text-sm">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Estimated downtime:{' '}
          {localStorage.getItem('maintenance_duration') || 'A few hours'}
        </div>
      </div>
    );
  }

  // ── Sidebar nav item renderer ──────────────────────────────────────────────
  const SidebarNavItem = ({ to, icon: Icon, label }) => (
    <NavLink
      key={to}
      to={to}
      onClick={() => setMobileOpen(false)}
      data-tooltip={label}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-150 sidebar-tooltip
        ${collapsed ? 'justify-center px-0 py-2.5 mx-2' : 'px-3 py-2.5 mx-0'}
        ${
          isActive
            ? 'bg-blue-50 text-blue-600 shadow-[inset_2px_0_0_0_var(--color-primary)]'
            : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={18}
            className={`flex-shrink-0 transition-colors ${
              isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600'
            }`}
            style={isActive ? { color: 'var(--color-primary)' } : {}}
          />
          {!collapsed && (
            <>
              <span className="truncate">{label}</span>
              {isActive && (
                <ChevronRight size={14} className="ml-auto text-blue-600 flex-shrink-0" />
              )}
            </>
          )}
          {/* Active indicator bar */}
          {isActive && collapsed && (
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r"
              style={{ backgroundColor: 'var(--color-primary)' }}
            />
          )}
        </>
      )}
    </NavLink>
  );

  // ── Sidebar inner content (shared by desktop + mobile) ────────────────────
  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-sidebar)' }}>
      {/* Logo + Collapse Toggle */}
      <div
        className={`flex items-center border-b border-gray-100 flex-shrink-0 ${
          collapsed && !isMobile ? 'justify-center px-0 py-5' : 'px-5 py-5'
        }`}
      >
        {/* Candlestick logo */}
        <div className="flex items-center gap-2.5">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="8" width="4" height="16" rx="1" fill="#3B82F6" />
            <rect x="3" y="12" width="6" height="2" rx="0.5" fill="#3B82F6" />
            <rect x="14" y="4" width="4" height="20" rx="1" fill="#10B981" />
            <rect x="13" y="8" width="6" height="2" rx="0.5" fill="#10B981" />
            <rect x="24" y="10" width="4" height="14" rx="1" fill="#F59E0B" />
            <rect x="23" y="14" width="6" height="2" rx="0.5" fill="#F59E0B" />
          </svg>
          {(!collapsed || isMobile) && (
            <div className="flex items-baseline gap-0.5">
              <span className="text-base font-bold text-gray-900">Fin</span>
              <span className="text-base font-bold" style={{ color: 'var(--color-primary)' }}>
                Nova
              </span>
              <span className="text-xs font-semibold text-slate-500 ml-0.5">AI</span>
            </div>
          )}
        </div>

        {/* Desktop collapse toggle button */}
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className={`ml-auto w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-gray-900 hover:bg-gray-100 transition-colors ${
              collapsed ? 'ml-0 mt-2 w-full justify-center' : ''
            }`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 py-4 space-y-0.5 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden"
        style={{ msOverflowStyle: 'none' }}
      >
        {(!collapsed || isMobile) && (
          <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest px-5 mb-3">
            Main Menu
          </p>
        )}
        
        {isAdmin ? (
          <div className="px-2">
            <button
              onClick={() => setMainMenuOpen(!mainMenuOpen)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 mx-0 rounded-xl text-sm font-medium transition-all duration-150 text-slate-700 hover:text-blue-600 hover:bg-slate-50 ${collapsed ? 'justify-center' : ''}`}
            >
              <LayoutDashboard size={18} className="flex-shrink-0" />
              {(!collapsed || isMobile) && (
                <>
                  <span>User Menu</span>
                  <div className={`ml-auto transition-transform ${mainMenuOpen ? 'rotate-90' : ''}`}>
                    <ChevronRight size={14} className="text-slate-500" />
                  </div>
                </>
              )}
            </button>
            {mainMenuOpen && (!collapsed || isMobile) && (
              <div className="mt-1 ml-4 border-l border-gray-200 pl-2 space-y-1">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                      }`
                    }
                  >
                    <item.icon size={14} />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        ) : (
          NAV_ITEMS.map((item) =>
            isMobile ? (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={18}
                      className={`flex-shrink-0 ${
                        isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600'
                      }`}
                      style={isActive ? { color: 'var(--color-primary)' } : {}}
                    />
                    <span>{item.label}</span>
                    {isActive && <ChevronRight size={14} className="ml-auto text-blue-600" />}
                  </>
                )}
              </NavLink>
            ) : (
              <SidebarNavItem key={item.to} {...item} />
            )
          )
        )}
        
        {/* Admin Menu */}
        {isAdmin && (
          <div className="mt-4 px-2">
            {(!collapsed || isMobile) && (
              <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">
                Administration
              </p>
            )}
            <button
              onClick={() => setAdminMenuOpen(!adminMenuOpen)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 mx-0 rounded-xl text-sm font-medium transition-all duration-150 text-slate-700 hover:text-blue-600 hover:bg-slate-50 ${collapsed ? 'justify-center' : ''}`}
            >
              <Settings size={18} className="flex-shrink-0" />
              {(!collapsed || isMobile) && (
                <>
                  <span>Admin Panel</span>
                  <div className={`ml-auto transition-transform ${adminMenuOpen ? 'rotate-90' : ''}`}>
                    <ChevronRight size={14} className="text-slate-500" />
                  </div>
                </>
              )}
            </button>
            
            {/* Dropdown Items */}
            {adminMenuOpen && (!collapsed || isMobile) && (
              <div className="mt-1 ml-4 border-l border-gray-200 pl-2 space-y-1">
                <NavLink
                  to="/admin?tab=system"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive && location.search.includes('system') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                    }`
                  }
                >
                  <Activity size={14} /> System Monitoring
                </NavLink>
                <NavLink
                  to="/admin?tab=users"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive && location.search.includes('users') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                    }`
                  }
                >
                  <User size={14} /> Users Manage
                </NavLink>
                <NavLink
                  to="/admin?tab=settings"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive && location.search.includes('settings') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                    }`
                  }
                >
                  <Settings size={14} /> App Control
                </NavLink>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Bottom user info strip (desktop, only when expanded) */}
      {(!collapsed || isMobile) && (
        <div className="px-3 py-3 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 text-xs font-semibold truncate">{userName}</p>
              <p className="text-slate-500 text-xs truncate">{userEmail}</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed bottom: just avatar */}
      {collapsed && !isMobile && (
        <div className="py-3 border-t border-gray-100 flex justify-center flex-shrink-0 hover:bg-slate-50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
            {userInitial}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">

      {/* ── Desktop Sidebar ──────────────────────────────────────────────────── */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 shadow-[2px_0_20px_rgba(0,0,0,0.12)] sidebar-transition overflow-hidden ${
          collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'
        }`}
        style={{ backgroundColor: 'var(--color-sidebar)' }}
      >
        <SidebarContent isMobile={false} />
      </aside>

      {/* ── Mobile Sidebar Overlay ────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 shadow-2xl animate-slide-in-left flex flex-col"
            style={{ backgroundColor: 'var(--color-sidebar)' }}
          >
            {/* Close button for mobile */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
            <SidebarContent isMobile={true} />
          </aside>
        </div>
      )}

      {/* ── Main content area ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Top Navbar ───────────────────────────────────────────────────── */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3.5 flex items-center justify-between flex-shrink-0 z-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">

          {/* Left: mobile menu + page title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-[17px] font-bold text-gray-900 leading-tight">{pageTitle}</h1>
              <p className="text-[11px] text-gray-400 hidden sm:block mt-0.5">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Right: Ask AI + Bell + Avatar */}
          <div className="flex items-center gap-2">

            {isAdmin && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-bold border border-red-200 mr-2 shadow-sm">
                <Settings size={13} />
                <span>ADMIN</span>
              </div>
            )}
            
            {/* ── Ask AI pill button ─────────────────────────────────────── */}
            <Link
              to="/chat"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-semibold shadow-md hover:shadow-lg hover:brightness-110 transition-all duration-150"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <MessageSquare size={13} />
              <span>Ask AI</span>
            </Link>

            {/* ── Notification Bell ─────────────────────────────────────── */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => {
                  setNotifOpen((v) => !v);
                  setProfileOpen(false);
                }}
                className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-gray-100 z-50 animate-slide-down overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <span className="text-sm font-semibold text-gray-900">Notifications</span>
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1 text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      <CheckCheck size={13} />
                      Mark all read
                    </button>
                  </div>

                  {/* Notification items */}
                  <ul className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                    {notifications.map((n) => (
                      <li
                        key={n.id}
                        className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                          n.read ? 'bg-white' : 'bg-blue-50/40'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${n.iconBg}`}>
                          <n.icon size={14} className={n.iconColor} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold leading-tight ${n.read ? 'text-gray-600' : 'text-gray-900'}`}>
                            {n.title}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{n.body}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{n.time}</p>
                        </div>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                        )}
                      </li>
                    ))}
                  </ul>

                  {/* Footer */}
                  <div className="px-4 py-2.5 border-t border-gray-100 text-center">
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="text-xs font-medium hover:underline"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Profile / Avatar dropdown ────────────────────────────── */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => {
                  setProfileOpen((v) => !v);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 py-1 px-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {userInitial}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[13px] font-semibold text-gray-800 leading-tight">
                    {userName.split(' ')[0]}
                  </p>
                  <p className="text-[11px] text-gray-400 leading-tight">{userRole}</p>
                </div>
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] border border-gray-100 z-50 animate-slide-down overflow-hidden">
                  {/* User info */}
                  <div className="px-4 py-3.5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {userInitial}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                        <p className="text-[11px] text-gray-400 truncate">{userEmail}</p>
                      </div>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="py-1.5">
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User size={15} className="text-gray-400" />
                      My Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings size={15} className="text-gray-400" />
                      Settings
                    </Link>
                  </div>

                  {/* Sign out */}
                  <div className="border-t border-gray-100 py-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} className="text-red-400" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── Page Content ──────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto main-scroll p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

