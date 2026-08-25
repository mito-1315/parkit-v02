<<<<<<< HEAD
export { Cameras } from './Configuration';
=======
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCameras, getCameraSlotCoverages, confirmCameraSlotCoverage } from '../api/cameras';
import { Camera, CheckCircle, AlertTriangle } from 'lucide-react';

export const Cameras: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: cameras, isLoading: camLoading } = useQuery({
    queryKey: ['cameras'],
    queryFn: getCameras,
  });

  const { data: coverages, isLoading: covLoading } = useQuery({
    queryKey: ['coverages'],
    queryFn: getCameraSlotCoverages,
  });

  const confirmMutation = useMutation({
    mutationFn: (id: number) => confirmCameraSlotCoverage(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coverages'] }),
  });

  const unconfirmedCoverages = coverages?.filter((c: any) => !c.is_confirmed) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Cameras & Conflict Resolution</h1>
        <p className="text-gray-400">Manage camera mappings and resolve slot overlap conflicts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cameras List */}
        <div className="bg-[#11131a] border border-gray-800 rounded-xl p-5 shadow-lg flex flex-col h-[600px]">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-200 mb-4">
            <Camera size={20} className="text-indigo-400" /> Camera Roster
          </h2>
          <div className="flex-1 overflow-y-auto">
            {camLoading ? <p className="text-gray-500">Loading...</p> : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 text-sm">
                    <th className="py-3 px-4 font-medium">IP Address</th>
                    <th className="py-3 px-4 font-medium">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {cameras?.map((cam: any) => (
                    <tr key={cam.id} className="border-b border-gray-800/50 hover:bg-gray-800/20">
                      <td className="py-3 px-4 text-gray-200 font-mono text-sm">{cam.ip_address}</td>
                      <td className="py-3 px-4 text-gray-400 text-sm">{cam.location_desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Conflict Resolution */}
        <div className="bg-[#11131a] border border-gray-800 rounded-xl p-5 shadow-lg flex flex-col h-[600px]">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-yellow-400 mb-4">
            <AlertTriangle size={20} /> Pending Approvals
          </h2>
          <p className="text-sm text-gray-400 mb-4">
            When multiple cameras overlap on a slot, admins must explicitly confirm which camera has the best view.
          </p>
          
          <div className="flex-1 overflow-y-auto space-y-3">
            {covLoading ? <p className="text-gray-500">Loading...</p> : unconfirmedCoverages.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">No pending conflicts to resolve.</div>
            ) : (
              unconfirmedCoverages.map((cov: any) => (
                <div key={cov.id} className="bg-[#1a1c23] border border-yellow-500/30 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-200">Slot {cov.slot_id}</span>
                      <span className="text-gray-500 text-sm">covered by</span>
                      <span className="font-mono text-indigo-300 text-sm">Camera {cov.camera_id}</span>
                    </div>
                    <div className="text-xs text-gray-400">Confidence: {(cov.confidence_score * 100).toFixed(1)}%</div>
                  </div>
                  <button
                    onClick={() => confirmMutation.mutate(cov.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-md transition-colors text-sm font-medium border border-green-500/20"
                  >
                    <CheckCircle size={16} /> Confirm
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
