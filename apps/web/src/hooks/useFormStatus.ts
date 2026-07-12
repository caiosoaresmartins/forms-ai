import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

type FormStatus = {
  form_id: string
  status: string
}

type Parties = Record<string, unknown[]>

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

type ChecklistResponse = {
  checklist: ChecklistItem[]
}

export function useFormStatus(formId: string) {
  const queryClient = useQueryClient()

  const statusQuery = useQuery<FormStatus>({
    queryKey: ['form-status', formId],
    queryFn: async () => {
      const { data } = await api.get(`/forms/${formId}/status`)
      return data
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (!status || ['filled', 'error'].includes(status)) return false
      return 3000
    },
  })

  const status = statusQuery.data?.status ?? 'pending'
  const isDone = ['filled', 'error', 'checklist_ready'].includes(status)

  const partiesQuery = useQuery<{ parties: Parties }>({
    queryKey: ['form-parties', formId],
    queryFn: async () => {
      const { data } = await api.get(`/forms/${formId}/parties`)
      return data
    },
    enabled: isDone,
    retry: false,
  })

  const checklistQuery = useQuery<ChecklistResponse>({
    queryKey: ['form-checklist', formId],
    queryFn: async () => {
      const { data } = await api.get(`/forms/${formId}/checklist`)
      return data
    },
    enabled: isDone,
    retry: false,
  })

  function refetch() {
    queryClient.invalidateQueries({ queryKey: ['form-checklist', formId] })
  }

  return {
    status,
    parties: partiesQuery.data?.parties ?? null,
    checklist: checklistQuery.data ?? null,
    isLoading: statusQuery.isLoading,
    refetch,
  }
}
