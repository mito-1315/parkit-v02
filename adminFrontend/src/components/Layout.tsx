import React, { useEffect, useMemo, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Activity, Settings2, LogIn, Car, Bell, BarChart3, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getFacilities } from '../api/facilities';
import { useQuery } from '@tanstack/react-query';
import { facilityIdOf } from '../lib/ids';
import { DevPanel } from './DevPanel';
import { socketManager } from '../sockets/socketManager';

export const Layout: React.FC = () => {
  const { user, logout, token, activeFacilityId, setActiveFacility } = useAuthStore();
  const navigate = useNavigate();
  const [socketLive, setSocketLive] = useState(false);

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/monitoring', icon: <Activity size={18} />, label: 'Live Monitoring' },
    { to: '/configuration', icon: <Settings2 size={18} />, label: 'Configuration' },
    { to: '/entry-exit', icon: <LogIn size={18} />, label: 'Entry & Exit' },
    { to: '/vehicles', icon: <Car size={18} />, label: 'Vehicles' },
    { to: '/alerts', icon: <Bell size={18} />, label: 'Alerts' },
    { to: '/reports', icon: <BarChart3 size={18} />, label: 'Reports' },
  ];

  return (
    <div className="flex h-screen bg-bg-base text-text-primary">
      <aside className="flex w-56 shrink-0 flex-col border-r border-border-hairline bg-bg-surface">
        <div className="flex items-center gap-2 border-b border-border-hairline px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-accent-brand font-display text-lg text-white">
            P
          </div>
          <div>
            <p className="font-display text-lg leading-none tracking-wide">SMARTPARK</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-text-muted">Control room</p>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-accent-brand/15 font-medium text-accent-brand'
                    : 'text-text-muted hover:bg-bg-elevated hover:text-text-primary'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border-hairline p-3">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-elevated font-display text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm">{user?.name}</p>
              <p className="truncate font-mono text-[10px] text-text-muted">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-md px-3 py-1.5 text-xs text-signal-occupied hover:bg-signal-occupied/10"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-border-hairline bg-bg-surface px-4">
          <span className="font-display text-sm tracking-widest text-text-muted">OPERATOR CONSOLE</span>
          <div className="flex items-center gap-3">
            <span
              className={`flex items-center gap-1.5 rounded-full border border-border-hairline px-2.5 py-0.5 text-[11px] ${
                socketLive ? 'text-accent-brand' : 'text-text-muted'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full bg-current ${socketLive ? 'live-pulse' : ''}`} />
              {socketLive ? 'LIVE' : 'OFFLINE'}
            </span>
            <label className="text-xs text-text-muted">
              Facility
              <select
                value={activeFacilityId || ''}
                onChange={(e) => setActiveFacility(Number(e.target.value) || null)}
                className="ml-2 rounded border border-border-hairline bg-bg-elevated px-2 py-1 text-sm text-text-primary"
              >
                <option value="">Select…</option>
                {facilities?.map((f: any) => {
                  const id = facilityIdOf(f);
                  return (
                    <option key={id} value={id}>
                      {f.name}
                    </option>
                  );
                })}
              </select>
            </label>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4">
          <Outlet />
        </div>
      </main>
      <DevPanel />
    </div>
  );
};
