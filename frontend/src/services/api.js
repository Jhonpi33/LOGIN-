import axios from 'axios'
import { useAuthStore } from '../stores/auth.store'

// Instancia unica: si mañana cambia la URL del backend, se cambia en UN solo lugar.
//
//  - EN DESARROLLO: el frontend corre en :5173 y el backend en :4500, así que
//    hay que poner la URL completa (sale de frontend/.env -> VITE_API_URL).
//  - EN PRODUCCION (Render): el backend SIRVE el frontend, los dos viven en el
//    mismo dominio, así que basta con "/api" (relativo a donde esté la pagina).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
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
