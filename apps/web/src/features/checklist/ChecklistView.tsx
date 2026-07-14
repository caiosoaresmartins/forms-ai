import React, { useState } from 'react';
import { Party, Document } from '@/types';
import { IconUpload, IconInfo, IconCheck } from '@/components/ui/Icons';

export function ChecklistView({ parties, setParties, formId, addToast, originalFile, onOpenClientPortal }: {
  parties: Party[]; setParties: React.Dispatch<React.SetStateAction<Party[]>>;
  formId: string | null; addToast: (msg: string, type?: string) => void;
  originalFile: File | null; onOpenClientPortal: () => void;
}) {
  const safeParties = Array.isArray(parties) ? parties : [];
  const total    = safeParties.reduce((a, p) => a + (p.documents?.length || 0), 0);
  const uploaded = safeParties.reduce((a, p) => a + (p.documents?.filter(d => d.status === 'uploaded').length || 0), 0);
  const pct      = total === 0 ? 0 : Math.round((uploaded / total) * 100);

  const handleDownloadOriginal = () => {
    if (!originalFile) return;
    const url = URL.createObjectURL(originalFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = originalFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFillForm = async () => {
    if (pct < 100) {
      addToast('Anexe todos os documentos antes de preencher o formulário.', 'error');
      return;
    }
    if (!formId) return;

    addToast('Preenchendo formulário automaticamente com IA...', 'default');
    
    try {
      const res = await fetch('/api/forms/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formId, parties })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erro na geração');
      
      addToast('Download iniciado!', 'success');
      window.open(data.downloadUrl, '_blank');
    } catch (error: any) {
      addToast(error.message, 'error');
    }
  };

  return (
    <div style={{ flex: 1, padding: '40px 32px', maxWidth: 880, margin: '0 auto', width: '100%' }}>
      {/* Cabeçalho da matriz */}
      <div className="fade-up" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: 10 }}>Matriz de documentos</p>
            <h1 className="display-heading" style={{ fontSize: 28, color: 'var(--parchment)' }}>Due Diligence</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
              {formId && (
                <span className="font-mono-doc seal" style={{ fontSize: 10 }}>{formId}</span>
              )}
              <span style={{ fontSize: 11, color: 'var(--dust)', fontWeight: 300 }}>
                {uploaded} de {total} documentos verificados
              </span>
            </div>
          </div>

          {/* Barra de progresso */}
          <div style={{ minWidth: 200 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--dust)' }}>Progresso</span>
              <span className="font-mono-doc" style={{ fontSize: 11, color: pct === 100 ? 'var(--forest)' : 'var(--parchment)' }}>{pct}%</span>
            </div>
            <div style={{ height: 3, background: 'var(--ink-3)', borderRadius: 2, overflow: 'hidden' }}>
              <div className="progress-fill" style={{ height: '100%', width: `${pct}%`, background: 'var(--forest)', borderRadius: 2 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="fade-up delay-1" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 32, background: 'var(--ink-2)', padding: '16px 20px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
        <button onClick={handleDownloadOriginal} disabled={!originalFile} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 12 }}>
          <IconUpload size={14} style={{ transform: 'rotate(180deg)' }} /> Baixar Original
        </button>
        <button onClick={() => {
          const name = prompt('Nome da nova parte (Ex: Fiador):');
          if (name) {
            setParties(ps => [...ps, { id: `party-${Date.now()}`, partyName: name, role: 'Parte', documents: [] }]);
          }
        }} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 12 }}>
          + Adicionar Parte
        </button>
        <button onClick={onOpenClientPortal} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 12, borderColor: 'var(--border-3)' }}>
          <IconInfo size={14} /> Portal do Cliente
        </button>
        <div style={{ flex: 1 }} />
        <button onClick={handleFillForm} className="btn-forest" style={{ padding: '8px 24px', fontSize: 12 }}>
          <span style={{ fontSize: 14 }}>✧</span> Preencher Formulário
        </button>
      </div>

      {/* Partes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {safeParties.map((party, pi) => (
          <PartyCard key={party.id} party={party} partyIndex={pi} setParties={setParties} addToast={addToast} />
        ))}
        {safeParties.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--ink-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--dust-2)', fontSize: 13 }}>A IA não conseguiu extrair os documentos corretamente. Tente enviar novamente.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PartyCard({ party, partyIndex, setParties, addToast }: {
  party: Party; partyIndex: number;
  setParties: React.Dispatch<React.SetStateAction<Party[]>>;
  addToast: (msg: string, type?: string) => void;
}) {
  const uploadedCount = party.documents.filter(d => d.status === 'uploaded').length;
  const totalCount    = party.documents.length;
  const allDone       = uploadedCount === totalCount;

  const toggle = (docId: string, current: Document['status']) => {
    const next = current === 'uploaded' ? 'pending' : 'uploaded';
    setParties(ps => ps.map((p, i) => i !== partyIndex ? p : {
      ...p, documents: p.documents.map(d => d.id === docId ? { ...d, status: 'updating' } : d),
    }));
    setTimeout(() => {
      setParties(ps => ps.map((p, i) => i !== partyIndex ? p : {
        ...p, documents: p.documents.map(d => d.id === docId ? { ...d, status: next } : d),
      }));
      addToast(next === 'uploaded' ? 'Documento verificado.' : 'Documento desmarcado.', next === 'uploaded' ? 'success' : 'default');
    }, 600);
  };

  return (
    <div className="card-doc fade-up" style={{ overflow: 'hidden' }}>
      {/* Header da parte */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: allDone ? 'rgba(26,107,85,0.06)' : 'var(--ink-2)',
      }}>
        <div>
          <p className="font-mono-doc" style={{ fontSize: 9, letterSpacing: '0.12em', color: 'var(--dust)', textTransform: 'uppercase', marginBottom: 4 }}>
            {party.role}
          </p>
          <h3 style={{ fontSize: 15, fontWeight: 400, color: 'var(--parchment)' }}>{party.partyName}</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => {
            const docName = prompt('Nome do documento exigido:');
            if (docName) {
              setParties(ps => ps.map((p, i) => i !== partyIndex ? p : {
                ...p, documents: [...p.documents, { id: `doc-${Date.now()}`, name: docName, status: 'pending', reason: 'Adicionado manualmente.' }]
              }));
            }
          }} style={{ fontSize: 11, color: 'var(--parchment)', background: 'rgba(240,235,225,0.05)', border: '1px solid var(--border-3)', padding: '4px 10px', borderRadius: 4, cursor: 'pointer' }}>
            + Documento
          </button>
          <span className="font-mono-doc" style={{
            fontSize: 10, letterSpacing: '0.06em',
            color: allDone ? 'var(--forest)' : 'var(--dust)',
            border: `1px solid ${allDone ? 'var(--forest)' : 'var(--border-2)'}`,
            padding: '3px 10px', borderRadius: 2,
          }}>
            {uploadedCount}/{totalCount}
          </span>
        </div>
      </div>

      {/* Documentos */}
      <div style={{ padding: '4px 0' }}>
        {party.documents.map((doc, i) => (
          <DocRow key={doc.id} doc={doc} isLast={i === party.documents.length - 1} onToggle={() => toggle(doc.id, doc.status)} />
        ))}
      </div>
    </div>
  );
}

