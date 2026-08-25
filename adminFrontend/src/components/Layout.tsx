import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Activity, Settings2, LogIn, Car, Bell, BarChart3, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getFacilities } from '../api/facilities';
import { useQuery } from '@tanstack/react-query';
import { facilityIdOf } from '../lib/ids';
import { DevPanel } from './DevPanel';
import { socketManager } from '../sockets/socketManager';
import ParkitLogo from '../assets/Parkit Logo.png';

export const Layout: React.FC = () => {
  const { user, logout, token, activeFacilityId, setActiveFacility } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [socketLive, setSocketLive] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: facilities } = useQuery({
    queryKey: ['facilities'],
    queryFn: getFacilities,
    enabled: !!user,
  });

  useEffect(() => {
    const socket = socketManager.getDashboardSocket();
    if (!socket) return;
    const on = () => setSocketLive(true);
    const off = () => setSocketLive(false);
    socket.on('connect', on);
    socket.on('disconnect', off);
    setSocketLive(socket.connected);
    return () => {
      socket.off('connect', on);
      socket.off('disconnect', off);
    };
  }, [token, activeFacilityId]);

  // Close sidebar on route change on smaller screens
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsExpanded(false);
    }
  }, [location.pathname]);

  // Handle ESC key to close expanded sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/monitoring', icon: <Activity size={20} />, label: 'Live Monitoring' },
    { to: '/configuration', icon: <Settings2 size={20} />, label: 'Configuration' },
    { to: '/entry-exit', icon: <LogIn size={20} />, label: 'Entry & Exit' },
    { to: '/vehicles', icon: <Car size={20} />, label: 'Vehicles' },
    { to: '/alerts', icon: <Bell size={20} />, label: 'Alerts' },
    { to: '/reports', icon: <BarChart3 size={20} />, label: 'Reports' },
  ];

  return (
    <div className="relative flex h-screen bg-[#F5F5F5] text-[#2E2E2E] p-3 gap-3 overflow-hidden font-sans select-none">
      {/* ── Background Backdrop Overlay (cinematic fade-in) ──────────────── */}
      {isExpanded && (
        <div
          onClick={() => setIsExpanded(false)}
          className="nav-backdrop-overlay fixed inset-0 z-30 cursor-pointer animate-in fade-in duration-300"
          aria-hidden="true"
        />
      )}

      {/* ── Floating Claymorphism Animated Sidebar ──────────────────────── */}
      <aside
        className={`clay-sidebar-container relative z-40 flex shrink-0 flex-col rounded-[28px] bg-white p-3.5 shadow-[12px_12px_24px_rgba(0,0,0,0.08),-12px_-12px_24px_rgba(255,255,255,0.95)] border border-white h-full ${
          isExpanded ? 'w-72' : 'w-[84px]'
        }`}
      >
        {/* Top Header: Logo + Morphing Menu Button */}
        <div className="flex items-center justify-between gap-2 mb-4 pb-2">
          {/* Logo Container */}
          <div
            className={`flex items-center gap-3 overflow-hidden transition-all duration-400 ${
              isExpanded ? 'px-2 py-1' : 'justify-center w-full'
            }`}
          >
            <div className="h-14 w-14 max-h-[60px] md:h-[90px] md:w-[90px] md:max-h-[90px] shrink-0 clay-logo-container p-2 md:p-3">
              <img src={ParkitLogo} alt="Parkit Logo" className="h-full w-full object-contain" />
            </div>
            {isExpanded && (
              <div className="min-w-0 animate-logo-reveal">
                <p className="font-display font-bold text-base leading-none tracking-wide text-[#2E2E2E]">PARKIT</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6E6E6E] mt-1">Control Room</p>
              </div>
            )}
          </div>

          {/* Morphing Hamburger / Close Trigger */}
          {isExpanded && (
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="morph-menu-btn shrink-0"
              title="Collapse Menu"
              aria-label="Collapse Navigation"
            >
              <span className="morph-line morph-line-top-open" />
              <span className="morph-line morph-line-middle-open" />
              <span className="morph-line morph-line-bottom-open" />
            </button>
          )}
        </div>

        {/* Compact Toggle Button (visible only when collapsed) */}
        {!isExpanded && (
          <div className="flex justify-center mb-3">
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="morph-menu-btn"
              title="Expand Menu"
              aria-label="Expand Navigation"
            >
              <span className="morph-line" />
              <span className="morph-line" />
              <span className="morph-line" />
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden py-1 pr-0.5">
          {navItems.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={!isExpanded ? item.label : undefined}
              style={{
                animationDelay: isExpanded ? `${index * 60}ms` : '0ms',
              }}
              className={({ isActive }) =>
                `group relative flex items-center rounded-2xl py-3 text-sm font-medium transition-all duration-300 ${
                  isExpanded ? 'px-4 gap-3.5 animate-nav-item' : 'justify-center px-0'
                } ${
                  isActive
                    ? 'bg-[#2E2E2E] text-white shadow-[6px_6px_14px_rgba(46,46,46,0.22)] font-semibold'
                    : 'text-[#6E6E6E] hover:text-[#2E2E2E] hover:bg-[#F8F9FA] hover:shadow-[3px_3px_8px_rgba(0,0,0,0.03)] hover:translate-x-0.5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-white' : ''}`}>
                    {item.icon}
                  </span>
                  {isExpanded && (
                    <span className="truncate tracking-wide text-sm">
                      {item.label}
                    </span>
                  )}
                  {/* Subtle active pill indicator on compact view */}
                  {!isExpanded && isActive && (
                    <span className="absolute right-1 h-1.5 w-1.5 rounded-full bg-white shadow-sm" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile & Logout Controls */}
        <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
          {isExpanded ? (
            <div
              className="space-y-3 animate-nav-item"
              style={{ animationDelay: '360ms' }}
            >
              <div className="flex items-center gap-3 px-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2E2E2E] font-display font-semibold text-sm text-white shadow-[2px_2px_6px_rgba(46,46,46,0.2)]">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#2E2E2E]">{user?.name || 'Administrator'}</p>
                  <p className="truncate font-mono text-[11px] text-[#6E6E6E]">{user?.role || 'FACILITY_ADMIN'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#FDFDFD] px-3 py-2.5 text-xs font-semibold text-[#6E6E6E] shadow-[2px_2px_6px_rgba(0,0,0,0.03)] transition-all hover:bg-[#2E2E2E] hover:text-white hover:border-[#2E2E2E] cursor-pointer"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2E2E2E] font-display font-semibold text-sm text-white shadow-[2px_2px_6px_rgba(46,46,46,0.2)] cursor-pointer"
                title={`${user?.name || 'Administrator'} (${user?.role || 'FACILITY_ADMIN'})`}
                onClick={() => setIsExpanded(true)}
              >
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <button
                onClick={handleLogout}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#6E6E6E] hover:text-[#2E2E2E] hover:bg-[#F8F9FA] transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Content Viewport (Subtle depth compression when expanded) ── */}
      <main
        className={`main-content-viewport flex min-w-0 flex-1 flex-col overflow-hidden ${
          isExpanded ? 'main-content-compressed' : ''
        }`}
      >
        {/* Floating Top Navbar */}
        <header className="mb-3 flex h-14 shrink-0 items-center justify-between rounded-[24px] bg-white/90 backdrop-blur-md px-4 sm:px-6 shadow-[8px_8px_20px_rgba(0,0,0,0.04),-8px_-8px_20px_rgba(255,255,255,0.95)] border border-white">
          <div className="flex items-center gap-3">
            <span className="font-display text-xs sm:text-sm font-semibold tracking-wider text-[#6E6E6E]">
              OPERATOR CONSOLE
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live Socket Status */}
            <span
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-wider ${
                socketLive
                  ? 'border-[#E5E7EB] bg-white text-[#2E2E2E] shadow-[2px_2px_6px_rgba(0,0,0,0.04)]'
                  : 'border-[#E5E7EB] bg-[#F5F5F5] text-[#8C8C8C]'
              }`}
            >
              <span className={`h-2 w-2 rounded-full bg-[#2E2E2E] ${socketLive ? 'live-pulse' : 'opacity-40'}`} />
              <span className="hidden sm:inline">{socketLive ? 'LIVE' : 'OFFLINE'}</span>
            </span>

            {/* Facility Selector */}
            <div className="flex items-center gap-2 text-xs font-medium text-[#6E6E6E]">
              <span className="hidden md:inline">Facility</span>
              <select
                value={activeFacilityId || ''}
                onChange={(e) => setActiveFacility(Number(e.target.value) || null)}
                className="clay-input px-3 py-1.5 text-xs font-medium text-[#2E2E2E] cursor-pointer max-w-[150px] sm:max-w-[200px]"
              >
                <option value="">Select facility…</option>
                {facilities?.map((f: any) => {
                  const id = facilityIdOf(f);
                  return (
                    <option key={id} value={id}>
                      {f.name}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </header>

        {/* Scrollable Page Outlet */}
        <div className="flex-1 overflow-auto rounded-[28px] bg-transparent p-1">
          <Outlet />
        </div>
      </main>

      <DevPanel />
    </div>
  );
};
