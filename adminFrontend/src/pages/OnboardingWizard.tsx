import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2 } from 'lucide-react';
import { getMe } from '../api/auth';
import {
  captureEmptyLot,
  completeOnboarding,
  confirmDetection,
  createOnboardingCameras,
  createOnboardingFacility,
  createOnboardingGates,
  createOnboardingZones,
  extractBoxes,
  getOnboardingStatus,
  getOnboardingSummary,
  getRawDetections,
  imageUrl,
  markDuplicateDetection,
  rejectDetection,
  setOnboardingPricing,
} from '../api/onboarding';
import { getCameras } from '../api/cameras';
import { getGates } from '../api/gates';
import { getZones } from '../api/facilities';
import { useAuthStore } from '../store/authStore';
import { cameraIdOf, zoneIdOf } from '../lib/ids';

const STEPS = [
  'Facility',
  'Zones',
  'Cameras',
  'Extraction',
  'Duplicates',
  'Gates',
  'Pricing',
  'Review',
];

const CAMERA_TYPES = ['PARKING_SLOT_CAM', 'GATE_ENTRY_CAM', 'GATE_EXIT_CAM', 'ANPR'] as const;
const SLOT_TYPES = ['NORMAL', 'EV', 'ACCESSIBLE', 'VIP', 'TWO_WHEELER', 'HEAVY'];

