<<<<<<< HEAD
import React from 'react';
=======
import React, { useState } from 'react';
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d

export const ConfirmDialog: React.FC<{
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ title, body, confirmLabel = 'Delete', onConfirm, onCancel }) => (
<<<<<<< HEAD
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 animate-in fade-in duration-200">
    <div className="w-full max-w-md clay-modal p-7 transform transition-all animate-in zoom-in-95 duration-200">
      <h3 className="font-display text-2xl font-semibold tracking-tight text-[#2E2E2E]">{title}</h3>
      <p className="mt-2.5 text-sm text-[#6E6E6E] leading-relaxed">{body}</p>
      <div className="mt-7 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="clay-btn-secondary px-5 py-2.5 text-sm"
=======
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div className="w-full max-w-md rounded-lg border border-border-hairline bg-bg-elevated p-5 shadow-2xl">
      <h3 className="font-display text-xl tracking-wide text-text-primary">{title}</h3>
      <p className="mt-2 text-sm text-text-muted">{body}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-border-hairline px-3 py-1.5 text-sm text-text-muted hover:bg-bg-surface"
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
<<<<<<< HEAD
          className="clay-btn-primary px-5 py-2.5 text-sm"
=======
          className="rounded-md bg-signal-occupied px-3 py-1.5 text-sm font-medium text-white"
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

export const EmptyState: React.FC<{ title: string; hint?: string }> = ({ title, hint }) => (
<<<<<<< HEAD
  <div className="clay-inset px-6 py-12 text-center my-2">
    <p className="text-base font-semibold text-[#2E2E2E]">{title}</p>
    {hint && <p className="mt-1.5 text-xs text-[#6E6E6E] max-w-md mx-auto">{hint}</p>}
=======
  <div className="rounded-lg border border-dashed border-border-hairline bg-bg-surface px-4 py-10 text-center">
    <p className="text-sm font-medium text-text-primary">{title}</p>
    {hint && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
  </div>
);

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
<<<<<<< HEAD
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
=======
    AVAILABLE: 'text-signal-available bg-signal-available/10',
    OCCUPIED: 'text-signal-occupied bg-signal-occupied/10',
    RESERVED: 'text-signal-reserved bg-signal-reserved/10',
    ONLINE: 'text-signal-available bg-signal-available/10',
    OFFLINE: 'text-signal-offline bg-signal-offline/15',
    CRITICAL: 'text-signal-occupied bg-signal-occupied/10',
    WARNING: 'text-signal-reserved bg-signal-reserved/10',
    INFO: 'text-accent-brand bg-accent-brand/10',
  };
  return (
    <span className={`rounded px-2 py-0.5 font-mono text-[11px] tracking-wide ${map[status] || 'text-text-muted bg-bg-elevated'}`}>
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
      {status}
    </span>
  );
};
<<<<<<< HEAD
=======

export function useConfirm() {
  const [pending, setPending] = useState<null | { title: string; body: string; action: () => void }>(null);
  const dialog = pending ? (
    <ConfirmDialog
      title={pending.title}
      body={pending.body}
      onCancel={() => setPending(null)}
      onConfirm={() => {
        pending.action();
        setPending(null);
      }}
    />
  ) : null;
  return { confirm: setPending, dialog };
}
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
