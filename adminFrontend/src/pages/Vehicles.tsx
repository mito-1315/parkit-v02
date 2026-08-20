import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchVehicles } from '../api/sessions';
import { useAuthStore } from '../store/authStore';
import { EmptyState, StatusBadge } from '../components/ui';
import { sessionIdOf } from '../lib/ids';

export const Vehicles: React.FC = () => {
  const { activeFacilityId } = useAuthStore();
  const [plate, setPlate] = useState('');
  const [submitted, setSubmitted] = useState('');
  const { data, isFetching, isError } = useQuery({
    queryKey: ['vehicle-search', submitted, activeFacilityId],
    queryFn: () => searchVehicles(submitted, activeFacilityId),
    enabled: submitted.length >= 2,
  });

  const selected = data?.[0];
  const active = selected?.parking_sessions?.find((s: any) => s.status === 'ACTIVE' || s.status === 'RESERVED');

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl tracking-wide">VEHICLES</h1>
        <p className="text-sm text-text-muted">Search by plate to see parked status and history.</p>
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(plate.trim());
        }}
      >
        <input
          value={plate}
          onChange={(e) => setPlate(e.target.value.toUpperCase())}
          placeholder="TN01AB1234"
          className="w-72 rounded border border-border-hairline bg-bg-elevated px-3 py-2 font-mono"
        />
        <button className="rounded bg-accent-brand px-4 py-2 text-sm text-white">Search</button>
      </form>
      {submitted.length < 2 && <EmptyState title="Enter at least 2 characters of a plate." hint="Example: ABC1" />}
      {isFetching && <p className="text-text-muted">Searching…</p>}
      {isError && <EmptyState title="Vehicle search failed." hint="Check that the plate query is valid." />}
      {submitted.length >= 2 && !isFetching && !data?.length && (
        <EmptyState title={`No vehicles matched “${submitted}”.`} hint="Try a shorter prefix of the plate." />
      )}
      {data?.map((vehicle: any) => (
        <div key={vehicle.vehicle_id} className="rounded-lg border border-border-hairline bg-bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="font-mono text-xl">{vehicle.license_plate}</p>
              <p className="text-xs text-text-muted">
                {vehicle.make} {vehicle.model} · {vehicle.user?.name}
              </p>
            </div>
            <StatusBadge status={active ? 'OCCUPIED' : 'AVAILABLE'} />
          </div>
          <p className="mb-2 text-sm text-text-muted">
            {active ? `Currently parked in ${active.slot?.slot_code ?? active.slot_id}` : 'Not parked'}
          </p>
          <h3 className="mb-2 text-xs uppercase tracking-wider text-text-muted">History</h3>
          {!vehicle.parking_sessions?.length ? (
            <EmptyState title="No parking history for this vehicle yet." />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-text-muted">
                <tr>
                  <th className="py-1">Status</th>
                  <th>Slot</th>
                  <th>Entry</th>
                  <th>Exit</th>
                </tr>
              </thead>
              <tbody>
                {vehicle.parking_sessions.map((s: any) => (
                  <tr key={sessionIdOf(s)} className="border-t border-border-hairline font-mono text-xs">
                    <td className="py-2">{s.status}</td>
                    <td>{s.slot?.slot_code ?? s.slot_id}</td>
                    <td>{s.entry_time ? new Date(s.entry_time).toLocaleString() : '—'}</td>
                    <td>{s.exit_time ? new Date(s.exit_time).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
};
