'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import type { AxiosError } from 'axios'
import Link from 'next/link'

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="3" fill="#1A6B55"/>
      <path d="M7 8h14M7 14h8M7 20h11" stroke="#F0EBE1" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="21" cy="20" r="3.5" fill="#1A6B55" stroke="#C9A84C" strokeWidth="1.5"/>
      <path d="M19.7 20l1 1 1.8-1.8" stroke="#C9A84C" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const fields = [
  { key: 'full_name',    label: 'NOME COMPLETO',         type: 'text',     placeholder: 'Maria Oliveira',              required: false },
  { key: 'email',        label: 'E-MAIL CORPORATIVO',    type: 'email',    placeholder: 'voce@empresa.com',            required: true },
  { key: 'password',     label: 'SENHA',                 type: 'password', placeholder: '••••••••',                    required: true },
  { key: 'tenant_name',  label: 'NOME DA EMPRESA',       type: 'text',     placeholder: 'Imobiliária Central S.A.',    required: true },
  { key: 'tenant_slug',  label: 'IDENTIFICADOR (SLUG)',  type: 'text',     placeholder: 'imobiliaria-central',         required: true },
] as const

type FieldKey = typeof fields[number]['key']

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState<Record<FieldKey | 'termsAccepted', string | boolean>>({
    full_name: '', email: '', password: '', tenant_name: '', tenant_slug: '', termsAccepted: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.termsAccepted) { setError('Você precisa aceitar os Termos de Serviço.'); return }
    setError('')
    setLoading(true)
    try {
      await authApi.register(form as any)
      router.push('/login?registered=1')
    } catch (err: unknown) {
      const ae = err as AxiosError<{ detail?: string }>
      setError(ae?.response?.data?.detail ?? 'Erro ao criar conta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', color: 'var(--parchment)', fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: 60, borderBottom: '1px solid var(--border)' }}>
        <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Logo />
          <span style={{ fontSize: 15, fontWeight: 400, color: 'var(--parchment)', letterSpacing: '-0.01em' }}>
            Forms<span style={{ color: 'var(--forest)', fontWeight: 500 }}>AI</span>
          </span>
        </Link>
        <Link href="/login" style={{ fontSize: 12, color: 'var(--dust)', textDecoration: 'none', fontFamily: 'DM Mono', letterSpacing: '0.06em' }}>
          JÁ TENHO CONTA →
        </Link>
      </nav>

      {/* Corpo */}
      <div style={{ flex: 1, display: 'flex' }}>
        {/* Esquerda — contexto */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px 80px', background: 'var(--ink-2)', borderRight: '1px solid var(--border)' }} className="fade-up">
          <p className="eyebrow" style={{ marginBottom: 24 }}>Criar conta gratuita</p>
          <h1 style={{ fontFamily: 'DM Sans', fontWeight: 200, fontSize: 40, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 20, color: 'var(--parchment)' }}>
            Automatize sua<br /><span style={{ color: 'var(--forest)' }}>due diligence</span>
          </h1>
          <p style={{ fontSize: 14, color: 'var(--dust-2)', fontWeight: 300, lineHeight: 1.7, maxWidth: 340, marginBottom: 40 }}>
            Configure sua empresa em menos de 2 minutos. Sem cartão de crédito. Sem compromisso.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['14 dias grátis sem precisar de cartão', 'Cancele quando quiser', 'Suporte por e-mail incluso', 'Conformidade LGPD garantida'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 16, height: 16, background: 'var(--forest-3)', border: '1px solid var(--forest)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--forest)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <span style={{ fontSize: 13, color: 'var(--dust-3)', fontWeight: 300 }}>{item}</span>
              </div>
            ))}
          </div>

          <div className="seal" style={{ marginTop: 48, alignSelf: 'flex-start' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--amber)', display: 'inline-block' }} />
            LGPD · ISO 27001 · Dados criptografados
          </div>
        </div>

        {/* Direita — formulário */}
        <div style={{ width: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', overflowY: 'auto' }} className="fade-up delay-1">
          <div style={{ width: '100%', maxWidth: 400 }}>
            <p style={{ fontSize: 13, color: 'var(--dust-2)', marginBottom: 24, fontWeight: 300 }}>
              Preencha os dados abaixo para criar seu acesso.
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {fields.map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 10, color: 'var(--dust-2)', marginBottom: 6, fontFamily: 'DM Mono', letterSpacing: '0.1em' }}>
                    {f.label}{!f.required && <span style={{ color: 'var(--dust)', marginLeft: 6, fontSize: 9 }}>OPCIONAL</span>}
                  </label>
                  <input
                    type={f.type}
                    required={f.required}
                    placeholder={f.placeholder}
                    value={form[f.key] as string}
                    onChange={set(f.key)}
                    className="input-doc"
                  />
                </div>
              ))}

              {/* Termos */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginTop: 4 }}>
                <div
                  onClick={() => setForm(f => ({ ...f, termsAccepted: !f.termsAccepted }))}
                  style={{
                    width: 16, height: 16, flexShrink: 0, marginTop: 1, borderRadius: 2,
                    border: `1px solid ${form.termsAccepted ? 'var(--forest)' : 'var(--border-3)'}`,
                    background: form.termsAccepted ? 'var(--forest)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}
                >
                  {form.termsAccepted && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--parchment)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <span style={{ fontSize: 12, color: 'var(--dust-2)', lineHeight: 1.5, fontWeight: 300 }}>
                  Li e concordo com os{' '}
                  <Link href="/termos" target="_blank" style={{ color: 'var(--parchment-2)', textDecoration: 'none' }}>Termos de Serviço e Política de Privacidade</Link>.
                </span>
              </label>

              {error && (
                <p style={{ fontSize: 12, color: '#e87070', background: 'rgba(168,45,45,0.1)', border: '1px solid rgba(168,45,45,0.2)', borderRadius: 'var(--radius)', padding: '8px 12px' }}>{error}</p>
              )}

              <button type="submit" disabled={loading} className="btn-forest" style={{ marginTop: 4 }}>
                {loading
                  ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="spin" style={{ display: 'inline-block', width: 13, height: 13, border: '2px solid rgba(240,235,225,0.2)', borderTopColor: 'var(--parchment)', borderRadius: '50%' }} />Criando conta…</span>
                  : 'Criar conta gratuita'
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
