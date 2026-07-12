'use client'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'
import { Upload, FileText, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api'

type UploadState = 'idle' | 'uploading' | 'error'

export function UploadZone() {
  const router = useRouter()
  const [state, setState] = useState<UploadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const file = accepted[0]
      if (!file) return

      setState('uploading')
      setError(null)
      setProgress(0)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const { data } = await apiClient.post<{ form_id: string }>('/forms/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => {
            if (e.total) setProgress(Math.round((e.loaded / e.total) * 100))
          },
        })

        router.push(`/forms/${data.form_id}`)
      } catch (err: unknown) {
        setState('error')
        setError(err instanceof Error ? err.message : 'Erro ao enviar arquivo')
      }
    },
    [router],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024, // 20 MB
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex w-full max-w-xl cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed p-12 transition-colors',
        isDragActive
          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
          : 'border-zinc-200 bg-white hover:border-brand-400 dark:border-zinc-800 dark:bg-zinc-900',
        state === 'error' && 'border-red-400 bg-red-50 dark:bg-red-900/10',
      )}
    >
      <input {...getInputProps()} />

      {state === 'uploading' ? (
        <>
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <p className="text-sm text-zinc-500">{progress}% enviado…</p>
        </>
      ) : state === 'error' ? (
        <>
          <AlertCircle className="h-10 w-10 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={(e) => { e.stopPropagation(); setState('idle'); setError(null) }}
            className="text-xs text-zinc-400 underline"
          >
            Tentar novamente
          </button>
        </>
      ) : (
        <>
          {isDragActive ? (
            <FileText className="h-10 w-10 text-brand-500" />
          ) : (
            <Upload className="h-10 w-10 text-zinc-400" />
          )}
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {isDragActive ? 'Solte o PDF aqui' : 'Arraste um PDF ou clique para selecionar'}
            </p>
            <p className="mt-1 text-xs text-zinc-400">Máximo 20 MB · somente PDF</p>
          </div>
        </>
      )}
    </div>
  )
}
