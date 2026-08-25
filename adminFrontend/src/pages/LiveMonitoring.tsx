import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { getZones, getFacilitySlots } from '../api/facilities';
import { getSlots } from '../api/slots';
import { getDetections } from '../api/sessions';
import { useSlotStatusEvents, useAlertEvents } from '../hooks/useSocketEvents';
import { Loader2 } from 'lucide-react';
import { slotCodeOf, slotIdOf, slotSignalClass, zoneIdOf } from '../lib/ids';
import { EmptyState, StatusBadge } from '../components/ui';

const ZoneGrid = ({
  zoneId,
  zoneName,
  slots: providedSlots,
  onSelect,
  pulsingId,
}: {
  zoneId: number;
  zoneName: string;
  slots?: any[];
  onSelect: (slot: any) => void;
  pulsingId?: number;
}) => {
  const { data: fetched, isLoading } = useQuery({
    queryKey: ['zones', zoneId, 'slots'],
    queryFn: () => getSlots(zoneId),
    enabled: !providedSlots,
  });
  const slots = providedSlots ?? fetched;

  if (!providedSlots && isLoading) {
    return (
<<<<<<< HEAD
      <div className="flex justify-center p-6">
        <Loader2 className="animate-spin text-[#2E2E2E]" />
=======
      <div className="flex justify-center p-4">
        <Loader2 className="animate-spin text-accent-brand" />
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="clay-card p-6">
      <h3 className="mb-4 font-display text-lg font-bold tracking-tight text-[#2E2E2E]">{zoneName}</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
=======
    <div className="rounded-lg border border-border-hairline bg-bg-surface p-4">
      <h3 className="mb-3 font-display text-lg tracking-wide text-text-primary">{zoneName}</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
        {slots?.map((slot: any) => {
          const id = slotIdOf(slot);
          const code = slotCodeOf(slot);
          return (
            <button
              key={id ?? code}
              type="button"
              onClick={() => onSelect(slot)}
<<<<<<< HEAD
              className={`flex flex-col items-center justify-center rounded-2xl p-3 transition-all duration-200 cursor-pointer ${slotSignalClass(slot.status)} ${
                pulsingId === id ? 'slot-pulse scale-105' : 'hover:scale-[1.03] active:scale-95'
              }`}
            >
              <span className="font-mono text-sm font-bold tracking-tight">{code}</span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider opacity-85">{slot.status}</span>
=======
              className={`flex flex-col items-center justify-center rounded-md border px-2 py-3 transition-colors ${slotSignalClass(slot.status)} ${
                pulsingId === id ? 'slot-pulse' : ''
              }`}
            >
              <span className="font-mono text-sm font-semibold">{code}</span>
              <span className="mt-0.5 text-[10px] uppercase tracking-wide opacity-80">{slot.status}</span>
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
            </button>
          );
        })}
        {slots?.length === 0 && (
<<<<<<< HEAD
          <div className="text-[#6E6E6E] col-span-full text-sm italic py-2">No slots configured in this zone.</div>
=======
          <div className="text-text-muted col-span-full text-sm">No slots configured in this zone.</div>
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
        )}
      </div>
    </div>
  );
};

export const LiveMonitoring: React.FC = () => {
  const { activeFacilityId } = useAuthStore();
  const [zoneFilter, setZoneFilter] = useState<number | 'all'>('all');
  const [selected, setSelected] = useState<any>(null);
  const [pulseId, setPulseId] = useState<number | undefined>();

  useSlotStatusEvents(activeFacilityId);
  useAlertEvents(activeFacilityId);

  const { data: zones, isLoading } = useQuery({
    queryKey: ['facilities', activeFacilityId, 'zones'],
    queryFn: () => getZones(activeFacilityId!),
    enabled: !!activeFacilityId,
  });

  const { data: facilitySlots } = useQuery({
    queryKey: ['facilities', activeFacilityId, 'slots'],
    queryFn: () => getFacilitySlots(activeFacilityId!),
    enabled: !!activeFacilityId,
    retry: false,
  });

  const { data: detections } = useQuery({
    queryKey: ['detections'],
    queryFn: getDetections,
    retry: false,
  });

  const counts = useMemo(() => {
    const list = facilitySlots || [];
    return {
      total: list.length,
      available: list.filter((s: any) => s.status === 'AVAILABLE').length,
      occupied: list.filter((s: any) => s.status === 'OCCUPIED').length,
      reserved: list.filter((s: any) => s.status === 'RESERVED').length,
      unavailable: list.filter((s: any) => !['AVAILABLE', 'OCCUPIED', 'RESERVED'].includes(s.status)).length,
    };
  }, [facilitySlots]);

  const visibleZones = useMemo(() => {
    const all = zones || [];
    if (zoneFilter === 'all') return all;
    return all.filter((z: any) => zoneIdOf(z) === zoneFilter);
  }, [zones, zoneFilter]);

  const selectSlot = (slot: any) => {
    setSelected(slot);
    const id = slotIdOf(slot);
    setPulseId(id);
    window.setTimeout(() => setPulseId(undefined), 220);
  };

  if (!activeFacilityId) {
    return (
      <EmptyState title="Select a facility" hint="Use the facility selector in the top bar to open live monitoring." />
    );
  }

  const session = selected?.parking_sessions?.[0];
  const cameras = selected?.primary_camera ? [selected.primary_camera] : [];

  return (
<<<<<<< HEAD
    <div className="space-y-5 font-sans">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#2E2E2E]">LIVE MONITORING</h1>
        <p className="text-sm text-[#6E6E6E] mt-1">Real-time facility layout and slot occupancy status.</p>
      </div>

      {facilitySlots && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            ['Total Slots', counts.total, 'text-[#2E2E2E]'],
            ['Available', counts.available, 'text-[#2E2E2E]'],
            ['Occupied', counts.occupied, 'text-[#3A3A3A]'],
            ['Reserved', counts.reserved, 'text-[#6E6E6E]'],
            ['Unavailable', counts.unavailable, 'text-[#8C8C8C]'],
          ].map(([label, value, color]) => (
            <div key={String(label)} className="clay-card-sm p-4 flex flex-col justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6E6E6E]">{label}</p>
              <p className={`font-display text-3xl font-bold leading-none mt-2 ${color}`}>{value}</p>
=======
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl tracking-wide">LIVE MONITORING</h1>
        <p className="text-sm text-text-muted">Slot occupancy mapped by zone — LED status colors only.</p>
      </div>

      {facilitySlots && (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          {[
            ['Total', counts.total, 'text-text-primary'],
            ['Available', counts.available, 'text-signal-available'],
            ['Occupied', counts.occupied, 'text-signal-occupied'],
            ['Reserved', counts.reserved, 'text-signal-reserved'],
            ['Unavailable', counts.unavailable, 'text-signal-offline'],
          ].map(([label, value, color]) => (
            <div key={String(label)} className="rounded-lg border border-border-hairline bg-bg-surface px-3 py-2">
              <p className="text-[11px] uppercase tracking-wider text-text-muted">{label}</p>
              <p className={`font-display text-3xl leading-none ${color}`}>{value}</p>
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
            </div>
          ))}
        </div>
      )}

<<<<<<< HEAD
      {/* Zone filter pills */}
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={() => setZoneFilter('all')}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
            zoneFilter === 'all'
              ? 'bg-[#2E2E2E] text-white shadow-[4px_4px_10px_rgba(46,46,46,0.22)]'
              : 'clay-btn-secondary'
          }`}
        >
          All Zones
=======
      <div className="flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setZoneFilter('all')}
          className={`rounded px-3 py-1 text-xs ${zoneFilter === 'all' ? 'bg-accent-brand text-white' : 'bg-bg-elevated text-text-muted'}`}
        >
          All zones
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
        </button>
        {zones?.map((z: any) => {
          const id = zoneIdOf(z)!;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setZoneFilter(id)}
<<<<<<< HEAD
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                zoneFilter === id
                  ? 'bg-[#2E2E2E] text-white shadow-[4px_4px_10px_rgba(46,46,46,0.22)]'
                  : 'clay-btn-secondary'
              }`}
=======
              className={`rounded px-3 py-1 text-xs ${zoneFilter === id ? 'bg-accent-brand text-white' : 'bg-bg-elevated text-text-muted'}`}
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
            >
              {z.name}
            </button>
          );
        })}
      </div>

      {isLoading ? (
<<<<<<< HEAD
        <div className="flex justify-center p-16">
          <Loader2 className="h-9 w-9 animate-spin text-[#2E2E2E]" />
=======
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent-brand" />
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
        </div>
      ) : zones?.length === 0 ? (
        <EmptyState title="No zones configured for this facility." hint="Create zones under Configuration." />
      ) : (
<<<<<<< HEAD
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          {/* Main Zone Maps */}
          <div className="grid gap-5">
=======
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="grid gap-4">
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
            {visibleZones?.map((zone: any) => {
              const zid = zoneIdOf(zone)!;
              const zoneSlots = facilitySlots?.filter((s: any) => s.zone_id === zid);
              return (
                <ZoneGrid
                  key={zid}
                  zoneId={zid}
                  zoneName={zone.name}
                  slots={zoneSlots}
                  onSelect={selectSlot}
                  pulsingId={pulseId}
                />
              );
            })}
          </div>

<<<<<<< HEAD
          {/* Right Sidebar Panels */}
          <aside className="space-y-4">
            {/* Slot Detail Card */}
            <div className="clay-card-sm p-5">
              <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-[#2E2E2E]">SLOT DETAIL</h3>
              {!selected ? (
                <p className="text-xs text-[#6E6E6E] py-2">Click a slot on the map to inspect.</p>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-xl font-bold text-[#2E2E2E]">{slotCodeOf(selected)}</p>
                    <StatusBadge status={selected.status} />
                  </div>
                  <p className="text-[11px] text-[#6E6E6E]">
                    Updated {selected.last_status_updated_at ? new Date(selected.last_status_updated_at).toLocaleTimeString() : '—'}
                  </p>
                  {session ? (
                    <div className="clay-inset p-3 font-mono text-xs text-[#2E2E2E]">
                      <p className="font-bold">{session.vehicle?.license_plate ?? `Vehicle #${session.vehicle_id}`}</p>
                      <p className="text-[#6E6E6E] text-[11px] mt-1">
=======
          <aside className="space-y-3">
            <div className="rounded-lg border border-border-hairline bg-bg-surface p-3">
              <h3 className="mb-2 font-display text-sm tracking-wide">SLOT DETAIL</h3>
              {!selected ? (
                <p className="text-xs text-text-muted">Click a slot on the map.</p>
              ) : (
                <div className="space-y-2 text-sm">
                  <p className="font-mono text-lg">{slotCodeOf(selected)}</p>
                  <StatusBadge status={selected.status} />
                  <p className="text-xs text-text-muted">
                    Updated {selected.last_status_updated_at ? new Date(selected.last_status_updated_at).toLocaleTimeString() : '—'}
                  </p>
                  {session ? (
                    <div className="rounded border border-border-hairline bg-bg-elevated p-2 font-mono text-xs">
                      <p>{session.vehicle?.license_plate ?? `Vehicle #${session.vehicle_id}`}</p>
                      <p className="text-text-muted">
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
                        {session.entry_time ? new Date(session.entry_time).toLocaleString() : 'Awaiting entry'}
                      </p>
                    </div>
                  ) : (
<<<<<<< HEAD
                    <p className="text-xs text-[#6E6E6E]">No active session on this slot.</p>
                  )}
                  <p className="text-xs text-[#6E6E6E]">
                    Cameras:{' '}
                    <span className="text-[#2E2E2E] font-medium">
                      {cameras.length
                        ? cameras.map((c: any) => c.name || `#${c.camera_id}`).join(', ')
                        : 'none assigned'}
                    </span>
=======
                    <p className="text-xs text-text-muted">No active session on this slot.</p>
                  )}
                  <p className="text-xs text-text-muted">
                    Cameras:{' '}
                    {cameras.length
                      ? cameras.map((c: any) => c.name || `#${c.camera_id}`).join(', ')
                      : 'none assigned'}
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
                  </p>
                </div>
              )}
            </div>

<<<<<<< HEAD
            {/* Live Feed Card */}
            <div className="clay-card-sm p-5">
              <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wider text-[#2E2E2E]">LIVE FEED</h3>
              <div className="space-y-2">
                {(detections || []).slice(0, 5).map((d: any) => (
                  <div key={d.detection_id} className="clay-inset p-2.5 font-mono text-[11px] text-[#3A3A3A]">
                    {d.detection_type === 'VEHICLE_PLATE'
                      ? `Gate ${d.gate_id ?? '—'} → plate ${d.license_plate_detected ?? '—'} detected`
                      : `Slot ${d.slot?.slot_code ?? d.slot_id} → ${d.detected_status}`}
                  </div>
                ))}
                {(!detections || detections.length === 0) && (
                  <p className="text-xs text-[#6E6E6E] py-2">No recent detections on this feed.</p>
=======
            <div className="rounded-lg border border-border-hairline bg-bg-surface p-3">
              <h3 className="mb-2 font-display text-sm tracking-wide">LIVE FEED</h3>
              <div className="space-y-1.5">
                {(detections || []).slice(0, 5).map((d: any) => (
                  <p key={d.detection_id} className="font-mono text-[11px] text-text-muted">
                    {d.detection_type === 'VEHICLE_PLATE'
                      ? `Gate ${d.gate_id ?? '—'} → plate ${d.license_plate_detected ?? '—'} detected`
                      : `Slot ${d.slot?.slot_code ?? d.slot_id} → ${d.detected_status}`}
                  </p>
                ))}
                {(!detections || detections.length === 0) && (
                  <p className="text-xs text-text-muted">No recent detections on this feed.</p>
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
