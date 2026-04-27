import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const baseURL =
  import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:3001/api'

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const url: string = error.config?.url ?? ''
      const isAuthEndpoint = url.startsWith('/auth/')
      const wasLoggedIn = useAuthStore.getState().isAuthenticated

      // Token expired or revoked while the user was logged in: force logout.
      // Skip /auth/* responses since those are normal auth-flow failures
      // (wrong password, OAuth rejected) handled by the login/register UI.
      if (!isAuthEndpoint && wasLoggedIn) {
        useAuthStore.getState().logout()
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.assign('/login?expired=1')
        }
      } else {
        // Defensive cleanup of stray storage even if not actively logged in.
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth-storage')
      }
    }
    return Promise.reject(error)
  },
)

export default api
