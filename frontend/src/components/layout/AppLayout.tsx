import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  Anchor, LayoutDashboard, TrendingUp, BarChart3, Ship, Compass,
  MapPin, FileText, ShoppingCart, Sliders, ShieldAlert, Sparkles,
  PieChart, FileDown, History, Settings, ChevronLeft, ChevronRight,
  LogOut, Bell, Shield, Zap, Menu, X, Package
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { AlertItem } from '../../types';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [showAlertsPopover, setShowAlertsPopover] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  // Live Date/Time in Indian Standard Time (IST)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }) + ' IST'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // Fetch active notifications
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const res = await apiClient.get('/alerts');
        setAlerts(res.data);
      } catch (e) {
        // Safe fallback
      }
    };
    loadAlerts();
  }, []);

  // Page titles and descriptions map
  const pageMeta: Record<string, { title: string; desc: string }> = {
    '/dashboard': {
      title: 'Executive Maritime Dashboard',
      desc: 'Operational cockpit & real-time freight forecasting for SAIL bulk cargo imports.',
    },
    '/forecast': {
      title: 'Freight Forecast Engine',
      desc: '90-day probabilistic quantile predictions and forward freight agreement benchmarks.',
    },
    '/decision-twin': {
      title: 'PortIN Decision Twin',
      desc: 'Multi-world scenario synthesis: Plan A (Best Overall), Plan B (Low Risk), Plan C (Low Cost).',
    },
    '/market': {
      title: 'Market Intelligence & Signals',
      desc: 'Commodity price indices, bunker fuel trends, and actionable chartering timing windows.',
    },
    '/vessel-optimizer': {
      title: 'Vessel Class Optimizer',
      desc: 'Handysize, Supramax, Panamax & Capesize parcel loading & draft compatibility matrix.',
    },
    '/port-intelligence': {
      title: 'East Coast Port Intelligence',
      desc: 'Berth restrictions, draft limits, and real-time open-meteo marine conditions.',
    },
    '/route-analysis': {
      title: 'Trade Lane & Route Analytics',
      desc: 'Ocean nautical distances, transit days, fuel consumption, and weather risk profiling.',
    },
    '/contract-optimizer': {
      title: 'Contract Strategy Intelligence',
      desc: 'Spot fixtures vs. short-term (3-voyage) and medium-term (6-voyage) COA comparisons.',
    },
    '/procurement': {
      title: 'Procurement Intelligence',
      desc: 'Comparative multi-origin sourcing from Australia, Indonesia, Mozambique, and Russia.',
    },
    '/scenario-lab': {
      title: 'Scenario Lab & Stress Testing',
      desc: 'Interactive What-If sensitivity sliders for freight, bunker, delays, and draft variance.',
    },
    '/risk-monitor': {
      title: 'Operational Risk Cockpit',
      desc: 'Composite risk score decomposition across volatility, demurrage, weather, and queue.',
    },
    '/ai-advisor': {
      title: 'PortIN Decision Advisor',
      desc: 'Natural language maritime decision support strictly grounded in physical port constraints.',
    },
    '/analytics': {
      title: 'Landed Cost & Performance Analytics',
      desc: 'Demurrage risk decomposition, port turnaround metrics, and model validation indices.',
    },
    '/reports': {
      title: 'Executive PDF Reports Center',
      desc: 'Generate, preview, and download institutional bulk cargo chartering briefs.',
    },
    '/history': {
      title: 'Decision History & Audit Trail',
      desc: 'Saved chartering decisions, historical scenarios, and parameter comparison.',
    },
    '/executive': {
      title: 'C-Suite 10-Second Cockpit',
      desc: 'High-level synthesis for Chairman & Commercial Directors.',
    },
    '/admin': {
      title: 'System Administration & Master Data',
      desc: 'Manage production cloud credentials, ML model retraining, and gazetted berth data.',
    },
    '/profile': {
      title: 'User Profile & Settings',
      desc: 'Security credentials, organization profile, and session management.',
    },
  };

  const currentMeta = pageMeta[location.pathname] || {
    title: 'PortIN Maritime Intelligence',
    desc: 'Intelligent freight forecasting & vessel chartering for East Coast India.',
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Freight Forecast', path: '/forecast', icon: TrendingUp },
    { label: 'Market Intelligence', path: '/market', icon: BarChart3 },
    { label: 'Vessel Optimizer', path: '/vessel-optimizer', icon: Ship },
    { label: 'Port Intelligence', path: '/port-intelligence', icon: MapPin },
    { label: 'Route Analysis', path: '/route-analysis', icon: Compass },
    { label: 'Contract Intelligence', path: '/contract-optimizer', icon: FileText },
    { label: 'Procurement Intelligence', path: '/procurement', icon: ShoppingCart },
    { label: 'Scenario Lab', path: '/scenario-lab', icon: Sliders },
    { label: 'Risk Monitor', path: '/risk-monitor', icon: ShieldAlert },
    { label: 'AI Advisor', path: '/ai-advisor', icon: Sparkles },
    { label: 'Analytics', path: '/analytics', icon: PieChart },
    { label: 'Reports', path: '/reports', icon: FileDown },
    { label: 'Decision History', path: '/history', icon: History },
  ];

  if (user?.role === 'admin') {
    navItems.push({ label: 'Admin Panel', path: '/admin', icon: Shield });
  }

  const unreadAlerts = alerts.filter((a) => !a.is_read).length;

  return (
    <div className="flex h-screen w-screen bg-[#F8F7F3] text-[#172033] overflow-hidden">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ========================================================================= */}
      {/* FIXED DEEP NAVY LEFT SIDEBAR (#102A4C) */}
      {/* ========================================================================= */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col transition-all duration-200 shrink-0 ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{
          backgroundColor: '#102A4C',
          borderRight: '1px solid rgba(228, 226, 220, 0.15)',
        }}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700/60">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden focus:outline-none group">
            <div
              className="p-2 rounded-lg shrink-0 transition-transform group-hover:scale-105"
              style={{
                backgroundColor: '#0F2747',
                border: '1px solid rgba(214, 166, 59, 0.4)',
              }}
            >
              <Anchor className="w-5 h-5 text-[#D6A63B]" />
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <span className="text-lg font-black tracking-tight text-white flex items-center gap-0.5">
                  Port<span style={{ color: '#D6A63B' }}>IN</span>
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#D6A63B] block font-semibold">
                  Intelligent Maritime Decisions
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 rounded-md text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all select-none ${
                  isActive
                    ? 'font-bold shadow-xs'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
                style={{
                  backgroundColor: isActive ? '#F3E3B7' : 'transparent',
                  color: isActive ? '#0F2747' : undefined,
                }}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className="w-4 h-4 shrink-0"
                  style={{ color: isActive ? '#0F2747' : '#94A3B8' }}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Active Scenario Panel (Near Bottom of Sidebar) */}
        {!collapsed && (
          <div className="mx-3 my-2 p-3 rounded-lg bg-[#0A1C33] border border-slate-700/50 text-xs text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#D6A63B] text-[10px] uppercase tracking-wider mb-1.5">
              <Package className="w-3.5 h-3.5" />
              <span>Active Scenario</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Cargo:</span>
              <span className="font-semibold text-white">Coking Coal</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Origin:</span>
              <span className="font-semibold text-white">Gladstone (AU)</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Port:</span>
              <span className="font-semibold text-white">Paradip (CQ-1)</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Parcel:</span>
              <span className="font-semibold text-[#F3E3B7]">70,000 MT</span>
            </div>
          </div>
        )}

        {/* User Profile Strip & Sign Out */}
        <div className="p-3 border-t border-slate-700/60 bg-[#0C223E]">
          <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{
                backgroundColor: '#D6A63B',
                color: '#0F2747',
              }}
            >
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {user?.full_name || 'Capt. R. Sharma'}
                </div>
                <div className="text-[10px] text-slate-400 truncate capitalize">
                  {user?.role?.replace('_', ' ') || 'Chartering Analyst'}
                </div>
              </div>
            )}
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-[#C64A3B] hover:bg-white/5 rounded-lg transition-colors ml-auto"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA WITH CLEAN WHITE/IVORY TOP HEADER */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Clean White/Ivory Top Header */}
        <header
          className="h-16 shrink-0 flex items-center justify-between px-6 z-30"
          style={{
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E4E2DC',
          }}
        >
          {/* LEFT: Page Title & Short Description */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-[#172033] hover:bg-[#F8F7F3]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-black text-[#0F2747] tracking-tight leading-tight">
                {currentMeta.title}
              </h1>
              <p className="text-xs text-[#68717D] hidden sm:block font-medium">
                {currentMeta.desc}
              </p>
            </div>
          </div>

          {/* RIGHT: Notifications, Date/Time, User Profile */}
          <div className="flex items-center gap-4">
            {/* Live IST Date/Time */}
            <div className="hidden lg:block text-xs font-semibold text-[#68717D] font-mono">
              {currentTime}
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowAlertsPopover(!showAlertsPopover)}
                className="relative p-2 rounded-lg text-[#172033] hover:bg-[#F8F7F3] border border-[#E4E2DC] transition-colors"
                title="Operational Alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadAlerts > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C64A3B]"></span>
                )}
              </button>

              {showAlertsPopover && (
                <div
                  className="absolute right-0 mt-2 w-80 rounded-xl shadow-2xl p-4 z-50 border animate-in fade-in duration-150"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E4E2DC',
                  }}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#E4E2DC] mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0F2747]">
                      Operational Alerts
                    </span>
                    <span className="text-[10px] text-[#68717D] font-semibold">{alerts.length} Total</span>
                  </div>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {alerts.map((a) => (
                      <div
                        key={a.id}
                        className="p-2.5 rounded-lg border text-xs"
                        style={{
                          backgroundColor: '#F8F7F3',
                          borderColor: '#E4E2DC',
                        }}
                      >
                        <div className="font-bold text-[#0F2747] flex items-center justify-between">
                          <span className="truncate">{a.title}</span>
                          <span
                            className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                              a.severity === 'warning'
                                ? 'text-[#D98A27] bg-[#FEF7EC]'
                                : a.severity === 'success'
                                ? 'text-[#2F7D4B] bg-[#F3FAF7]'
                                : 'text-[#0F2747] bg-[#F0F4F9]'
                            }`}
                          >
                            {a.severity}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#68717D] mt-1 leading-relaxed">{a.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Profile Link */}
            <Link
              to="/profile"
              className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-lg hover:bg-[#F8F7F3] border border-[#E4E2DC] transition-colors"
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: '#0F2747',
                  color: '#FFFFFF',
                }}
              >
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <span className="text-xs font-bold text-[#0F2747] hidden sm:block">
                {user?.full_name?.split(' ')[0] || 'Operator'}
              </span>
            </Link>
          </div>
        </header>

        {/* Scrollable Page Outlet Canvas */}
        <main
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"
          style={{ backgroundColor: '#F8F7F3' }}
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
