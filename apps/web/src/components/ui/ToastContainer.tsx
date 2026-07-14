import React from 'react';
import { Toast } from '@/types';
import { IconX } from './Icons';

export function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map((t) => (
        <div key={t.id} className="fade-up" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--ink-3)', border: '1px solid var(--border-2)',
          borderLeft: `2px solid ${t.type === 'success' ? 'var(--forest)' : 'var(--amber)'}`,
          padding: '10px 14px', borderRadius: 'var(--radius)',
          minWidth: 280, maxWidth: 360,
        }}>
          <span style={{ fontSize: 13, color: 'var(--parchment)', fontWeight: 300, flex: 1 }}>{t.message}</span>
          <button onClick={() => removeToast(t.id)} style={{ color: 'var(--dust)', background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}>
            <IconX size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
