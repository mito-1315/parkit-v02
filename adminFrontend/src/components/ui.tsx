import React from 'react';

export const ConfirmDialog: React.FC<{
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ title, body, confirmLabel = 'Delete', onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
    <div className="w-full max-w-md clay-modal p-7 transform transition-all animate-in zoom-in-95 duration-200">
      <h3 className="font-display text-2xl font-semibold tracking-tight text-[#2E2E2E]">{title}</h3>
      <p className="mt-2.5 text-sm text-[#6E6E6E] leading-relaxed">{body}</p>
      <div className="mt-7 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="clay-btn-secondary px-5 py-2.5 text-sm"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="clay-btn-primary px-5 py-2.5 text-sm"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

export const EmptyState: React.FC<{ title: string; hint?: string }> = ({ title, hint }) => (
  <div className="clay-inset px-6 py-12 text-center my-2">
    <p className="text-base font-semibold text-[#2E2E2E]">{title}</p>
    {hint && <p className="mt-1.5 text-xs text-[#6E6E6E] max-w-md mx-auto">{hint}</p>}
  </div>
);

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    AVAILABLE: 'text-[#2E2E2E] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[2px_2px_6px_rgba(0,0,0,0.04),-2px_-2px_6px_rgba(255,255,255,0.9)]',
    OCCUPIED: 'text-white bg-[#2E2E2E] shadow-[2px_2px_8px_rgba(46,46,46,0.25)]',
    RESERVED: 'text-[#3A3A3A] bg-[#EEEEEE] border border-[#D1D5DB]',
    ONLINE: 'text-[#2E2E2E] bg-[#FFFFFF] border border-[#E5E7EB] shadow-[2px_2px_6px_rgba(0,0,0,0.04)]',
    OFFLINE: 'text-[#8C8C8C] bg-[#F5F5F5] border border-[#E5E7EB]',
    CRITICAL: 'text-white bg-[#3A3A3A] shadow-[2px_2px_8px_rgba(58,58,58,0.25)]',
    WARNING: 'text-[#2E2E2E] bg-[#EEEEEE] border border-[#D1D5DB]',
    INFO: 'text-[#2E2E2E] bg-[#FFFFFF] border border-[#E5E7EB]',
  };
  return (
    <span className={`rounded-full px-3 py-1 font-mono text-[11px] font-medium tracking-wide ${map[status] || 'text-[#6E6E6E] bg-[#F5F5F5]'}`}>
      {status}
    </span>
  );
};
