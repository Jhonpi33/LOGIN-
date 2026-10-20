# Guía: estructura y comandos de Quasar + Pinia + Vue 3

Guía para **copiar este patrón a cualquier otro proyecto**. Todo lo de aquí salió
del proyecto frontend `quasar/` (Vue 3 + Vite + Quasar + Pinia + Vue Router) y
está escrito para funcionar contra este backend (`backend_prueba`).

---

## 0. La idea en una frase

```
Quasar (UI)  →  solo pinta botones, tablas, drawers
Vue 3        →  la lógica del componente (<script setup>)
Pinia        →  el estado compartido entre componentes (con persistencia)
Vue Router   →  decide qué vista se muestra en cada URL
     │
     └──── services/ (axios) ──── HTTP + JSON ────> Express :4500 ──> MongoDB
```

Ninguno de los cuatro se entera de los otros tres más allá de lo que se
importa. Por eso se pueden copiar piezas por separado a otro proyecto.

---

## 1. Comandos

### 1.1 Crear el proyecto (dos caminos, elige uno)

**Camino A — Vite + plugin de Quasar (el que usa este proyecto, recomendado)**

```bash
npm create vite@latest mi-front -- --template vue
cd mi-front
npm install
npm install quasar @quasar/extras pinia pinia-plugin-persistedstate vue-router axios
npm install -D @quasar/vite-plugin sass-embedded
npm run dev
```

**Camino B — Quasar CLI (trae `quasar dev`, `quasar build`,/layouts con `q-page`)**

```bash
npm init quasar
cd mi-front
npm install
npm run dev        # equivalente a `quasar dev`
```

> Diferencia clave: con el **CLI** los comandos son `quasar dev / quasar build /
> quasar new page` y el archivo `quasar.config.js` manda. Con **Vite + plugin**
> los comandos son los de Vite (`npm run dev`, `npm run build`) y todo se
> configura en `vite.config.js`. **Este proyecto usa Vite + plugin.**

### 1.2 Comandos del día a día

| Comando                       | Qué hace                                    |
|-------------------------------|---------------------------------------------|
| `npm run dev`                 | servidor de desarrollo en `http://localhost:5173` |
| `npm run build`               | genera `dist/` listo para producción        |
| `npm run preview`             | sirve el `dist/` para revisarlo en local    |
| `npm install`                 | instala todo lo del `package.json`          |
| `npm install <paquete>`       | agrega una dependencia y la escribe en `package.json` |
| `npm uninstall <paquete>`     | la quita                                    |
| `npm run dev -- --host`       | lo expone en la red local (para celular)    |

### 1.3 Versiones usadas (las que funcionan juntas)

```json
{
  "vue": "^3.5.41",
  "vue-router": "^4.6.4",
  "pinia": "^4.0.3",
  "pinia-plugin-persistedstate": "^4.7.1",
  "quasar": "^2.28.0",
  "@quasar/extras": "^2.0.4",
  "@quasar/vite-plugin": "^2.0.2",
  "vite": "^8.2.2"
}
```

> Si `npm run dev` revienta después de instalar algo, casi siempre es por
> **versiones desalineadas**. Borra `node_modules` y `package-lock.json` y
> vuelve a `npm install`.

---

## 2. Estructura de carpetas (así se copia a otro proyecto)

```
mi-front/
├── index.html                 <- único HTML: <div id="app"> + main.js
├── vite.config.js             <- plugins de Vite y de Quasar
├── package.json               <- dependencias y scripts
├── .env                       <- VITE_API_URL=... (NO se sube a git)
├── public/                    <- archivos tal cual (favicon, logos)
└── src/
    ├── main.js                <- PUNTO DE ENTRADA: monta Vue + Quasar + Pinia + Router
    ├── App.vue                <- maqueta general: header, drawer, footer, <router-view>
    ├── quasar-variables.sass  <- colores de la marca (primary, secondary, ...)
    ├── style.css              <- estilos globales (index.sass de Quasar va en main.js)
    ├── assets/                <- imágenes y fuentes
    ├── components/            <- componentes reutilizables (botones, tablas, forms)
    ├── views/                 <- una vista por ruta: Productos.vue, Ventas.vue, Compras.vue
    ├── routes/routes.js       <- definición de rutas + history
    ├── stores/stores.js       <- stores de Pinia
    └── services/              <- axios: api.js + un archivo por recurso del backend
        ├── api.js
        ├── cursos.service.js
        └── aprendices.service.js
```

