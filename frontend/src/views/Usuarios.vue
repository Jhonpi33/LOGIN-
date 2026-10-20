<template>
  <q-page class="q-pa-md">
    <encabezado-vista
      titulo="Usuarios"
      subtitulo="Cuentas del sistema, roles y permisos"
      icono="manage_accounts"
      color="accent"
    >
      <template #acciones>
        <q-btn
          v-if="auth.esAdmin"
          color="primary"
          icon="person_add"
          label="Nuevo usuario"
          unelevated
          @click="abrirNuevo"
        />
      </template>
    </encabezado-vista>

    <div class="row q-col-gutter-lg">
      <!-- Mi cuenta -->
      <div class="col-12 col-md-4">
        <q-card flat bordered>
          <q-card-section class="bg-primary text-white">
            <div class="text-h6" id="Cuenta_color">Mi cuenta</div>
            <div class="text-caption">Sesion iniciada en este equipo</div>
          </q-card-section>

          <q-card-section class="column items-center q-pa-lg">
            <q-avatar size="80px" color="grey-3" text-color="primary" icon="person" />
            <div class="text-h6 q-mt-md">{{ auth.nombre }}</div>
            <q-badge :color="auth.esAdmin ? 'secondary' : 'primary'" class="q-mt-xs">
              {{ auth.usuario?.rol }}
            </q-badge>
          </q-card-section>

          <q-separator />

          <q-list>
            <q-item>
              <q-item-section avatar><q-icon name="mail" color="primary" /></q-item-section>
              <q-item-section>
                <q-item-label caption>Correo</q-item-label>
                <q-item-label>{{ auth.usuario?.email }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section avatar>
                <q-icon
                  :name="auth.usuario?.status === 0 ? 'check_circle' : 'cancel'"
                  :color="auth.usuario?.status === 0 ? 'positive' : 'negative'"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label caption>Estado</q-item-label>
                <q-item-label>{{ auth.usuario?.status === 0 ? 'Activo' : 'Inactivo' }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <q-separator />
          <q-card-actions align="center" class="q-pa-md">
            <q-btn outline color="negative" icon="logout" label="Cerrar sesion" @click="cerrarSesion" />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Lista de usuarios -->
      <div class="col-12 col-md-8">
        <!--
          Sin banners en HTML: el aviso de "solo lectura" se lanza como
          notificación (notivue) en onMounted(), igual que el resto de avisos.
        -->

        <q-card flat bordered>
          <q-table
            :rows="filas"
            :columns="columnas"
            row-key="_id"
            :filter="busqueda"
            :loading="cargando"
            v-model:pagination="paginacion"
            :rows-per-page-options="[5, 10, 20, 0]"
            flat
            dense
          >
            <template #top>
              <div class="row full-width items-center q-gutter-sm">
                <q-input
                  v-model="busqueda"
                  dense
                  outlined
                  clearable
                  placeholder="Buscar por nombre o correo..."
                  class="col"
                >
                  <template #prepend><q-icon name="search" /></template>
                </q-input>

                <q-select
                  v-model="filtroEstado"
                  dense
                  outlined
                  emit-value
                  map-value
                  :options="opcionesEstado"
                  label="Estado"
                  style="min-width: 140px"
                />
              </div>
            </template>

            <template #body-cell-nombre="props">
              <q-td :props="props">
                <div class="row items-center no-wrap q-gutter-xs">
                  <span class="text-weight-medium">{{ props.row.nombre }}</span>
                  <q-badge v-if="props.row._id === auth.usuario?._id" color="orange" label="tu" />
                </div>
              </q-td>
            </template>

            <template #body-cell-rol="props">
              <q-td :props="props" auto-width>
                <q-badge :color="props.row.rol === 'ADMIN' ? 'secondary' : 'blue-4'">
                  {{ props.row.rol }}
                </q-badge>
              </q-td>
            </template>

            <template #body-cell-estado="props">
              <q-td :props="props" auto-width>
                <q-badge :color="props.row.status === 0 ? 'positive' : 'negative'">
                  {{ props.row.status === 0 ? 'Activo' : 'Inactivo' }}
                </q-badge>
              </q-td>
            </template>

            <template #body-cell-acciones="props">
              <q-td :props="props" auto-width class="q-gutter-xs">
                <template v-if="auth.esAdmin">
                  <q-btn
                    flat
                    dense
                    round
                    color="primary"
                    icon="edit"
                    size="sm"
                    title="Editar"
                    @click="abrirEditar(props.row)"
                  />
                  <q-btn
                    flat
                    dense
                    round
                    color="secondary"
                    icon="admin_panel_settings"
                    size="sm"
                    title="Cambiar rol"
                    @click="abrirRol(props.row)"
                  />
                  <q-btn
                    flat
                    dense
                    round
                    :color="props.row.status === 0 ? 'negative' : 'positive'"
                    :icon="props.row.status === 0 ? 'delete' : 'restart_alt'"
                    size="sm"
                    :disable="props.row._id === auth.usuario?._id"
                    :title="
                      props.row._id === auth.usuario?._id
                        ? 'No puedes eliminar tu propia cuenta'
                        : props.row.status === 0
                          ? 'Eliminar (desactivar)'
                          : 'Reactivar'
                    "
                    @click="cambiarEstado(props.row)"
                  />
                </template>
                <span v-else class="text-grey-6 text-caption">solo lectura</span>
              </q-td>
            </template>

            <template #no-data>
              <div class="text-center q-pa-lg text-grey-7">
                <q-icon name="group" size="40px" class="q-mb-sm" />
                <div>No hay usuarios para mostrar.</div>
              </div>
            </template>
          </q-table>
        </q-card>
      </div>
    </div>

    <!-- Formulario crear / editar -->
    <q-dialog v-model="abierto" persistent>
      <q-card style="min-width: 430px; max-width: 95vw">
        <q-card-section class="row items-center">
          <q-icon :name="modo === 'nuevo' ? 'person_add' : 'edit'" color="primary" size="28px" />
          <div class="text-h6 q-ml-sm">
            {{ modo === 'nuevo' ? 'Nuevo usuario' : 'Editar usuario' }}
          </div>
          <q-space />
          <q-btn flat round dense icon="close" color="grey" @click="abierto = false" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <q-input v-model="form.nombre" outlined dense label="Nombre completo" />

          <q-input v-model="form.email" outlined dense label="Correo electronico" />

          <q-input
            v-if="modo === 'nuevo'"
            v-model="form.password"
            :type="verPassword ? 'text' : 'password'"
            outlined
            dense
            autocomplete="off"
            label="Contrasena (minimo 6 caracteres)"
          >
            <template #prepend><q-icon name="lock" color="primary" /></template>
            <template #append>
              <q-icon
                :name="verPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="verPassword = !verPassword"
              />
            </template>
          </q-input>

          <q-select
            v-model="form.rol"
            outlined
            dense
            emit-value
            map-value
            :options="opcionesRol"
            label="Rol"
            :disable="form._id === auth.usuario?._id"
          />
          <div v-if="form._id === auth.usuario?._id" class="text-caption text-grey-6">
            Tu propio rol no se puede cambiar desde aqui.
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            unelevated
            label="Guardar"
            color="primary"
            icon="save"
            :loading="guardando"
            @click="guardar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Cambiar rol -->
    <q-dialog v-model="rolAbierto" persistent>
      <q-card style="min-width: 360px; max-width: 95vw">
        <q-card-section class="row items-center">
          <q-icon name="admin_panel_settings" color="secondary" size="28px" />
          <div class="text-h6 q-ml-sm">Cambiar rol</div>
          <q-space />
          <q-btn flat round dense icon="close" color="grey" @click="rolAbierto = false" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-sm">
          <div class="text-subtitle2">{{ seleccionado?.nombre }}</div>
          <div class="text-caption text-grey-7">{{ seleccionado?.email }}</div>
          <q-select
            v-model="nuevoRol"
            outlined
            dense
            emit-value
            map-value
            :options="opcionesRol"
            label="Rol"
          />
          <div class="text-caption text-grey-6">
            <b>ADMIN</b>: crea, edita, cambia roles y elimina. <b>USER</b>: solo visualiza.
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            unelevated
            label="Aplicar"
            color="secondary"
            icon="check"
            :loading="guardando"
            @click="guardarRol"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import EncabezadoVista from '../components/EncabezadoVista.vue'
import { useAuthStore } from '../stores/auth.store'
import { usuariosService } from '../services/usuarios.service'
import alerta from '../services/alertas'
import { avisarSeguridad } from '../services/seguridad'

const auth = useAuthStore()
const router = useRouter()

const usuarios = ref([])
const cargando = ref(false)
const guardando = ref(false)

const busqueda = ref('')
const filtroEstado = ref('todos')
const opcionesEstado = [
  { label: 'Todos', value: 'todos' },
  { label: 'Activos', value: 'activos' },
  { label: 'Inactivos', value: 'inactivos' }
]
const opcionesRol = [
  { label: 'ADMIN — acceso total', value: 'ADMIN' },
  { label: 'USER — solo visualiza', value: 'USER' }
]
const paginacion = ref({ page: 1, rowsPerPage: 10 })

const columnas = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'email', label: 'Correo', field: 'email', align: 'left', sortable: true },
  { name: 'rol', label: 'Rol', field: 'rol', align: 'center', sortable: true },
  { name: 'estado', label: 'Estado', field: 'status', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'status', align: 'right' }
]

