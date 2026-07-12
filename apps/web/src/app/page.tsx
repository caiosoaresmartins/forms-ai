import { UploadZone } from '@/components/upload/UploadZone'
import { Logo } from '@/components/ui/Logo'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 px-4 py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <Logo />
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Forms AI
        </h1>
        <p className="max-w-md text-zinc-500 dark:text-zinc-400">
          Envie um formulário PDF e nossa IA identifica as partes, gera a checklist de documentos e preenche automaticamente.
        </p>
      </div>

      <UploadZone />
    </main>
  )
}