**Regla mental:** `views/` pinta pantallas, `components/` se reutilizan,
`stores/` guarda estado compartido, `services/` habla con el backend. Si una
función hace dos de esas cosas, está en el archivo equivocado.

> **Ruta de importación:** en `views/` los imports van con `../`
> (`../stores/stores`), en `App.vue` y `main.js` con `./`
> (`./stores/stores`). Olvidar el `../` es el error #1 al copiar un archivo de
> una carpeta a otra.

---

## 3. Archivos de configuración

### 3.1 `vite.config.js`

```js
import vue from '@vitejs/plugin-vue'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

export default defineConfig({
  plugins: [
    vue({ template: { transformAssetUrls } }),   // compila los .vue
    quasar({                                     // compila Quasar en modo JIT
      sassVariables: join(import.meta.dirname, 'src/quasar-variables.sass')
    })
  ]
})
```

`transformAssetUrls` es obligatorio: sin él, los `src` de las imágenes dentro
de los componentes Quasar no se procesan.

### 3.2 `index.html`

```html
<div id="app"></div>
<script type="module" src="/src/main.js"></script>
```

Vue se monta sobre `#app`. Este archivo es el único que no está en `src/`.

### 3.3 `src/main.js` — el orden importa

```js
import { createApp } from 'vue'
import './style.css'
import { Quasar } from 'quasar'
import App from './App.vue'
import { router } from './routes/routes.js'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// 1) estilos de Quasar (iconos + css base)
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

const pinia = createPinia()
const app = createApp(App)

app.use(Quasar, { plugins: {} })   // 2) Quasar (agrega aquí Notify, Dialog, Loading...)
app.use(pinia)                     // 3) Pinia ANTES de cualquier store
pinia.use(piniaPluginPersistedstate) // 4) plugin de persistencia
app.use(router)                    // 5) Router al final
app.mount('#app')
```

**Orden correcto:** Quasar → Pinia → plugin de persistencia → Router → `mount`.
Si montas la app antes de `app.use(pinia)`, cualquier store usado en un
componente revienta con *"getActivePinia was called with no active Pinia"*.

### 3.4 `src/quasar-variables.sass` — los colores

```sass
$primary   : #1976D2
$secondary : #26A69A
$accent    : #9C27B0
$dark      : #1D1D1D
$positive  : #21BA45
$negative  : #C10015
$info      : #31CCEC
$warning   : #F2C037
```

Estas variables se usan como clases: `class="bg-primary"`, `text-negative`,
`color="positive"`. Cambiar `$primary` aquí cambia **todo** el tema sin tocar
un solo componente.

---

## 4. Vue 3 — `<script setup>`

Todo componente vive en un `.vue` con tres bloques: `template` (lo que se ve),
`script setup` (la lógica) y opcional `style`.

```vue
<template>
  <div>
    <h1>soy Productos</h1>
    <button @click="useCarrito.aumCarrito()">Aumentar</button>
  </div>
</template>

<script setup>
import { useCarritoStore } from '../stores/stores'

const useCarrito = useCarritoStore()   // instancia el store
</script>
```

Lo esencial:

