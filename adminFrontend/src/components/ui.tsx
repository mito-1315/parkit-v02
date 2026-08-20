import React, { useState } from 'react';

export const ConfirmDialog: React.FC<{
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ title, body, confirmLabel = 'Delete', onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div className="w-full max-w-md rounded-lg border border-border-hairline bg-bg-elevated p-5 shadow-2xl">
      <h3 className="font-display text-xl tracking-wide text-text-primary">{title}</h3>
      <p className="mt-2 text-sm text-text-muted">{body}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-border-hairline px-3 py-1.5 text-sm text-text-muted hover:bg-bg-surface"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-md bg-signal-occupied px-3 py-1.5 text-sm font-medium text-white"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

export const EmptyState: React.FC<{ title: string; hint?: string }> = ({ title, hint }) => (
  <div className="rounded-lg border border-dashed border-border-hairline bg-bg-surface px-4 py-10 text-center">
    <p className="text-sm font-medium text-text-primary">{title}</p>
    {hint && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
  </div>
);

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
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
      {status}
    </span>
  );
};

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