export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { token, login } = useAuthStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const status = await getOnboardingStatus();
      if (status.onboardingStatus === 'COMPLETED') {
        navigate(token ? '/monitoring' : '/login', { replace: true });
        return;
      }
      const resumeAt = Math.min(8, Math.max(1, (status.onboardingStep || 0) + 1));
      setStep(status.hasFacility ? resumeAt : 1);
      setLoading(false);
    })().catch(() => setLoading(false));
  }, [navigate, token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-base">
        <Loader2 className="animate-spin text-accent-brand" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base p-6">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs uppercase tracking-widest text-text-muted">Facility onboarding</p>
        <h1 className="font-display text-4xl tracking-wide">SETUP WIZARD</h1>
        <ol className="mt-4 flex flex-wrap gap-2">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const canJumpBack = n >= 2 && n < step;
            return (
              <li
                key={label}
                role={canJumpBack ? 'button' : undefined}
                tabIndex={canJumpBack ? 0 : undefined}
                onClick={canJumpBack ? () => { setError(''); setStep(n); } : undefined}
                onKeyDown={canJumpBack ? (e) => e.key === 'Enter' && setStep(n) : undefined}
                className={`rounded-full px-3 py-1 text-xs select-none ${
                  n === step
                    ? 'bg-accent-brand text-white'
                    : n < step
                      ? 'bg-signal-available/20 text-signal-available cursor-pointer hover:bg-signal-available/40'
                      : 'bg-bg-elevated text-text-muted'
                }`}
              >
                {n}. {label}
              </li>
            );
          })}
        </ol>
        {error && (
          <div className="mt-4 rounded-md border border-signal-occupied/30 bg-signal-occupied/10 p-2 text-sm text-signal-occupied">
            {error}
          </div>
        )}
        {step >= 3 && (
          <button
            type="button"
            onClick={() => { setError(''); setStep(step - 1); }}
            className="mt-4 text-sm text-text-muted hover:text-text-primary"
          >
            ← Back
          </button>
        )}
        <div className="mt-3 rounded-xl border border-border-hairline bg-bg-surface p-6">
          {step === 1 && (
            <StepFacility
              busy={busy}
              setBusy={setBusy}
              setError={setError}
              onDone={() => setStep(2)}
              login={login}
            />
          )}
          {step === 2 && <StepZones busy={busy} setBusy={setBusy} setError={setError} onDone={() => setStep(3)} />}
          {step === 3 && <StepCameras busy={busy} setBusy={setBusy} setError={setError} onDone={() => setStep(4)} />}
          {step === 4 && <StepExtract busy={busy} setBusy={setBusy} setError={setError} onDone={() => setStep(5)} />}
          {step === 5 && <StepDuplicates busy={busy} setBusy={setBusy} setError={setError} onDone={() => setStep(6)} />}
          {step === 6 && <StepGates busy={busy} setBusy={setBusy} setError={setError} onDone={() => setStep(7)} />}
          {step === 7 && <StepPricing busy={busy} setBusy={setBusy} setError={setError} onDone={() => setStep(8)} />}
          {step === 8 && (
            <StepReview
              busy={busy}
              setBusy={setBusy}
              setError={setError}
              onDone={() => navigate('/monitoring')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-xs font-medium text-text-muted">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputClass =
  'w-full rounded-md border border-border-hairline bg-bg-elevated px-3 py-2 text-sm text-text-primary';

function StepFacility({
  busy,
  setBusy,
  setError,
  onDone,
  login,
}: {
  busy: boolean;
  setBusy: (v: boolean) => void;
  setError: (v: string) => void;
  onDone: () => void;
  login: (token: string, user: any) => void;
}) {
  const [form, setForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    contact_phone: '',
    contact_email: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const data = await createOnboardingFacility({
        name: form.name,
        address: form.address,
        city: form.city,
        state: form.state,
        country: form.country,
        pincode: form.pincode,
        contact_phone: form.contact_phone,
        contact_email: form.contact_email,
        admin: { name: form.adminName, email: form.adminEmail, password: form.adminPassword },
      });
      useAuthStore.setState({ token: data.accessToken });
      const user = await getMe();
      login(data.accessToken, {
        id: user.admin_id ?? user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        facility_id: user.facility_id,
      });
      onDone();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Could not create facility');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-3 md:grid-cols-2">
      <h2 className="font-display text-2xl tracking-wide md:col-span-2">Facility & admin account</h2>
      <Field label="Organization name">
        <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </Field>
      <Field label="Address">
        <input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
      </Field>
      <Field label="City">
        <input className={inputClass} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
      </Field>
      <Field label="State">
        <input className={inputClass} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
      </Field>
      <Field label="Country">
        <input className={inputClass} value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
      </Field>
      <Field label="Pincode">
        <input className={inputClass} value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} required />
      </Field>
      <Field label="Contact phone">
        <input className={inputClass} value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} required />
      </Field>
      <Field label="Contact email">
        <input className={inputClass} type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} required />
      </Field>
      <Field label="Admin name">
        <input className={inputClass} value={form.adminName} onChange={(e) => setForm({ ...form, adminName: e.target.value })} required />
      </Field>
      <Field label="Admin email">
        <input className={inputClass} type="email" value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} required />
      </Field>
      <Field label="Admin password">
        <input className={inputClass} type="password" value={form.adminPassword} onChange={(e) => setForm({ ...form, adminPassword: e.target.value })} required minLength={6} />
      </Field>
      <div className="md:col-span-2 mt-2">
        <button type="submit" disabled={busy} className="rounded-md bg-accent-brand px-4 py-2 text-sm text-white disabled:opacity-50">
          {busy ? 'Saving…' : 'Save and continue'}
        </button>
      </div>
    </form>
  );
}

