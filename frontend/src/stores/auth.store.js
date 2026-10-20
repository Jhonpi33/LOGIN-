import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usuariosService } from '../services/usuarios.service'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const token = ref('')
    const usuario = ref(null)

    // getters
    const autenticado = computed(() => !!token.value)
    const esAdmin = computed(() => usuario.value?.rol === 'ADMIN')
    const nombre = computed(() => usuario.value?.nombre || '')

    // actions
    async function login(email, password) {
      const { data } = await usuariosService.login({ email, password })
      token.value = data.token
      usuario.value = data.usuario
      return data
    }

    function logout() {
      token.value = ''
      usuario.value = null
    }

    return { token, usuario, autenticado, esAdmin, nombre, login, logout }
  },
  {
    persist: true // guarda token y usuario en localStorage (sobrevive al F5)
  }
)