function DocRow({ doc, isLast, onToggle }: { doc: Document; isLast: boolean; onToggle: () => void }) {
  const [showXAI, setShowXAI] = useState(false);
  const isUploaded = doc.status === 'uploaded';
  const isUpdating = doc.status === 'updating';

  return (
    <div style={{
      borderBottom: isLast ? 'none' : '1px solid var(--border)',
      transition: 'background 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', gap: 14 }}>
        {/* Checkbox */}
        <button
          onClick={onToggle}
          disabled={isUpdating}
          aria-label={isUploaded ? 'Desmarcar documento' : 'Marcar como verificado'}
          style={{
            width: 20, height: 20, borderRadius: 2, flexShrink: 0,
            border: `1px solid ${isUploaded ? 'var(--forest)' : 'var(--border-3)'}`,
            background: isUploaded ? 'var(--forest)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: isUpdating ? 'wait' : 'pointer',
            transition: 'all 0.2s ease',
            opacity: isUpdating ? 0.5 : 1,
          }}
        >
          {isUpdating
            ? <span className="spin" style={{ display: 'inline-block', width: 10, height: 10, border: '1.5px solid rgba(240,235,225,0.2)', borderTopColor: 'var(--parchment)', borderRadius: '50%' }} />
            : isUploaded ? <IconCheck size={11} /> : null
          }
        </button>

        {/* Nome */}
        <span style={{
          flex: 1, fontSize: 13, fontWeight: 300,
          color: isUploaded ? 'var(--dust-3)' : 'var(--parchment)',
          textDecoration: isUploaded ? 'none' : 'none',
        }}>
          {doc.name}
        </span>

        {/* Raciocínio XAI */}
        <button
          onClick={() => setShowXAI(s => !s)}
          title="Ver raciocínio da IA"
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: showXAI ? 'rgba(26,107,85,0.15)' : 'transparent',
            border: `1px solid ${showXAI ? 'var(--forest)' : 'var(--border)'}`,
            borderRadius: 2, padding: '4px 8px',
            color: showXAI ? 'var(--forest)' : 'var(--dust)',
            cursor: 'pointer', fontSize: 10, fontFamily: 'DM Mono',
            letterSpacing: '0.06em', transition: 'all 0.15s',
          }}
        >
          <IconInfo size={11} /> XAI
        </button>

        {/* Status badge / ação */}
        <div style={{ minWidth: 90, textAlign: 'right' }}>
          {isUploaded
            ? <span className="font-mono-doc" style={{ fontSize: 10, color: 'var(--forest)', letterSpacing: '0.08em' }}>VERIFICADO</span>
            : (
              <label style={{ cursor: 'pointer' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 11, fontFamily: 'DM Sans', fontWeight: 400,
                  color: 'var(--parchment-2)', padding: '5px 12px',
                  border: '1px solid var(--border-2)', borderRadius: 2,
                  transition: 'all 0.15s',
                }}>
                  <IconUpload size={11} /> Anexar
                </span>
                <input type="file" style={{ display: 'none' }} onChange={onToggle} />
              </label>
            )
          }
        </div>
      </div>

      {/* Painel XAI expandível */}
      <div style={{
        overflow: 'hidden', maxHeight: showXAI ? 120 : 0,
        transition: 'max-height 0.3s ease',
      }}>
        <div style={{
          margin: '0 20px 12px 54px',
          padding: '12px 14px',
          background: 'rgba(26,107,85,0.07)',
          border: '1px solid rgba(26,107,85,0.2)',
          borderRadius: 'var(--radius)',
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <div style={{ color: 'var(--forest)', flexShrink: 0, marginTop: 1 }}><IconInfo size={13} /></div>
          <p style={{ fontSize: 12, color: 'var(--dust-3)', lineHeight: 1.6, fontWeight: 300 }}>
            <span style={{ color: 'var(--parchment-2)', fontWeight: 400 }}>Contexto analisado: </span>
            {doc.reason}
          </p>
        </div>
      </div>
    </div>
  );
}