function StepZones({ busy, setBusy, setError, onDone }: any) {
  const facilityId = useAuthStore((s) => s.activeFacilityId);
  const [existing, setExisting] = useState<any[]>([]);
  const [rows, setRows] = useState([{ name: 'Ground Floor', floor_level: 0 }]);

  useEffect(() => {
    if (facilityId) {
      getZones(facilityId).then((z) => { if (z?.length) setExisting(z); });
    }
  }, [facilityId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await createOnboardingZones(rows.map((r) => ({ name: r.name, floor_level: Number(r.floor_level) })));
      onDone();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Could not save zones');
    } finally {
      setBusy(false);
    }
  };

  if (existing.length > 0) {
    return (
      <div className="space-y-4">
        <h2 className="font-display text-2xl tracking-wide">Zones</h2>
        <p className="text-sm text-text-muted">Zones are already saved. To change them you would need to restart onboarding.</p>
        <div className="space-y-2">
          {existing.map((z: any) => (
            <div key={z.zone_id} className="flex items-center gap-4 rounded border border-border-hairline bg-bg-elevated px-3 py-2 text-sm">
              <span className="font-medium">{z.name}</span>
              <span className="text-text-muted">Floor {z.floor_level}</span>
            </div>
          ))}
        </div>
        <button type="button" onClick={onDone} className="rounded-md bg-accent-brand px-4 py-2 text-sm text-white">
          Continue
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <h2 className="font-display text-2xl tracking-wide">Zones</h2>
      {rows.map((row, i) => (
        <div key={i} className="grid gap-3 md:grid-cols-2">
          <Field label="Zone name">
            <input className={inputClass} value={row.name} onChange={(e) => {
              const next = [...rows];
              next[i] = { ...row, name: e.target.value };
              setRows(next);
            }} required />
          </Field>
          <Field label="Floor level">
            <input className={inputClass} type="number" value={row.floor_level} onChange={(e) => {
              const next = [...rows];
              next[i] = { ...row, floor_level: Number(e.target.value) };
              setRows(next);
            }} required />
          </Field>
        </div>
      ))}
      <button type="button" className="text-sm text-accent-brand" onClick={() => setRows([...rows, { name: '', floor_level: 0 }])}>
        + Add zone
      </button>
      <div>
        <button type="submit" disabled={busy} className="rounded-md bg-accent-brand px-4 py-2 text-sm text-white">
          {busy ? 'Saving…' : 'Save and continue'}
        </button>
      </div>
    </form>
  );
}

function StepCameras({ busy, setBusy, setError, onDone }: any) {
  const facilityId = useAuthStore((s) => s.activeFacilityId);
  const [zones, setZones] = useState<any[]>([]);
  const [rows, setRows] = useState([{ name: 'Lot Cam 1', camera_type: 'PARKING_SLOT_CAM', zone_id: '' }]);
  const [captured, setCaptured] = useState<Record<number, string>>({});
  const [created, setCreated] = useState<any[]>([]);

  useEffect(() => {
    if (facilityId) getZones(facilityId).then(setZones);
    getCameras().then((all) => {
      if (all?.length) {
        setCreated(all);
        const caps: Record<number, string> = {};
        all.forEach((c: any) => {
          if (c.empty_lot_image_url) caps[c.camera_id] = c.empty_lot_image_url;
        });
        setCaptured(caps);
        // When cameras already exist, default the "add more" row to ANPR
        // (slot cams are likely already covered; gates need ANPR cameras)
        const hasAnpr = all.some((c: any) => c.camera_type === 'ANPR');
        if (!hasAnpr) {
          setRows([{ name: 'Entry Cam', camera_type: 'ANPR', zone_id: '' }]);
        }
      }
    });
  }, [facilityId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const added = await createOnboardingCameras(
        rows.map((r) => ({
          name: r.name,
          camera_type: r.camera_type,
          zone_id: r.zone_id ? Number(r.zone_id) : null,
        })),
      );
      const all = [...created, ...added];
      setCreated(all);
      setRows([{ name: '', camera_type: 'ANPR', zone_id: '' }]);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Could not save cameras');
    } finally {
      setBusy(false);
    }
  };

  const capture = async (id: number) => {
    const cam = await captureEmptyLot(id);
    setCaptured((c) => ({ ...c, [id]: cam.empty_lot_image_url }));
  };

  const slotCams = created.filter((c) => c.camera_type === 'PARKING_SLOT_CAM');
  const allCaptured = slotCams.length > 0 && slotCams.every((c) => captured[c.camera_id] || c.empty_lot_image_url);
  const anprCams = created.filter((c) => c.camera_type === 'ANPR');

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl tracking-wide">Cameras</h2>

      {created.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Saved cameras</p>
          {created.map((c: any) => (
            <div key={c.camera_id} className="flex items-center justify-between rounded border border-border-hairline bg-bg-elevated p-3">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-text-muted">{c.camera_type}</p>
              </div>
              {c.camera_type === 'PARKING_SLOT_CAM' && (
                <button type="button" className="rounded bg-accent-brand px-3 py-1.5 text-xs text-white" onClick={() => capture(c.camera_id)}>
                  {(captured[c.camera_id] || c.empty_lot_image_url) ? 'Re-capture Empty-Lot' : 'Capture Empty-Lot Feed (Mock)'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="space-y-3 rounded border border-border-hairline bg-bg-elevated p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
          {created.length > 0 ? 'Add more cameras' : 'Add cameras'}
        </p>
        {created.length > 0 && !created.some((c: any) => c.camera_type === 'ANPR') && (
          <p className="rounded border border-signal-reserved/30 bg-signal-reserved/10 px-3 py-2 text-xs text-signal-reserved">
            ⚠ No ANPR cameras yet. Gates require at least one ANPR camera — add one below before proceeding to gates.
          </p>
        )}
        {rows.map((row, i) => (
          <div key={i} className="grid gap-3 md:grid-cols-3">
            <Field label="Name">
              <input className={inputClass} value={row.name} onChange={(e) => {
                const next = [...rows];
                next[i] = { ...row, name: e.target.value };
                setRows(next);
              }} required />
            </Field>
            <Field label="Type">
              <select className={inputClass} value={row.camera_type} onChange={(e) => {
                const next = [...rows];
                next[i] = { ...row, camera_type: e.target.value };
                setRows(next);
              }}>
                {CAMERA_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Zone">
              <select className={inputClass} value={row.zone_id} onChange={(e) => {
                const next = [...rows];
                next[i] = { ...row, zone_id: e.target.value };
                setRows(next);
              }}>
                <option value="">None</option>
                {zones.map((z) => (
                  <option key={zoneIdOf(z)} value={zoneIdOf(z)}>{z.name}</option>
                ))}
              </select>
            </Field>
          </div>
        ))}
        <div className="flex items-center gap-3">
          <button type="button" className="text-sm text-accent-brand" onClick={() => setRows([...rows, { name: '', camera_type: 'ANPR', zone_id: '' }])}>
            + Add row
          </button>
          <button type="submit" disabled={busy} className="rounded-md bg-accent-brand px-4 py-2 text-sm text-white">
            {busy ? 'Saving…' : 'Save cameras'}
          </button>
        </div>
      </form>

      {(slotCams.length > 0 || anprCams.length > 0) && (
        <div className="space-y-2">
          {anprCams.length === 0 && (
            <p className="rounded border border-signal-reserved/30 bg-signal-reserved/10 px-3 py-2 text-xs text-signal-reserved">
              Gates require at least one ANPR camera. Add one above before continuing.
            </p>
          )}
          <button
            type="button"
            disabled={!allCaptured || anprCams.length === 0}
            onClick={onDone}
            className="rounded-md bg-accent-brand px-4 py-2 text-sm text-white disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

function BoxOverlay({ detections, image }: { detections: any[]; image?: string | null }) {
  return (
    <div className="relative overflow-hidden rounded border border-border-hairline bg-bg-elevated">
      {image ? (
        <img src={imageUrl(image)} alt="Empty lot" className="block w-full" />
      ) : (
        <div className="flex h-48 items-center justify-center text-xs text-text-muted">No empty-lot image</div>
      )}
      {detections.map((d) => {
        const b = d.bounding_box || {};
        return (
          <div
            key={d.detection_id}
            className="absolute border-2 border-accent-brand/80"
            style={{ left: `${(b.x || 0) * 100}%`, top: `${(b.y || 0) * 100}%`, width: `${(b.width || 0) * 100}%`, height: `${(b.height || 0) * 100}%` }}
          >
            <span className="absolute -top-4 left-0 bg-accent-brand px-1 font-mono text-[10px] text-white">
              {d.suggested_code}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function StepExtract({ busy, setBusy, setError, onDone }: any) {
  const [cameras, setCameras] = useState<any[]>([]);
  const [results, setResults] = useState<Record<number, any[]>>({});

  useEffect(() => {
    getCameras().then((all) => setCameras(all.filter((c: any) => c.camera_type === 'PARKING_SLOT_CAM')));
  }, []);

  const run = async (id: number) => {
    setBusy(true);
    setError('');
    try {
      const rows = await extractBoxes(id);
      setResults((r) => ({ ...r, [id]: rows }));
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Extraction failed');
    } finally {
      setBusy(false);
    }
  };

  const allRun = cameras.length > 0 && cameras.every((c) => results[c.camera_id]?.length);

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl tracking-wide">Box extraction</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {cameras.map((c) => (
          <div key={c.camera_id} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-medium">{c.name}</p>
              <button type="button" disabled={busy} onClick={() => run(c.camera_id)} className="rounded bg-accent-brand px-3 py-1.5 text-xs text-white">
                Run Extraction (Mock)
              </button>
            </div>
            <BoxOverlay detections={results[c.camera_id] || []} image={c.empty_lot_image_url} />
          </div>
        ))}
      </div>
      <button type="button" disabled={!allRun} onClick={onDone} className="rounded-md bg-accent-brand px-4 py-2 text-sm text-white disabled:opacity-40">
        Continue to duplicate review
      </button>
    </div>
  );
}

function StepDuplicates({ setError, onDone }: any) {
  const facilityId = useAuthStore((s) => s.activeFacilityId);
  const [payload, setPayload] = useState<any>(null);
  const [zones, setZones] = useState<any[]>([]);
  const [finalize, setFinalize] = useState<any>(null);
  const [dupPick, setDupPick] = useState<any>(null);
  const [form, setForm] = useState({ slotCode: '', zoneId: '', slotType: 'NORMAL' });

  const reload = async () => {
    const data = await getRawDetections('PENDING_REVIEW');
    setPayload(data);
  };

  useEffect(() => {
    reload();
    if (facilityId) getZones(facilityId).then(setZones);
  }, [facilityId]);

  const pending = payload?.cameras?.flatMap((c: any) => c.detections) || [];

  const act = async (fn: () => Promise<any>) => {
    setError('');
    try {
      await fn();
      setFinalize(null);
      setDupPick(null);
      await reload();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl tracking-wide">Duplicate review</h2>
      <p className="text-sm text-text-muted">Compare cameras side by side. Keep one box per physical space.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {payload?.cameras?.map((cam: any) => (
          <div key={cam.camera_id} className="space-y-2">
            <p className="font-medium">{cam.name}</p>
            <BoxOverlay detections={cam.detections} image={cam.empty_lot_image_url} />
            <div className="space-y-2">
              {cam.detections.map((d: any) => (
                <div key={d.detection_id} className="rounded border border-border-hairline bg-bg-elevated p-2 text-sm">
                  <p className="font-mono">{d.suggested_code}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <button type="button" className="rounded bg-signal-available/20 px-2 py-1 text-xs text-signal-available" onClick={() => {
                      setFinalize(d);
                      // Pre-select the camera's own zone; fall back to zones[0] if the camera has no zone
                      const camZoneId = cam.zone_id ? String(cam.zone_id) : String(zoneIdOf(zones[0]) || '');
                      setForm({ slotCode: d.suggested_code, zoneId: camZoneId, slotType: 'NORMAL' });
                    }}>
                      This is a real space
                    </button>
                    <button type="button" className="rounded bg-signal-occupied/20 px-2 py-1 text-xs text-signal-occupied" onClick={() => act(() => rejectDetection(d.detection_id))}>
                      Not a real space
                    </button>
                    <button type="button" className="rounded bg-signal-reserved/20 px-2 py-1 text-xs text-signal-reserved" onClick={() => setDupPick(d)}>
                      Duplicate of another camera's box
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {finalize && (
        <form
          className="rounded border border-border-hairline bg-bg-elevated p-4"
          onSubmit={(e) => {
            e.preventDefault();
            act(() => confirmDetection(finalize.detection_id, { slotCode: form.slotCode, zoneId: Number(form.zoneId), slotType: form.slotType }));
          }}
        >
          <p className="mb-2 text-sm">Finalize {finalize.suggested_code}</p>
          <div className="grid gap-2 md:grid-cols-3">
            <input className={inputClass} value={form.slotCode} onChange={(e) => setForm({ ...form, slotCode: e.target.value })} required />
            <select className={inputClass} value={form.zoneId} onChange={(e) => setForm({ ...form, zoneId: e.target.value })}>
              {zones.map((z) => (
                <option key={zoneIdOf(z)} value={zoneIdOf(z)}>{z.name}</option>
              ))}
            </select>
            <select className={inputClass} value={form.slotType} onChange={(e) => setForm({ ...form, slotType: e.target.value })}>
              {SLOT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="mt-3 rounded bg-accent-brand px-3 py-1.5 text-xs text-white">Confirm slot</button>
        </form>
      )}

      {dupPick && (
        <div className="rounded border border-border-hairline bg-bg-elevated p-4">
          <p className="mb-2 text-sm">Mark {dupPick.suggested_code} as duplicate of:</p>
          <div className="flex flex-wrap gap-2">
            {pending
              .filter((d: any) => d.camera_id !== dupPick.camera_id)
              .map((d: any) => (
                <button
                  key={d.detection_id}
                  type="button"
                  className="rounded border border-border-hairline px-2 py-1 font-mono text-xs"
                  onClick={() => act(() => markDuplicateDetection(dupPick.detection_id, d.detection_id))}
                >
                  {d.suggested_code}
                </button>
              ))}
          </div>
        </div>
      )}

      <button type="button" disabled={pending.length > 0} onClick={onDone} className="rounded-md bg-accent-brand px-4 py-2 text-sm text-white disabled:opacity-40">
        Continue
      </button>
    </div>
  );
}

function StepGates({ busy, setBusy, setError, onDone }: any) {
  const [cameras, setCameras] = useState<any[]>([]);
  const [rows, setRows] = useState([{ name: 'Main Entry', gate_type: 'ENTRY', camera_id: '' }]);
  const [created, setCreated] = useState<any[]>([]);

  useEffect(() => {
    getCameras().then((all) => setCameras(all.filter((c: any) => c.camera_type === 'ANPR')));
    getGates().then((existing: any[]) => {
      if (existing?.length) {
        setCreated(existing);
        setRows(existing.map((g: any) => ({
          name: g.name,
          gate_type: g.gate_type,
          camera_id: g.camera_id ? String(g.camera_id) : '',
        })));
      }
    }).catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const gates = await createOnboardingGates(
        rows.map((r) => ({ name: r.name, gate_type: r.gate_type, camera_id: r.camera_id ? Number(r.camera_id) : null })),
      );
      setCreated(gates);
      onDone();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Could not save gates');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <h2 className="font-display text-2xl tracking-wide">Gates</h2>
      {rows.map((row, i) => (
        <div key={i} className="grid gap-3 md:grid-cols-3">
          <input className={inputClass} value={row.name} onChange={(e) => {
            const next = [...rows];
            next[i] = { ...row, name: e.target.value };
            setRows(next);
          }} required />
          <select className={inputClass} value={row.gate_type} onChange={(e) => {
            const next = [...rows];
            next[i] = { ...row, gate_type: e.target.value };
            setRows(next);
          }}>
            <option>ENTRY</option>
            <option>EXIT</option>
            <option>BOTH</option>
          </select>
          <select className={inputClass} value={row.camera_id} onChange={(e) => {
            const next = [...rows];
            next[i] = { ...row, camera_id: e.target.value };
            setRows(next);
          }}>
            <option value="">ANPR camera</option>
            {cameras.map((c) => (
              <option key={cameraIdOf(c)} value={cameraIdOf(c)}>{c.name}</option>
            ))}
          </select>
        </div>
      ))}
      <button type="button" className="text-sm text-accent-brand" onClick={() => setRows([...rows, { name: 'Main Exit', gate_type: 'EXIT', camera_id: '' }])}>
        + Add gate
      </button>
      <div className="flex gap-3">
        <button type="submit" disabled={busy} className="rounded-md bg-accent-brand px-4 py-2 text-sm text-white">
          {busy ? 'Saving…' : created.length > 0 ? 'Update gates' : 'Save gates'}
        </button>
        {created.length > 0 && (
          <button type="button" onClick={onDone} className="rounded-md border border-border-hairline px-4 py-2 text-sm text-text-primary">
            Continue without changes
          </button>
        )}
      </div>
      {created.length > 0 && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <p className="text-xs text-text-muted md:col-span-2">Currently saved gates (will be replaced on update):</p>
          {created.map((g: any) => (
            <div key={g.gate_id} className="rounded border border-border-hairline bg-bg-elevated p-3">
              <p className="font-medium">{g.name}</p>
              <p className="font-mono text-xs text-text-muted">{g.qr_code}</p>
              <div className="mt-2 inline-block rounded bg-white p-2">
                <QRCodeSVG value={JSON.stringify({ gateId: g.gate_id, qr_code: g.qr_code })} size={96} />
              </div>
            </div>
          ))}
        </div>
      )}
    </form>
  );
}

function StepPricing({ busy, setBusy, setError, onDone }: any) {
  const [form, setForm] = useState({ hourlyRate: 40, currency: 'INR', gracePeriodMinutes: 15, minimumFee: 20 });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await setOnboardingPricing({
        hourlyRate: Number(form.hourlyRate),
        currency: form.currency,
        gracePeriodMinutes: Number(form.gracePeriodMinutes),
        minimumFee: Number(form.minimumFee),
      });
      onDone();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Could not save pricing');
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="grid max-w-lg gap-3">
      <h2 className="font-display text-2xl tracking-wide">Pricing</h2>
      <Field label="Hourly rate">
        <input className={inputClass} type="number" step="0.01" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: Number(e.target.value) })} />
      </Field>
      <Field label="Currency">
        <input className={inputClass} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
      </Field>
      <Field label="Grace period (minutes)">
        <input className={inputClass} type="number" value={form.gracePeriodMinutes} onChange={(e) => setForm({ ...form, gracePeriodMinutes: Number(e.target.value) })} />
      </Field>
      <Field label="Minimum fee">
        <input className={inputClass} type="number" step="0.01" value={form.minimumFee} onChange={(e) => setForm({ ...form, minimumFee: Number(e.target.value) })} />
      </Field>
      <button type="submit" disabled={busy} className="rounded-md bg-accent-brand px-4 py-2 text-sm text-white">Save and continue</button>
    </form>
  );
}

function StepReview({ busy, setBusy, setError, onDone }: any) {
  const [summary, setSummary] = useState<any>(null);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    getOnboardingSummary().then(setSummary);
    getRawDetections('PENDING_REVIEW').then((d) => setPending(d.pendingCount || 0));
  }, []);

  const finish = async () => {
    setBusy(true);
    setError('');
    try {
      await completeOnboarding();
      onDone();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Cannot complete onboarding yet');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl tracking-wide">Review & finish</h2>
      {summary && (
        <div className="grid gap-3 md:grid-cols-4">
          <Stat label="Zones" value={summary.zoneCount} />
          <Stat label="Confirmed slots" value={summary.confirmedSlotCount} />
          <Stat label="Gates" value={summary.gateCount} />
          <Stat label="Hourly rate" value={`${summary.pricing?.currency} ${summary.pricing?.hourly_rate}`} />
        </div>
      )}
      <div className="space-y-1 text-sm text-text-muted">
        {summary?.slotsPerCamera?.map((c: any) => (
          <p key={c.camera_id}>{c.name}: {c.confirmedSlots} confirmed slots</p>
        ))}
      </div>
      <button
        type="button"
        disabled={busy || pending > 0}
        onClick={finish}
        className="rounded-md bg-accent-brand px-4 py-2 text-sm text-white disabled:opacity-40"
      >
        Complete Onboarding
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded border border-border-hairline bg-bg-elevated p-3">
      <p className="text-[11px] uppercase tracking-wider text-text-muted">{label}</p>
      <p className="font-display text-3xl">{value}</p>
    </div>
  );
}
