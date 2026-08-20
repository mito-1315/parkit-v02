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
import { EmptyState, StatusBadge, useConfirm } from '../components/ui';
import { realignSlotZones } from '../api/onboarding';

const TABS = ['Facility', 'Zones', 'Slots', 'Cameras', 'Gates'] as const;
type Tab = (typeof TABS)[number];

export const Configuration: React.FC = () => {
  const [tab, setTab] = useState<Tab>('Facility');
  const { activeFacilityId } = useAuthStore();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl tracking-wide">CONFIGURATION</h1>
        <p className="text-sm text-text-muted">Facility profile, zones, slots, cameras, and gates.</p>
      </div>
      <div className="flex flex-wrap gap-1 border-b border-border-hairline pb-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded px-3 py-1.5 text-sm ${tab === t ? 'bg-accent-brand text-white' : 'text-text-muted hover:bg-bg-elevated'}`}
          >
            {t}
          </button>
        ))}
      </div>
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
    <label key={key} className="block text-xs text-text-muted">
      {label}
      <input
        className="mt-1 w-full rounded border border-border-hairline bg-bg-elevated px-2 py-1.5 text-sm text-text-primary"
        value={current?.[key] ?? ''}
        onChange={(e) => setForm({ ...(current || {}), [key]: e.target.value })}
      />
    </label>
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      {dialog}
      <div className="space-y-1 rounded-lg border border-border-hairline bg-bg-surface p-3">
        {facilities?.map((f: any) => {
          const id = facilityIdOf(f)!;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setActiveFacility(id);
                setForm(null);
              }}
              className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm ${
                activeFacilityId === id ? 'bg-accent-brand/15 text-accent-brand' : 'hover:bg-bg-elevated'
              }`}
            >
              {f.name}
              <span
                role="button"
                className="text-signal-occupied"
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
            </button>
          );
        })}
        <button
          type="button"
          className="w-full rounded border border-dashed border-border-hairline py-1.5 text-xs text-text-muted"
          onClick={() => {
            setActiveFacility(null);
            setForm({ name: '', address: '', city: '', state: '', country: '', pincode: '', contact_phone: '', contact_email: '', total_slots: 0 });
          }}
        >
          + New facility
        </button>
      </div>
      <form
        className="grid grid-cols-2 gap-3 rounded-lg border border-border-hairline bg-bg-surface p-4"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        {field('name', 'Name')}
        {field('address', 'Address')}
        {field('city', 'City')}
        {field('state', 'State')}
        {field('country', 'Country')}
        {field('pincode', 'Pincode')}
        {field('contact_phone', 'Phone')}
        {field('contact_email', 'Email')}
        {field('total_slots', 'Total slots')}
        <div className="col-span-2">
          <button type="submit" className="rounded bg-accent-brand px-4 py-2 text-sm text-white">
            Save facility
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
    <div className="space-y-3">
      {dialog}
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim().length >= 2) create.mutate();
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Zone name" className="rounded border border-border-hairline bg-bg-elevated px-2 py-1.5 text-sm" />
        <input value={floor} onChange={(e) => setFloor(e.target.value)} placeholder="Floor" className="w-20 rounded border border-border-hairline bg-bg-elevated px-2 py-1.5 text-sm" />
        <button className="rounded bg-accent-brand px-3 py-1.5 text-sm text-white">Add zone</button>
      </form>
      {!zones?.length ? (
        <EmptyState title="No zones in this facility yet." hint="Add a zone name and floor level above." />
      ) : (
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
    <div className="space-y-3">
      {dialog}
      <div className="flex items-center gap-2 rounded border border-border-hairline bg-bg-elevated px-3 py-2 text-sm">
        <span className="text-text-muted flex-1">
          If slots appear in the wrong zone after onboarding, use this to reassign them to their camera's zone.
        </span>
        <button
          type="button"
          disabled={realigning}
          onClick={doRealign}
          className="rounded bg-signal-reserved/80 px-3 py-1.5 text-xs text-white disabled:opacity-50"
        >
          {realigning ? 'Fixing…' : 'Fix slot zones'}
        </button>
        {realignMsg && <span className="text-xs text-signal-available">{realignMsg}</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        <select value={zoneId} onChange={(e) => setZoneId(e.target.value ? Number(e.target.value) : '')} className="rounded border border-border-hairline bg-bg-elevated px-2 py-1.5 text-sm">
          {zones?.map((z: any) => (
            <option key={zoneIdOf(z)} value={zoneIdOf(z)}>
              {z.name}
            </option>
          ))}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded border border-border-hairline bg-bg-elevated px-2 py-1.5 text-sm">
          <option value="">All types</option>
          {['NORMAL', 'EV', 'ACCESSIBLE', 'VIP', 'TWO_WHEELER', 'HEAVY'].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded border border-border-hairline bg-bg-elevated px-2 py-1.5 text-sm">
          <option value="">All statuses</option>
          {['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE', 'BLOCKED', 'UNKNOWN'].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <button
          className="rounded bg-accent-brand px-3 py-1.5 text-sm text-white"
          onClick={() => {
            const code = prompt('Slot code (e.g. S021)');
            if (code && effectiveZone)
              create.mutate({ facility_id: facilityId, slot_code: code, slot_type: 'NORMAL', status: 'AVAILABLE' });
          }}
        >
          Add slot
        </button>
        <button
          className="rounded border border-border-hairline px-3 py-1.5 text-sm"
          onClick={() => {
            const n = Number(prompt('Generate how many slots?', '5'));
            if (n > 0) bulk.mutate(n);
          }}
        >
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
    <div className="space-y-3">
      {dialog}
      <button
        className="rounded bg-accent-brand px-3 py-1.5 text-sm text-white"
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
        Add camera
      </button>
      {!list?.length ? (
        <EmptyState title="No cameras registered for this facility." />
      ) : (
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
            <input
              autoFocus
              type="text"
              placeholder="e.g. Main Entry, Block B Exit"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
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
                  }`}
                >
                  {t === 'ENTRY' ? '→ Entry Gate' : 'Exit Gate ←'}
                </button>
              ))}
            </div>
          </div>

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
          {/* Entry gates */}
          {entryGates.length > 0 && (
            <GateSection
              title="Entry Gates"
              accentClass="text-green-400"
              dotClass="bg-green-500"
              gates={entryGates}
              onRegen={id => regen.mutate(id)}
              onDelete={(id, name) => confirm({ title: 'Delete gate', body: `Delete "${name}"?`, action: () => remove.mutate(id) })}
            />
          )}

          {/* Exit gates */}
          {exitGates.length > 0 && (
            <GateSection
              title="Exit Gates"
              accentClass="text-orange-400"
              dotClass="bg-orange-500"
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
  title, accentClass, dotClass, gates, onRegen, onDelete,
}: {
  title: string;
  accentClass: string;
  dotClass: string;
  gates: any[];
  onRegen: (id: number) => void;
  onDelete: (id: number, name: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2 h-2 rounded-full ${dotClass}`} />
        <span className={`text-sm font-semibold ${accentClass}`}>{title}</span>
        <span className="text-xs text-text-muted">({gates.length})</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {gates.map((g: any) => {
          const id = gateIdOf(g)!;
          const payload = g.qr_code || JSON.stringify({ gateId: id });
          return (
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
