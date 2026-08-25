import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReports } from '../api/sessions';
import { useAuthStore } from '../store/authStore';
import { EmptyState } from '../components/ui';
<<<<<<< HEAD
import { Loader2, RefreshCw, TrendingUp, ArrowDownRight, ArrowUpRight, Clock, Activity } from 'lucide-react';

export const Reports: React.FC = () => {
  const { activeFacilityId } = useAuthStore();
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
=======

export const Reports: React.FC = () => {
  const { activeFacilityId } = useAuthStore();
  const { data, isLoading } = useQuery({
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
    queryKey: ['reports', activeFacilityId],
    queryFn: () => getReports(activeFacilityId),
    enabled: !!activeFacilityId,
  });

<<<<<<< HEAD
  if (!activeFacilityId) {
    return (
      <div className="space-y-6 font-sans">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#2E2E2E]">REPORTS &amp; ANALYTICS</h1>
          <p className="text-sm text-[#6E6E6E] mt-1">Daily operations snapshot and occupancy analytics derived from session history.</p>
        </div>
        <EmptyState
          title="Select a facility to view reports."
          hint="Use the facility selector in the top navigation bar to load performance metrics for that location."
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 font-sans space-y-3">
        <Loader2 className="animate-spin text-[#2E2E2E]" size={36} />
        <p className="text-sm font-semibold text-[#6E6E6E]">Calculating facility occupancy metrics…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6 font-sans">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#2E2E2E]">REPORTS &amp; ANALYTICS</h1>
          <p className="text-sm text-[#6E6E6E] mt-1">Daily operations snapshot and occupancy analytics derived from session history.</p>
        </div>
        <div className="clay-card p-8 text-center space-y-4">
          <p className="text-base font-bold text-[#2E2E2E]">Failed to load analytics report</p>
          <p className="text-xs text-[#6E6E6E]">There was an error communicating with the report service.</p>
          <button
            onClick={() => refetch()}
            className="clay-btn-primary px-5 py-2.5 text-xs font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6 font-sans">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#2E2E2E]">REPORTS &amp; ANALYTICS</h1>
          <p className="text-sm text-[#6E6E6E] mt-1">Daily operations snapshot and occupancy analytics derived from session history.</p>
        </div>
        <EmptyState title="No report data yet." hint="Completed sessions will populate this view once parking activity occurs." />
      </div>
    );
  }

  const occupancyList = Array.isArray(data.occupancyByDay) ? data.occupancyByDay : [];
  const max = Math.max(1, ...occupancyList.map((d: any) => Number(d.occupancyPct) || 0));

  const totalEntries = data.totalEntries ?? 0;
  const totalExits = data.totalExits ?? 0;
  const peakOccupancyPct = data.peakOccupancyPct ?? 0;
  const avgDurationMinutes = data.avgDurationMinutes ?? 0;
  const entriesLastHour = data.entriesLastHour ?? 0;
  const exitsLastHour = data.exitsLastHour ?? 0;
  const currentlyActive = data.currentlyActive ?? 0;
  const currentlyReserved = data.currentlyReserved ?? 0;
  const slotCounts = data.slotCounts ?? { total: 0, available: 0, occupied: 0, reserved: 0 };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#2E2E2E]">REPORTS &amp; ANALYTICS</h1>
          <p className="text-sm text-[#6E6E6E] mt-1">Daily operations snapshot and occupancy analytics derived from session history.</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="clay-btn-secondary px-4 py-2 text-xs font-semibold self-start sm:self-auto flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          {isFetching ? 'Refreshing…' : 'Refresh Metrics'}
        </button>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card
          title="Total Entries"
          value={totalEntries}
          subtitle={`+${entriesLastHour} in the last hour`}
          icon={<ArrowDownRight size={18} className="text-[#2E2E2E]" />}
        />
        <Card
          title="Total Exits"
          value={totalExits}
          subtitle={`+${exitsLastHour} in the last hour`}
          icon={<ArrowUpRight size={18} className="text-[#6E6E6E]" />}
        />
        <Card
          title="Peak Occupancy"
          value={`${peakOccupancyPct}%`}
          subtitle={`${currentlyActive} active / ${currentlyReserved} reserved`}
          icon={<TrendingUp size={18} className="text-[#2E2E2E]" />}
        />
        <Card
          title="Avg Duration"
          value={`${avgDurationMinutes} min`}
          subtitle="Completed sessions"
          icon={<Clock size={18} className="text-[#6E6E6E]" />}
        />
      </div>

      {/* 7-Day Occupancy Trend Chart */}
      <div className="clay-card p-6">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-[#2E2E2E]" />
            <h2 className="font-display text-base font-bold tracking-wide text-[#2E2E2E]">OCCUPANCY TREND — 7 DAYS</h2>
          </div>
          <span className="text-xs font-semibold text-[#6E6E6E]">Max: {max}%</span>
        </div>

        {occupancyList.length === 0 ? (
          <div className="text-center py-10 text-xs text-[#6E6E6E]">No daily trend data available yet.</div>
        ) : (
          <div className="flex h-56 items-end gap-3 sm:gap-6 px-2 pb-2">
            {occupancyList.map((d: any) => {
              const pct = Number(d.occupancyPct) || 0;
              const heightPct = Math.max(6, (pct / max) * 85);
              const dateStr = String(d.date || '').slice(5);

              return (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                  {/* Tooltip on hover */}
                  <div className="text-[11px] font-bold text-[#2E2E2E] bg-white px-2 py-0.5 rounded-md shadow-[2px_2px_6px_rgba(0,0,0,0.06)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {pct}%
                  </div>
                  {/* Visual Bar */}
                  <div
                    className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-[#2E2E2E] to-[#505050] shadow-[0_4px_15px_rgba(46,46,46,0.2)] transition-all duration-300 group-hover:scale-y-[1.05] group-hover:brightness-110 group-hover:shadow-[0_8px_20px_rgba(46,46,46,0.3)] origin-bottom"
                    style={{ height: `${heightPct}%` }}
                    title={`${d.date}: ${pct}% (${d.entries || 0} in, ${d.exits || 0} out)`}
                  />
                  {/* X-axis Date label */}
                  <span className="font-mono text-[11px] font-semibold text-[#6E6E6E] mt-1">{dateStr || '—'}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Daily Breakdown Table & Slot Distribution Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Daily Breakdown Table */}
        <div className="clay-card p-6 lg:col-span-2 space-y-4">
          <h2 className="font-display text-base font-bold tracking-wide text-[#2E2E2E] pb-2 border-b border-[#E5E7EB]">
            DAILY OPERATIONS LOG
          </h2>
          {occupancyList.length === 0 ? (
            <p className="text-xs text-[#6E6E6E] py-4">No daily logs recorded yet.</p>
          ) : (
            <div className="clay-table-container">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F8F9FA] text-xs font-semibold uppercase tracking-wider text-[#6E6E6E] border-b border-[#E5E7EB]">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Entries</th>
                    <th className="py-3 px-4">Exits</th>
                    <th className="py-3 px-4 text-right">Occupancy Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {occupancyList.map((d: any) => (
                    <tr key={d.date} className="hover:bg-[#F8F9FA] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#2E2E2E]">{d.date}</td>
                      <td className="py-3 px-4 text-[#2E2E2E] font-medium">{d.entries ?? 0}</td>
                      <td className="py-3 px-4 text-[#6E6E6E] font-medium">{d.exits ?? 0}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#2E2E2E]">
                        {d.occupancyPct ?? 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Real-time Capacity Distribution Card */}
        <div className="clay-card p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-base font-bold tracking-wide text-[#2E2E2E] pb-2 border-b border-[#E5E7EB]">
              CAPACITY BREAKDOWN
            </h2>
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between clay-inset p-3">
                <span className="text-xs font-semibold text-[#6E6E6E]">Total Facility Slots</span>
                <span className="font-mono text-base font-bold text-[#2E2E2E]">{slotCounts.total}</span>
              </div>
              <div className="flex items-center justify-between clay-inset p-3">
                <span className="text-xs font-semibold text-[#6E6E6E]">Available Slots</span>
                <span className="font-mono text-base font-bold text-[#2E2E2E]">{slotCounts.available}</span>
              </div>
              <div className="flex items-center justify-between clay-inset p-3">
                <span className="text-xs font-semibold text-[#6E6E6E]">Occupied Slots</span>
                <span className="font-mono text-base font-bold text-[#2E2E2E]">{slotCounts.occupied}</span>
              </div>
              <div className="flex items-center justify-between clay-inset p-3">
                <span className="text-xs font-semibold text-[#6E6E6E]">Reserved Slots</span>
                <span className="font-mono text-base font-bold text-[#6E6E6E]">{slotCounts.reserved}</span>
              </div>
            </div>
          </div>
          <div className="text-[11px] text-[#8C8C8C] text-center pt-2">
            Auto-refreshes when parking sessions update.
          </div>
=======
  if (!activeFacilityId) return <EmptyState title="Select a facility to view reports." />;
  if (isLoading) return <p className="text-text-muted">Calculating occupancy…</p>;
  if (!data) return <EmptyState title="No report data yet." hint="Completed sessions will populate this view." />;

  const max = Math.max(1, ...((data.occupancyByDay || []).map((d: any) => d.occupancyPct) as number[]));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl tracking-wide">REPORTS</h1>
        <p className="text-sm text-text-muted">Daily operations snapshot from session history.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card title="Total entries" value={data.totalEntries} />
        <Card title="Total exits" value={data.totalExits} />
        <Card title="Peak occupancy" value={`${data.peakOccupancyPct}%`} />
        <Card title="Avg duration" value={`${data.avgDurationMinutes} min`} />
      </div>
      <div className="rounded-lg border border-border-hairline bg-bg-surface p-4">
        <h2 className="mb-4 font-display tracking-wide">OCCUPANCY — 7 DAYS</h2>
        <div className="flex h-48 items-end gap-3">
          {(data.occupancyByDay || []).map((d: any) => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-accent-brand/70"
                style={{ height: `${Math.max(6, (d.occupancyPct / max) * 100)}%` }}
                title={`${d.occupancyPct}%`}
              />
              <span className="font-mono text-[10px] text-text-muted">{d.date.slice(5)}</span>
            </div>
          ))}
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
        </div>
      </div>
    </div>
  );
};

<<<<<<< HEAD
const Card = ({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
}) => (
  <div className="clay-card-sm p-5 flex flex-col justify-between">
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#6E6E6E]">{title}</p>
      {icon}
    </div>
    <div className="mt-3">
      <p className="font-display text-3xl font-bold text-[#2E2E2E] leading-none">{value}</p>
      {subtitle && <p className="text-[11px] font-medium text-[#6E6E6E] mt-1.5">{subtitle}</p>}
    </div>
=======
const Card = ({ title, value }: { title: string; value: React.ReactNode }) => (
  <div className="rounded-lg border border-border-hairline bg-bg-surface p-4">
    <p className="text-xs uppercase tracking-wider text-text-muted">{title}</p>
    <p className="font-display text-3xl">{value}</p>
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
  </div>
);
