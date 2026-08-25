import React, { useMemo, useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { useAuthStore } from '../store/authStore';
import {
  createFacility,
  createZone,
  deleteFacility,
  deleteZone,
  getFacilities,
  getFacility,
  getZones,
  updateFacility,
  updateZone,
} from '../api/facilities';
import { createSlot, deleteSlot, generateSlots, getSlots } from '../api/slots';
import { createCamera, deleteCamera, getCameras, updateCamera } from '../api/cameras';
import { createGate, deleteGate, getGates, regenerateGateQr } from '../api/gates';
import {
  facilityIdOf,
  gateIdOf,
  gateTypeOf,
  slotCodeOf,
  slotIdOf,
  zoneIdOf,
} from '../lib/ids';
<<<<<<< HEAD
import { EmptyState, StatusBadge } from '../components/ui';
import { useConfirm } from '../hooks/useConfirm';
=======
import { EmptyState, StatusBadge, useConfirm } from '../components/ui';
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
import { realignSlotZones } from '../api/onboarding';

const TABS = ['Facility', 'Zones', 'Slots', 'Cameras', 'Gates'] as const;
type Tab = (typeof TABS)[number];

export const Configuration: React.FC = () => {
  const [tab, setTab] = useState<Tab>('Facility');
  const { activeFacilityId } = useAuthStore();
  return (
<<<<<<< HEAD
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#2E2E2E]">CONFIGURATION</h1>
        <p className="text-sm text-[#6E6E6E] mt-1">Facility profile, zones, slots, cameras, and gate setups.</p>
      </div>

      {/* Clay Tabs */}
      <div className="flex flex-wrap gap-2 pb-2">
=======
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl tracking-wide">CONFIGURATION</h1>
        <p className="text-sm text-text-muted">Facility profile, zones, slots, cameras, and gates.</p>
      </div>
      <div className="flex flex-wrap gap-1 border-b border-border-hairline pb-2">
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
<<<<<<< HEAD
            className={`rounded-full px-5 py-2 text-xs font-semibold transition-all duration-200 cursor-pointer ${
              tab === t
                ? 'bg-[#2E2E2E] text-white shadow-[4px_4px_12px_rgba(46,46,46,0.22)]'
                : 'clay-btn-secondary'
            }`}
=======
            className={`rounded px-3 py-1.5 text-sm ${tab === t ? 'bg-accent-brand text-white' : 'text-text-muted hover:bg-bg-elevated'}`}
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
          >
            {t}
          </button>
        ))}
      </div>
<<<<<<< HEAD

=======
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
      {tab === 'Facility' && <FacilityPanel />}
      {tab === 'Zones' && <ZonesPanel />}
      {tab === 'Slots' && <SlotsPanel facilityId={activeFacilityId} />}
      {tab === 'Cameras' && <CamerasPanel facilityId={activeFacilityId} />}
      {tab === 'Gates' && <GatesPanel facilityId={activeFacilityId} />}
    </div>
  );
};

