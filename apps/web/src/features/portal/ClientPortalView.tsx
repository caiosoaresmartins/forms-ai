import React from 'react';
import { Party, Document } from '@/types';
import { IconCheck } from '@/components/ui/Icons';

export function ClientPortalView({ parties, setParties, addToast, onBack, formId }: any) {
  const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>, partyIdx: number, docId: string, current: string) => {
    if (current === 'uploaded' || current === 'updating') return;
    const file = e.target.files?.[0];
    if (!file) return;

    setParties((ps: Party[]) => ps.map((p, i) => i !== partyIdx ? p : {
      ...p, documents: p.documents.map(d => d.id === docId ? { ...d, status: 'updating' } : d),
    }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'supporting');
      formData.append('formId', formId);

      const upRes = await fetch('/api/forms/upload', { method: 'POST', body: formData });
      const upData = await upRes.json();
      if (!upRes.ok) throw new Error(upData.detail || 'Erro no upload');

      setParties((ps: Party[]) => ps.map((p, i) => i !== partyIdx ? p : {
        ...p, documents: p.documents.map(d => d.id === docId ? { ...d, status: 'uploaded', path: upData.path } : d),
      }));
      addToast('Documento recebido e anexado.', 'success');
    } catch(err: any) {
      addToast('Erro ao anexar arquivo', 'error');
      setParties((ps: Party[]) => ps.map((p, i) => i !== partyIdx ? p : {
        ...p, documents: p.documents.map(d => d.id === docId ? { ...d, status: 'pending' } : d),
      }));
    }
  };

  return (
    <div style={{ flex: 1, padding: '40px 32px', maxWidth: 880, margin: '0 auto', width: '100%' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dust)', fontSize: 12, marginBottom: 32, letterSpacing: '0.06em', fontFamily: 'DM Mono' }}>
        ← VOLTAR PARA A MATRIZ
      </button>

      <div className="fade-up" style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 className="display-heading" style={{ fontSize: 32, color: 'var(--parchment)', marginBottom: 8 }}>Portal de Envio</h1>
        <p style={{ fontSize: 14, color: 'var(--dust-2)', fontWeight: 300 }}>Por favor, anexe os documentos solicitados abaixo para darmos andamento ao seu processo.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {Array.isArray(parties) && parties.map((party: Party, pIdx: number) => (
          <div key={party.id} className="card-doc fade-up" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--ink-3)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 400, color: 'var(--parchment)' }}>{party.partyName}</h3>
            </div>
            <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {party.documents.map((doc: Document) => {
                const isUploaded = doc.status === 'uploaded';
                const isUpdating = doc.status === 'updating';
                return (
                  <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, padding: '16px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--ink)' }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 400, color: isUploaded ? 'var(--dust-3)' : 'var(--parchment)' }}>{doc.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--dust)', marginTop: 4 }}>{isUploaded ? 'Documento recebido' : 'Pendente de envio'}</p>
                    </div>
                    {isUpdating ? (
                      <div style={{ padding: '8px 24px' }}>
                        <span className="spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(240,235,225,0.3)', borderTopColor: 'var(--parchment)', borderRadius: '50%' }} />
                      </div>
                    ) : isUploaded ? (
                      <button disabled style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'rgba(26,107,85,0.1)', color: 'var(--forest)', border: '1px solid rgba(26,107,85,0.3)', borderRadius: 'var(--radius)', fontSize: 12 }}>
                        <IconCheck size={12} /> Enviado
                      </button>
                    ) : (
                      <label style={{ cursor: 'pointer' }}>
                        <span className="btn-primary" style={{ padding: '8px 24px', fontSize: 12 }}>Anexar Arquivo</span>
                        <input type="file" style={{ display: 'none' }} onChange={(e) => handleToggle(e, pIdx, doc.id, doc.status)} />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
