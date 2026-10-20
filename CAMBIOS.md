# Registro de cambios — Proyecto LOGIN

> **Archivo de control.** Aquí queda apuntado **cada cambio** que hacemos:
> qué se hizo, **en qué archivo**, por qué y cómo probarlo.
> Se actualiza **cada vez que hacemos algo nuevo** (la entrada más reciente va
> al final del historial).

---

## 1. Cómo se ejecuta el proyecto

**Un solo comando** (levanta backend **y** frontend a la vez):

```bash
cd LOGIN/frontend && npm run dev
```

- línea **`[api]`** → backend en el puerto **4500** (nodemon + MongoDB)
- línea **`[web]`** → frontend en **http://localhost:5173**

Comandos separados (si prefieres dos terminales):

```bash
cd LOGIN/backend_prueba && npm run dev   # solo backend
cd LOGIN/frontend && npm run dev:web     # solo frontend
```

| Credencial | Valor |
|---|---|
| Admin | `admin@sena.edu.co` / `123456` |
| Admin extra | `admin.nuevo@correo.com` / `123456` |
| Usuario común (solo lectura) | `demo.user@correo.com` / `123456` |

---

## 2. Qué hay montado (arquitectura)

```
LOGIN/
├── backend_prueba/      ← DADO POR EL PROFE (Express + Mongoose)
│   ├── server.js            rutas + middlewares + CORS
│   ├── database.js          conexión a MongoDB (MONGO_URL)
│   ├── controller/          lógica de cada recurso
│   ├── routes/              URLs de la API
│   ├── validations/         express-validator
│   ├── middlewares/         validateJWT, validateFields, validateAdmin (NUESTRO)
│   └── .env                 MONGO_URL, PUERTO 4500, clave JWT
│
└── frontend/            ← CREADO POR NOSOTROS (Vite + Vue 3 + Quasar + Pinia + Axios)
    ├── .env                     VITE_API_URL=http://localhost:4500/api
    ├── vite.config.js           plugins vue + quasar
    └── src/
        ├── main.js              monta Quasar → Pinia → plugin → Router
        ├── App.vue              menú lateral (hamburguesa) / login sin layout
        ├── routes/routes.js     rutas + guardia de sesión
        ├── stores/auth.store.js token y usuario persistidos (Pinia)
        ├── services/            api.js (axios) + 1 archivo por recurso
        │   ├── api.js               instancia axios + interceptor x-token
        │   ├── usuarios.service.js
        │   ├── cursos.service.js
        │   ├── aprendices.service.js
        │   ├── alertas.js           avisos (notivue) + modales (SweetAlert2)
        │   └── seguridad.js         detecta contraseñas débiles/filtradas
        ├── stores/
        │   ├── auth.store.js           token + usuario (persistido)
        │   └── preferencias.store.js   modo oscuro (persistido)
        ├── styles/
        │   ├── alertas.css             estilo de los diálogos (SweetAlert2)
        │   └── temas-notivue.js        tema claro/oscuro de las notificaciones
        ├── components/
        │   ├── EncabezadoVista.vue     cabecera con icono de cada vista
        │   └── BotonTema.vue           alterna modo oscuro / claro
        └── views/                Login, Home, Cursos, Aprendices, Usuarios
```

**Regla:** componente → *store* o *service* → backend. Nunca el componente
habla con axios directo.

---

## 3. Base de datos

| Punto | Estado |
|---|---|
| Motor | MongoDB Atlas (`mongodb+srv://...pruebawebservice`) |
| Archivo | `backend_prueba/.env` → variable `MONGO_URL` |
| Conexión | `backend_prueba/database.js` (reintenta cada 5 s si falla) |
| Prueba | `npm run dev` debe imprimir **"Conectado a la base de datos"** |

Última verificación (06/10/2026): **6 usuarios, 7 cursos, 100 aprendices**.