function FacilityPanel() {
  const queryClient = useQueryClient();
  const { activeFacilityId, setActiveFacility } = useAuthStore();
  const { data: facilities } = useQuery({ queryKey: ['facilities'], queryFn: getFacilities });
  const { data: facility } = useQuery({
    queryKey: ['facility', activeFacilityId],
    queryFn: () => getFacility(activeFacilityId!),
    enabled: !!activeFacilityId,
  });
  const [form, setForm] = useState<any>(null);
  const current = form ?? facility;
  const { confirm, dialog } = useConfirm();

  const save = useMutation({
    mutationFn: () =>
      activeFacilityId
        ? updateFacility(activeFacilityId, {
            name: current.name,
            address: current.address,
            city: current.city,
            state: current.state,
            country: current.country,
            pincode: current.pincode,
            contact_phone: current.contact_phone,
            contact_email: current.contact_email,
            total_slots: Number(current.total_slots),
          })
        : createFacility({
            name: current.name,
            address: current.address || 'TBD address',
            city: current.city || 'City',
            state: current.state || 'State',
            country: current.country || 'Country',
            pincode: current.pincode || '000000',
            contact_phone: current.contact_phone || '0000000000',
            contact_email: current.contact_email || 'ops@example.com',
            total_slots: Number(current.total_slots || 0),
          }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      if (data?.facility_id) setActiveFacility(data.facility_id);
    },
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteFacility(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      setActiveFacility(null);
    },
  });

  const field = (key: string, label: string) => (
<<<<<<< HEAD
    <label key={key} className="block text-xs font-semibold text-[#6E6E6E] uppercase tracking-wider">
      {label}
      <input
        className="mt-1.5 w-full clay-input px-3.5 py-2.5 text-sm font-medium text-[#2E2E2E]"
=======
    <label key={key} className="block text-xs text-text-muted">
      {label}
      <input
        className="mt-1 w-full rounded border border-border-hairline bg-bg-elevated px-2 py-1.5 text-sm text-text-primary"
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
        value={current?.[key] ?? ''}
        onChange={(e) => setForm({ ...(current || {}), [key]: e.target.value })}
      />
    </label>
  );

  return (
<<<<<<< HEAD
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      {dialog}
      <div className="clay-card p-4 space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-[#6E6E6E] px-2 mb-2">Facility List</p>
        {facilities?.map((f: any) => {
          const id = facilityIdOf(f)!;
          return (
            <div
              key={id}
=======
    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      {dialog}
      <div className="space-y-1 rounded-lg border border-border-hairline bg-bg-surface p-3">
        {facilities?.map((f: any) => {
          const id = facilityIdOf(f)!;
          return (
            <button
              key={id}
              type="button"
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
              onClick={() => {
                setActiveFacility(id);
                setForm(null);
              }}
<<<<<<< HEAD
              className={`flex w-full items-center justify-between rounded-2xl px-3.5 py-2.5 text-left text-sm font-semibold transition-all cursor-pointer ${
                activeFacilityId === id
                  ? 'bg-[#2E2E2E] text-white shadow-[4px_4px_10px_rgba(46,46,46,0.2)]'
                  : 'hover:bg-[#F8F9FA] text-[#2E2E2E]'
              }`}
            >
              <span className="truncate">{f.name}</span>
              <span
                role="button"
                className={`ml-2 text-xs px-1.5 py-0.5 rounded-md hover:bg-black/10 transition-colors ${
                  activeFacilityId === id ? 'text-white/80' : 'text-[#8C8C8C]'
                }`}
=======
              className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm ${
                activeFacilityId === id ? 'bg-accent-brand/15 text-accent-brand' : 'hover:bg-bg-elevated'
              }`}
            >
              {f.name}
              <span
                role="button"
                className="text-signal-occupied"
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
                onClick={(e) => {
                  e.stopPropagation();
                  confirm({
                    title: 'Delete facility',
                    body: `Delete ${f.name}? This cannot be undone.`,
                    action: () => remove.mutate(id),
                  });
                }}
              >
                ×
              </span>
<<<<<<< HEAD
            </div>
=======
            </button>
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
          );
        })}
        <button
          type="button"
<<<<<<< HEAD
          className="w-full clay-btn-secondary py-2.5 text-xs font-semibold mt-3"
=======
          className="w-full rounded border border-dashed border-border-hairline py-1.5 text-xs text-text-muted"
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
          onClick={() => {
            setActiveFacility(null);
            setForm({ name: '', address: '', city: '', state: '', country: '', pincode: '', contact_phone: '', contact_email: '', total_slots: 0 });
          }}
        >
<<<<<<< HEAD
          + New Facility
        </button>
      </div>

      <form
        className="clay-card p-7 grid grid-cols-2 gap-4"
=======
          + New facility
        </button>
      </div>
      <form
        className="grid grid-cols-2 gap-3 rounded-lg border border-border-hairline bg-bg-surface p-4"
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
<<<<<<< HEAD
        <div className="col-span-2 pb-2 border-b border-[#E5E7EB]">
          <h3 className="font-display text-lg font-bold text-[#2E2E2E]">
            {activeFacilityId ? 'Facility Details' : 'Register New Facility'}
          </h3>
        </div>
=======
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
        {field('name', 'Name')}
        {field('address', 'Address')}
        {field('city', 'City')}
        {field('state', 'State')}
        {field('country', 'Country')}
        {field('pincode', 'Pincode')}
        {field('contact_phone', 'Phone')}
        {field('contact_email', 'Email')}
<<<<<<< HEAD
        {field('total_slots', 'Total Slots')}
        <div className="col-span-2 pt-2">
          <button type="submit" className="clay-btn-primary px-6 py-3 text-sm font-semibold">
            Save Facility
=======
        {field('total_slots', 'Total slots')}
        <div className="col-span-2">
          <button type="submit" className="rounded bg-accent-brand px-4 py-2 text-sm text-white">
            Save facility
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
          </button>
        </div>
      </form>
    </div>
  );
}

function ZonesPanel() {
  const { activeFacilityId } = useAuthStore();
  const queryClient = useQueryClient();
  const { confirm, dialog } = useConfirm();
  const { data: zones } = useQuery({
    queryKey: ['facilities', activeFacilityId, 'zones'],
    queryFn: () => getZones(activeFacilityId!),
    enabled: !!activeFacilityId,
  });
  const [name, setName] = useState('');
  const [floor, setFloor] = useState('0');
  const create = useMutation({
    mutationFn: () => createZone(activeFacilityId!, { name, floor_level: Number(floor) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities', activeFacilityId, 'zones'] });
      setName('');
    },
  });
  const remove = useMutation({
    mutationFn: (id: number) => deleteZone(activeFacilityId!, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['facilities', activeFacilityId, 'zones'] }),
  });
  const edit = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => updateZone(activeFacilityId!, id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['facilities', activeFacilityId, 'zones'] }),
  });

  if (!activeFacilityId) return <EmptyState title="Select a facility to manage zones." />;

  return (
<<<<<<< HEAD
    <div className="clay-card p-6 space-y-5">
      {dialog}
      <form
        className="flex flex-wrap items-center gap-3"
=======
    <div className="space-y-3">
      {dialog}
      <form
        className="flex flex-wrap gap-2"
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim().length >= 2) create.mutate();
        }}
      >
<<<<<<< HEAD
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Zone name (e.g. Zone A)"
          className="clay-input px-4 py-2.5 text-sm"
        />
        <input
          value={floor}
          onChange={(e) => setFloor(e.target.value)}
          placeholder="Floor"
          className="w-24 clay-input px-4 py-2.5 text-sm"
        />
        <button className="clay-btn-primary px-5 py-2.5 text-sm">Add Zone</button>
=======
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Zone name" className="rounded border border-border-hairline bg-bg-elevated px-2 py-1.5 text-sm" />
        <input value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="Floor" className="w-20 rounded border border-border-hairline bg-bg-elevated px-2 py-1.5 text-sm" />
        <button className="rounded bg-accent-brand px-3 py-1.5 text-sm text-white">Add zone</button>
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
      </form>
      {!zones?.length ? (
        <EmptyState title="No zones in this facility yet." hint="Add a zone name and floor level above." />
      ) : (
<<<<<<< HEAD
        <div className="clay-table-container">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8F9FA] text-xs font-semibold uppercase tracking-wider text-[#6E6E6E] border-b border-[#E5E7EB]">
              <tr>
                <th className="py-3 px-4">Zone Name</th>
                <th className="py-3 px-4">Floor Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {zones.map((z: any) => {
                const id = zoneIdOf(z)!;
                return (
                  <tr key={id} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#2E2E2E]">{z.name}</td>
                    <td className="py-3 px-4 font-mono text-[#6E6E6E]">{z.floor_level}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        className="mr-3 text-xs font-semibold text-[#2E2E2E] hover:underline"
                        onClick={() => {
                          const next = prompt('Rename zone', z.name);
                          if (next) edit.mutate({ id, payload: { name: next } });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="text-xs font-semibold text-[#6E6E6E] hover:text-[#2E2E2E]"
                        onClick={() =>
                          confirm({
                            title: 'Delete zone',
                            body: `Delete zone ${z.name}? Slots in this zone must be removed first.`,
                            action: () => remove.mutate(id),
                          })
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
=======
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-text-muted">
            <tr>
              <th className="py-2">Name</th>
              <th>Floor</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {zones.map((z: any) => {
              const id = zoneIdOf(z)!;
              return (
                <tr key={id} className="border-t border-border-hairline">
                  <td className="py-2">{z.name}</td>
                  <td className="font-mono">{z.floor_level}</td>
                  <td className="text-right">
                    <button
                      className="mr-2 text-xs text-accent-brand"
                      onClick={() => {
                        const next = prompt('Rename zone', z.name);
                        if (next) edit.mutate({ id, payload: { name: next } });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-xs text-signal-occupied"
                      onClick={() =>
                        confirm({
                          title: 'Delete zone',
                          body: `Delete zone ${z.name}? Slots in this zone must be removed first.`,
                          action: () => remove.mutate(id),
                        })
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
      )}
    </div>
  );
}

function SlotsPanel({ facilityId }: { facilityId: number | null }) {
  const queryClient = useQueryClient();
  const { confirm, dialog } = useConfirm();
  const [realigning, setRealigning] = useState(false);
  const [realignMsg, setRealignMsg] = useState('');
  const doRealign = useCallback(async () => {
    setRealigning(true);
    setRealignMsg('');
    try {
      const r = await realignSlotZones();
      setRealignMsg(`Done — ${r.fixed} of ${r.total} slots moved to their camera's zone.`);
      queryClient.invalidateQueries({ queryKey: ['zones'] });
    } catch {
      setRealignMsg('Realignment failed.');
    } finally {
      setRealigning(false);
    }
  }, [queryClient]);
  const { data: zones } = useQuery({
    queryKey: ['facilities', facilityId, 'zones'],
    queryFn: () => getZones(facilityId!),
    enabled: !!facilityId,
  });
  const [zoneId, setZoneId] = useState<number | ''>('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const effectiveZone = Number(zoneId) || zoneIdOf(zones?.[0]);
  const { data: slots } = useQuery({
    queryKey: ['zones', effectiveZone, 'slots'],
    queryFn: () => getSlots(effectiveZone!),
    enabled: !!effectiveZone,
  });
  const create = useMutation({
    mutationFn: (payload: any) => createSlot(effectiveZone!, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zones', effectiveZone, 'slots'] }),
  });
  const bulk = useMutation({
    mutationFn: (count: number) => generateSlots(effectiveZone!, { count, prefix: 'S', slot_type: 'NORMAL' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zones', effectiveZone, 'slots'] }),
  });
  const remove = useMutation({
    mutationFn: (id: number) => deleteSlot(effectiveZone!, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zones', effectiveZone, 'slots'] }),
  });

  const filtered = useMemo(
    () =>
      (slots || []).filter((s: any) => {
        if (typeFilter && s.slot_type !== typeFilter) return false;
        if (statusFilter && s.status !== statusFilter) return false;
        return true;
      }),
    [slots, typeFilter, statusFilter]
  );

  if (!facilityId) return <EmptyState title="Select a facility to manage slots." />;

  return (
<<<<<<< HEAD
    <div className="clay-card p-6 space-y-5">
      {dialog}
      <div className="flex items-center gap-3 clay-inset p-4 text-xs font-medium text-[#6E6E6E]">
        <span className="flex-1">
=======
    <div className="space-y-3">
      {dialog}
      <div className="flex items-center gap-2 rounded border border-border-hairline bg-bg-elevated px-3 py-2 text-sm">
        <span className="text-text-muted flex-1">
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
          If slots appear in the wrong zone after onboarding, use this to reassign them to their camera's zone.
        </span>
        <button
          type="button"
          disabled={realigning}
          onClick={doRealign}
<<<<<<< HEAD
          className="clay-btn-secondary px-4 py-2 text-xs font-semibold"
        >
          {realigning ? 'Fixing…' : 'Fix slot zones'}
        </button>
        {realignMsg && <span className="font-semibold text-[#2E2E2E]">{realignMsg}</span>}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={zoneId}
          onChange={(e) => setZoneId(e.target.value ? Number(e.target.value) : '')}
          className="clay-input px-3.5 py-2 text-sm"
        >
=======
          className="rounded bg-signal-reserved/80 px-3 py-1.5 text-xs text-white disabled:opacity-50"
        >
          {realigning ? 'Fixing…' : 'Fix slot zones'}
        </button>
        {realignMsg && <span className="text-xs text-signal-available">{realignMsg}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        <select value={zoneId} onChange={(e) => setZoneId(e.target.value ? Number(e.target.value) : '')} className="rounded border border-border-hairline bg-bg-elevated px-2 py-1.5 text-sm">
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
          {zones?.map((z: any) => (
            <option key={zoneIdOf(z)} value={zoneIdOf(z)}>
              {z.name}
            </option>
          ))}
        </select>
<<<<<<< HEAD
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="clay-input px-3.5 py-2 text-sm"
        >
=======
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded border border-border-hairline bg-bg-elevated px-2 py-1.5 text-sm">
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
          <option value="">All types</option>
          {['NORMAL', 'EV', 'ACCESSIBLE', 'VIP', 'TWO_WHEELER', 'HEAVY'].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
<<<<<<< HEAD
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="clay-input px-3.5 py-2 text-sm"
        >
=======
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded border border-border-hairline bg-bg-elevated px-2 py-1.5 text-sm">
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
          <option value="">All statuses</option>
          {['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE', 'BLOCKED', 'UNKNOWN'].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <button
<<<<<<< HEAD
          className="clay-btn-primary px-4 py-2 text-xs font-semibold"
=======
          className="rounded bg-accent-brand px-3 py-1.5 text-sm text-white"
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
          onClick={() => {
            const code = prompt('Slot code (e.g. S021)');
            if (code && effectiveZone)
              create.mutate({ facility_id: facilityId, slot_code: code, slot_type: 'NORMAL', status: 'AVAILABLE' });
          }}
        >
<<<<<<< HEAD
          Add Slot
        </button>
        <button
          className="clay-btn-secondary px-4 py-2 text-xs font-semibold"
=======
          Add slot
        </button>
        <button
          className="rounded border border-border-hairline px-3 py-1.5 text-sm"
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
          onClick={() => {
            const n = Number(prompt('Generate how many slots?', '5'));
            if (n > 0) bulk.mutate(n);
          }}
        >
<<<<<<< HEAD
          Generate N Slots
        </button>
      </div>

      {!filtered.length ? (
        <EmptyState title="No slots match these filters." hint="Clear filters or generate slots for this zone." />
      ) : (
        <div className="clay-table-container">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8F9FA] text-xs font-semibold uppercase tracking-wider text-[#6E6E6E] border-b border-[#E5E7EB]">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filtered.map((s: any) => {
                const id = slotIdOf(s)!;
                return (
                  <tr key={id} className="hover:bg-[#F8F9FA] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#2E2E2E]">{slotCodeOf(s)}</td>
                    <td className="py-3 px-4 text-[#6E6E6E] font-medium">{s.slot_type}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        className="text-xs font-semibold text-[#6E6E6E] hover:text-[#2E2E2E]"
                        onClick={() =>
                          confirm({
                            title: 'Delete slot',
                            body: `Delete slot ${slotCodeOf(s)}?`,
                            action: () => remove.mutate(id),
                          })
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
=======
          Generate N slots
        </button>
      </div>
      {!filtered.length ? (
        <EmptyState title="No slots match these filters." hint="Clear filters or generate slots for this zone." />
      ) : (
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-text-muted">
            <tr>
              <th className="py-2">Code</th>
              <th>Type</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((s: any) => {
              const id = slotIdOf(s)!;
              return (
                <tr key={id} className="border-t border-border-hairline">
                  <td className="py-2 font-mono">{slotCodeOf(s)}</td>
                  <td>{s.slot_type}</td>
                  <td>
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="text-right">
                    <button
                      className="text-xs text-signal-occupied"
                      onClick={() =>
                        confirm({
                          title: 'Delete slot',
                          body: `Delete slot ${slotCodeOf(s)}?`,
                          action: () => remove.mutate(id),
                        })
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
      )}
    </div>
  );
}

function CamerasPanel({ facilityId }: { facilityId: number | null }) {
  const queryClient = useQueryClient();
  const { confirm, dialog } = useConfirm();
  const { data: cameras } = useQuery({ queryKey: ['cameras'], queryFn: getCameras });
  const list = cameras?.filter((c: any) => !facilityId || c.facility_id === facilityId);
  const create = useMutation({
    mutationFn: (payload: any) => createCamera(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cameras'] }),
  });
  const remove = useMutation({
    mutationFn: (id: number) => deleteCamera(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cameras'] }),
  });
  const toggle = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateCamera(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cameras'] }),
  });

  if (!facilityId) return <EmptyState title="Select a facility to manage cameras." />;

  return (
<<<<<<< HEAD
    <div className="clay-card p-6 space-y-5">
      {dialog}
      <button
        className="clay-btn-primary px-5 py-2.5 text-xs font-semibold"
=======
    <div className="space-y-3">
      {dialog}
      <button
        className="rounded bg-accent-brand px-3 py-1.5 text-sm text-white"
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
        onClick={() => {
          const name = prompt('Camera name');
          if (name)
            create.mutate({
              facility_id: facilityId,
              name,
              camera_type: 'PARKING_SLOT_CAM',
              location_description: 'Operator added',
            });
        }}
      >
<<<<<<< HEAD
        + Add Camera
=======
        Add camera
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
      </button>
      {!list?.length ? (
        <EmptyState title="No cameras registered for this facility." />
      ) : (
<<<<<<< HEAD
        <div className="clay-table-container">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8F9FA] text-xs font-semibold uppercase tracking-wider text-[#6E6E6E] border-b border-[#E5E7EB]">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {list.map((c: any) => (
                <tr key={c.camera_id} className="hover:bg-[#F8F9FA] transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#2E2E2E]">{c.name}</td>
                  <td className="py-3 px-4 font-mono text-xs text-[#6E6E6E]">{c.camera_type}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggle.mutate({ id: c.camera_id, status: c.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE' })}
                      className="cursor-pointer"
                    >
                      <StatusBadge status={c.status} />
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      className="text-xs font-semibold text-[#6E6E6E] hover:text-[#2E2E2E]"
                      onClick={() =>
                        confirm({
                          title: 'Delete camera',
                          body: `Remove ${c.name}?`,
                          action: () => remove.mutate(c.camera_id),
                        })
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
=======
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-text-muted">
            <tr>
              <th className="py-2">Name</th>
              <th>Type</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.map((c: any) => (
              <tr key={c.camera_id} className="border-t border-border-hairline">
                <td className="py-2">{c.name}</td>
                <td className="font-mono text-xs">{c.camera_type}</td>
                <td>
                  <button
                    onClick={() => toggle.mutate({ id: c.camera_id, status: c.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE' })}
                  >
                    <StatusBadge status={c.status} />
                  </button>
                </td>
                <td className="text-right">
                  <button
                    className="text-xs text-signal-occupied"
                    onClick={() =>
                      confirm({
                        title: 'Delete camera',
                        body: `Remove ${c.name}?`,
                        action: () => remove.mutate(c.camera_id),
                      })
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
      )}
    </div>
  );
}

function GatesPanel({ facilityId }: { facilityId: number | null }) {
  const queryClient = useQueryClient();
  const { confirm, dialog } = useConfirm();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'ENTRY' });

  const { data: gates } = useQuery({ queryKey: ['gates'], queryFn: getGates });
  const list = gates?.filter((g: any) => !facilityId || g.facility_id === facilityId) ?? [];
  const entryGates = list.filter((g: any) => gateTypeOf(g) === 'ENTRY');
  const exitGates  = list.filter((g: any) => gateTypeOf(g) === 'EXIT');

  const create = useMutation({
    mutationFn: (payload: any) => createGate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gates'] });
      setShowForm(false);
      setForm({ name: '', type: 'ENTRY' });
    },
  });
  const regen = useMutation({
    mutationFn: (id: number) => regenerateGateQr(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gates'] }),
  });
  const remove = useMutation({
    mutationFn: (id: number) => deleteGate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gates'] }),
  });

  if (!facilityId) return <EmptyState title="Select a facility to manage gates." />;

  const handleAdd = () => {
    if (!form.name.trim()) return;
    create.mutate({
      facility_id: facilityId,
      name: form.name.trim(),
      gate_type: form.type,
      qr_code: `GATE_${Date.now()}`,
    });
  };

  return (
<<<<<<< HEAD
    <div className="space-y-6">
      {dialog}

      {!showForm ? (
        <button
          className="clay-btn-primary px-5 py-2.5 text-xs font-semibold"
          onClick={() => setShowForm(true)}
        >
          + Add Gate
        </button>
      ) : (
        <div className="clay-card-sm p-6 space-y-4 max-w-md">
          <p className="text-sm font-bold text-[#2E2E2E]">New Gate Setup</p>

          <div>
            <label className="block text-xs font-semibold text-[#6E6E6E] uppercase tracking-wider mb-1">Gate Name</label>
=======
    <div className="space-y-5">
      {dialog}

      {/* ── Add gate button / inline form ──────────────────────────── */}
      {!showForm ? (
        <button
          className="rounded bg-accent-brand px-3 py-1.5 text-sm text-white hover:opacity-90 transition-opacity"
          onClick={() => setShowForm(true)}
        >
          + Add gate
        </button>
      ) : (
        <div className="rounded-lg border border-border-hairline bg-bg-surface p-4 space-y-3 max-w-sm">
          <p className="text-sm font-semibold text-text-primary">New Gate</p>

          {/* Gate name */}
          <div>
            <label className="block text-xs text-text-muted mb-1">Gate Name</label>
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
            <input
              autoFocus
              type="text"
              placeholder="e.g. Main Entry, Block B Exit"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
<<<<<<< HEAD
              className="w-full clay-input px-3.5 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#6E6E6E] uppercase tracking-wider mb-1">Gate Type</label>
            <div className="flex gap-3">
              {['ENTRY', 'EXIT'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={`flex-1 rounded-2xl py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                    form.type === t
                      ? 'bg-[#2E2E2E] text-white shadow-[4px_4px_10px_rgba(46,46,46,0.22)]'
                      : 'clay-btn-secondary'
=======
              className="w-full rounded border border-border-hairline bg-bg-base px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent-brand"
            />
          </div>

          {/* Gate type */}
          <div>
            <label className="block text-xs text-text-muted mb-1">Gate Type</label>
            <div className="flex gap-2">
              {['ENTRY', 'EXIT'].map(t => (
                <button
                  key={t}
                  onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={`flex-1 rounded border py-2 text-xs font-semibold transition-colors ${
                    form.type === t
                      ? t === 'ENTRY'
                        ? 'border-green-500 bg-green-500/10 text-green-400'
                        : 'border-orange-500 bg-orange-500/10 text-orange-400'
                      : 'border-border-hairline text-text-muted hover:border-gray-500'
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
                  }`}
                >
                  {t === 'ENTRY' ? '→ Entry Gate' : 'Exit Gate ←'}
                </button>
              ))}
            </div>
          </div>

<<<<<<< HEAD
          <div className="flex gap-3 pt-2">
            <button
              disabled={!form.name.trim() || create.isPending}
              onClick={handleAdd}
              className="clay-btn-primary px-5 py-2 text-xs font-semibold disabled:opacity-40"
            >
              {create.isPending ? 'Adding…' : 'Save Gate'}
            </button>
            <button
              onClick={() => { setShowForm(false); setForm({ name: '', type: 'ENTRY' }); }}
              className="clay-btn-secondary px-5 py-2 text-xs font-semibold"
=======
          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              disabled={!form.name.trim() || create.isPending}
              onClick={handleAdd}
              className="rounded bg-accent-brand px-4 py-1.5 text-sm text-white disabled:opacity-40"
            >
              {create.isPending ? 'Adding…' : 'Add Gate'}
            </button>
            <button
              onClick={() => { setShowForm(false); setForm({ name: '', type: 'ENTRY' }); }}
              className="rounded border border-border-hairline px-4 py-1.5 text-sm text-text-muted hover:text-text-primary"
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState title="No gates configured for this facility." />
      ) : (
        <div className="space-y-6">
<<<<<<< HEAD
          {entryGates.length > 0 && (
            <GateSection
              title="Entry Gates"
=======
          {/* Entry gates */}
          {entryGates.length > 0 && (
            <GateSection
              title="Entry Gates"
              accentClass="text-green-400"
              dotClass="bg-green-500"
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
              gates={entryGates}
              onRegen={id => regen.mutate(id)}
              onDelete={(id, name) => confirm({ title: 'Delete gate', body: `Delete "${name}"?`, action: () => remove.mutate(id) })}
            />
          )}

<<<<<<< HEAD
          {exitGates.length > 0 && (
            <GateSection
              title="Exit Gates"
=======
          {/* Exit gates */}
          {exitGates.length > 0 && (
            <GateSection
              title="Exit Gates"
              accentClass="text-orange-400"
              dotClass="bg-orange-500"
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
              gates={exitGates}
              onRegen={id => regen.mutate(id)}
              onDelete={(id, name) => confirm({ title: 'Delete gate', body: `Delete "${name}"?`, action: () => remove.mutate(id) })}
            />
          )}
        </div>
      )}
    </div>
  );
}

function GateSection({
<<<<<<< HEAD
  title, gates, onRegen, onDelete,
}: {
  title: string;
=======
  title, accentClass, dotClass, gates, onRegen, onDelete,
}: {
  title: string;
  accentClass: string;
  dotClass: string;
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
  gates: any[];
  onRegen: (id: number) => void;
  onDelete: (id: number, name: string) => void;
}) {
  return (
    <div>
<<<<<<< HEAD
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2.5 h-2.5 rounded-full bg-[#2E2E2E]" />
        <span className="text-base font-bold text-[#2E2E2E]">{title}</span>
        <span className="text-xs font-semibold text-[#6E6E6E]">({gates.length})</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
=======
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2 h-2 rounded-full ${dotClass}`} />
        <span className={`text-sm font-semibold ${accentClass}`}>{title}</span>
        <span className="text-xs text-text-muted">({gates.length})</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
        {gates.map((g: any) => {
          const id = gateIdOf(g)!;
          const payload = JSON.stringify({ gateId: id, type: gateTypeOf(g) });
          return (
<<<<<<< HEAD
            <div key={id} className="clay-card-sm p-6 text-center flex flex-col items-center justify-between">
              <div>
                <p className="font-bold text-base text-[#2E2E2E]">{g.name}</p>
                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#6E6E6E] mt-0.5">{gateTypeOf(g)}</p>
                <div className="mx-auto mb-4 inline-block bg-white p-3 rounded-2xl shadow-[inset_2px_2px_4px_rgba(0,0,0,0.04)] border border-[#E5E7EB]">
                  <QRCodeSVG value={payload} size={128} />
                </div>
                <p className="mb-3 font-mono text-[10px] text-[#6E6E6E] break-all clay-inset p-2">{payload}</p>
              </div>
              <div className="flex justify-center gap-4 pt-2">
                <button className="text-xs font-semibold text-[#2E2E2E] hover:underline" onClick={() => onRegen(id)}>
                  Regenerate QR
                </button>
                <button
                  className="text-xs font-semibold text-[#6E6E6E] hover:text-[#2E2E2E]"
=======
            <div key={id} className="rounded-lg border border-border-hairline bg-bg-surface p-4 text-center">
              <p className="font-medium text-text-primary">{g.name}</p>
              <p className={`mb-3 text-xs font-semibold ${accentClass}`}>{gateTypeOf(g)}</p>
              <div className="mx-auto mb-3 inline-block bg-white p-2 rounded">
                <QRCodeSVG value={payload} size={128} />
              </div>
              <p className="mb-2 font-mono text-[10px] text-text-muted break-all">{payload}</p>
              <div className="flex justify-center gap-3">
                <button className="text-xs text-accent-brand hover:underline" onClick={() => onRegen(id)}>
                  Regenerate
                </button>
                <button
                  className="text-xs text-signal-occupied hover:underline"
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
                  onClick={() => onDelete(id, g.name)}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const Facilities = Configuration;
export const Cameras = Configuration;
export const Gates = Configuration;
