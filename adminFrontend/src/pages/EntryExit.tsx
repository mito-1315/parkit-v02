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
<<<<<<< HEAD
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#2E2E2E]">ENTRY & EXIT</h1>
        <p className="text-sm text-[#6E6E6E] mt-1">Manual confirmations when ANPR or occupancy detection misses a vehicle.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-lg">
        <div className="clay-card-sm p-4 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6E6E]">Entries Last Hour</span>
          <span className="font-display text-2xl font-bold text-[#2E2E2E]">{reports?.entriesLastHour ?? 0}</span>
        </div>
        <div className="clay-card-sm p-4 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6E6E]">Exits Last Hour</span>
          <span className="font-display text-2xl font-bold text-[#2E2E2E]">{reports?.exitsLastHour ?? 0}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Reserved Sessions */}
        <section className="clay-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#E5E7EB]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2E2E2E]" />
              <h2 className="font-display text-base font-bold tracking-wide text-[#2E2E2E]">RESERVED QUEUE</h2>
              <span className="text-xs text-[#6E6E6E] font-medium ml-auto">({reserved.length})</span>
            </div>
            {isLoading ? (
              <p className="text-sm text-[#6E6E6E] py-4">Loading sessions…</p>
            ) : !reserved.length ? (
              <EmptyState title="No pending entries." hint="Reserved sessions waiting at the barrier will show here." />
            ) : (
              <div className="space-y-3">
                {reserved.map((session: any) => (
                  <div
                    key={sessionIdOf(session)}
                    className="clay-inset p-4 flex items-center justify-between transition-all hover:bg-[#F2F4F7]"
                  >
                    <div>
                      <p className="font-mono text-base font-bold text-[#2E2E2E]">
                        {session.vehicle?.license_plate || `Vehicle #${session.vehicle_id}`}
                      </p>
                      <p className="text-xs font-semibold text-[#6E6E6E] mt-0.5">
                        Allocated Slot: {session.slot?.slot_code ?? session.slot_id}
                      </p>
                    </div>
                    <button
                      onClick={() => entryMutation.mutate(sessionIdOf(session)!)}
                      className="clay-btn-primary px-4 py-2 text-xs font-semibold"
                    >
                      Confirm Entry
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Active Sessions */}
        <section className="clay-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#E5E7EB]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#6E6E6E]" />
              <h2 className="font-display text-base font-bold tracking-wide text-[#2E2E2E]">ACTIVE PARKED</h2>
              <span className="text-xs text-[#6E6E6E] font-medium ml-auto">({active.length})</span>
            </div>
            {!active.length ? (
              <EmptyState title="No vehicles currently parked." hint="Active sessions appear here until exit is confirmed." />
            ) : (
              <div className="space-y-3">
                {active.map((session: any) => (
                  <div
                    key={sessionIdOf(session)}
                    className="clay-inset p-4 flex items-center justify-between transition-all hover:bg-[#F2F4F7]"
                  >
                    <div>
                      <p className="font-mono text-base font-bold text-[#2E2E2E]">
                        {session.vehicle?.license_plate || `Vehicle #${session.vehicle_id}`}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[#6E6E6E] mt-0.5">
                        <span>Slot {session.slot?.slot_code ?? session.slot_id}</span>
                        <StatusBadge status="OCCUPIED" />
                      </div>
                    </div>
                    <button
                      onClick={() => exitMutation.mutate(sessionIdOf(session)!)}
                      className="clay-btn-secondary px-4 py-2 text-xs font-semibold"
                    >
                      Confirm Exit
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
=======
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
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
        </section>
      </div>
    </div>
  );
};
