<<<<<<< HEAD
export { Facilities } from './Configuration';
=======
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFacilities, createFacility, deleteFacility, getZones, createZone, deleteZone } from '../api/facilities';
import { Building2, Plus, Trash2, MapPin, Map } from 'lucide-react';

export const Facilities: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedFacility, setSelectedFacility] = useState<number | null>(null);

  const { data: facilities, isLoading: facLoading } = useQuery({
    queryKey: ['facilities'],
    queryFn: getFacilities,
  });

  const { data: zones, isLoading: zonesLoading } = useQuery({
    queryKey: ['facilities', selectedFacility, 'zones'],
    queryFn: () => getZones(selectedFacility!),
    enabled: !!selectedFacility,
  });

  const createFacMutation = useMutation({
    mutationFn: (name: string) => createFacility({ name, address: 'TBD' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['facilities'] }),
  });

  const deleteFacMutation = useMutation({
    mutationFn: (id: number) => deleteFacility(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facilities'] });
      setSelectedFacility(null);
    },
  });

  const createZoneMutation = useMutation({
    mutationFn: (name: string) => createZone(selectedFacility!, { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['facilities', selectedFacility, 'zones'] }),
  });

  const handleAddFacility = () => {
    const name = prompt('Enter Facility Name:');
    if (name) createFacMutation.mutate(name);
  };

  const handleAddZone = () => {
    const name = prompt('Enter Zone Name:');
    if (name) createZoneMutation.mutate(name);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Facilities & Zones</h1>
        <p className="text-gray-400">Manage physical locations and parking areas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Facilities List */}
        <div className="bg-[#11131a] border border-gray-800 rounded-xl p-5 shadow-lg lg:col-span-1 flex flex-col h-[calc(100vh-12rem)]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-200">
              <Building2 size={20} className="text-indigo-400" /> Facilities
            </h2>
            <button onClick={handleAddFacility} className="p-1.5 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 rounded-md transition-colors">
              <Plus size={16} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2">
            {facLoading && <p className="text-gray-500">Loading...</p>}
            {facilities?.map((fac: any) => (
              <div
                key={fac.id}
                onClick={() => setSelectedFacility(fac.id)}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedFacility === fac.id
                    ? 'bg-indigo-600/10 border-indigo-500/50 text-indigo-300'
                    : 'bg-[#1a1c23] border-gray-700/50 hover:border-gray-600 text-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin size={16} className={selectedFacility === fac.id ? 'text-indigo-400' : 'text-gray-500'} />
                  <span className="font-medium">{fac.name}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteFacMutation.mutate(fac.id); }}
                  className="text-red-400/50 hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Zones List */}
        <div className="bg-[#11131a] border border-gray-800 rounded-xl p-5 shadow-lg lg:col-span-2 flex flex-col h-[calc(100vh-12rem)]">
          {selectedFacility ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-200">
                  <Map size={20} className="text-purple-400" /> Zones
                </h2>
                <button onClick={handleAddZone} className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-purple-600/20 transition-colors">
                  <Plus size={16} /> Add Zone
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {zonesLoading && <p className="text-gray-500">Loading...</p>}
                {zones?.length === 0 ? (
                  <div className="text-center text-gray-500 mt-10">No zones found for this facility.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400 text-sm">
                        <th className="py-3 px-4 font-medium">Zone Name</th>
                        <th className="py-3 px-4 font-medium w-24">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {zones?.map((zone: any) => (
                        <tr key={zone.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                          <td className="py-3 px-4 text-gray-200 font-medium">{zone.name}</td>
                          <td className="py-3 px-4">
                            <button className="text-red-400/50 hover:text-red-400 transition-colors p-1">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
              <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center">
                <Map size={24} className="text-gray-400" />
              </div>
              <p>Select a facility to manage its zones</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