> `database.js` fuerza DNS público (8.8.8.8 / 1.1.1.1) porque el `+srv` de
> Atlas a veces falla con el DNS local.

---

## 4. Plantilla para las nuevas entradas

```markdown
### [FECHA] N.º — Título corto
- **Archivos:** `ruta/archivo.js`
- **Qué hice:** ...
- **Por qué:** ...
- **Cómo probarlo:** ...
```

---

## 5. Historial de cambios

### [2026-09-28] 1 — Creación del frontend
- **Archivos:** `frontend/package.json`, `vite.config.js`, `index.html`, `.env`, `src/main.js`
- **Qué hice:** carpeta `frontend/` con el *Camino A* de la guía
  `GUIA-QUASAR-PINIA-VUE.md` (Vite + plugin de Quasar) e instalé todas las
  dependencias: `vue 3.5`, `vue-router 4.6`, `pinia 4.0`, `pinia-plugin-persistedstate`,
  `quasar 2.33`, `@quasar/extras`, `axios 1.20`, `@quasar/vite-plugin`, `sass-embedded`.
- **Por qué:** la guía dice que ese es el patrón del proyecto anterior.
- **Cómo probarlo:** `npm run dev` → sin errores → `npm run build` → ✅.

### [2026-09-28] 2 — Login con axios + Pinia
- **Archivos:** `src/views/Login.vue`, `src/stores/auth.store.js`, `src/services/api.js`, `src/services/usuarios.service.js`, `src/routes/routes.js`
- **Qué hice:** formulario de login que llama a `POST /api/usuarios/login`,
  guarda `token` + `usuario` en Pinia con `persist: true`, interceptor de axios
  que inyecta la cabecera `x-token` y cierra sesión en **401**, y guardia de rutas.
- **Por qué:** sin token el backend responde 401 en todo lo demás.
- **Cómo probarlo:** entrar con el admin → cae en `#/home` y sobrevive al F5.

### [2026-09-28] 3 — SweetAlert2 en lugar de alertas del sistema
- **Archivos:** `src/services/alertas.js` (nuevo), `src/main.js`, `src/views/*`, `src/App.vue`
- **Qué hice:** instalé `sweetalert2` y centralicé todos los mensajes en
  `alerta.exito/error/aviso/toast/confirmar/cargando`. Quité `:rules` de HTML,
  los `div`/`q-banner` de error y los plugins `Notify/Dialog/Loading` de Quasar
  (`plugins: {}`).
- **Por qué:** el profe/usted no quería ventanas nativas ni alertas de Material.

### [2026-09-29] 4 — Menú hamburguesa y vistas de gestión
- **Archivos:** `src/App.vue`, `src/routes/routes.js`, `src/components/EncabezadoVista.vue` (nuevo), `src/views/Home.vue`, `src/views/Cursos.vue`, `src/views/Aprendices.vue`, `src/views/Usuarios.vue`, `src/services/aprendices.service.js` (nuevo)
- **Qué hice:** drawer lateral (`show-if-above`, breakpoint 1024) con Inicio /
  Cursos / Aprendices / Usuarios; tabla con buscador, filtros y paginación;
  diálogos para crear/editar; home con tarjetas de resumen.
- **Cómo probarlo:** ☰ en el header entra y sale del menú; en móvil es overlay.

### [2026-09-29] 5 — Backend: administración de usuarios (lo único tocado del backend)
- **Archivos:** `backend_prueba/middlewares/validateAdmin.js` (NUEVO),
  `routes/usuarios.routes.js`, `controller/usuario.controller.js`,
  `validations/usuario.validation.js`, `README.md`
- **Qué hice:**
  - `validateAdmin` → devuelve **403** si el rol no es ADMIN.
  - Nuevos endpoints: `GET /usuarios`, `GET /usuarios/:id`,
    `PUT /usuarios/update/:id`, `PUT /usuarios/role/:id`,
    `PUT /usuarios/active/:id`, `PUT /usuarios/inactive/:id`.
  - `POST /register` ahora exige ADMIN y acepta `rol`.
  - Protecciones: no puedes cambiarte tu rol, desactivarte a ti mismo, ni
    quedarte sin administrador.
  - "Eliminar" = **desactivar** (`status: 1`), igual que cursos y aprendices.
