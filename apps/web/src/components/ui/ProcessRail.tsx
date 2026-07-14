import React from 'react';
import { ViewKey } from '@/types';
import { IconCheck } from './Icons';

const STEPS: { key: ViewKey; label: string }[] = [
  { key: 'upload',    label: 'Upload' },
  { key: 'analyzing', label: 'Análise IA' },
  { key: 'checklist', label: 'Due Diligence' },
];

export function ProcessRail({ current }: { current: ViewKey }) {
  const order: ViewKey[] = ['upload', 'analyzing', 'checklist'];
  const currentIdx = order.indexOf(current);

  return (
    <div className="process-rail" style={{ padding: '0 4px' }}>
      {STEPS.map((s, i) => {
        const stepIdx = order.indexOf(s.key);
        const isDone   = stepIdx < currentIdx;
        const isActive = stepIdx === currentIdx;
        return (
          <React.Fragment key={s.key}>
            <div className={`process-step ${isDone ? 'done' : isActive ? 'active' : ''}`}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 18, height: 18,
                border: `1px solid ${isDone ? 'var(--forest)' : isActive ? 'var(--parchment-2)' : 'var(--border-2)'}`,
                borderRadius: 2,
                background: isDone ? 'var(--forest)' : 'transparent',
                color: isDone ? 'var(--parchment)' : isActive ? 'var(--parchment)' : 'var(--dust)',
                fontSize: 9,
              }}>
                {isDone ? <IconCheck size={9} /> : i + 1}
              </span>
              {s.label}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`process-connector ${isDone ? 'done' : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
