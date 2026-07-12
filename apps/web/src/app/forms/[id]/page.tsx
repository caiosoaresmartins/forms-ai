'use client'
import { useParams } from 'next/navigation'
import { useFormStatus } from '@/hooks/useFormStatus'
import { ChecklistPanel } from '@/components/checklist/ChecklistPanel'
import { PartiesPanel } from '@/components/parties/PartiesPanel'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DownloadButton } from '@/components/ui/DownloadButton'

export default function FormDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { status, parties, checklist, isLoading } = useFormStatus(id)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <span className="text-sm">Processando formulário…</span>
        </div>
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Formulário</h1>
          <p className="mt-1 font-mono text-sm text-zinc-400">{id}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          {status === 'filled' && <DownloadButton formId={id} />}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PartiesPanel parties={parties} />
        <ChecklistPanel checklist={checklist} />
      </div>
    </main>
  )
}