- **Por qué:** el profe solo dio login y register; hacía falta ver/editar usuarios.
- **Cómo probarlo:** login como `demo.user@correo.com` → intentar cambiar rol → **403**.

### [2026-09-29] 6 — Login "pelado"
- **Archivos:** `src/App.vue`, `src/views/Login.vue`
- **Qué hice:** `<router-view v-if="esLogin">` fuera del `q-layout`: en `#/login`
  no hay header, ni ☰, ni drawer, ni footer — solo la tarjeta.
- **Por qué:** "en el login solo quiero lo del login".

### [2026-09-29] 7 — Avisos del navegador sustituidos por los nuestros
- **Archivos:** `src/services/seguridad.js` (NUEVO), `src/services/alertas.js` (`alerta.seguridad()`), `src/views/Login.vue`, `src/views/Usuarios.vue`
- **Qué hice:** lista local de ~55 contraseñas filtradas; si la que se escribe
  está en la lista sale **nuestra** alerta *"Violación de la seguridad de los
 datos"* con botones **Continuar igual / Cancelar**. Además `autocomplete="off"`
  + `readonly` hasta el foco para que Chrome no rellene ni muestre su banner rojo.
- **Por qué:** usted pidió cambiar el "Cambia tu contraseña" de Google por ese
  texto. **Ojo:** el banner rojo es de Chrome (Google) y no se puede reescribir
  desde el código; lo que hacemos es reemplazarlo por el nuestro e impedir que
  Chrome salte.
- **Cómo probarlo:** entrar con `admin@sena.edu.co / 123456` → sale la alerta.

### [2026-10-06] 8 — Servidores reconectados + este archivo
- **Archivos:** `LOGIN/CAMBIOS.md` (ESTE)
- **Qué hice:** relancé backend (`:4500`) y frontend (`:5173`) tras el reinicio,
  verifiqué la conexión a MongoDB y creé el registro de cambios.
- **Comprobado:** login 200 · 6 usuarios · 7 cursos · 100 aprendices · frontend 200.
- **Ojo:** el puerto del frontend **cambió de 5175 a 5173** (el anterior estaba libre otra vez).

### [2026-10-06] 9 — Puertos ocupados: `EADDRINUSE`
- **Archivos:** ninguno (era un proceso, no código)
- **Qué pasó:** al correr `npm run dev` en `backend_prueba` salió
  `Error: listen EADDRINUSE: address already in use :::4500` y nodemon
  respondió `app crashed - waiting for file changes...`.
- **Por qué:** ya había **otro** backend escuchando en el 4500 (el que yo había
  dejado corriendo en segundo plano). Solo puede haber **un** proceso por puerto.
- **Cómo se resolvió:** liberé los puertos:
  ```bash
  lsof -ti:4500 | xargs kill    # mata el proceso del backend
  lsof -ti:5173 | xargs kill    # mata el proceso del frontend
  ```
- **Estado:** 4500 y 5173 **libres**, listos para que los levantes en tu terminal.

### [2026-10-06] 10 — Notificaciones con **notivue** (las que pediste)
- **Archivos:** `package.json` (nueva dependencia `notivue@2.4.5`),
  `src/main.js`, `src/services/alertas.js`, `src/styles/temas-notivue.js` (NUEVO)
