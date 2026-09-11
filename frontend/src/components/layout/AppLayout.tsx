import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, Ship, MapPin, Compass,
  FileText, ShoppingCart, Sliders, ShieldAlert, Sparkles,
  PieChart, FileDown, History, Settings, ChevronLeft, ChevronRight,
  LogOut, Bell, Shield, Menu, X, CheckCircle2, AlertTriangle, Plus,
  Layers, BarChart2, Anchor, Search, Lightbulb, Clock, CloudSun, CalendarCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { AlertItem } from '../../types';

interface NavGroup {
  groupName: string;
  items: {
    label: string;
    path: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    badge?: string | number;
  }[];
}

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

  // Live Date/Time in IST
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

  // Alerts
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

  const navGroups: NavGroup[] = [
    {
      groupName: 'MARKET',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'New Forecast', path: '/forecast', icon: TrendingUp },
        { label: 'Booking', path: '/booking', icon: CalendarCheck, badge: 3 },
      ],
    },
    {
      groupName: 'ANALYSIS',
      items: [
        { label: 'Comparison Plan', path: '/decision-twin', icon: BarChart2 },
        { label: 'Vessel Directory', path: '/vessel-optimizer', icon: Ship },
        { label: 'Route Analysis', path: '/route-analysis', icon: Compass },
        { label: 'Reports', path: '/reports', icon: FileDown },
      ],
    },
    {
      groupName: 'MONITORING',
      items: [
        { label: 'Ship Congestion Forecast', path: '/risk-monitor', icon: ShieldAlert, badge: 3 },
        { label: 'Weather Forecasting', path: '/weather-forecasting', icon: CloudSun },
        { label: 'AI Advisor', path: '/ai-advisor', icon: Sparkles },
        { label: 'History', path: '/history', icon: History },
      ],
    },
    {
      groupName: 'SYSTEM',
      items: [
        { label: 'Settings', path: '/profile', icon: Settings },
        ...(user?.role === 'admin'
          ? [{ label: 'Admin Panel', path: '/admin', icon: Shield }]
          : []),
      ],
    },
  ];

  const unreadAlerts = alerts.filter((a) => !a.is_read).length;

  return (
    <div className="flex h-screen w-screen bg-[#F8F7F3] text-[#172033] overflow-hidden font-sans">
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
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col transition-all duration-200 shrink-0 ${collapsed ? 'w-20' : 'w-64'
          } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{
          backgroundColor: '#102A4C',
          borderRight: '1px solid rgba(228, 226, 220, 0.15)',
        }}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700/60">
          <Link to="/dashboard" className="flex items-center gap-2.5 overflow-hidden focus:outline-none group">
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

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3">
          {navGroups.map((group) => (
            <div key={group.groupName} className="space-y-0.5">
              {!collapsed && (
                <div className="text-[9px] font-black uppercase tracking-wider text-slate-400 px-3 py-1">
                  {group.groupName}
                </div>
              )}
              {group.items.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path === '/forecast' && location.pathname === '/new-forecast');
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all select-none ${isActive
                        ? 'font-bold shadow-xs'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    style={{
                      backgroundColor: isActive ? '#F3E3B7' : 'transparent',
                      color: isActive ? '#0F2747' : undefined,
                    }}
                    title={collapsed ? item.label : undefined}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className="w-4 h-4 shrink-0"
                        style={{ color: isActive ? '#0F2747' : '#94A3B8' }}
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!collapsed && item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${isActive
                            ? 'bg-[#0F2747] text-[#F3E3B7]'
                            : 'bg-slate-800 text-slate-300'
                          }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Status Widget (Near Bottom) */}
        {!collapsed && (
          <div className="mx-3 my-2 p-2.5 rounded-lg bg-[#0A1C33] border border-slate-700/50 text-[11px] space-y-1">
            <div className="flex items-center gap-2 font-bold text-[#D6A63B] text-[10px] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>DECISION ENGINE ACTIVE</span>
            </div>
            <div className="text-[10px] text-slate-300 flex items-center justify-between">
              <span>140 corridors</span>
              <span className="text-[#F3E3B7] font-semibold">Econometric</span>
            </div>
          </div>
        )}

        {/* User Profile Bar */}
        <div className="p-3 border-t border-slate-700/60 bg-[#0C223E]">
          <div className={`flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{
                backgroundColor: location.pathname === '/forecast' ? '#0F2747' : '#D6A63B',
                color: location.pathname === '/forecast' ? '#FFFFFF' : '#0F2747',
              }}
            >
              {location.pathname === '/forecast' ? 'C' : location.pathname === '/risk-monitor' ? 'S' : (location.pathname === '/decision-twin' || location.pathname === '/weather-forecasting') ? 'H' : (user?.full_name?.charAt(0) || 'C')}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {location.pathname === '/forecast' ? 'Chief Executive Admin...' : location.pathname === '/risk-monitor' ? 'Senior Chartering Analyst' : (location.pathname === '/decision-twin' || location.pathname === '/weather-forecasting') ? 'Head of Bulk Cargo' : (user?.full_name || 'Capt. Samarth R.')}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  Logistics &amp; Chartering
                </div>
              </div>
            )}
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-[#C64A3B] hover:bg-white/5 rounded-lg transition-colors ml-auto cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT WITH CLEAN WHITE/IVORY TOP HEADER */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8F7F3]">
        <header
          className="h-16 shrink-0 flex items-center justify-between px-6 z-30"
          style={{
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E4E2DC',
          }}
        >
          {/* Mobile Menu & Page Title / Breadcrumb / Search */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 rounded-lg text-[#172033] hover:bg-[#F8F7F3] cursor-pointer"
            >
              <Menu className="w-5 h-5 text-[#0F2747]" />
            </button>

            {location.pathname === '/forecast' ? (
              <div className="relative hidden sm:block w-72 md:w-88">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search ports, vessels, routes..."
                  className="w-full pl-9 pr-3.5 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-medium text-[#0F2747] placeholder:text-slate-400 focus:outline-none focus:border-[#1E65B8]"
                />
              </div>
            ) : (
              <div>
                {location.pathname === '/risk-monitor' ? (
                  <div className="text-sm font-black text-[#0F2747] flex items-center gap-1.5 leading-tight">
                    <span className="text-[#68717D] font-medium">Corridor:</span>
                    <span>🇦🇺 Hay Point – 🇮🇳 Paradip Port</span>
                  </div>
                ) : (
                  <>
                    <div className="text-[11px] font-semibold text-[#68717D] flex items-center gap-1 leading-none">
                      <span>PortIN</span>
                      <span className="text-slate-400">&gt;</span>
                      <span className="text-[#0F2747] font-bold">
                        {location.pathname === '/route-analysis'
                          ? 'Route Analysis'
                          : location.pathname === '/decision-twin'
                            ? 'Comparison Plan'
                            : location.pathname === '/weather-forecasting'
                              ? 'Weather Forecasting'
                              : location.pathname === '/booking' || location.pathname === '/charter-operations'
                                ? 'Smart Booking'
                                : location.pathname === '/dashboard'
                                  ? 'Dashboard'
                                  : location.pathname.replace('/', '').replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    </div>
                    {location.pathname !== '/decision-twin' && location.pathname !== '/weather-forecasting' && (
                      <h1 className="text-base sm:text-lg font-black text-[#0F2747] tracking-tight leading-tight mt-0.5">
                        {location.pathname === '/dashboard' ? 'Maritime Logistics Intelligence' : 'PortIN Freight Cockpit'}
                      </h1>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {location.pathname === '/forecast' ? (
              <>
                {/* Demo Scenario Button */}
                <button
                  type="button"
                  className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FEF3C7] border border-[#FCD34D] text-[#92400E] text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Demo Scenario</span>
                </button>

                {/* Last Updated */}
                <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#64748B] font-medium mr-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Last Updated: 07 Sep 2026, 15:20</span>
                </div>

                {/* Notification Bell (Badge 4) */}
                <div className="relative">
                  <button
                    onClick={() => setShowAlertsPopover(!showAlertsPopover)}
                    className="relative p-2 rounded-lg text-[#172033] hover:bg-[#F8F7F3] border border-[#E4E2DC] transition-colors cursor-pointer"
                    title="Operational Alerts"
                  >
                    <Bell className="w-4 h-4 text-[#68717D]" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E05252] text-white text-[9px] font-black flex items-center justify-center">
                      4
                    </span>
                  </button>
                </div>

                {/* Chief Executive Admin User Badge */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white border border-[#E4E2DC] text-[#172033] hover:bg-[#F8F7F3] transition-colors"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                    style={{ backgroundColor: '#0F2747' }}
                  >
                    C
                  </div>
                  <div className="hidden lg:block text-left leading-tight">
                    <div className="text-xs font-bold text-[#172033] truncate max-w-[140px]">
                      Chief Executive Admin
                    </div>
                    <div className="text-[10px] text-[#68717D]">
                      Logistics Officer
                    </div>
                  </div>
                </Link>
              </>
            ) : location.pathname === '/risk-monitor' ? (
              <>
                <span className="hidden md:inline text-xs font-semibold text-[#68717D] mr-1">
                  06 Sept 2026, 21:00 IST
                </span>

                {/* NEW FORECAST Button (Amber/Orange) */}
                <Link
                  to="/forecast"
                  className="px-4 py-1.5 rounded-lg text-xs font-black text-white flex items-center gap-1.5 shadow-sm transition-all hover:opacity-95 cursor-pointer"
                  style={{ backgroundColor: '#E67E22' }}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>+ NEW FORECAST</span>
                </Link>

                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowAlertsPopover(!showAlertsPopover)}
                    className="relative p-2 rounded-lg text-[#172033] hover:bg-[#F8F7F3] border border-[#E4E2DC] transition-colors cursor-pointer"
                    title="Operational Alerts"
                  >
                    <Bell className="w-4 h-4 text-[#68717D]" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E05252] text-white text-[9px] font-black flex items-center justify-center">
                      3
                    </span>
                  </button>
                </div>

                {/* User Profile Badge (Orange 'S' Senior Chartering Analyst) */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white border border-[#E4E2DC] text-[#172033] hover:bg-[#F8F7F3] transition-colors"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                    style={{ backgroundColor: '#D6A63B' }}
                  >
                    S
                  </div>
                  <div className="hidden lg:block text-left leading-tight">
                    <div className="text-xs font-bold text-[#172033] truncate max-w-[140px]">
                      Senior Chartering Analyst
                    </div>
                    <div className="text-[10px] text-[#68717D]">
                      Logistics &amp; Chartering
                    </div>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="hidden sm:block px-3 py-1.5 rounded-lg text-xs font-bold border border-[#E4E2DC] bg-white text-[#0F2747] hover:bg-[#F8F7F3] transition-colors cursor-pointer"
                >
                  Overview
                </button>

                {/* NEW FORECAST Button */}
                <Link
                  to="/forecast"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-black text-white flex items-center gap-1.5 shadow-sm transition-all hover:opacity-95 cursor-pointer"
                  style={{ backgroundColor: '#1E65B8' }}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>+ NEW FORECAST</span>
                </Link>

                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowAlertsPopover(!showAlertsPopover)}
                    className="relative p-2 rounded-lg text-[#172033] hover:bg-[#F8F7F3] border border-[#E4E2DC] transition-colors cursor-pointer"
                    title="Operational Alerts"
                  >
                    <Bell className="w-4 h-4 text-[#68717D]" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E05252] text-white text-[9px] font-black flex items-center justify-center">
                      {location.pathname === '/weather-forecasting' ? 2 : 3}
                    </span>
                  </button>

                  {showAlertsPopover && (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-[#E4E2DC] shadow-2xl p-4 z-50 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between pb-2 border-b border-[#E4E2DC] mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#0F2747]">
                          Operational Alerts
                        </span>
                        <span className="text-[10px] text-[#68717D] font-semibold">{alerts.length} Total</span>
                      </div>
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {alerts.map((alert) => (
                          <div
                            key={alert.id}
                            className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E4E2DC] text-xs text-[#172033] space-y-1"
                          >
                            <div className="flex items-center justify-between font-bold text-[#0F2747]">
                              <span>{alert.title}</span>
                              <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
                                {alert.severity}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#68717D]">{alert.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Badge */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white border border-[#E4E2DC] text-[#172033] hover:bg-[#F8F7F3] transition-colors"
                >
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-black text-white shrink-0"
                    style={{ backgroundColor: '#0F2747' }}
                  >
                    {(location.pathname === '/decision-twin' || location.pathname === '/weather-forecasting') ? 'H' : (user?.full_name ? user.full_name.charAt(0) : 'E')}
                  </div>
                  <div className="hidden lg:block text-left leading-tight">
                    <div className="text-xs font-bold text-[#172033] truncate max-w-[130px]">
                      {(location.pathname === '/decision-twin' || location.pathname === '/weather-forecasting') ? 'Head of Bulk Cargo' : (user?.full_name || 'East Coast Traffic & ...')}
                    </div>
                    <div className="text-[10px] text-[#68717D]">
                      Logistics Officer
                    </div>
                  </div>
                </Link>

                {/* Log out Button */}
                <button
                  onClick={logout}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold border border-[#E4E2DC] bg-white text-[#68717D] hover:text-[#C64A3B] hover:bg-[#F8F7F3] transition-colors cursor-pointer"
                >
                  Log out
                </button>
              </>
            )}
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto bg-[#F8F7F3]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
