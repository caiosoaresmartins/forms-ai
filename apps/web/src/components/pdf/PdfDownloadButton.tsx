'use client'
import { useState, useEffect } from 'react'
import { FileDown, Loader2, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'

type PdfStatus = {
  ready: boolean
  form_id: string
  method?: string
  fields_filled?: number
}

type Props = {
  formId: string
}

export function PdfDownloadButton({ formId }: Props) {
  const [status, setStatus] = useState<PdfStatus | null>(null)
  const [generating, setGenerating] = useState(false)

  async function fetchStatus() {
    try {
      const { data } = await api.get<PdfStatus>(`/forms/${formId}/pdf/status`)
      setStatus(data)
    } catch {
      setStatus({ ready: false, form_id: formId })
    }
  }

  useEffect(() => {
    fetchStatus()
    // Polling enquanto não estiver pronto
    const interval = setInterval(() => {
      if (!status?.ready) fetchStatus()
    }, 4000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId, status?.ready])

  async function handleGenerate() {
    setGenerating(true)
    try {
      await api.post(`/forms/${formId}/pdf/generate`)
      // Poll até ficar pronto
      const poll = setInterval(async () => {
        const { data } = await api.get<PdfStatus>(`/forms/${formId}/pdf/status`)
        if (data.ready) {
          setStatus(data)
          setGenerating(false)
          clearInterval(poll)
        }
      }, 2000)
    } catch {
      setGenerating(false)
    }
  }

  function handleDownload() {
    const url = `${process.env.NEXT_PUBLIC_API_URL}/forms/${formId}/pdf/filled`
    window.open(url, '_blank')
  }

  if (!status) {
    return (
      <button disabled className="flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm text-zinc-400 dark:bg-zinc-800">
        <Loader2 size={16} className="animate-spin" />
        Verificando...
      </button>
    )
  }

  if (status.ready) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          <FileDown size={16} />
          Baixar PDF preenchido
        </button>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800 transition-colors"
          title="Regenerar PDF"
        >
          <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={generating}
      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
    >
      {generating ? (
        <><Loader2 size={16} className="animate-spin" /> Gerando...</>
      ) : (
        <><FileDown size={16} /> Gerar PDF preenchido</>
      )}
    </button>
  )
}
