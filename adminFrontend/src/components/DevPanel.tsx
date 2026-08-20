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
  }, [socketManager.getDashboardSocket(), socketManager.getAlertsSocket()]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg z-50 hover:bg-gray-700 transition-colors"
        title="Open Dev Panel"
      >
        <Terminal size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-gray-900 text-green-400 font-mono text-xs shadow-2xl rounded-lg overflow-hidden z-50 border border-gray-700">
      <div className="flex justify-between items-center bg-gray-800 p-2 border-b border-gray-700">
        <span className="font-bold flex items-center gap-2">
          <Terminal size={16} /> Socket Events
        </span>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
          <X size={16} />
        </button>
      </div>
      <div className="p-2 h-64 overflow-y-auto">
        {events.length === 0 ? (
          <div className="text-gray-500 italic">No events yet...</div>
        ) : (
          events.map((ev, i) => (
            <div key={i} className="mb-2 border-b border-gray-800 pb-1">
              <div className="text-gray-400">{ev.time.toLocaleTimeString()} - <span className="text-blue-400">{ev.type}</span></div>
              <pre className="whitespace-pre-wrap mt-1">{JSON.stringify(ev.data, null, 2)}</pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
