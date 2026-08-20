import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getGates } from '../api/gates';
import { QRCodeSVG } from 'qrcode.react';
import { Video } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Gates: React.FC = () => {
  const { activeFacilityId } = useAuthStore();
  const { data: gates, isLoading } = useQuery({
    queryKey: ['gates'],
    queryFn: getGates,
  });

  const facilityGates = gates?.filter((g: any) => g.facility_id === activeFacilityId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Gates & QR Codes</h1>
        <p className="text-gray-400">Print these QR codes and place them at the respective gates.</p>
      </div>

      {!activeFacilityId ? (
        <div className="bg-[#11131a] border border-gray-800 rounded-xl p-8 text-center text-gray-400">
          Please select a facility to view its gates.
        </div>
      ) : isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : facilityGates?.length === 0 ? (
        <div className="bg-[#11131a] border border-gray-800 rounded-xl p-8 text-center text-gray-400">
          No gates configured for this facility.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilityGates?.map((gate: any) => (
            <div key={gate.id} className="bg-[#11131a] border border-gray-800 rounded-xl p-6 flex flex-col items-center shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                <Video className="text-blue-400" size={24} />
              </div>
              
              <h3 className="text-xl font-bold text-gray-100 mb-1">{gate.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold mb-6 ${
                gate.type === 'ENTRY' ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'
              }`}>
                {gate.type} GATE
              </span>

              <div className="bg-white p-4 rounded-xl shadow-inner mb-4">
                <QRCodeSVG value={JSON.stringify({ gateId: gate.id })} size={150} />
              </div>
              
              <p className="text-xs text-gray-500 font-mono">Payload: {`{"gateId": ${gate.id}}`}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
