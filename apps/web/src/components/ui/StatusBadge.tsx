import { cn } from '@/lib/utils'

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending:         { label: 'Aguardando',  color: 'bg-zinc-100 text-zinc-500' },
  analyzing:       { label: 'Analisando',  color: 'bg-blue-100 text-blue-600' },
  checklist_ready: { label: 'Checklist OK', color: 'bg-yellow-100 text-yellow-700' },
  filling:         { label: 'Preenchendo', color: 'bg-orange-100 text-orange-600' },
  filled:          { label: 'Pronto',       color: 'bg-green-100 text-green-700' },
  error:           { label: 'Erro',         color: 'bg-red-100 text-red-600' },
}

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? { label: status, color: 'bg-zinc-100 text-zinc-500' }
  return (
    <span className={cn('rounded-full px-3 py-1 text-xs font-medium', s.color)}>
      {s.label}
    </span>
  )
}
