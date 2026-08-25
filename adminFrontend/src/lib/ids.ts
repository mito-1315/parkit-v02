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
      return 'bg-white text-[#2E2E2E] border border-[#E5E7EB] shadow-[4px_4px_10px_rgba(0,0,0,0.04),-4px_-4px_10px_rgba(255,255,255,0.95)] hover:border-[#2E2E2E]';
    case 'OCCUPIED':
      return 'bg-[#2E2E2E] text-white border border-[#2E2E2E] shadow-[4px_4px_12px_rgba(46,46,46,0.25)]';
    case 'RESERVED':
      return 'bg-[#EEEEEE] text-[#3A3A3A] border border-[#D1D5DB] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.04)]';
    default:
      return 'bg-[#F9FAFB] text-[#9CA3AF] border border-[#E5E7EB] opacity-60';
  }
}
