import React, { useState, useEffect } from 'react';
import { IconCheck } from '@/components/ui/Icons';

const ANALYSIS_STEPS = [
  { text: 'Transferindo para armazenamento seguro', time: 900 },
  { text: 'Extraindo texto via PaddleOCR', time: 1800 },
  { text: 'Processando com LLaMA 3 · Groq', time: 2400 },
  { text: 'Estruturando matriz de due diligence', time: 1200 },
];

export function AnalyzingView({ onComplete, isAnalyzing }: { onComplete: () => void, isAnalyzing: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step < ANALYSIS_STEPS.length - 1) {
      const t = setTimeout(() => setStep(s => s + 1), ANALYSIS_STEPS[step].time);
      return () => clearTimeout(t);
    } else if (!isAnalyzing) {
      const t = setTimeout(() => {
        setStep(ANALYSIS_STEPS.length);
        setTimeout(onComplete, 600);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [step, isAnalyzing, onComplete]);

  const progress = Math.round((step / ANALYSIS_STEPS.length) * 100);

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: 480 }}>
        <div className="card-doc" style={{ padding: '40px 36px' }}>
          {/* Cabeçalho */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
            <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
              <svg viewBox="0 0 36 36" style={{ width: 36, height: 36, transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="14" fill="none" stroke="var(--ink-3)" strokeWidth="2" />
                <circle
                  cx="18" cy="18" r="14"
                  fill="none" stroke="var(--forest)" strokeWidth="2"
                  strokeDasharray={`${2 * Math.PI * 14}`}
                  strokeDashoffset={`${2 * Math.PI * 14 * (1 - progress / 100)}`}
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                  strokeLinecap="round"
                />
              </svg>
              <span className="font-mono-doc" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'var(--dust-3)' }}>
                {progress}%
              </span>
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 400, color: 'var(--parchment)' }}>Agente IA em operação</p>
              <p style={{ fontSize: 12, color: 'var(--dust)', marginTop: 2, fontWeight: 300 }}>Análise de contexto jurídico</p>
            </div>
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {ANALYSIS_STEPS.map((s, i) => {
              const isDone   = i < step;
              const isActive = i === step;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                  borderRadius: 'var(--radius)',
                  background: isActive ? 'var(--ink-3)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--border-2)' : 'transparent'}`,
                  transition: 'all 0.3s ease',
                }}>
                  {/* indicador */}
                  <div style={{
                    width: 20, height: 20, borderRadius: 2, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isDone ? 'var(--forest)' : isActive ? 'var(--ink)' : 'transparent',
                    border: `1px solid ${isDone ? 'var(--forest)' : isActive ? 'var(--border-3)' : 'var(--border)'}`,
                  }}>
                    {isDone
                      ? <IconCheck size={10} />
                      : isActive
                        ? <span className="spin" style={{ display: 'inline-block', width: 10, height: 10, border: '1.5px solid rgba(240,235,225,0.2)', borderTopColor: 'var(--parchment)', borderRadius: '50%' }} />
                        : null
                    }
                  </div>
                  <span className="font-mono-doc" style={{
                    fontSize: 11, letterSpacing: '0.04em',
                    color: isDone ? 'var(--forest)' : isActive ? 'var(--parchment-2)' : 'var(--dust)',
                  }}>
                    {s.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
