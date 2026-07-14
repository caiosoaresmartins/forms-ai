import React from 'react';
import Link from 'next/link';
import { Logo, IconArrow } from '@/components/ui/Icons';

export function LandingView({ onGetStarted }: { onGetStarted: () => void }) {
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
