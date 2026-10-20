import api from './api'

// GET /api/cursos requiere la cabecera x-token: la inyecta el interceptor de api.js
export const cursosService = {
  listar: (status) => api.get('/cursos', { params: { status } }),
  obtener: (id) => api.get(`/cursos/${id}`),
  crear: (data) => api.post('/cursos/register', data),
  actualizar: (id, data) => api.put(`/cursos/update/${id}`, data),
  activar: (id) => api.put(`/cursos/active/${id}`),
  desactivar: (id) => api.put(`/cursos/inactive/${id}`)
}