| Concepto                        | Ejemplo                                             |
|---------------------------------|-----------------------------------------------------|
| Variable reactiva               | `const total = ref(0)` → `total.value` en JS, `total` en el template |
| Estado calculado                | `const doble = computed(() => total.value * 2)`     |
| Propiedad (entrada)             | `defineProps(['titulo'])` → `props.titulo`          |
| Evento de salida                | `defineEmits(['guardado'])` → `$emit('guardado')`   |
| Ciclo de vida                   | `onMounted(() => cargar())` — cuando ya está en pantalla |
| Dos-way binding                 | `<input v-model="form.nombre">`                     |
| Condicional                     | `<p v-if="cargando">Cargando...</p>`                |
| Lista                           | `<li v-for="c in cursos" :key="c._id">{{ c.nombre }}</li>` |
| Evento                          | `<q-btn @click="guardar" />`                        |
| Navegación programática         | `const router = useRouter(); router.push('/ventas')` |

**Los tres estados de toda pantalla:** cargando, error, datos. Un componente
que solo maneja el caso feliz está incompleto.

```js
const cursos = ref([])
const cargando = ref(false)
const error = ref('')

const cargar = async () => {
  cargando.value = true
  error.value = ''
  try {
    const { data } = await cursosService.listar()
    cursos.value = data
  } catch (e) {
    error.value = e.response?.data?.msg || 'Error de conexion'
  } finally {
    cargando.value = false
  }
}
onMounted(cargar)
```

---

## 5. Vue Router — `src/routes/routes.js`

```js
import Compras   from '../views/Compras.vue'
import Ventas    from '../views/Ventas.vue'
import Productos from '../views/Productos.vue'
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'

const routes = [
  { path: '/',       component: Productos },
  { path: '/ventas', component: Ventas },
  { path: '/compras', component: Compras },
  { path: '/:pathMatch(.*)*', redirect: '/' }   // 404 -> inicio
]

export const router = createRouter({
  routes,
  history: createWebHashHistory()
})
```

| `history`               | URL resultante                    | Cuándo usarlo                          |
|-------------------------|-----------------------------------|----------------------------------------|
| `createWebHashHistory()`| `http://host/#/ventas`            | **Deploy en estáticos / subcarpeta**: no exige configurar el servidor |
| `createWebHistory()`    | `http://host/ventas`              | Producción con reescritura de rutas (nginx, Netlify, Vercel) |

Y en `App.vue`, el router escribe **dentro** de la maqueta:

```html
<q-page-container>
  <router-view />     <!-- aquí se monta la vista de la URL actual -->
</q-page-container>
```

Navegar (tres formas válidas, la primera es la de Quasar):

```html
<q-btn to="/ventas">Ventas</q-btn>
<router-link to="/compras"><button>Compras</button></router-link>
```
```js
import { useRouter } from 'vue-router'
const router = useRouter()
router.push('/ventas')
```

> **No olvides `name` en las rutas** si vas a navegar por nombre:
> `{ path: '/ventas', name: 'ventas', component: Ventas }` y luego
> `router.push({ name: 'ventas' })`.

---

## 6. Pinia — el estado compartido

### 6.1 Store estilo *setup* (el que usa este proyecto)

`src/stores/stores.js`:

```js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCarritoStore = defineStore('carrito', () => {
  const contadorCarrito = ref(15)

  // getter
  const estaVacio = computed(() => contadorCarrito.value === 0)

  // actions
  function aumCarrito()  { contadorCarrito.value++ }
  function dismCarrito() { contadorCarrito.value-- }

  return { contadorCarrito, estaVacio, aumCarrito, dismCarrito }
}, {
  persist: true     // <- guarda el estado en localStorage automáticamente
})
```

- El **primer argumento** es el **id** del store (`'carrito'`): debe ser único.
- El **segundo** es la función con `ref` + `computed` + funciones (estado,
  getters y actions se devuelven en el mismo `return`).
- El **tercero** es la configuración: `persist: true` activa
  `pinia-plugin-persistedstate` (registrado en `main.js`).

