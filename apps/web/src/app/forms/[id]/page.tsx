'use client'
import { use } from 'react'
import { useFormStatus } from '@/hooks/useFormStatus'
import { ChecklistPanel } from '@/components/checklist/ChecklistPanel'
import { PdfDownloadButton } from '@/components/pdf/PdfDownloadButton'

export default function FormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { checklist, status, isLoading, refetch } = useFormStatus(id)

  if (isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm text-zinc-400">Carregando...</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Formulário</h1>
          <span className="text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-zinc-500">
            {status}
          </span>
        </div>
        <PdfDownloadButton formId={id} />
      </div>

      <ChecklistPanel
        formId={id}
        checklist={checklist}
        onUpdate={refetch}
      />
    </main>
  )
}
