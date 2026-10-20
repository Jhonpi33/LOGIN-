import axios from 'axios'
import { useAuthStore } from '../stores/auth.store'

// Instancia unica: si mañana cambia la URL del backend, se cambia en UN solo lugar.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // http://localhost:4500/api
  headers: { 'Content-Type': 'application/json' }
})

// El token se inyecta aqui, una sola vez, para TODAS las peticiones.
api.interceptors.request.use((config) => {
  const { token } = useAuthStore() // con persistencia trae el token ya guardado
  if (token) config.headers['x-token'] = token
  return config
})

// Si el backend responde 401 (token vencido o ausente), se cierra la sesion.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const auth = useAuthStore()
      auth.logout()
    }
    return Promise.reject(error)
  }
)

export default api
