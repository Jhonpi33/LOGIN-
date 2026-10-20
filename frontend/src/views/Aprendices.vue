<template>
  <q-page class="q-pa-md">
    <encabezado-vista
      titulo="Aprendices"
      subtitulo="Gestion de aprendices y su curso inscrito"
      icono="groups"
      color="secondary"
    >
      <template #acciones>
        <q-btn color="primary" icon="person_add" label="Nuevo aprendiz" unelevated @click="abrirNuevo" />
      </template>
    </encabezado-vista>

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
              placeholder="Buscar por documento, nombre o correo..."
              class="col"
            >
              <template #prepend><q-icon name="search" /></template>
            </q-input>

            <q-select
              v-model="filtroCurso"
              dense
              outlined
              emit-value
              map-value
              clearable
              :options="opcionesCursos"
              label="Curso"
              style="min-width: 190px"
            />

            <q-select
              v-model="filtroEstado"
              dense
              outlined
              emit-value
              map-value
              :options="opcionesEstado"
              label="Estado"
              style="min-width: 150px"
            />
          </div>
        </template>

        <template #body-cell-curso="props">
          <q-td :props="props">
            {{ props.row.curso?.nombre || '—' }}
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
              :color="props.row.status === 0 ? 'negative' : 'positive'"
              :icon="props.row.status === 0 ? 'block' : 'check_circle'"
              size="sm"
              :title="props.row.status === 0 ? 'Desactivar' : 'Activar'"
              @click="cambiarEstado(props.row)"
            />
          </q-td>
        </template>

        <template #no-data>
          <div class="text-center q-pa-lg text-grey-7">
            <q-icon name="groups" size="40px" class="q-mb-sm" />
            <div>No hay aprendices para mostrar.</div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Formulario crear / editar -->
    <q-dialog v-model="abierto" persistent>
      <q-card style="min-width: 440px; max-width: 95vw">
        <q-card-section class="row items-center">
          <q-icon :name="modo === 'nuevo' ? 'person_add' : 'edit'" color="primary" size="28px" />
          <div class="text-h6 q-ml-sm">
            {{ modo === 'nuevo' ? 'Nuevo aprendiz' : 'Editar aprendiz' }}
          </div>
          <q-space />
          <q-btn flat round dense icon="close" color="grey" @click="abierto = false" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <q-input
            ref="refDocumento"
            v-model="form.documento"
            outlined
            dense
            label="Documento"
            :error="errores.documento"
            @update:model-value="limpiarError(errores, 'documento')"
          />
          <q-input
            ref="refNombre"
            v-model="form.nombre"
            outlined
            dense
            label="Nombre completo"
            :error="errores.nombre"
            @update:model-value="limpiarError(errores, 'nombre')"
          />
          <q-input
            ref="refEmail"
            v-model="form.email"
            outlined
            dense
            label="Correo electronico"
            :error="errores.email"
            @update:model-value="limpiarError(errores, 'email')"
          />
          <q-select
            ref="refCurso"
            v-model="form.curso"
            outlined
            dense
            emit-value
            map-value
            :options="opcionesCursos"
            label="Curso"
            :error="errores.curso"
            @update:model-value="limpiarError(errores, 'curso')"
          />
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
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import EncabezadoVista from '../components/EncabezadoVista.vue'
import { aprendicesService } from '../services/aprendices.service'
import { cursosService } from '../services/cursos.service'
import alerta from '../services/alertas'
import { validarCampoAVez, limpiarError } from '../services/validacion'

const aprendices = ref([])
const cursos = ref([])
const cargando = ref(false)
const guardando = ref(false)

const busqueda = ref('')
const filtroCurso = ref(null)
const filtroEstado = ref('todos')
const opcionesEstado = [
  { label: 'Todos', value: 'todos' },
  { label: 'Activos', value: 'activos' },
  { label: 'Inactivos', value: 'inactivos' }
]
const paginacion = ref({ page: 1, rowsPerPage: 10 })

const columnas = [
  { name: 'documento', label: 'Documento', field: 'documento', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'email', label: 'Correo', field: 'email', align: 'left', sortable: true },
  { name: 'curso', label: 'Curso', field: (r) => r.curso?.nombre, align: 'left', sortable: true },
  { name: 'estado', label: 'Estado', field: 'status', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'status', align: 'right' }
]

