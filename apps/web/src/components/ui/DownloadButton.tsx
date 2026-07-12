'use client'
import { Download } from 'lucide-react'

export function DownloadButton({ formId }: { formId: string }) {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/forms/${formId}/download`

  return (
    <a
      href={url}
      download
      className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
    >
      <Download className="h-4 w-4" />
      Baixar PDF
    </a>
  )
}
