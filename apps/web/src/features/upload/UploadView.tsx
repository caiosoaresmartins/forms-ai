import React, { useState } from 'react';
import { IconUpload, IconFile } from '@/components/ui/Icons';

export function UploadView({ onUpload }: { onUpload: (file: File) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: 600 }}>
        <p className="eyebrow" style={{ textAlign: 'center', marginBottom: 12 }}>Nova análise</p>
        <h2 className="display-heading" style={{ fontSize: 32, color: 'var(--parchment)', textAlign: 'center', marginBottom: 8 }}>Envie o formulário</h2>
        <p style={{ fontSize: 14, color: 'var(--dust-2)', textAlign: 'center', marginBottom: 40, fontWeight: 300 }}>
          Suportamos PDF até 50 MB · A IA analisa o contexto em segundos
        </p>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          style={{
            border: `1px dashed ${isDragging ? 'var(--forest)' : file ? 'var(--forest)' : 'var(--border-2)'}`,
            borderRadius: 'var(--radius)',
            padding: '48px 32px',
            textAlign: 'center',
            background: isDragging ? 'rgba(26,107,85,0.06)' : 'var(--ink-2)',
            transition: 'all 0.2s ease',
            cursor: 'default',
          }}
        >
          {!file ? (
            <>
              <div style={{ color: 'var(--dust)', marginBottom: 20, display: 'inline-flex' }}>
                <IconUpload size={36} />
              </div>
              <p style={{ fontSize: 14, color: 'var(--parchment-2)', marginBottom: 6, fontWeight: 300 }}>Arraste e solte o PDF aqui</p>
              <p style={{ fontSize: 12, color: 'var(--dust)', marginBottom: 24 }}>ou selecione do seu computador</p>
              <label style={{ cursor: 'pointer' }}>
                <span className="btn-secondary" style={{ fontSize: 12, padding: '8px 20px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <IconFile size={14} /> Selecionar arquivo
                </span>
                <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] ?? null)} />
              </label>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: 'var(--ink)', border: '1px solid var(--border-2)',
                borderRadius: 'var(--radius)', padding: '12px 20px', width: '100%', maxWidth: 400,
              }}>
                <div style={{ color: 'var(--forest)', flexShrink: 0 }}><IconFile size={20} /></div>
                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <p style={{ fontSize: 13, fontWeight: 400, color: 'var(--parchment)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                  <p className="font-mono-doc" style={{ fontSize: 10, color: 'var(--dust)', marginTop: 3 }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--forest)', flexShrink: 0 }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setFile(null)} className="btn-secondary" style={{ fontSize: 12, padding: '9px 20px' }}>Trocar arquivo</button>
                <button onClick={() => file && onUpload(file)} className="btn-forest" style={{ fontSize: 12, padding: '9px 24px' }}>
                  Analisar com IA →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Formatos suportados */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
          {['Contratos imobiliários', 'Formulários bancários', 'Fichas cadastrais', 'Procurações'].map(tag => (
            <span key={tag} className="font-mono-doc" style={{ fontSize: 10, color: 'var(--dust)', letterSpacing: '0.06em' }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