> `persist` es lo que hace que el contador sobreviva a un F5. Sin el plugin en
> `main.js`, `persist: true` **no hace nada ni avisa**.

### 6.2 Usarlo en cualquier componente

```js
import { useCarritoStore } from '../stores/stores'
const useCarrito = useCarritoStore()      // se llama SIEMPRE en cada componente
```
```html
<q-badge color="orange">{{ useCarrito.contadorCarrito }}</q-badge>
<button @click="useCarrito.aumCarrito()">Aumentar</button>
```

Un **mismo store compartido**: el cambio hecho en `Productos.vue` se ve en
`App.vue` al instante, porque los dos apuntan a la misma instancia.

### 6.3 Ejemplo real para este backend: `useAuthStore`

```js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { usuariosService } from '../services/usuarios.service'

export const useAuthStore = defineStore('auth', () => {
  const token = ref('')
  const usuario = ref(null)

  const autenticado = computed(() => !!token.value)
  const esAdmin = computed(() => usuario.value?.rol === 'ADMIN')

  async function login(email, password) {
    const { data } = await usuariosService.login({ email, password })
    token.value = data.token
    usuario.value = data.usuario
  }

  function logout() {
    token.value = ''
    usuario.value = null
  }

  return { token, usuario, autenticado, esAdmin, login, logout }
}, { persist: true })
```

Y el interceptor de axios (una sola vez, en `services/api.js`):

```js
api.interceptors.request.use((config) => {
  const { token } = useAuthStore()   // ya con persistencia, trae el token guardado
  if (token) config.headers['x-token'] = token
  return config
})
```

**Dónde vive cada cosa:**

| Dato                        | ¿Store de Pinia? | Ejemplo                                  |
|-----------------------------|------------------|------------------------------------------|
| Sesión / token / usuario    | **Sí**           | `useAuthStore`                           |
| Carrito, filtros globales, contador | **Sí**   | `useCarritoStore`                        |
| Texto de un input           | No               | `ref` dentro del componente              |
| Datos de una tabla          | No (salvo que 2+ pantallas los usen) | `ref` + `onMounted` |
| Preferencia oscura          | Sí               | `useThemeStore` con `persist`            |

---

## 7. Quasar — los componentes que más se usan

### 7.1 La maqueta (`App.vue`)

```html
<q-layout view="hHh lpR fFf">
  <q-header elevated class="bg-primary text-white">
    <q-toolbar>
      <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
      <q-toolbar-title>Titulo</q-toolbar-title>
    </q-toolbar>
  </q-header>

  <q-drawer v-model="leftDrawerOpen" side="left" overlay behavior="mobile" bordered>
    <q-btn to="/">Productos</q-btn>
  </q-drawer>

  <q-page-container>
    <router-view />
  </q-page-container>

  <q-footer elevated class="bg-grey-8 text-white">...</q-footer>
</q-layout>
```

`view="hHh lpR fFf"` define la disposición: header fijo de altura normal,
drawer a la izquierda, footer fijo. El contenido **siempre** va dentro de
`<q-page-container>`, y si usas el CLI de Quasar, cada vista empieza con
`<q-page>`.

### 7.2 Componentes de uso diario

| Componente / directiva | Para qué                       | Ejemplo corto                          |
|------------------------|--------------------------------|----------------------------------------|
| `q-btn`                | botón                          | `<q-btn color="primary" icon="add" label="Nuevo" />` |
| `q-input`              | campo de texto                 | `<q-input v-model="form.nombre" label="Nombre" />` |
| `q-select`             | combo / dropdown               | `<q-select v-model="f.curso" :options="cursos" option-value="_id" option-label="nombre" />` |
| `q-table`              | tabla con paginación y búsqueda | `:rows="cursos" :columns="cols" row-key="_id"` |
| `q-dialog`             | modal                          | `<q-dialog v-model="abrir"><q-card>...</q-card></q-dialog>` |
| `q-form`               | formulario con validación      | `<q-form @submit.prevent="guardar">`   |
| `q-badge`              | indicador                      | `<q-badge color="orange" floating>15</q-badge>` |
| `q-card`               | contenedor con sombra          | `<q-card><q-card-section>...</q-card-section></q-card>` |
| `q-list` / `q-item`    | menús y listas                 | `<q-item clickable @click="irA(ruta)">` |
| `q-inner-loading`      | spinner dentro de una tabla    | `<q-inner-loading :showing="cargando" />` |
| `v-close-popup`        | cierra el menú/dialogo al clic | `<q-item v-close-popup>`               |