const filas = computed(() => {
  let lista = usuarios.value
  if (filtroEstado.value === 'activos') lista = lista.filter((u) => u.status === 0)
  if (filtroEstado.value === 'inactivos') lista = lista.filter((u) => u.status !== 0)
  return lista
})

// Formulario
const abierto = ref(false)
const modo = ref('nuevo')
const form = ref({ _id: '', nombre: '', email: '', password: '', rol: 'USER' })
const verPassword = ref(false)

// Cambio de rol
const rolAbierto = ref(false)
const seleccionado = ref(null)
const nuevoRol = ref('USER')

async function cargar() {
  cargando.value = true
  try {
    const { data } = await usuariosService.listar()
    usuarios.value = data
  } catch (e) {
    alerta.error('No se pudieron cargar los usuarios', e.response?.data?.msg || 'Error de conexion')
  } finally {
    cargando.value = false
  }
}

function abrirNuevo() {
  modo.value = 'nuevo'
  form.value = { _id: '', nombre: '', email: '', password: '', rol: 'USER' }
  verPassword.value = false
  abierto.value = true
}

function abrirEditar(fila) {
  modo.value = 'editar'
  form.value = {
    _id: fila._id,
    nombre: fila.nombre,
    email: fila.email,
    password: '',
    rol: fila.rol
  }
  abierto.value = true
}

