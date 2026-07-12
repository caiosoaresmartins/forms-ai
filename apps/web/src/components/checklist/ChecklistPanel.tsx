'use client'
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Upload } from 'lucide-react'
import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

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
  formId: string
  checklist: { checklist: ChecklistItem[] } | null
  onUpdate?: () => void
}

const PARTY_LABELS: Record<string, string> = {
  buyer: 'Comprador',
  seller: 'Vendedor',
  witness: 'Testemunha',
  procurator: 'Procurador',
  spouse: 'Cônjuge',
}

export function ChecklistPanel({ formId, checklist, onUpdate }: Props) {
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
          <ChecklistGroup
            key={i}
            formId={formId}
            item={item}
            partyIndex={i}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  )
}

function ChecklistGroup({
  formId,
  item,
  partyIndex,
  onUpdate,
}: {
  formId: string
  item: ChecklistItem
  partyIndex: number
  onUpdate?: () => void
}) {
  const [open, setOpen] = useState(true)
  const [uploading, setUploading] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingDocIndex, setPendingDocIndex] = useState<number | null>(null)

  const label = PARTY_LABELS[item.party_type] ?? item.party_type
  const total = item.documents.length
  const done = item.documents.filter((d) => d.uploaded).length

  async function handleToggle(docIndex: number, current: boolean) {
    await api.patch(
      `/forms/${formId}/checklist/${partyIndex}/${docIndex}`,
      { uploaded: !current },
    )
    onUpdate?.()
  }

  function handleUploadClick(docIndex: number) {
    setPendingDocIndex(docIndex)
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || pendingDocIndex === null) return
    setUploading(pendingDocIndex)
    try {
      const formData = new FormData()
      formData.append('file', file)
      await api.post(`/forms/${formId}/parties/${item.party_index}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await api.patch(
        `/forms/${formId}/checklist/${partyIndex}/${pendingDocIndex}`,
        { uploaded: true },
      )
      onUpdate?.()
    } finally {
      setUploading(null)
      setPendingDocIndex(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="rounded-xl border border-zinc-100 dark:border-zinc-800">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium">{label}</span>
          {item.party_name && (
            <span className="text-sm text-zinc-500">— {item.party_name}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400">
            {done}/{total}
          </span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {open && (
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {item.documents.map((doc, di) => (
            <li key={di} className="flex items-start gap-3 px-4 py-3">
              <button
                onClick={() => handleToggle(di, doc.uploaded ?? false)}
                className="mt-0.5 shrink-0 text-zinc-400 hover:text-emerald-500 transition-colors"
                aria-label={doc.uploaded ? 'Desmarcar entregue' : 'Marcar como entregue'}
              >
                {doc.uploaded ? (
                  <CheckCircle2 size={18} className="text-emerald-500" />
                ) : (
                  <Circle size={18} />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-sm',
                    doc.uploaded && 'line-through text-zinc-400',
                  )}
                >
                  {doc.name}
                  {doc.required && (
                    <span className="ml-1 text-xs text-red-400">*</span>
                  )}
                </p>
                {doc.notes && (
                  <p className="text-xs text-zinc-400 mt-0.5">{doc.notes}</p>
                )}
              </div>

              <button
                onClick={() => handleUploadClick(di)}
                disabled={uploading === di}
                className="shrink-0 text-zinc-400 hover:text-blue-500 transition-colors disabled:opacity-40"
                aria-label="Enviar arquivo"
              >
                <Upload size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
