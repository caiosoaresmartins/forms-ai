"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

/* ─── tipos ──────────────────────────────────────────────────── */
interface Document {
  id: string;
  name: string;
  status: 'pending' | 'uploaded' | 'updating';
  reason: string;
}

interface Party {
  id: string;
  partyName: string;
  role: string;
  documents: Document[];
}

/* ─── dados mock ─────────────────────────────────────────────── */
const initialMockParties: Party[] = [
  {
    id: 'party-1',
    partyName: 'João Carlos Silva',
    role: 'Requerente · Pessoa Física',
    documents: [
      { id: 'd1', name: 'RG ou CNH (frente e verso)', status: 'pending', reason: 'Identificação obrigatória para validar a autenticidade do formulário por Pessoa Física, conforme art. 12 da Norma ABNT 15894.' },
      { id: 'd2', name: 'Comprovante de Residência', status: 'pending', reason: 'Necessário para qualificação completa do requerente no sistema de registro do cartório.' },
      { id: 'd3', name: 'Comprovante de Renda', status: 'uploaded', reason: 'Exigido pela seção 4.2 do formulário principal para análise de viabilidade creditícia.' },
    ],
  },
  {
    id: 'party-2',
    partyName: 'TechCorp Imóveis S.A.',
    role: 'Empresa Parceira · Pessoa Jurídica',
    documents: [
      { id: 'd4', name: 'Matrícula do Imóvel Atualizada', status: 'uploaded', reason: 'Fundamental para comprovar a titularidade do imóvel conforme seção 2.1 do formulário.' },
      { id: 'd5', name: 'Certidão Negativa de Débitos', status: 'pending', reason: 'Mitigação de risco trabalhista e tributário ao associar Pessoa Jurídica à operação.' },
      { id: 'd6', name: 'Contrato Social Atualizado', status: 'pending', reason: 'Necessário para validar poderes de representação dos signatários perante o cartório.' },
    ],
  },
];

