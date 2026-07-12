'use client'
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

type Document = {
  name: string
  required: boolean
  notes?: string
  uploaded?: boolean
}

type ChecklistItem = {
  party_type: string
  party_index: number
  party_name: string
  documents: Document[]
}

type Props = {
  checklist: { checklist: ChecklistItem[] } | null
}

const PARTY_LABELS: Record<string, string> = {
  buyer: 'Comprador',
  seller: 'Vendedor',
  witness: 'Testemunha',
  procurator: 'Procurador',
  spouse: 'Cônjuge',
}

export function ChecklistPanel({ checklist }: Props) {
  const items = checklist?.checklist ?? []

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold">Checklist</h2>
        <p className="text-sm text-zinc-400">Nenhuma checklist gerada ainda.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold">Checklist de documentos</h2>
      <div className="flex flex-col gap-4">
        {items.map((item, i) => (
          <ChecklistGroup key={i} item={item} />
        ))}
      </div>
    </div>
  )
}

function ChecklistGroup({ item }: { item: ChecklistItem }) {
  const [open, setOpen] = useState(true)
  const total = item.documents.length
  const done = item.documents.filter((d) => d.uploaded).length

  return (
    <div className="rounded-xl border border-zinc-100 dark:border-zinc-800">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div>
          <span className="text-sm font-medium">
            {PARTY_LABELS[item.party_type] ?? item.party_type} {item.party_index}
          </span>
          {item.party_name && (
            <span className="ml-2 text-xs text-zinc-400">{item.party_name}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">{done}/{total}</span>
          {open ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
        </div>
      </button>

      {open && (
        <ul className="divide-y divide-zinc-50 dark:divide-zinc-800">
          {item.documents.map((doc, j) => (
            <li key={j} className="flex items-start gap-3 px-4 py-2">
              {doc.uploaded ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-zinc-300" />
              )}
              <div>
                <p className={cn('text-sm', doc.uploaded && 'text-zinc-400 line-through')}>
                  {doc.name}
                  {doc.required && <span className="ml-1 text-red-400">*</span>}
                </p>
                {doc.notes && <p className="text-xs text-zinc-400">{doc.notes}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
