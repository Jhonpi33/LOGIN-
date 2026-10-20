import { createApp } from 'vue'
import { Quasar } from 'quasar'          // componentes; los avisos son de notivue
import { createNotivue } from 'notivue'  // notificaciones tipo "toast"
import App from './App.vue'
import { router } from './routes/routes.js'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// 1) estilos base: Quasar primero, los nuestros DESPUES para poder sobreescribir
import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

import 'notivue/notification.css' // estructura de las notificaciones
import 'notivue/animations.css'   // entran/salen de arriba

import './style.css'

// 2) stream de notificaciones: centradas arriba, maximo 3 en pantalla y en cola
const notivue = createNotivue({
  position: 'top-center',
  limit: 3,
  enqueue: true,
  avoidDuplicates: true,
  pauseOnHover: true,
  notifications: {
    global: { duration: 3200 },
    error: { duration: 5200 }
  }
})

const pinia = createPinia()
const app = createApp(App)

app.use(notivue) // 3) notivue antes del mount para poder usar push.*
app.use(Quasar, {
  plugins: {},
  // 4) paleta del proyecto: azul rey + gris
  config: {
    brand: {
      primary: '#4169E1',
      secondary: '#1E3A8A',
      accent: '#64748B',
      dark: '#111827',
      positive: '#16A34A',
      negative: '#DC2626',
      info: '#4169E1',
      warning: '#F59E0B'
    }
  }
})
app.use(pinia)                   // 5) Pinia ANTES de cualquier store
pinia.use(piniaPluginPersistedstate) // 6) plugin de persistencia
app.use(router)                  // 7) Router al final
app.mount('#app')
