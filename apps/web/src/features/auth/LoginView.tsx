import React, { useState } from 'react';
import Link from 'next/link';
import { Logo, IconCheck } from '@/components/ui/Icons';

export function LoginView({ onLogin, onBack }: { onLogin: (email: string) => void; onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || 'E-mail ou senha inválidos.');
        setLoading(false);
        return;
      }

      // O cookie HttpOnly já é setado pela API. Salvamos apenas por compatibilidade local.
      localStorage.setItem('access_token', data.access_token);
      onLogin(email || 'gestor@empresa.com');
    } catch (err) {
      setError('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
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
            {error && (
              <p style={{ fontSize: 12, color: 'var(--amber)', background: 'rgba(201,168,76,0.1)', padding: '8px 12px', borderRadius: 4, border: '1px solid var(--amber)' }}>
                {error}
              </p>
            )}
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
