<template>
  <q-page class="q-pa-md">
    <encabezado-vista
      titulo="Mi perfil"
      subtitulo="Datos de tu cuenta y sesión"
      icono="account_circle"
      color="primary"
    />

    <div class="row q-col-gutter-md">
      <!-- Tarjeta principal: la cuenta -->
      <div class="col-12 col-md-7">
        <q-card flat bordered>
          <q-card-section class="row items-center q-gutter-md">
            <q-avatar size="72px" color="primary" text-color="white" icon="person" />
            <div>
              <div class="text-h6">{{ auth.nombre || 'Sin nombre' }}</div>
              <div class="text-caption text-grey-7">{{ datos.email || 'Sin correo' }}</div>
              <q-badge :color="esAdmin ? 'positive' : 'info'" class="q-mt-xs">
                {{ auth.esAdmin ? 'Administrador' : 'Usuario' }}
              </q-badge>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">Información de la cuenta</div>

            <q-list>
              <q-item>
                <q-item-section avatar><q-icon name="badge" color="primary" /></q-item-section>
                <q-item-section>
                  <q-item-label caption>Nombre completo</q-item-label>
                  <q-item-label>{{ auth.nombre || '—' }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar><q-icon name="mail" color="primary" /></q-item-section>
                <q-item-section>
                  <q-item-label caption>Correo electrónico</q-item-label>
                  <q-item-label>{{ datos.email || '—' }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="admin_panel_settings" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>Rol</q-item-label>
                  <q-item-label>{{ datos.rol || '—' }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar><q-icon name="event" color="primary" /></q-item-section>
                <q-item-section>
                  <q-item-label caption>Miembro desde</q-item-label>
                  <q-item-label>{{ desde }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar><q-icon name="toggle_on" color="primary" /></q-item-section>
                <q-item-section>
                  <q-item-label caption>Estado de la cuenta</q-item-label>
                  <q-item-label>{{ datos.status === 0 ? 'Activa' : 'Inactiva' }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Tarjeta lateral: sesión y preferencias -->
      <div class="col-12 col-md-5">
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-subtitle2">Sesión</div>
            <div class="text-caption text-grey-7">
              El token de acceso se guarda en tu navegador y caduca a las 4 horas.
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="around" class="q-pa-md">
            <q-btn
              unelevated
              color="negative"
              icon="logout"
              label="Cerrar sesión"
              class="full-width"
              @click="cerrarSesion"
            />
          </q-card-actions>
        </q-card>

        <q-card flat bordered>
          <q-card-section class="row items-center justify-between">
            <div>
              <div class="text-subtitle2">Apariencia</div>
              <div class="text-caption text-grey-7">Alterna entre modo claro y oscuro.</div>
            </div>
            <boton-tema />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import EncabezadoVista from '../components/EncabezadoVista.vue'
import BotonTema from '../components/BotonTema.vue'
import { useAuthStore } from '../stores/auth.store'
import alerta from '../services/alertas'

const auth = useAuthStore()
const router = useRouter()
const $q = useQuasar()

// El store solo guarda los datos que devolvió el login; si no hubo correo
// en esa respuesta, mostramos lo que tengamos.
const datos = computed(() => auth.usuario || {})
const esAdmin = computed(() => auth.esAdmin)

const desde = computed(() => {
  const fecha = datos.value.createdAt
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

async function cerrarSesion() {
  const ok = await alerta.confirmar('Cerrar sesión', '¿Seguro que quieres salir?')
  if (!ok) return

  auth.logout()
  alerta.toast('Sesión cerrada', 'info')
  router.push({ name: 'login' })
}
</script>
