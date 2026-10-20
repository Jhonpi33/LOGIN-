import api from './api'

/**
 * Endpoints de /api/usuarios.
 *  - login:    PUBLICO (es como se consigue el token)
 *  - register: solo ADMIN
 *  - get:      cualquier usuario con sesion (VER la lista)
 *  - put:      solo ADMIN (editar, rol, activar/desactivar)
 */
export const usuariosService = {
  login: (data) => api.post('/usuarios/login', data),
  register: (data) => api.post('/usuarios/register', data),

  listar: (status) => api.get('/usuarios', { params: { status } }),
  obtener: (id) => api.get(`/usuarios/${id}`),

  actualizar: (id, data) => api.put(`/usuarios/update/${id}`, data),
  cambiarRol: (id, rol) => api.put(`/usuarios/role/${id}`, { rol }),
  activar: (id) => api.put(`/usuarios/active/${id}`),
  desactivar: (id) => api.put(`/usuarios/inactive/${id}`)
}
