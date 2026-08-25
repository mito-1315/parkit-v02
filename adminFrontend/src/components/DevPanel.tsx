import React, { useEffect, useState } from 'react';
import { socketManager } from '../sockets/socketManager';
import { Terminal, X } from 'lucide-react';

export const DevPanel: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const dashboard = socketManager.getDashboardSocket();
    const alerts = socketManager.getAlertsSocket();

    const addEvent = (type: string, data: any) => {
      setEvents((prev) => [{ type, data, time: new Date() }, ...prev].slice(0, 20));
    };

    if (dashboard) {
      dashboard.onAny((event, ...args) => addEvent(`dashboard:${event}`, args));
    }
    if (alerts) {
      alerts.onAny((event, ...args) => addEvent(`alerts:${event}`, args));
    }

    return () => {
      if (dashboard) dashboard.offAny();
      if (alerts) alerts.offAny();
    };
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-[#2E2E2E] text-white shadow-[6px_6px_16px_rgba(46,46,46,0.3)] z-50 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="Open Socket Dev Panel"
      >
        <Terminal size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 clay-modal overflow-hidden z-50 p-4 border border-[#E5E7EB] animate-in slide-in-from-bottom-5 duration-200">
      <div className="flex justify-between items-center pb-3 mb-3 border-b border-[#E5E7EB]">
        <span className="font-display font-semibold text-sm flex items-center gap-2 text-[#2E2E2E]">
          <Terminal size={16} /> Socket Events
        </span>
        <button
          onClick={() => setIsOpen(false)}
          className="text-[#6E6E6E] hover:text-[#2E2E2E] p-1 rounded-lg hover:bg-[#F5F5F5] transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>
      <div className="clay-inset p-3 h-64 overflow-y-auto font-mono text-xs text-[#3A3A3A]">
        {events.length === 0 ? (
          <div className="text-[#8C8C8C] italic text-center py-8">No events yet...</div>
        ) : (
          events.map((ev, i) => (
            <div key={i} className="mb-2.5 border-b border-[#E5E7EB] pb-2 last:border-none last:pb-0">
              <div className="text-[10px] text-[#6E6E6E] font-medium">
                {ev.time.toLocaleTimeString()} — <span className="text-[#2E2E2E] font-semibold">{ev.type}</span>
              </div>
              <pre className="whitespace-pre-wrap mt-1 text-[11px] bg-white p-2 rounded-xl border border-[#E5E7EB] text-[#2E2E2E]">
                {JSON.stringify(ev.data, null, 2)}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
