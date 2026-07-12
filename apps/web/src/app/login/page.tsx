'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'

const features = [
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M9 12h6M9 16h6M9 8h2M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Leitura inteligente de PDF',
    desc: 'OCR avançado com PaddleOCR extrai textos, CPFs, CNPJs e cláusulas de qualquer contrato automaticamente.',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 2a10 10 0 1 0 10 10" strokeLinecap="round" />
        <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 2 16 8M22 2h-5M22 2v5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Checklist automática com IA',
    desc: 'O modelo de linguagem analisa o contrato e gera automaticamente a lista de documentos necessários para cada parte.',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Preenchimento automático',
    desc: 'Os dados extraídos preenchem os campos do PDF original com precisão, eliminando erros manuais e retrabalho.',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Multi-empresa & LGPD',
    desc: 'Isolamento por tenant, controle de acesso por papéis e endpoints de exclusão em conformidade com a LGPD.',
  },
]

const plans = [
  {
    name: 'Starter',
    price: 'R$ 197',
    period: '/mês',
    desc: 'Para imobiliárias e escritórios pequenos.',
    features: ['5 usuários', '200 formulários/mês', 'OCR + checklist IA', 'Suporte por e-mail'],
    cta: 'Começar grátis',
    highlight: false,
  },
  {
    name: 'Profissional',
    price: 'R$ 497',
    period: '/mês',
    desc: 'Para equipes em crescimento.',
    features: ['20 usuários', '1.000 formulários/mês', 'Preenchimento automático PDF', 'Integrações via API', 'Suporte prioritário'],
    cta: 'Assinar agora',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Sob consulta',
    period: '',
    desc: 'Para grandes operações.',
    features: ['Usuários ilimitados', 'Formulários ilimitados', 'SLA garantido', 'Onboarding dedicado', 'Customizações'],
    cta: 'Falar com vendas',
    highlight: false,
  },
]

const pipelineSteps = [
  { step: '01', label: 'Upload do PDF' },
  { step: '02', label: 'OCR + Extração IA' },
  { step: '03', label: 'Checklist de docs' },
  { step: '04', label: 'PDF preenchido' },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login(email, password)
      const { access_token, refresh_token } = res.data
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
      document.cookie = `access_token=${access_token}; path=/; SameSite=Lax`
      router.push('/')
    } catch {
      setError('E-mail ou senha inválidos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-label="Forms AI">
              <rect width="32" height="32" rx="8" fill="#0d9488" />
              <path d="M9 10h14M9 16h9M9 22h12" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="24" cy="22" r="4" fill="#0d9488" stroke="white" strokeWidth="2" />
              <path d="M22.5 22l1 1 2-2" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-semibold text-lg tracking-tight text-white">Forms <span className="text-teal-400">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Funcionalidades</a>
            <a href="#pricing" className="hover:text-white transition-colors">Preços</a>
          </div>
          <a
            href="/register"
            className="text-sm font-medium px-4 py-2 rounded-lg border border-teal-500/40 text-teal-400 hover:bg-teal-500/10 transition-colors"
          >
            Criar conta
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              Powered by PaddleOCR + Groq LLaMA 3
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-6">
              Contratos preenchidos{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                automaticamente
              </span>{' '}
              com IA
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8 max-w-lg">
              Envie um PDF, a IA lê as partes, gera a checklist de documentos e devolve o contrato preenchido — em segundos.
              Sem retrabalho, sem erro manual.
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              {['Imobiliárias', 'Cartórios', 'Escritórios jurídicos', 'Corretoras'].map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs border border-zinc-700">
                  {tag}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-zinc-800">
              {([['10×', 'mais rápido'], ['99%', 'precisão OCR'], ['100%', 'LGPD']] as [string, string][]).map(([num, label]) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-teal-400">{num}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-sm mx-auto lg:mx-0 lg:ml-auto">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl shadow-black/40">
              <h2 className="text-xl font-semibold text-white mb-1">Acesse sua conta</h2>
              <p className="text-zinc-500 text-sm mb-6">Entre para continuar no painel</p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5" htmlFor="email">
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="voce@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5" htmlFor="password">
                    Senha
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-800/60 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
                  />
                </div>
                {error && (
                  <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 text-sm transition-all duration-200 mt-1"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Entrando...
                    </span>
                  ) : 'Entrar'}
                </button>
              </form>
              <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
                <p className="text-xs text-zinc-500">
                  Não tem conta?{' '}
                  <a href="/register" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
                    Criar gratuitamente
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6 border-t border-zinc-800/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-teal-400 text-sm font-medium mb-3 tracking-wide uppercase">Funcionalidades</p>
            <h2 className="text-3xl font-bold text-white">Tudo que você precisa para automatizar contratos</h2>
            <p className="text-zinc-500 mt-3 max-w-xl mx-auto">Da leitura ao preenchimento, sem nenhum trabalho manual.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-teal-500/30 hover:bg-zinc-800/60 transition-all duration-300 group"
              >
                <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4 group-hover:bg-teal-500/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-white text-sm mb-2">{f.title}</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PIPELINE VISUAL */}
      <section className="py-20 px-6 bg-zinc-900/40 border-y border-zinc-800/60">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-zinc-500 text-sm mb-10">Como funciona em 4 etapas</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            {pipelineSteps.map((item, i) => (
              <div key={item.step} className="flex flex-row md:flex-col items-center gap-3 md:gap-2">
                <div className="w-12 h-12 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-sm shrink-0">
                  {item.step}
                </div>
                <p className="text-zinc-400 text-xs font-medium">{item.label}</p>
                {i < pipelineSteps.length - 1 && (
                  <span className="hidden md:inline text-zinc-600 text-lg ml-2">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-teal-400 text-sm font-medium mb-3 tracking-wide uppercase">Preços</p>
            <h2 className="text-3xl font-bold text-white">Simples, transparente e sem surpresas</h2>
            <p className="text-zinc-500 mt-3">Cancele quando quiser. Sem fidelidade.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-8 border transition-all duration-300 ${
                  plan.highlight
                    ? 'bg-teal-950/40 border-teal-500/50 shadow-lg shadow-teal-500/10'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-teal-500 text-zinc-950 text-xs font-bold px-3 py-1 rounded-full">
                      Mais popular
                    </span>
                  </div>
                )}
                <p className="text-zinc-400 text-sm mb-1">{plan.name}</p>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-zinc-500 text-sm mb-1">{plan.period}</span>
                </div>
                <p className="text-zinc-500 text-xs mb-6">{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-zinc-400">
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-teal-400 shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="/register"
                  className={`block w-full text-center py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    plan.highlight
                      ? 'bg-teal-600 hover:bg-teal-500 text-white'
                      : 'border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-800/60 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#0d9488" />
              <path d="M9 10h14M9 16h9M9 22h12" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="24" cy="22" r="4" fill="#0d9488" stroke="white" strokeWidth="2" />
              <path d="M22.5 22l1 1 2-2" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-sm text-zinc-500">Forms AI — Todos os direitos reservados © 2026</span>
          </div>
          <p className="text-xs text-zinc-600">Em conformidade com a LGPD</p>
        </div>
      </footer>
    </div>
  )
}