async function guardar() {
  const nombre = form.value.nombre.trim()
  const email = form.value.email.trim()

  if (!nombre || !email) {
    return alerta.aviso('Campos vacios', 'Nombre y correo son obligatorios')
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return alerta.aviso('Correo invalido', 'Revisa el formato del correo electronico')
  }

  if (modo.value === 'nuevo') {
    if (form.value.password.length < 6) {
      return alerta.aviso('Contrasena corta', 'La contrasena debe tener al menos 6 caracteres')
    }
    // clave debil o filtrada -> sale NUESTRA alerta, no la del navegador
    const seguir = await avisarSeguridad(form.value.password)
    if (!seguir) return
  }

  guardando.value = true
  try {
    let r
    if (modo.value === 'nuevo') {
      r = await usuariosService.register({
        nombre,
        email,
        password: form.value.password,
        rol: form.value.rol
      })
    } else {
      r = await usuariosService.actualizar(form.value._id, {
        nombre,
        email,
        rol: form.value.rol
      })
    }

    abierto.value = false
    await alerta.exito('Listo', r.data.msg)
    await cargar()
  } catch (e) {
    const data = e.response?.data
    alerta.error('No se pudo guardar', data?.errors?.[0] || data?.msg || 'Error de conexion')
  } finally {
    guardando.value = false
  }
}

function abrirRol(fila) {
  seleccionado.value = fila
  nuevoRol.value = fila.rol
  rolAbierto.value = true
}

async function guardarRol() {
  guardando.value = true
  try {
    const r = await usuariosService.cambiarRol(seleccionado.value._id, nuevoRol.value)
    rolAbierto.value = false
    await alerta.exito('Rol actualizado', r.data.msg)
    await cargar()
  } catch (e) {
    const data = e.response?.data
    alerta.error('No se pudo cambiar el rol', data?.errors?.[0] || data?.msg || 'Error de conexion')
  } finally {
    guardando.value = false
  }
}

async function cambiarEstado(fila) {
  const eliminar = fila.status === 0
  const ok = await alerta.confirmar(
    eliminar ? 'Eliminar usuario' : 'Reactivar usuario',
    eliminar
      ? `${fila.nombre} quedara INACTIVO y no podra iniciar sesion.`
      : `${fila.nombre} volvera a poder iniciar sesion.`
  )
  if (!ok) return

  try {
    const r = eliminar
      ? await usuariosService.desactivar(fila._id)
      : await usuariosService.activar(fila._id)
    alerta.toast(r.data.msg, 'success')
    await cargar()
  } catch (e) {
    alerta.error('No se pudo completar', e.response?.data?.msg || 'Error de conexion')
  }
}

async function cerrarSesion() {
  const ok = await alerta.confirmar('Cerrar sesion', 'Seguro que quieres salir?')
  if (!ok) return

  auth.logout()
  alerta.toast('Sesion cerrada', 'info')
  router.push({ name: 'login' })
}

function alEntrar() {
  cargar()

  // El aviso de solo lectura NO es un banner de HTML: es una notificación
  if (!auth.esAdmin) {
    alerta.info(
      'Vista de solo lectura',
      'Solo un administrador puede crear, editar, cambiar roles o eliminar usuarios.'
    )
  }
}

onMounted(alEntrar)
</script>

<style>
#Cuenta_color{
    --app-texto: #e6ecf8;
}
</style>