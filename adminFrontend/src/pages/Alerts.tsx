import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getAlerts, resolveAlert } from '../api/alerts';
import { useAlertEvents } from '../hooks/useSocketEvents';
import { useAuthStore } from '../store/authStore';
import { alertIdOf, alertMessageOf, alertTypeOf, isAlertResolved } from '../lib/ids';
import { EmptyState, StatusBadge } from '../components/ui';

const TYPES = [
  'PARKING_FULL',
  'CAMERA_OFFLINE',
  'SLOT_CONFLICT',
  'LOW_CONFIDENCE_DETECTION',
  'UNAUTHORIZED_SLOT_OCCUPANCY',
  'ENTRANCE_CONGESTION',
];

export const Alerts: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeFacilityId } = useAuthStore();
  const [severity, setSeverity] = useState('');
  const [type, setType] = useState('');
  const [resolved, setResolved] = useState<'all' | 'open' | 'resolved'>('open');
  const [toast, setToast] = useState<string | null>(null);

  useAlertEvents(activeFacilityId);

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts', activeFacilityId, severity, type],
    queryFn: () =>
      getAlerts({
        facility_id: activeFacilityId || undefined,
        severity: severity || undefined,
        alert_type: type || undefined,
      }),
    enabled: !!activeFacilityId,
  });

  useEffect(() => {
    const onNew = (alert: any) => {
      setToast(alertMessageOf(alert) || 'New alert');
      const t = window.setTimeout(() => setToast(null), 4000);
      return () => window.clearTimeout(t);
    };
    // fallback timer toast if sockets are quiet
    const timer = window.setInterval(() => {
      const open = (alerts || []).filter((a: any) => !isAlertResolved(a));
      if (open[0]) setToast(`Shift reminder: ${alertTypeOf(open[0]).replaceAll('_', ' ')} still open`);
    }, 45000);
    return () => window.clearInterval(timer);
  }, [alerts]);

  const resolveMutation = useMutation({
    mutationFn: (id: number) => resolveAlert(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
  });

  const filtered = (alerts || []).filter((a: any) => {
    if (resolved === 'open' && isAlertResolved(a)) return false;
    if (resolved === 'resolved' && !isAlertResolved(a)) return false;
    return true;
  });

  if (!activeFacilityId) return <EmptyState title="Select a facility to view alerts." />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl tracking-wide">ALERTS</h1>
        <p className="text-sm text-text-muted">Severity-coded queue for the current shift.</p>
      </div>
      {toast && (
        <div className="rounded border border-signal-reserved/40 bg-signal-reserved/10 px-3 py-2 text-sm text-signal-reserved">
          {toast}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="rounded border border-border-hairline bg-bg-elevated px-2 py-1.5 text-sm">
          <option value="">All severities</option>
          <option>INFO</option>
          <option>WARNING</option>
          <option>CRITICAL</option>
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded border border-border-hairline bg-bg-elevated px-2 py-1.5 text-sm">
          <option value="">All types</option>
          {TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select value={resolved} onChange={(e) => setResolved(e.target.value as any)} className="rounded border border-border-hairline bg-bg-elevated px-2 py-1.5 text-sm">
          <option value="open">Unresolved</option>
          <option value="resolved">Resolved</option>
          <option value="all">All</option>
        </select>
      </div>
      {isLoading ? (
        <p className="text-text-muted">Loading alerts…</p>
      ) : !filtered.length ? (
        <EmptyState title="No alerts match these filters." hint="Clear filters or wait for the next camera/session event." />
      ) : (
        <div className="space-y-2">
          {filtered.map((alert: any) => (
            <div key={alertIdOf(alert)} className="flex items-start justify-between rounded-lg border border-border-hairline bg-bg-surface p-3">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <StatusBadge status={alert.severity} />
                  <span className="font-mono text-xs">{alertTypeOf(alert)}</span>
                </div>
                <p className="text-sm">{alertMessageOf(alert)}</p>
                <p className="mt-1 font-mono text-[11px] text-text-muted">{new Date(alert.created_at).toLocaleString()}</p>
              </div>
              {!isAlertResolved(alert) && (
                <button
                  onClick={() => resolveMutation.mutate(alertIdOf(alert)!)}
                  className="rounded bg-signal-available/15 px-3 py-1.5 text-xs text-signal-available"
                >
                  Resolve
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
