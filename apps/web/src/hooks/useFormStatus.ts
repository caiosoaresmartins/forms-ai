import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

type FormStatus = {
  form_id: string
  status: string
}

type Parties = Record<string, unknown[]>
type Checklist = { checklist: unknown[] }

export function useFormStatus(formId: string) {
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

  const checklistQuery = useQuery<{ checklist: Checklist }>({
    queryKey: ['form-checklist', formId],
    queryFn: async () => {
      const { data } = await api.get(`/forms/${formId}/checklist`)
      return data
    },
    enabled: isDone,
    retry: false,
  })

  return {
    status,
    parties: partiesQuery.data?.parties ?? null,
    checklist: checklistQuery.data?.checklist ?? null,
    isLoading: statusQuery.isLoading,
  }
}
