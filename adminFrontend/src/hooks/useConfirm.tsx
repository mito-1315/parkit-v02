import { useState } from 'react';
import { ConfirmDialog } from '../components/ui';

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
