'use client'
import { User, Building2 } from 'lucide-react'

type Party = {
  index: number
  type: 'person' | 'company'
  name_field: string
}

type Parties = {
  buyers?: Party[]
  sellers?: Party[]
  witnesses?: Party[]
  procurators?: Party[]
  spouses?: Party[]
}

type Props = { parties: Parties | null }

const LABELS: Record<string, string> = {
  buyers: 'Compradores',
  sellers: 'Vendedores',
  witnesses: 'Testemunhas',
  procurators: 'Procuradores',
  spouses: 'Cônjuges',
}

export function PartiesPanel({ parties }: Props) {
  const entries = Object.entries(parties ?? {}).filter(([, list]) => list && list.length > 0)

  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold">Partes</h2>
        <p className="text-sm text-zinc-400">Nenhuma parte identificada ainda.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold">Partes identificadas</h2>
      <div className="flex flex-col gap-4">
        {entries.map(([key, list]) => (
          <div key={key}>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-400">
              {LABELS[key] ?? key}
            </p>
            <ul className="flex flex-col gap-2">
              {(list as Party[]).map((party, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800"
                >
                  {party.type === 'company' ? (
                    <Building2 className="h-4 w-4 shrink-0 text-zinc-400" />
                  ) : (
                    <User className="h-4 w-4 shrink-0 text-zinc-400" />
                  )}
                  <span className="text-sm">{party.name_field}</span>
                  <span className="ml-auto text-xs text-zinc-300">#{party.index}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
