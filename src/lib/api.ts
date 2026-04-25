import axios from 'axios'

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
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth-storage')
    }
    return Promise.reject(error)
  },
)

export default api
