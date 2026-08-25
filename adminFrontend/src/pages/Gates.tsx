<<<<<<< HEAD
export { Gates } from './Configuration';
=======
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getGates } from '../api/gates';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowRightLeft, DoorOpen, DoorClosed } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Gates: React.FC = () => {
  const { activeFacilityId } = useAuthStore();
  const { data: gates, isLoading } = useQuery({
    queryKey: ['gates'],
    queryFn: getGates,
  });

  const facilityGates = gates?.filter((g: any) => g.facility_id === activeFacilityId) ?? [];
  const entryGates = facilityGates.filter((g: any) => g.type === 'ENTRY');
  const exitGates = facilityGates.filter((g: any) => g.type === 'EXIT');

  if (!activeFacilityId) {
    return (
      <div className="space-y-4">
        <Header />
        <div className="bg-[#11131a] border border-gray-800 rounded-xl p-10 text-center text-gray-500 text-sm">
          Please select a facility to view its gates.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Header />
        <p className="text-gray-500 text-sm">Loading gates…</p>
      </div>
    );
  }

  if (facilityGates.length === 0) {
    return (
      <div className="space-y-4">
        <Header />
        <div className="bg-[#11131a] border border-gray-800 rounded-xl p-10 text-center text-gray-500 text-sm">
          No gates configured for this facility.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Header />

      {/* ── Entry Gates ─────────────────────────────────────────────────── */}
      <GateSection
        title="Entry Gates"
        subtitle="Place these QR codes at entry points. Parkit users scan them to begin a parking session."
        color="green"
        icon={<DoorOpen size={16} />}
        gates={entryGates}
        emptyText="No entry gates configured."
      />

      {/* ── Exit Gates ──────────────────────────────────────────────────── */}
      <GateSection
        title="Exit Gates"
        subtitle="Place these QR codes at exit points. Parkit users scan them to end and pay for their session."
        color="orange"
        icon={<DoorClosed size={16} />}
        gates={exitGates}
        emptyText="No exit gates configured."
      />
    </div>
  );
};

const Header: React.FC = () => (
  <div>
    <h1 className="text-2xl font-bold text-gray-100">Gates &amp; QR Codes</h1>
    <p className="text-gray-400 text-sm mt-1">
      Print these QR codes and affix them at the respective gates so Parkit users can scan them.
    </p>
  </div>
);

interface GateSectionProps {
  title: string;
  subtitle: string;
  color: 'green' | 'orange';
  icon: React.ReactNode;
  gates: any[];
  emptyText: string;
}

const GateSection: React.FC<GateSectionProps> = ({
  title, subtitle, color, icon, gates, emptyText,
}) => {
  const accent = color === 'green'
    ? { border: 'border-green-500/30', badge: 'bg-green-500/10 text-green-400', dot: 'bg-green-500', bar: 'from-green-500 to-emerald-400' }
    : { border: 'border-orange-500/30', badge: 'bg-orange-500/10 text-orange-400', dot: 'bg-orange-500', bar: 'from-orange-500 to-amber-400' };

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-2 h-2 rounded-full ${accent.dot}`} />
        <h2 className="text-base font-semibold text-gray-200">{title}</h2>
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${accent.badge}`}>
          {gates.length} gate{gates.length !== 1 ? 's' : ''}
        </span>
      </div>
      <p className="text-gray-500 text-xs mb-4 -mt-2">{subtitle}</p>

      {gates.length === 0 ? (
        <div className="bg-[#11131a] border border-gray-800 rounded-xl p-6 text-center text-gray-600 text-sm">
          {emptyText}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {gates.map((gate: any) => (
            <GateCard key={gate.id} gate={gate} accent={accent} icon={icon} />
          ))}
        </div>
      )}
    </section>
  );
};

interface GateCardProps {
  gate: any;
  accent: { border: string; badge: string; dot: string; bar: string };
  icon: React.ReactNode;
}

const GateCard: React.FC<GateCardProps> = ({ gate, accent, icon }) => {
  const payload = JSON.stringify({ gateId: gate.id, type: gate.type });

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>Gate QR — ${gate.name}</title>
      <style>
        body{font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fff}
        h2{margin:16px 0 4px;font-size:22px}
        p{margin:0 0 12px;color:#555;font-size:13px}
        .badge{background:#f1f5f9;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:600;letter-spacing:.5px;margin-bottom:16px;display:inline-block}
        .mono{font-family:monospace;font-size:11px;color:#888;margin-top:12px}
      </style></head>
      <body>
        <p style="font-size:13px;font-weight:700;letter-spacing:1px;color:#333;margin-bottom:4px">PARKIT</p>
        <h2>${gate.name}</h2>
        <span class="badge">${gate.type} GATE</span>
        <div id="qr"></div>
        <p class="mono">${payload}</p>
        <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
        <script>QRCode.toCanvas(document.createElement('canvas'), ${JSON.stringify(payload)}, {width:220}, function(e,c){if(!e)document.getElementById('qr').appendChild(c)});</script>
      </body></html>
    `);
    w.document.close();
    setTimeout(() => w.print(), 600);
  };

  return (
    <div className={`bg-[#11131a] border ${accent.border} rounded-xl overflow-hidden`}>
      {/* Accent bar */}
      <div className={`h-1 bg-gradient-to-r ${accent.bar}`} />

      <div className="p-5 flex flex-col items-center gap-4">
        {/* Gate name + badge */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-2 text-gray-300">
            {icon}
            <span className="font-semibold text-base">{gate.name}</span>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${accent.badge}`}>
            {gate.type}
          </span>
        </div>

        {/* QR */}
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <QRCodeSVG value={payload} size={140} />
        </div>

        {/* Payload */}
        <p className="text-xs text-gray-600 font-mono">{payload}</p>

        {/* Print */}
        <button
          onClick={handlePrint}
          className="w-full text-xs font-semibold text-gray-400 hover:text-gray-200 border border-gray-700 hover:border-gray-500 rounded-lg py-2 transition-colors"
        >
          Print QR
        </button>
      </div>
    </div>
  );
};
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
