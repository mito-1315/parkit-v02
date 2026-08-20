import React, { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { confirmEntry, confirmExit, getActiveSessions, getReports } from '../api/sessions';
import { getGates } from '../api/gates';
import { useAuthStore } from '../store/authStore';
import { gateIdOf, sessionIdOf } from '../lib/ids';
import { EmptyState, StatusBadge } from '../components/ui';

export const EntryExit: React.FC = () => {
  const queryClient = useQueryClient();
  const { activeFacilityId } = useAuthStore();
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['sessions', 'active', activeFacilityId],
    queryFn: () => getActiveSessions(activeFacilityId),
  });
  const { data: reports } = useQuery({
    queryKey: ['reports', activeFacilityId],
    queryFn: () => getReports(activeFacilityId),
  });
  const { data: gates } = useQuery({ queryKey: ['gates'], queryFn: getGates });
  const exitGateId = gateIdOf(gates?.find((g: any) => (g.gate_type ?? g.type) === 'EXIT')) || gateIdOf(gates?.[0]) || 1;

  const entryMutation = useMutation({
    mutationFn: (id: number) => confirmEntry(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
  });
  const exitMutation = useMutation({
    mutationFn: (id: number) => confirmExit(id, exitGateId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
  });

  const reserved = useMemo(() => sessions?.filter((s: any) => s.status === 'RESERVED') || [], [sessions]);
  const active = useMemo(() => sessions?.filter((s: any) => s.status === 'ACTIVE') || [], [sessions]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl tracking-wide">ENTRY & EXIT</h1>
        <p className="text-sm text-text-muted">Manual confirmations when ANPR or occupancy detection misses a vehicle.</p>
      </div>
      <div className="flex gap-3 text-sm">
        <div className="rounded border border-border-hairline bg-bg-surface px-3 py-2">
          Entries last hour <span className="font-display text-xl text-signal-available">{reports?.entriesLastHour ?? 0}</span>
        </div>
        <div className="rounded border border-border-hairline bg-bg-surface px-3 py-2">
          Exits last hour <span className="font-display text-xl text-signal-reserved">{reports?.exitsLastHour ?? 0}</span>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border-hairline bg-bg-surface p-4">
          <h2 className="mb-3 font-display tracking-wide text-signal-reserved">RESERVED</h2>
          {isLoading ? (
            <p className="text-text-muted">Loading…</p>
          ) : !reserved.length ? (
            <EmptyState title="No pending entries." hint="Reserved sessions waiting at the barrier will show here." />
          ) : (
            reserved.map((session: any) => (
              <div key={sessionIdOf(session)} className="mb-2 flex items-center justify-between rounded border border-border-hairline bg-bg-elevated p-3">
                <div>
                  <p className="font-mono">{session.vehicle?.license_plate || `Vehicle #${session.vehicle_id}`}</p>
                  <p className="text-xs text-text-muted">Slot {session.slot?.slot_code ?? session.slot_id}</p>
                </div>
                <button
                  onClick={() => entryMutation.mutate(sessionIdOf(session)!)}
                  className="rounded bg-accent-brand px-3 py-1.5 text-xs text-white"
                >
                  Confirm Entry
                </button>
              </div>
            ))
          )}
        </section>
        <section className="rounded-lg border border-border-hairline bg-bg-surface p-4">
          <h2 className="mb-3 font-display tracking-wide text-signal-occupied">ACTIVE</h2>
          {!active.length ? (
            <EmptyState title="No vehicles currently parked." hint="Active sessions appear here until exit is confirmed." />
          ) : (
            active.map((session: any) => (
              <div key={sessionIdOf(session)} className="mb-2 flex items-center justify-between rounded border border-border-hairline bg-bg-elevated p-3">
                <div>
                  <p className="font-mono">{session.vehicle?.license_plate || `Vehicle #${session.vehicle_id}`}</p>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    Slot {session.slot?.slot_code ?? session.slot_id} <StatusBadge status="OCCUPIED" />
                  </div>
                </div>
                <button
                  onClick={() => exitMutation.mutate(sessionIdOf(session)!)}
                  className="rounded border border-signal-reserved/40 px-3 py-1.5 text-xs text-signal-reserved"
                >
                  Confirm Exit
                </button>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
};
