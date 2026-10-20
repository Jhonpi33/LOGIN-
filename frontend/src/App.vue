<template>
  <!--
    Notivue va AQUÍ (fuera del q-layout) para que las notificaciones existan
    también en la pantalla de login.
  -->
  <Notivue v-slot="item">
    <Notification :item="item" :theme="temaNotivue" />
  </Notivue>

  <!-- El login vive solo: sin header, sin menu hamburguesa y sin footer -->
  <router-view v-if="esLogin" />

  <q-layout v-else view="hHh Lpr fFf" class="app-layout">
    <q-header class="app-header text-white">
      <q-toolbar class="app-toolbar">
        <q-btn dense flat round icon="menu" aria-label="Abrir menú" @click="toggleDrawer" />
        <q-toolbar-title>
          <span class="app-brand-mark"><q-icon name="school" /></span>
          <span class="app-brand-name">Campus</span>
        </q-toolbar-title>

        <!-- Acceso rápido: un clic y caes en Inicio (se resalta cuando ya estás ahí) -->
        <q-btn
          flat
          dense
          no-caps
          icon="home"
          :label="$q.screen.lt.sm ? '' : 'Inicio'"
          aria-label="Ir al inicio"
          :to="{ name: 'home' }"
          active-class="app-inicio--activo"
          class="app-inicio q-ml-sm"
        />

        <boton-tema class="text-white q-ml-xs q-mr-xs" />

        <template v-if="auth.autenticado">
          <q-badge color="white" text-color="primary" class="app-user-badge q-mr-sm q-pa-xs text-weight-bold">
            {{ auth.nombre }}
          </q-badge>
          <q-btn flat dense icon="logout" label="Salir" class="app-logout" @click="cerrarSesion" />
        </template>
      </q-toolbar>
    </q-header>

    <!-- Menu lateral: queda abierto en escritorio y entra como overlay en movil -->
    <q-drawer
      v-model="drawerAbierto"
      show-if-above
      :width="260"
      :breakpoint="1024"
      bordered
      class="drawer-fondo"
    >
      <div class="q-pa-md q-mx-sm q-mt-sm row items-center q-gutter-sm drawer-usuario">
        <q-avatar size="44px" color="white" text-color="primary" icon="person" />
        <div class="col">
          <div class="text-weight-bold ellipsis">{{ auth.nombre || 'Invitado' }}</div>
          <div class="text-caption drawer-usuario__rol">
            {{ auth.usuario?.rol || 'sin sesion' }}
          </div>
        </div>
      </div>

      <q-separator spaced />

      <q-list padding>
        <q-item-label header class="text-grey-6 text-caption text-weight-bold">
        MENÚ PRINCIPAL
        </q-item-label>

        <q-item
          v-for="item in menu"
          :key="item.ruta"
          clickable
          v-ripple
          :to="{ name: item.ruta }"
          active-class="bg-primary text-white"
        >
          <q-item-section avatar><q-icon :name="item.icono" /></q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
          <q-item-section v-if="item.badge" side>
            <q-badge :color="item.badgeColor" rounded>{{ item.badge }}</q-badge>
          </q-item-section>
        </q-item>

        <q-separator spaced />

        <q-item-label header class="text-grey-6 text-caption text-weight-bold">SESIÓN</q-item-label>

        <q-item clickable v-ripple @click="cerrarSesion">
          <q-item-section avatar><q-icon name="logout" color="negative" /></q-item-section>
          <q-item-section class="text-negative">Cerrar sesion</q-item-section>
        </q-item>
      </q-list>

      <div class="absolute-bottom q-pa-sm text-center text-caption text-grey-6">
        Campus · Gestión académica
      </div>
    </q-drawer>

    <q-page-container>
      <router-view v-slot="{ Component }">
        <transition name="vista" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { Notivue, Notification } from 'notivue'
import { useAuthStore } from './stores/auth.store'
import { usePreferenciasStore } from './stores/preferencias.store'
import { temaClaro, temaOscuro } from './styles/temas-notivue'
import BotonTema from './components/BotonTema.vue'
import alerta from './services/alertas'

const auth = useAuthStore()
const prefs = usePreferenciasStore()
const router = useRouter()
const route = useRoute()
const $q = useQuasar()

// En la ruta de login no se monta el layout (ni drawer ni header ni footer)
const esLogin = computed(() => route.name === 'login')

// ---- Modo oscuro / claro (persistido en localStorage) --------------------
$q.dark.set(prefs.oscuro)
watch(() => prefs.oscuro, (v) => $q.dark.set(v))

// Tema de las notificaciones: cambia junto con el modo oscuro
const temaNotivue = computed(() => ($q.dark.is ? temaOscuro : temaClaro))

const drawerAbierto = ref(true)

const menu = [
  { ruta: 'home', label: 'Inicio', icono: 'dashboard' },
  { ruta: 'cursos', label: 'Cursos', icono: 'menu_book' },
  { ruta: 'aprendices', label: 'Aprendices', icono: 'groups' },
  { ruta: 'usuarios', label: 'Usuarios', icono: 'manage_accounts' }
]

function toggleDrawer() {
  drawerAbierto.value = !drawerAbierto.value
}

async function cerrarSesion() {
  const ok = await alerta.confirmar('Cerrar sesion', 'Seguro que quieres salir?')
  if (!ok) return

  auth.logout()
  alerta.toast('Sesion cerrada', 'info')
  router.push({ name: 'login' })
}
</script>

<style scoped>
/* El fondo del menu (claro/oscuro) se define en src/style.css -> .q-drawer.drawer-fondo */

.app-header {
  background: linear-gradient(105deg, #3158d5 0%, #2448b6 58%, #1e3a8a 100%);
  box-shadow: 0 5px 20px rgba(30, 58, 138, 0.2);
}

.app-toolbar {
  min-height: 68px;
  padding: 0 22px;
}

.app-brand-mark {
  display: inline-grid;
  width: 34px;
  height: 34px;
  margin-right: 10px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.13);
  vertical-align: middle;
}

.app-brand-name {
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.app-user-badge {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Acceso rápido a Inicio en la barra superior (píldora blanca) */
.app-inicio {
  padding: 6px 15px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.13);
  color: #fff;
  font-weight: 600;
  letter-spacing: 0.01em;
  transition: transform 0.22s ease, background 0.22s ease, box-shadow 0.22s ease,
    color 0.22s ease;
}

.app-inicio :deep(.q-icon) {
  transition: transform 0.25s ease;
}

.app-inicio:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.24);
  box-shadow: 0 8px 18px rgba(15, 32, 80, 0.35);
}

.app-inicio:hover :deep(.q-icon) {
  transform: scale(1.2);
}

/* Se queda "encendido" mientras estás en Inicio */
.app-inicio--activo {
  background: #fff !important;
  border-color: #fff !important;
  color: #1e3a8a !important;
  box-shadow: 0 8px 18px rgba(15, 32, 80, 0.35);
}

.app-inicio--activo:hover {
  transform: translateY(-2px);
}

.drawer-usuario {
  background: linear-gradient(135deg, #4169e1 0%, #1e3a8a 100%);
  border-radius: 14px;
  color: #fff;
  box-shadow: 0 10px 22px rgba(30, 58, 138, 0.3);
}

.drawer-usuario__rol {
  color: rgba(255, 255, 255, 0.85);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

@media (max-width: 599px) {
  .app-toolbar {
    min-height: 60px;
    padding: 0 10px;
  }

  .app-user-badge {
    display: none;
  }
}
</style>