- **Qué hice:**
  - Instalé **notivue** (<https://notivue.smastrom.io>) y lo registré en `main.js`
    con `createNotivue({ position: 'top-center', limit: 3, enqueue: true })`:
    **centradas arriba**, máximo 3 en pantalla, si hay más entran en cola.
  - `<Notivue>` se monta en **`App.vue`**, fuera del `q-layout`, para que
    exista también en la pantalla de login.
  - `alertas.js` ahora reparte en dos:
    - **Avisos → notivue:** `alerta.exito()`, `alerta.error()`, `alerta.aviso()`,
      `alerta.toast(titulo, tipo)` → `push.success/error/warning/info`.
      Se cierran solos (3.2 s; los errores 5.2 s) y se pueden cerrar deslizando.
    - **Diálogos → SweetAlert2:** `alerta.confirmar()` y `alerta.seguridad()`
      (el de la contraseña filtrada). **Motivo:** notivue solo hace toasts,
      no tiene ventanas modales con botones Aceptar/Cancelar.
  - Nuevo `alerta.limpiarAvisos()` = `push.destroyAll()`.
  - Temas propios en `styles/temas-notivue.js` (`temaClaro` / `temaOscuro`)
    construidos sobre `lightTheme`/`darkTheme` con la paleta azul rey + gris.
- **Cómo probarlo:** entrar mal la contraseña → aviso rojo arriba centrado;
  guardar un curso → aviso verde que desaparece solo.

### [2026-10-06] 11 — Modo oscuro y modo claro
- **Archivos:** `src/stores/preferencias.store.js` (NUEVO),
  `src/components/BotonTema.vue` (NUEVO), `src/App.vue`, `src/style.css`,
  `src/views/Login.vue`
- **Qué hice:**
  - Store `preferencias` con `oscuro`, **persistido en localStorage** (recuerda
    la elección entre sesiones).
  - `App.vue` sincroniza Quasar: `$q.dark.set(prefs.oscuro)` + `watch`.
  - `BotonTema` (🌙/☀️) en el **header** y también en la esquina del **login**.
  - `style.css` con tokens `--app-fondo`, `--app-superficie`, `--app-borde`,
    `--app-texto`… definidos en `:root` y redefinidos en `body.body--dark`
    (la clase que Quasar añade al entrar en modo oscuro).
  - Reglas oscuras para tabla, drawer, tarjetas y diálogo de confirmación.
  - Ajuste de contraste: `text-grey-6/7/8` y `bg-blue-1`/`text-blue-9` (Quasar
    los fija con `!important`) se aclaran en modo oscuro para que se lean bien.
- **Cómo probarlo:** botón 🌙 arriba a la derecha; F5 y sigue igual.

### [2026-10-06] 12 — Paleta **azul rey + gris**
- **Archivos:** `src/main.js` (config `brand` de Quasar), `src/style.css`,
  `src/styles/alertas.css`, `src/styles/temas-notivue.js`, `src/App.vue`,
  `src/views/Login.vue`
- **Qué hice:**
  - `app.use(Quasar, { config: { brand: {...} } })`:
    `primary #4169E1` (azul rey), `secondary #1E3A8A` (azul rey oscuro),
    `accent #64748B` (gris), más `positive/negative/info/warning`.
    Con eso cambian **todos** los botones, cabeceras y menú a la vez.
  - Login: degradado **azul rey → gris** (antes acababa en verde) y cabecera
    de la tarjeta en degradado azul rey.
  - Header/footer/ficha del usuario en azul rey; tablas con tintes azules;
    diálogos con borde superior azul rey y botón *Aceptar* azul rey.
  - Orden de imports arreglado en `main.js`: **Quasar primero y `style.css`
    después**, para que nuestros estilos puedan sobreescribir los de Quasar.
- **Cómo probarlo:** botón principal, menú lateral y tablas deben verse azul rey.

### [2026-10-06] 13 — Estado: Pencil (MCP) y navegador
- **Archivos:** ninguno
- **Qué pasó:** el MCP de **Pencil** se desconectó de la sesión (ya no aparece
  en la lista de herramientas) y el navegador de escritorio sigue **desconectado**,
  así que **no pude hacer el diseño en `.pen` ni capturas**.
- **Para retomarlo:** abrir la sesión en la app de escritorio, conectar Pencil
  con un archivo `.pen` abierto y avisarme; el diseño visual queda pendiente.
- **Estado de servicios:** backend `:4500` ✅ · frontend `:5173` ✅ (lo dejé
  corriendo yo para verificar) · `npm run build` ✅.

### [2026-10-06] 14 — Accesos rápidos que no navegaban
- **Archivos:** `src/views/Home.vue`
- **Qué pasaba:** las tarjetas de "Accesos rápidos" llevaban
  `:to="{ name: ... }"` pero **`q-card` no tiene prop `to`** (sus props son
  `tag`, `square`, `flat`, `bordered` + `dark`), así que Vue lo tiraba al DOM
  como atributo normal y **no navegaba a ningún sitio**.
- **Qué hice:** navegación con `router.push` en `@click` + accesibilidad
  (`role="link"`, `tabindex="0"`, Enter/Espacio) y flecha que se anima al
  pasar el ratón. Ojo: `q-item` (menú lateral) **sí** acepta `to`, ahí no
  había que tocar nada.
- **Cómo probarlo:** Inicio → clic en *Cursos / Aprendices / Usuarios*.

### [2026-10-06] 15 — Las avisos salían "debajo del hero" (cortados)
- **Archivos:** `src/style.css`
- **Causa raíz:** notivue monta el contenedor con `z-index: var(--nv-z, 500)`
  y el `q-header` de Quasar pinta con `z-index: 1000` → **los avisos quedaban
  DETRÁS del header**: solo se veía la parte de abajo, justo bajo el hero.
- **Qué hice:** `--nv-z: 2000` en `:root` → el aviso flota **por encima de
  todo**, centrado arriba y completamente visible (también sobre los
  diálogos de SweetAlert, que van a 1060).
- **Cómo probarlo:** cualquier aviso (guardar, error, etc.) debe verse entero,
  sin que el header lo tape.

### [2026-10-06] 16 — Rediseño de los diálogos (el de la contraseña, feo)
- **Archivos:** `src/styles/alertas.css` (reescrito)
- **Qué hice:** los dos diálogos que quedan (`alerta.confirmar()` y
  `alerta.seguridad()` — el de la contraseña filtrada) ahora van con el mismo
  lenguaje visual que el resto:
  - tarjeta **sin banda azul encima**, borde fino, radio 20px, fondo y texto
    con los **tokens `--app-*`** (se adapta solo a modo oscuro);
  - icono tipo **chip circular suave** en vez del aro grueso de fábrica
    (azul para *¿continuar?*, ámbar para la contraseña);
  - botones **píldora** de 44px: *Aceptar* azul rey con sombra,
    *Cancelar* fantasma con borde gris;
  - ancho fijo 380px y en móvil se apilan a todo lo ancho.
- **Cómo probarlo:** entrar con `admin@sena.edu.co / 123456` → abre el de la
  contraseña; o Cerrar sesión → diálogo de confirmación.

### [2026-10-06] 17 — Último banner de HTML fuera (solo lectura)
- **Archivos:** `src/views/Usuarios.vue`
- **Qué hice:** el `q-banner` azul de *"Vista de solo lectura"* (única alerta
  que seguía pintada en HTML) se quitó; ahora se lanza con
  `alerta.info(...)` al entrar en la vista si el usuario no es ADMIN.
- **Cómo probarlo:** entrar con `demo.user@correo.com` → Usuarios.

### [2026-10-06] 18 — Auditoría de validaciones y avisos
- **Verificado en todo `src/` (0 coincidencias):**
  | Comprobación | Resultado |
  |---|---|
  | `:rules` / `rules=` (validación HTML) | **0** |
  | `window.alert` / `alert()` (navegador) | **0** |
  | `$q.notify` / `Notify.create` / `Dialog.create` (Quasar) | **0** |
  | `q-banner` / `q-inner-loading` (avisos en HTML) | **0** (solo queda la regla CSS muerta en `style.css`) |
  | `div` de error con `v-if` o `text-caption text-negative` | **0** |
  | `plugins: {}` en Quasar (sin plugins de alertas) | ✅ |
- **Resultado:** las **32** llamadas de las vistas van todas por
  `alerta.*` → notivue (avisos) o SweetAlert2 (diálogos).

### [2026-10-06] 19 — Aviso: archivos modificados fuera de esta sesión
- **Qué pasó:** a las **14:24:40** `App.vue`, `Login.vue`, `main.js` y
  `style.css` se reescribieron con un diseño nuevo (branding **"Campus"**,
  login de dos paneles con showcase, header/footer con degradado).
- **Qué hice:** **no los sobrescribí**; trabajé encima con cambios puntuales
  (`--nv-z` en `style.css`) y dejé el resto tal cual.

### [2026-10-06] 20 — Un solo comando (backend + frontend) y el JSON de estado
- **Archivos:** `frontend/package.json`, `frontend/src/services/estado.service.js` (NUEVO),
  `frontend/src/views/Home.vue`, `CAMBIOS.md` (ESTE)
- **Qué hice:**
  - Instalé **`concurrently`** (devDependency) y cambié los scripts del frontend:

    | Script | Qué hace |
    |---|---|
    | `npm run dev` | levanta **los dos**: `[api]` backend `:4500` + `[web]` Vite `:5173` |
    | `npm run dev:api` | solo el backend (`npm --prefix ../backend_prueba run dev`) |
    | `npm run dev:web` | solo el frontend (antes era el `dev`) |

    - `concurrently -k` = si una línea muere (o haces Ctrl+C) mata a la otra,
      así no queda un Vite huérfano apuntando a un backend caído.
  - Nuevo servicio **`estado.service.js`** → `GET /api/estado` (ruta pública que ya
    existía en `server.js`), siguiendo la regla vista → *service* → backend.
  - `Home.vue`: tarjeta **"Estado del backend"** con chip *Conectado / Sin conexión*,
    botón de refresco y el **JSON en vivo** impreso (`ok`, `mensaje`, `puerto`,
    `baseDatos`, `fecha`) en un `<pre>` con los tokens `--app-*` (se adapta al modo
    oscuro). Si el backend está caído se pinta el JSON de error con la ayuda.
- **Por qué:** se pidió arrancar **solo desde el frontend** y que ahí se viera el
  JSON del backend que está funcionando (sin abrir dos terminales ni olvidarse del 4500).
- **Cómo probarlo:** `cd LOGIN/frontend && npm run dev` → en la consola aparece
  `[api] Servidor en http://localhost:4500` y `[api] Conectado a la base de datos` →
  entrar a `#/home` → la tarjeta muestra el JSON con `"baseDatos": "conectada"`.
- **Comprobado:** un solo comando arrancó ambos puertos · `GET /api/estado` →
  `{"ok":true,...,"baseDatos":"conectada"}` · frontend 200 · `npm run build` ✅.
- **Ojo (buena práctica):** esto es para **desarrollo**. En producción no se usa
  `concurrently`: cada servicio corre por separado (PM2/Docker) o el backend sirve
  el build desde `backend_prueba/public` (`server.js` ya está preparado).

### [2026-10-06] 21 — El backend abría una interfaz vieja (ya no sirve nada visual)
- **Archivos:** `backend_prueba/server.js` (middlewares + catch-all)
- **Qué pasaba:** `http://localhost:4500` mostraba **una interfaz distinta** a la
  del frontend. Causa: `backend_prueba/public/` guarda una **compilación vieja**
  (05/09/2026, título *"Estructura Frontend | Vue + Quasar"*) y `server.js` la
  servía con `express.static(publicPath)` + un `*` que devolvía ese `index.html`.
- **Qué hice:**
  - `express.static` y el `sendFile` ahora **solo se activan con
    `SERVIR_FRONTEND=true`** en `backend_prueba/.env`. Por defecto **apagado**.
  - Cualquier ruta que no sea `/api/...` responde **404 en JSON** con la pista:
    `{"msg":"La ruta solicitada no existe","ayuda":"La API vive en /api ... el
    frontend corre en http://localhost:5173"}`.
  - No borré `public/` (es un build que quizá quieras usar en producción); queda
    inactivo hasta que actives la variable.
- **Por qué:** se pidió que el backend **no abra nada visual**, solo viva el
  servidor JS con su API.
- **Cómo probarlo:** `curl http://localhost:4500/` → **404 JSON** ·
  `curl http://localhost:4500/api/estado` → 200 con el JSON · `/api/cursos` sin
  token → 401 · abrir `http://localhost:5173` sigue mostrando la app real.
- **Comprobado:** `/` → 404 JSON ✅ · `/api/estado` → `{"ok":true,...}` ✅ ·
  `/favicon.svg` → 404 (ya no sirve assets viejos) ✅ · nodemon recargó solo.

### [2026-10-06] 22 — Quitada la tarjeta "Estado del backend" del Inicio
- **Archivos:** `frontend/src/views/Home.vue`, `frontend/src/services/estado.service.js` (BORRADO)
- **Qué hice:** eliminé del **Inicio** la tarjeta con el JSON de `/api/estado`
  (chip *Conectado/Sin conexión*, botón refresco y el `<pre>` con el JSON), su
  import, su estado reactivo (`estadoBackend`, `estadoJson`, `cargarEstado`),
  el CSS `.estado-json` y el servicio que solo usaba esa tarjeta.
- **Por qué:** "eso no me gusta, quítame esa parte del inicio".
- **Ojo:** el endpoint **`GET /api/estado` sigue existiendo en el backend** (no
  se tocó `server.js`); solo se dejó de pintar en el frontend. Si lo quieres
  volver a mostrar, se recrea el servicio en 2 minutos.
- **Cómo probarlo:** Inicio → solo quedan el hero, las 4 tarjetas de resumen y
  los accesos rápidos. `npm run build` ✅ · sin referencias residuales ✅.

### [2026-10-06] 23 — Footer rediseñado con animaciones
- **Archivos:** `frontend/src/App.vue` (template del `q-footer`, `<script setup>` y `<style scoped>`)
- **Qué había:** una línea centrada plana *"Campus · Plataforma de gestión
  académica"* sobre fondo liso `#1b347f`.
- **Qué hay ahora:**
  - **Cinta animada** arriba: un gradiente azul/gris que recorre todo el ancho en bucle.
  - **Marca** con logo en degradado que **flota** (sube y baja) + nombre y bajada.
  - **Enlaces rápidos** (Inicio · Cursos · Aprendices · Usuarios) que navegan con
    `router.push`: al pasar el ratón **se elevan**, les entra un **subrayado que se
    barre** y el icono **salta/escala**.
  - **Reloj en vivo** a la derecha (HH:MM:SS, `setInterval` 1 s con limpieza en
    `onUnmounted`) con **punto verde que late**.
  - Barra inferior con `© {año}` y el stack (*Vue 3 · Quasar · Express*) con un
    **brillo** que recorre el texto.
  - Fondo con degradado + resplandor radial (se ve en claro y en oscuro) y
    `@media (prefers-reduced-motion: reduce)` que apaga todo para quien tiene
    las animaciones del sistema desactivadas.
  - Móvil (≤599px): todo centrado, sin bajada de marca y sin el texto del stack
    para que el pie no ocupe pantalla.
- **Cómo probarlo:** con el dev corriendo, el HMR lo pinta solo → pasa el ratón
  por los enlaces del pie, mira la cinta de arriba y el reloj.
- **Comprobado:** `npm run build` ✅ · `App.vue` y `Home.vue` compilan en dev (200) ✅.

### [2026-10-06] 24 — Footer eliminado + acceso rápido a Inicio en la barra
- **Archivos:** `frontend/src/App.vue`
- **Qué hice:**
  - **Quité el `q-footer` completo** (la entrada 23, con sus animaciones): no
    gustó → se borró el template, todo su CSS (cinta, logo flotante, enlaces,
    reloj, brillo, keyframes y media queries) y el JS que solo usaba él
    (`ir()`, `hora`/`anio` + `setInterval`, `onMounted`/`onUnmounted`).
  - **Nuevo acceso rápido en el `q-header`**: píldora **"⌂ Inicio"** al lado de
    la marca, con `:to="{ name: 'home' }"` (navega sin JS extra) y
    `active-class="app-inicio--activo"` → **se queda en blanco con texto azul
    rey mientras estés en Inicio**.
  - Animaciones del botón: al pasar el ratón **se eleva**, aclara el fondo,
    proyecta sombra y el icono **escala**; transición suave de 0.22 s.
  - En móvil (`$q.screen.lt.sm`) el botón **solo muestra el icono** para que la
    barra no se llene; `aria-label="Ir al inicio"` para lectores de pantalla.
- **Por qué:** "lo del footer no me parece chevere, solo quita el footer y
  créame algo de acceso rápido en la barra para entrar rápido al inicio".
- **Cómo probarlo:** F5 en `:5173` → ya **no hay pie** y arriba, junto a
  *Campus*, aparece **⌂ Inicio** → un clic y estás en el panel; si ya estás en
  Inicio el botón se ve encendido (blanco).
- **Comprobado:** `npm run build` ✅ · `App.vue` compila en dev (200) ✅ ·
  **0 referencias** a `q-footer`/`app-footer` ✅.

---

## 6. Errores frecuentes

| Mensaje | Causa | Solución |
|---|---|---|
| `EADDRINUSE :::4500` | ya hay un backend corriendo | `lsof -ti:4500 \| xargs kill` |
| `EADDRINUSE :5173` | ya hay un Vite corriendo | `lsof -ti:5173 \| xargs kill` |
| `app crashed - waiting for file changes` | nodemon se quedó sin proceso por el error de arriba | arreglar lo anterior y guardar cualquier archivo, o `rs` |
| `401 No hay token en la peticion` | falta la cabecera `x-token` | el interceptor de `services/api.js` la pone; revisar que haya login |
| `403 Requiere permisos de administrador` | un `USER` intenta operar como admin | entrar con una cuenta ADMIN |
| `blocked by CORS policy` | el backend no está corriendo o es otro puerto | levantar `backend_prueba` en el 4500 |
| `Conectando a la base de datos, reintentando en 5s` | Atlas o el DNS local no responden | revisar `MONGO_URL` en `.env` / internet |
| Página en blanco | error de JS | F12 → pestaña **Console** |
| Vite no ve cambios en `.env` | hay que reiniciar `npm run dev` | terminal |

---

## 7. Pendientes

- [ ] **Diseño en Pencil (`.pen`)**: crear el mockup del login y de las vistas
      con la paleta azul rey + gris. **Bloqueado**: el MCP de Pencil se
      desconectó de la sesión (entrada 13).
- [ ] **Verificación visual en navegador**: bloqueada por el mismo motivo
      (navegador de escritorio desconectado); lo único comprobado es
      `npm run build` + que Vite compila los 9 módulos sin errores.
- [ ] Entrar con `123456` mostrará la alerta de seguridad **cada vez**; si
      prefieres que solo salga al *crear* un usuario, se quita del login.
- [ ] Los **diálogos** (confirmar/eliminar) siguen en SweetAlert2 porque notivue
      solo hace avisos flotantes; si quieres, los cambio a modales propios.
- [ ] No hay endpoint de "cambiar mi contraseña" en el backend (solo si el
      profe lo agrega, desde ahí se enlaza).
- [ ] No se puede borrar físicamente un usuario: solo desactivar.