### 7.3 Iconos

Usan **Material Icons** (importados en `main.js`), y van como texto en
`icon`, no como componentes:

```html
<q-btn icon="add" />
<q-icon name="edit" color="primary" />
<q-icon name="delete" color="negative" />
```

Los más usados: `add`, `edit`, `delete`, `search`, `menu`, `close`,
`visibility`, `visibility_off`, `shopping_cart`, `logout`, `refresh`.
Lista completa: <https://fonts.google.com/icons>

### 7.4 Plugins de Quasar (avisos flotantes)

Se registran **una sola vez** en `main.js`:

```js
import { Notify } from 'quasar'
app.use(Quasar, { plugins: { Notify } })
```

Y se usan desde cualquier componente sin importar nada:

```js
import { useQuasar } from 'quasar'
const $q = useQuasar()

$q.notify({ type: 'positive', message: 'Curso registrado correctamente' })
$q.notify({ type: 'negative', message: e.response?.data?.msg || 'Error' })
```

Otros plugins habituales: `Dialog` (confirmar antes de eliminar), `Loading`
(spinners globales), `Dark` (modo oscuro).

### 7.5 Animaciones y utilidades

```html
<q-page class="q-pa-md q-gutter-sm">   <!-- padding y espaciado -->
<q-card class="q-mt-md">               <!-- margin-top -->
<div class="row q-col-gutter-md">       <!-- fila con columnas -->
  <div class="col-12 col-sm-6">...</div>
</div>
<transition appear enter-active-class="animated fadeIn">...</transition>
```

---

## 8. Conectar este frontend con `backend_prueba`

1. **Levanta el backend** (`npm run dev` en `backend_prueba`, puerto **4500**)
   y prueba la API sola: `POST /api/usuarios/login` con
   `{"email":"admin@sena.edu.co","password":"123456"}`.

2. **`.env` en el frontend:**

   ```
   VITE_API_URL=http://localhost:4500/api
   ```

3. **`src/services/api.js`:**

   ```js
   import axios from 'axios'
   import { useAuthStore } from '../stores/auth.store'

   const api = axios.create({
     baseURL: import.meta.env.VITE_API_URL,
     headers: { 'Content-Type': 'application/json' }
   })

   api.interceptors.request.use((config) => {
     const { token } = useAuthStore()
     if (token) config.headers['x-token'] = token
     return config
   })

   export default api
   ```

4. **`src/services/cursos.service.js`:**

   ```js
   import api from './api'
   export const cursosService = {
     listar: (status) => api.get('/cursos', { params: { status } }),
     crear: (data) => api.post('/cursos/register', data),
     actualizar: (id, data) => api.put(`/cursos/update/${id}`, data),
     desactivar: (id) => api.put(`/cursos/inactive/${id}`)
   }
   ```

5. **Nunca desde el componente a axios directo:** componente → *store* o
   *service* → backend. Si cambia una ruta del backend, se toca **un** archivo.

**Recordatorio de los códigos del backend:**

| Código | Significado | Qué hace el frontend               |
|--------|-------------|-------------------------------------|
| 400    | datos inválidos | mostrar `errors[]` o `msg` en pantalla |
| 401    | sin token / vencido | `logout()` y `router.push('/login')` |
| 404    | la URL no existe | revisar `services/*.js`             |

---

