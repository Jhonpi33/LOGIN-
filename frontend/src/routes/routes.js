import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Cursos from '../views/Cursos.vue'
import Aprendices from '../views/Aprendices.vue'
import Usuarios from '../views/Usuarios.vue'
import Perfil from '../views/Perfil.vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'

const routes = [
  { path: '/login', name: 'login', component: Login, meta: { publico: true } },
  { path: '/home', name: 'home', component: Home },
  { path: '/cursos', name: 'cursos', component: Cursos },
  { path: '/aprendices', name: 'aprendices', component: Aprendices },
  { path: '/usuarios', name: 'usuarios', component: Usuarios },
  { path: '/perfil', name: 'perfil', component: Perfil },
  { path: '/', redirect: '/home' },
  { path: '/:pathMatch(.*)*', redirect: '/' } // 404 -> inicio
]

export const router = createRouter({
  routes,
  history: createWebHashHistory() // sirve en estaticos y en subcarpeta: #/login
})

// Guardia global: sin token no se entra a las rutas que no son publicas.
router.beforeEach((to) => {
  const auth = useAuthStore()

  if (!to.meta.publico && !auth.autenticado) {
    return { name: 'login' }
  }

  // Con sesion activa no tiene sentido volver al login.
  if (to.name === 'login' && auth.autenticado) {
    return { name: 'home' }
  }
})
