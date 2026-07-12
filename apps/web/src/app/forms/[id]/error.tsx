'use client'
import { useEffect } from 'react'

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-zinc-500">Algo deu errado ao carregar este formulário.</p>
      <button
        onClick={reset}
        className="rounded-lg bg-teal-600 px-4 py-2 text-sm text-white hover:bg-teal-700"
      >
        Tentar novamente
      </button>
    </div>
  )
}