## 9. Recetas (para replicar en otro proyecto)

### 9.1 Agregar una vista + ruta

1. Crear `src/views/Nueva.vue`.
2. Importarla y agregar la fila en `src/routes/routes.js`.
3. Agregar el botón en el drawer de `App.vue` (`<q-btn to="/nueva">`).

### 9.2 Agregar un store

1. Crear `src/stores/xxx.store.js` con `defineStore('id', () => {...}, { persist: true })`.
2. Importarlo en el componente: `const x = useXxxStore()`.
3. Si usa `persist`, verificar que `piniaPluginPersistedstate` esté en `main.js`.

### 9.3 Agregar un recurso del backend (cursos → instructores)

1. `src/services/instructores.service.js` con los métodos del README del backend.
2. `src/stores/instructores.store.js` (opcional, si más de una pantalla lo usa).
3. `src/views/Instructores.vue` con `onMounted(cargar)`.
4. Ruta en `routes.js` + botón en `App.vue`.

**Siempre en ese orden. Nada más.**

---

## 10. Errores frecuentes

| Síntoma | Causa real | Dónde se arregla |
|---|---|---|
| `getActivePinia was called with no active Pinia` | Falta `app.use(pinia)` o se usa el store antes de montarlo | `main.js` |
| `persist: true` no recuerda nada | No está registrado `piniaPluginPersistedstate` | `main.js` |
| `Failed to resolve import "../stores/stores"` | Falta el `../` (o sobra) según la carpeta | el import del componente |
| `Quasar is not defined` / estilos rotos | Faltan los imports de `quasar/src/css/index.sass` o de `@quasar/extras` | `main.js` |
| Los colores `bg-primary` no cambian | El archivo no se llama `quasar-variables.sass` o no está en `vite.config.js` | `vite.config.js` |
| Iconos no se ven | No se importó `@quasar/extras/material-icons/material-icons.css` | `main.js` |
| La vista no cambia al navegar | Falta `<router-view />` o la ruta no existe | `App.vue` / `routes.js` |
| Página en blanco (404) al refrescar con `createWebHistory` | El servidor no reescribe todo a `index.html` | usar `createWebHashHistory()` o configurar el server |
| `blocked by CORS policy` | El backend no tiene `cors()` o es otro puerto | Backend `server.js` |
| `401 No hay token en la peticion` | No se inyectó `x-token` | interceptor en `services/api.js` |
| El contador/pantalla se reinicia en F5 | El dato vive en un `ref` local y no en un store con `persist` | moverlo a Pinia |
| `X has already been registered` | Se importó un componente dos veces o el store se definió en dos archivos | revisar imports |
| Vite no ve cambios en `.env` | Hay que reiniciar `npm run dev` | terminal |

**Herramienta obligatoria:** pestaña **Network** del navegador (F12). Ahí se ve
la URL exacta, la cabecera `x-token`, el body y la respuesta. Y la pestaña
**Vue** (extensión Vue Devtools / Volar) para inspeccionar los stores de Pinia
en vivo.

---

## 11. Checklist al copiar este patrón a otro proyecto

- [ ] `npm run dev` levanta sin errores en `localhost:5173`.
- [ ] `main.js` monta en este orden: Quasar → Pinia → plugin → Router → `mount`.
- [ ] `vite.config.js` tiene `vue({ template: { transformAssetUrls } })` y `quasar(...)`.
- [ ] Existe `src/quasar-variables.sass` con los colores.
- [ ] `App.vue` tiene `<q-layout>` con `<q-page-container><router-view /></q-page-container>`.
- [ ] Cada vista de `views/` tiene su fila en `routes.js`.
- [ ] `.env` con `VITE_API_URL` y `services/api.js` con el interceptor de `x-token`.
- [ ] Todo componente tiene sus tres estados: cargando / error / datos.
- [ ] El backend responde con CORS habilitado y el token llega en `x-token`.