const opcionesCursos = computed(() =>
  cursos.value
    .filter((c) => c.status === 0)
    .map((c) => ({ label: `${c.codigo} — ${c.nombre}`, value: c._id }))
)

const filas = computed(() => {
  let lista = aprendices.value
  if (filtroCurso.value) lista = lista.filter((a) => a.curso?._id === filtroCurso.value)
  if (filtroEstado.value === 'activos') lista = lista.filter((a) => a.status === 0)
  if (filtroEstado.value === 'inactivos') lista = lista.filter((a) => a.status !== 0)
  return lista
})

// Formulario
const abierto = ref(false)
const modo = ref('nuevo')
const editId = ref(null)
const form = ref({ documento: '', nombre: '', email: '', curso: '' })

// Campos marcados en rojo (:error en el q-input) y refs para enfocarlos
const errores = ref({ documento: false, nombre: false, email: false, curso: false })
const refDocumento = ref(null)
const refNombre = ref(null)
const refEmail = ref(null)
const refCurso = ref(null)

function limpiarErrores() {
  errores.value = { documento: false, nombre: false, email: false, curso: false }
}

async function cargar() {
  cargando.value = true
  try {
    const [a, c] = await Promise.all([aprendicesService.listar(), cursosService.listar()])
    aprendices.value = a.data
    cursos.value = c.data
  } catch (e) {
    alerta.error('No se pudieron cargar los aprendices', e.response?.data?.msg || 'Error de conexion')
  } finally {
    cargando.value = false
  }
}

function abrirNuevo() {
  modo.value = 'nuevo'
  editId.value = null
  form.value = { documento: '', nombre: '', email: '', curso: '' }
  limpiarErrores()
  abierto.value = true
}

function abrirEditar(fila) {
  modo.value = 'editar'
  editId.value = fila._id
  form.value = {
    documento: fila.documento,
    nombre: fila.nombre,
    email: fila.email,
    curso: fila.curso?._id || ''
  }
  limpiarErrores()
  abierto.value = true
}

async function guardar() {
  const documento = (form.value.documento || '').trim()
  const nombre = (form.value.nombre || '').trim()
  const email = (form.value.email || '').trim()

  // Validacion UN CAMPO A LA VEZ: se detiene en el primero que falte, lo pinta
  // de rojo, lo deja enfocado y avisa solo de ese. El usuario lo corrige y al
  // volver a guardar aparece el siguiente. Asi se va guiando de uno en uno.
  const ok = await validarCampoAVez(
    [
      {
        clave: 'documento',
        ref: refDocumento,
        ok: !!documento,
        titulo: 'Falta el documento',
        mensaje: 'Escribe el numero de documento'
      },
      {
        clave: 'nombre',
        ref: refNombre,
        ok: !!nombre,
        titulo: 'Falta el nombre',
        mensaje: 'Escribe el nombre completo'
      },
      {
        clave: 'email',
        ref: refEmail,
        ok: !!email,
        titulo: 'Falta el correo',
        mensaje: 'Escribe el correo electronico'
      },
      {
        clave: 'email',
        ref: refEmail,
        ok: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
        titulo: 'Correo invalido',
        mensaje: 'Revisa el formato del correo electronico'
      },
      {
        clave: 'curso',
        ref: refCurso,
        ok: !!form.value.curso,
        titulo: 'Falta el curso',
        mensaje: 'Selecciona el curso del aprendiz'
      }
    ],
    errores
  )
  if (!ok) return

  guardando.value = true
  try {
    const payload = {
      documento,
      nombre,
      email,
      curso: form.value.curso
    }
    const r =
      modo.value === 'nuevo'
        ? await aprendicesService.crear(payload)
        : await aprendicesService.actualizar(editId.value, payload)

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

async function cambiarEstado(fila) {
  const desactivar = fila.status === 0
  const ok = await alerta.confirmar(
    desactivar ? 'Desactivar aprendiz' : 'Activar aprendiz',
    `${fila.nombre} — ${fila.documento}`
  )
  if (!ok) return

  try {
    const r = desactivar
      ? await aprendicesService.desactivar(fila._id)
      : await aprendicesService.activar(fila._id)
    alerta.toast(r.data.msg, 'success')
    await cargar()
  } catch (e) {
    alerta.error('No se pudo cambiar el estado', e.response?.data?.msg || 'Error de conexion')
  }
}

onMounted(cargar)
</script>