/* ─── ícones inline ──────────────────────────────────────────── */
function IconUpload({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function IconFile({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function IconCheck({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconLogOut({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconInfo({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function IconX({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconArrow({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

/* ─── logo ───────────────────────────────────────────────────── */
function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="3" fill="#1A6B55" />
      <path d="M7 8h14M7 14h8M7 20h11" stroke="#F0EBE1" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="21" cy="20" r="3.5" fill="#1A6B55" stroke="#C9A84C" strokeWidth="1.5" />
      <path d="M19.7 20l1 1 1.8-1.8" stroke="#C9A84C" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── toast ──────────────────────────────────────────────────── */
interface Toast { id: string; message: string; type: string; }

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
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

/* ─── trilha de processo (assinatura do design) ──────────────── */
type ViewKey = 'landing' | 'login' | 'upload' | 'analyzing' | 'checklist' | 'clientPortal';

const STEPS: { key: ViewKey; label: string }[] = [
  { key: 'upload',    label: 'Upload' },
  { key: 'analyzing', label: 'Análise IA' },
  { key: 'checklist', label: 'Due Diligence' },
];

function ProcessRail({ current }: { current: ViewKey }) {
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

/* ─── app principal ──────────────────────────────────────────── */
export default function App() {
  const [currentView, setCurrentView] = useState<ViewKey>('landing');
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [formId, setFormId] = useState<string | null>(null);
  const [partiesData, setPartiesData] = useState<Party[]>(initialMockParties);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type = 'default') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };
  const removeToast = (id: string) => setToasts(p => p.filter(t => t.id !== id));

  const handleLogin = (email: string) => {
    setUser({ email, name: email.split('@')[0] });
    setCurrentView('upload');
    addToast('Acesso autorizado', 'success');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('landing');
    setPartiesData(initialMockParties);
  };

  const handleUploadStart = async (file: File) => {
    setOriginalFile(file);
    setFormId(`DOC-${Date.now().toString(36).toUpperCase()}`);
    setCurrentView('analyzing');
    addToast('Processando documento com Groq…');

    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/forms/analyze', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Erro desconhecido');
      setPartiesData(data.parties);
    } catch (error: any) {
      addToast(error.message, 'error');
    }
  };

  const handleAnalysisComplete = () => {
    setCurrentView('checklist');
    addToast('Matriz de due diligence gerada', 'success');
  };

  const showHeader = user && currentView !== 'login' && currentView !== 'landing';
  const showRail   = currentView === 'upload' || currentView === 'analyzing' || currentView === 'checklist';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--ink)' }}>
      {/* Header */}
      {showHeader && (
        <header style={{
          position: 'sticky', top: 0, zIndex: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px',
          height: 56,
          background: 'rgba(10,10,11,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
        }}>
          {/* Logo */}
          <button onClick={() => setCurrentView('landing')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Logo size={24} />
            <span style={{ fontFamily: 'DM Sans', fontSize: 14, fontWeight: 400, color: 'var(--parchment)', letterSpacing: '-0.01em' }}>
              Forms<span style={{ color: 'var(--forest)', fontWeight: 500 }}>AI</span>
            </span>
          </button>

          {/* Rail central */}
          {showRail && <ProcessRail current={currentView} />}

          {/* User + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span className="font-mono-doc" style={{ fontSize: 11, color: 'var(--dust-2)', letterSpacing: '0.06em' }}>
              {user.name.toUpperCase()}
            </span>
            <button onClick={handleLogout} title="Sair" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: '1px solid var(--border-2)',
              borderRadius: 'var(--radius)', padding: '6px 10px',
              color: 'var(--dust-2)', cursor: 'pointer', fontSize: 11, transition: 'all 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--parchment)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-3)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--dust-2)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-2)'; }}
            >
              <IconLogOut size={13} />
            </button>
          </div>
        </header>
      )}

      {/* Views */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {currentView === 'landing'   && <LandingView   onGetStarted={() => setCurrentView('login')} />}
        {currentView === 'login'     && <LoginView     onLogin={handleLogin} onBack={() => setCurrentView('landing')} />}
        {currentView === 'upload'    && <UploadView    onUpload={handleUploadStart} />}
        {currentView === 'analyzing' && <AnalyzingView onComplete={handleAnalysisComplete} />}
        {currentView === 'checklist' && (
          <ChecklistView
            parties={partiesData}
            setParties={setPartiesData}
            formId={formId}
            addToast={addToast}
            originalFile={originalFile}
            onOpenClientPortal={() => setCurrentView('clientPortal')}
          />
        )}
        {currentView === 'clientPortal' && (
          <ClientPortalView 
            parties={partiesData} 
            setParties={setPartiesData}
            addToast={addToast}
            onBack={() => setCurrentView('checklist')}
          />
        )}
      </main>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   LANDING
══════════════════════════════════════════════════════════════ */
function LandingView({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="watermark-bg" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 64,
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo size={26} />
          <span style={{ fontFamily: 'DM Sans', fontSize: 15, fontWeight: 400, color: 'var(--parchment)', letterSpacing: '-0.01em' }}>
            Forms<span style={{ color: 'var(--forest)', fontWeight: 500 }}>AI</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/admin" style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'var(--dust-2)', textDecoration: 'none', letterSpacing: '0.01em' }}>
            Funcionários
          </Link>
          <button onClick={onGetStarted} className="btn-secondary" style={{ padding: '8px 20px', fontSize: 13 }}>
            Entrar
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '80px 48px', textAlign: 'center', maxWidth: 900, margin: '0 auto', width: '100%',
      }}>
        <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
          <div className="seal">
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--amber)', display: 'inline-block', animation: 'softPulse 2s ease-in-out infinite' }} />
            PaddleOCR · Groq LLaMA 3 · LGPD
          </div>

          <h1 className="display-heading" style={{ fontSize: 'clamp(40px, 6vw, 80px)', color: 'var(--parchment)', maxWidth: 760 }}>
            Due diligence que leva{' '}
            <span style={{ color: 'var(--forest)' }}>segundos.</span>
            <br />
            <span style={{ color: 'var(--dust-3)', fontWeight: 200 }}>Não semanas.</span>
          </h1>

          <p style={{ fontSize: 16, fontWeight: 300, color: 'var(--dust-2)', maxWidth: 520, lineHeight: 1.7 }}>
            Faça upload de qualquer formulário PDF. A IA lê, identifica as partes, gera a checklist de documentos e devolve tudo estruturado — sem retrabalho, sem erro manual.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={onGetStarted} className="btn-primary" style={{ fontSize: 14, padding: '13px 32px' }}>
              Começar agora <IconArrow size={15} />
            </button>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <button className="btn-secondary" style={{ fontSize: 14, padding: '13px 32px' }}>
                Ver demonstração
              </button>
            </Link>
          </div>

          {/* Métricas */}
          <div style={{ display: 'flex', gap: 48, marginTop: 16, paddingTop: 32, borderTop: '1px solid var(--border)', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              ['10×', 'mais rápido que o processo manual'],
              ['99%', 'de precisão no OCR'],
              ['100%', 'em conformidade com a LGPD'],
            ].map(([num, label]) => (
              <div key={num} style={{ textAlign: 'center' }}>
                <div className="font-mono-doc" style={{ fontSize: 28, fontWeight: 400, color: 'var(--forest)', letterSpacing: '-0.02em' }}>{num}</div>
                <div style={{ fontSize: 11, color: 'var(--dust)', marginTop: 4, maxWidth: 120, lineHeight: 1.4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ borderTop: '1px solid var(--border)', padding: '72px 48px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <p className="eyebrow" style={{ textAlign: 'center', marginBottom: 48 }}>Como funciona</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1, border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
            {[
              { n: '01', title: 'Upload do PDF', desc: 'Arraste qualquer formulário. Suportamos PDFs até 50 MB com múltiplas páginas.' },
              { n: '02', title: 'OCR + IA', desc: 'PaddleOCR extrai o texto. O LLaMA 3 via Groq interpreta as partes e contexto jurídico.' },
              { n: '03', title: 'Checklist gerada', desc: 'Uma matriz de documentos é montada automaticamente, com raciocínio explicável por documento.' },
              { n: '04', title: 'PDF preenchido', desc: 'Os campos do formulário são preenchidos e o arquivo é devolvido para download imediato.' },
            ].map((f) => (
              <div key={f.n} className="fade-up" style={{ padding: '32px 28px', background: 'var(--ink-2)', borderRight: '1px solid var(--border)' }}>
                <div className="font-mono-doc" style={{ fontSize: 11, color: 'var(--forest)', letterSpacing: '0.1em', marginBottom: 16 }}>{f.n}</div>
                <h3 style={{ fontFamily: 'DM Sans', fontSize: 15, fontWeight: 400, color: 'var(--parchment)', marginBottom: 10, letterSpacing: '-0.01em' }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--dust-2)', lineHeight: 1.6, fontWeight: 300 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo size={18} />
          <span className="font-mono-doc" style={{ fontSize: 11, color: 'var(--dust)', letterSpacing: '0.06em' }}>FORMS AI © 2026</span>
        </div>
        <span className="font-mono-doc" style={{ fontSize: 11, color: 'var(--dust)', letterSpacing: '0.06em' }}>EM CONFORMIDADE COM A LGPD</span>
      </footer>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   LOGIN
══════════════════════════════════════════════════════════════ */
function LoginView({ onLogin, onBack }: { onLogin: (email: string) => void; onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      onLogin(email || 'gestor@empresa.com');
      setLoading(false);
    }, 900);
  };

  return (
    <div style={{ flex: 1, display: 'flex' }}>
      {/* Lado esquerdo — identidade */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '64px 80px', borderRight: '1px solid var(--border)',
        background: 'var(--ink-2)',
      }} className="fade-up">
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dust)', fontSize: 12, marginBottom: 64, letterSpacing: '0.06em', fontFamily: 'DM Mono' }}>
          ← VOLTAR
        </button>
        <Logo size={40} />
        <h1 className="display-heading" style={{ fontSize: 42, color: 'var(--parchment)', marginTop: 24, marginBottom: 16 }}>
          Acesso ao<br />sistema
        </h1>
        <p style={{ fontSize: 14, color: 'var(--dust-2)', fontWeight: 300, lineHeight: 1.7, maxWidth: 320 }}>
          Plataforma restrita para gestores e operadores certificados. Seus dados são criptografados e protegidos por LGPD.
        </p>

        <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            'Isolamento por tenant',
            'Criptografia em repouso',
            'Logs de auditoria completos',
          ].map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 16, height: 16, background: 'var(--forest-3)', border: '1px solid var(--forest)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconCheck size={10} />
              </div>
              <span style={{ fontSize: 13, color: 'var(--dust-3)', fontWeight: 300 }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lado direito — formulário */}
      <div style={{
        width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '64px 48px',
      }} className="fade-up delay-1">
        <div style={{ width: '100%', maxWidth: 360 }}>
          <p className="eyebrow" style={{ marginBottom: 32 }}>Identificação</p>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--dust-2)', marginBottom: 6, fontFamily: 'DM Mono', letterSpacing: '0.08em' }}>E-MAIL</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="gestor@empresa.com" className="input-doc"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: 'var(--dust-2)', marginBottom: 6, fontFamily: 'DM Mono', letterSpacing: '0.08em' }}>SENHA</label>
              <input
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" className="input-doc"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-forest" style={{ marginTop: 8 }}>
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(240,235,225,0.3)', borderTopColor: 'var(--parchment)', borderRadius: '50%' }} />Verificando…</span>
                : 'Acessar sistema'
              }
            </button>
          </form>

          <div className="divider-text" style={{ margin: '24px 0' }}>ou</div>

          <p style={{ fontSize: 12, color: 'var(--dust)', textAlign: 'center' }}>
            Não tem conta?{' '}
            <Link href="/register" style={{ color: 'var(--parchment-2)', textDecoration: 'none', fontWeight: 400 }}>
              Criar acesso
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   UPLOAD
══════════════════════════════════════════════════════════════ */
function UploadView({ onUpload }: { onUpload: (file: File) => void }) {
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

/* ══════════════════════════════════════════════════════════════
   ANALISANDO
══════════════════════════════════════════════════════════════ */
const ANALYSIS_STEPS = [
  { text: 'Transferindo para armazenamento seguro', time: 900 },
  { text: 'Extraindo texto via PaddleOCR', time: 1800 },
  { text: 'Processando com LLaMA 3 · Groq', time: 2400 },
  { text: 'Estruturando matriz de due diligence', time: 1200 },
];

function AnalyzingView({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step < ANALYSIS_STEPS.length) {
      const t = setTimeout(() => setStep(s => s + 1), ANALYSIS_STEPS[step].time);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(onComplete, 600);
      return () => clearTimeout(t);
    }
  }, [step, onComplete]);

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

/* ══════════════════════════════════════════════════════════════
   CHECKLIST
══════════════════════════════════════════════════════════════ */
function ChecklistView({ parties, setParties, formId, addToast, originalFile, onOpenClientPortal }: {
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

  const handleFillForm = () => {
    if (pct < 100) {
      addToast('Anexe todos os documentos antes de preencher o formulário.', 'error');
      return;
    }
    addToast('Preenchendo formulário automaticamente com IA...', 'default');
    setTimeout(() => {
      addToast('Formulário preenchido e gerado com sucesso!', 'success');
    }, 2500);
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
        <span className="font-mono-doc" style={{
          fontSize: 10, letterSpacing: '0.06em',
          color: allDone ? 'var(--forest)' : 'var(--dust)',
          border: `1px solid ${allDone ? 'var(--forest)' : 'var(--border-2)'}`,
          padding: '3px 10px', borderRadius: 2,
        }}>
          {uploadedCount}/{totalCount}
        </span>
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

/* ══════════════════════════════════════════════════════════════
   PORTAL DO CLIENTE
══════════════════════════════════════════════════════════════ */
function ClientPortalView({ parties, setParties, addToast, onBack }: any) {
  const handleToggle = (partyIdx: number, docId: string, current: string) => {
    if (current === 'uploaded' || current === 'updating') return;
    setParties((ps: Party[]) => ps.map((p, i) => i !== partyIdx ? p : {
      ...p, documents: p.documents.map(d => d.id === docId ? { ...d, status: 'updating' } : d),
    }));
    setTimeout(() => {
      setParties((ps: Party[]) => ps.map((p, i) => i !== partyIdx ? p : {
        ...p, documents: p.documents.map(d => d.id === docId ? { ...d, status: 'uploaded' } : d),
      }));
      addToast('Documento recebido e anexado.', 'success');
    }, 1500);
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
                        <input type="file" style={{ display: 'none' }} onChange={() => handleToggle(pIdx, doc.id, doc.status)} />
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
