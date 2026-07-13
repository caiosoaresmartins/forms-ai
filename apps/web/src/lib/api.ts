/**
 * Cliente Axios centralizado para consumir a API FastAPI.
 * Injeta automaticamente o Bearer token em todas as requisições.
 */
import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

// Injeta token em todas as requisições
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redireciona para /login em 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// --- Auth ---
export const authApi = {
  login: (email: string, password: string) =>
    axios.post('/api/auth/login', { email, password }),
  register: (data: {
    email: string
    password: string
    full_name?: string
    tenant_name: string
    tenant_slug: string
  }) => axios.post('/api/auth/register', data),
  me: () => api.get('/auth/me'),
  refresh: (refresh_token: string) => api.post('/auth/refresh', { refresh_token }),
}

// --- Forms ---
export const formsApi = {
  list: () => api.get('/forms'),
  upload: (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.post('/forms/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  analyze: (id: string) => api.post(`/forms/${id}/analyze`),
  status: (id: string) => api.get(`/forms/${id}/status`),
  get: (id: string) => api.get(`/forms/${id}`),
}
