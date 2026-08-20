export function entityId(row: Record<string, unknown> | null | undefined, ...keys: string[]): number | undefined {
  if (!row) return undefined;
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
    if (typeof value === 'string' && value !== '') {
      const n = Number(value);
      if (Number.isFinite(n) && n > 0) return n;
    }
  }
  return undefined;
}

export const facilityIdOf = (row: any) => entityId(row, 'facility_id', 'id');
export const zoneIdOf = (row: any) => entityId(row, 'zone_id', 'id');
export const slotIdOf = (row: any) => entityId(row, 'slot_id', 'id');
export const sessionIdOf = (row: any) => entityId(row, 'session_id', 'id');
export const cameraIdOf = (row: any) => entityId(row, 'camera_id', 'id');
export const gateIdOf = (row: any) => entityId(row, 'gate_id', 'id');
export const alertIdOf = (row: any) => entityId(row, 'alert_id', 'id');
export const coverageIdOf = (row: any) => entityId(row, 'coverage_id', 'id');
export const vehicleIdOf = (row: any) => entityId(row, 'vehicle_id', 'id');

export const slotCodeOf = (row: any) => String(row?.slot_code ?? row?.label ?? '—');
export const gateTypeOf = (row: any) => String(row?.gate_type ?? row?.type ?? '');
export const alertTypeOf = (row: any) => String(row?.alert_type ?? row?.type ?? '');
export const alertMessageOf = (row: any) => String(row?.message ?? row?.description ?? '');
export const isAlertResolved = (row: any) => Boolean(row?.is_resolved) || row?.status === 'RESOLVED';
export const isCoverageConfirmed = (row: any) =>
  Boolean(row?.confirmed_by_admin) || Boolean(row?.is_confirmed);

export function slotSignalClass(status: string | undefined) {
  switch (status) {
    case 'AVAILABLE':
      return 'bg-signal-available/15 text-signal-available border-signal-available/40';
    case 'OCCUPIED':
      return 'bg-signal-occupied/15 text-signal-occupied border-signal-occupied/40';
    case 'RESERVED':
      return 'bg-signal-reserved/15 text-signal-reserved border-signal-reserved/40';
    default:
      return 'bg-signal-offline/20 text-signal-offline border-signal-offline/40';
  }
}
