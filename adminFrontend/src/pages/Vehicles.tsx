import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchVehicles } from '../api/sessions';
import { useAuthStore } from '../store/authStore';
import { EmptyState, StatusBadge } from '../components/ui';
import { sessionIdOf } from '../lib/ids';
<<<<<<< HEAD
import { Search } from 'lucide-react';
=======
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d

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
<<<<<<< HEAD
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#2E2E2E]">VEHICLES</h1>
        <p className="text-sm text-[#6E6E6E] mt-1">Search by license plate to view active occupancy and history.</p>
      </div>

      <form
        className="flex gap-3 max-w-md"
=======
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl tracking-wide">VEHICLES</h1>
        <p className="text-sm text-text-muted">Search by plate to see parked status and history.</p>
      </div>
      <form
        className="flex gap-2"
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(plate.trim());
        }}
      >
<<<<<<< HEAD
        <div className="relative flex-1">
          <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C8C8C]" />
          <input
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            placeholder="e.g. TN01AB1234"
            className="w-full clay-input py-2.5 pl-11 pr-4 font-mono text-sm uppercase font-bold text-[#2E2E2E]"
          />
        </div>
        <button type="submit" className="clay-btn-primary px-6 py-2.5 text-xs font-semibold">
          Search
        </button>
      </form>

      {submitted.length < 2 && (
        <EmptyState title="Enter at least 2 characters of a plate." hint="Example: ABC or TN01" />
      )}
      {isFetching && <p className="text-sm text-[#6E6E6E] py-4">Searching database…</p>}
=======
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
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
      {isError && <EmptyState title="Vehicle search failed." hint="Check that the plate query is valid." />}
      {submitted.length >= 2 && !isFetching && !data?.length && (
        <EmptyState title={`No vehicles matched “${submitted}”.`} hint="Try a shorter prefix of the plate." />
      )}
<<<<<<< HEAD

      {data?.map((vehicle: any) => (
        <div key={vehicle.vehicle_id} className="clay-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
            <div>
              <p className="font-mono text-2xl font-bold text-[#2E2E2E]">{vehicle.license_plate}</p>
              <p className="text-xs font-medium text-[#6E6E6E] mt-0.5">
                {vehicle.make} {vehicle.model} · Owner: <span className="text-[#2E2E2E] font-semibold">{vehicle.user?.name}</span>
=======
      {data?.map((vehicle: any) => (
        <div key={vehicle.vehicle_id} className="rounded-lg border border-border-hairline bg-bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="font-mono text-xl">{vehicle.license_plate}</p>
              <p className="text-xs text-text-muted">
                {vehicle.make} {vehicle.model} · {vehicle.user?.name}
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
              </p>
            </div>
            <StatusBadge status={active ? 'OCCUPIED' : 'AVAILABLE'} />
          </div>
<<<<<<< HEAD

          <div className="clay-inset p-3.5 text-xs font-semibold text-[#2E2E2E]">
            {active ? (
              <span>Currently parked in Slot: <span className="font-bold">{active.slot?.slot_code ?? active.slot_id}</span></span>
            ) : (
              <span className="text-[#6E6E6E]">Vehicle is not currently parked in this facility.</span>
            )}
          </div>

          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#6E6E6E]">Session History</h3>
            {!vehicle.parking_sessions?.length ? (
              <EmptyState title="No parking history for this vehicle yet." />
            ) : (
              <div className="clay-table-container">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F8F9FA] text-xs font-semibold uppercase tracking-wider text-[#6E6E6E] border-b border-[#E5E7EB]">
                    <tr>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Slot</th>
                      <th className="py-2.5 px-4">Entry Time</th>
                      <th className="py-2.5 px-4">Exit Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {vehicle.parking_sessions.map((s: any) => (
                      <tr key={sessionIdOf(s)} className="hover:bg-[#F8F9FA] transition-colors font-mono text-xs text-[#2E2E2E]">
                        <td className="py-2.5 px-4">
                          <StatusBadge status={s.status} />
                        </td>
                        <td className="py-2.5 px-4 font-bold">{s.slot?.slot_code ?? s.slot_id}</td>
                        <td className="py-2.5 px-4 text-[#6E6E6E]">{s.entry_time ? new Date(s.entry_time).toLocaleString() : '—'}</td>
                        <td className="py-2.5 px-4 text-[#6E6E6E]">{s.exit_time ? new Date(s.exit_time).toLocaleString() : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
=======
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
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
        </div>
      ))}
    </div>
  );
};
