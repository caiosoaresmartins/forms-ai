'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import type { AxiosError } from 'axios'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '', password: '', full_name: '', tenant_name: '', tenant_slug: '', termsAccepted: false
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.termsAccepted) {
      setError('Você precisa aceitar os Termos de Serviço.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await authApi.register(form)
      router.push('/login?registered=1')
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ detail?: string }>
      setError(axiosErr?.response?.data?.detail ?? 'Erro ao criar conta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Criar conta</h1>
        <p className="text-gray-500 mb-6 text-sm">Preencha os dados para começar</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {([
            ['full_name', 'Nome completo', 'text'],
            ['email', 'E-mail', 'email'],
            ['password', 'Senha', 'password'],
            ['tenant_name', 'Nome da empresa', 'text'],
            ['tenant_slug', 'Slug da empresa (ex: minha-empresa)', 'text'],
          ] as const).map(([key, label, type]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type}
                required={key !== 'full_name'}
                value={form[key as keyof typeof form] as string}
                onChange={set(key)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          ))}
          
          <div className="flex items-start gap-2 mt-2">
            <input
              type="checkbox"
              id="termsAccepted"
              checked={form.termsAccepted}
              onChange={set('termsAccepted')}
              className="mt-1 h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <label htmlFor="termsAccepted" className="text-sm text-gray-600">
              Eu li e concordo com os{' '}
              <a href="/termos" target="_blank" className="text-teal-600 hover:underline">
                Termos de Serviço e Política de Privacidade
              </a>
              .
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold rounded-lg py-2 text-sm transition-colors mt-2"
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-500 mt-4">
          Já tem conta?{' '}
          <a href="/login" className="text-teal-600 hover:underline font-medium">
            Entrar
          </a>
        </p>
      </div>
    </main>
  )
}
