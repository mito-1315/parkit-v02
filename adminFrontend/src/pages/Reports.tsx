import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReports } from '../api/sessions';
import { useAuthStore } from '../store/authStore';
import { EmptyState } from '../components/ui';

export const Reports: React.FC = () => {
  const { activeFacilityId } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['reports', activeFacilityId],
    queryFn: () => getReports(activeFacilityId),
    enabled: !!activeFacilityId,
  });

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
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, value }: { title: string; value: React.ReactNode }) => (
  <div className="rounded-lg border border-border-hairline bg-bg-surface p-4">
    <p className="text-xs uppercase tracking-wider text-text-muted">{title}</p>
    <p className="font-display text-3xl">{value}</p>
  </div>
);
