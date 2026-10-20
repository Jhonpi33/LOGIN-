import api from './api'

// GET /api/aprendices trae el curso poblado (populate) -> fila.curso.nombre
export const aprendicesService = {
  listar: (status) => api.get('/aprendices', { params: { status } }),
  porCurso: (cursoId) => api.get(`/aprendices/curso/${cursoId}`),
  obtener: (id) => api.get(`/aprendices/${id}`),
  crear: (data) => api.post('/aprendices/register', data),
  actualizar: (id, data) => api.put(`/aprendices/update/${id}`, data),
  activar: (id) => api.put(`/aprendices/active/${id}`),
  desactivar: (id) => api.put(`/aprendices/inactive/${id}`)
}
