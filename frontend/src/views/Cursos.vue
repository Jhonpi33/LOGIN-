<template>
  <q-page class="q-pa-md">
    <encabezado-vista
      titulo="Cursos"
      subtitulo="Crear, editar y activar los cursos del programa"
      icono="menu_book"
      color="primary"
    >
      <template #acciones>
        <q-btn color="primary" icon="add" label="Nuevo curso" unelevated @click="abrirNuevo" />
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
              placeholder="Buscar por codigo o nombre..."
              class="col"
            >
              <template #prepend><q-icon name="search" /></template>
            </q-input>

            <q-select
              v-model="filtro"
              dense
              outlined
              emit-value
              map-value
              :options="opcionesFiltro"
              label="Estado"
              style="min-width: 150px"
            />
          </div>
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
            <q-icon name="menu_book" size="40px" class="q-mb-sm" />
            <div>No hay cursos para mostrar.</div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Formulario crear / editar -->
    <q-dialog v-model="abierto" persistent>
      <q-card style="min-width: 420px; max-width: 95vw">
        <q-card-section class="row items-center">
          <q-icon :name="modo === 'nuevo' ? 'add_circle' : 'edit'" color="primary" size="28px" />
          <div class="text-h6 q-ml-sm">
            {{ modo === 'nuevo' ? 'Nuevo curso' : 'Editar curso' }}
          </div>
          <q-space />
          <q-btn flat round dense icon="close" color="grey" @click="abierto = false" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-gutter-md">
          <q-input v-model="form.codigo" outlined dense label="Codigo" />
          <q-input v-model="form.nombre" outlined dense label="Nombre" />
          <q-input
            v-model.number="form.duracion"
            type="number"
            outlined
            dense
            label="Duracion en horas"
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
import { cursosService } from '../services/cursos.service'
import alerta from '../services/alertas'

const cursos = ref([])
const cargando = ref(false)
const guardando = ref(false)

const busqueda = ref('')
const filtro = ref('todos')
const opcionesFiltro = [
  { label: 'Todos', value: 'todos' },
  { label: 'Activos', value: 'activos' },
  { label: 'Inactivos', value: 'inactivos' }
]
const paginacion = ref({ page: 1, rowsPerPage: 10 })

const columnas = [
  { name: 'codigo', label: 'Codigo', field: 'codigo', align: 'left', sortable: true },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  {
    name: 'duracion',
    label: 'Duracion',
    field: 'duracion',
    align: 'center',
    sortable: true,
    format: (v) => `${v} h`
  },
  { name: 'estado', label: 'Estado', field: 'status', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'status', align: 'right' }
]

const filas = computed(() => {
  if (filtro.value === 'activos') return cursos.value.filter((c) => c.status === 0)
  if (filtro.value === 'inactivos') return cursos.value.filter((c) => c.status !== 0)
  return cursos.value
})

// Formulario
const abierto = ref(false)
const modo = ref('nuevo')
const editId = ref(null)
const form = ref({ codigo: '', nombre: '', duracion: null })

async function cargar() {
  cargando.value = true
  try {
    const { data } = await cursosService.listar()
    cursos.value = data
  } catch (e) {
    alerta.error('No se pudieron cargar los cursos', e.response?.data?.msg || 'Error de conexion')
  } finally {
    cargando.value = false
  }
}

function abrirNuevo() {
  modo.value = 'nuevo'
  editId.value = null
  form.value = { codigo: '', nombre: '', duracion: null }
  abierto.value = true
}

function abrirEditar(fila) {
  modo.value = 'editar'
  editId.value = fila._id
  form.value = { codigo: fila.codigo, nombre: fila.nombre, duracion: fila.duracion }
  abierto.value = true
}

async function guardar() {
  const codigo = (form.value.codigo || '').trim()
  const nombre = (form.value.nombre || '').trim()
  const duracion = Number(form.value.duracion)

  // Validacion propia: sin :rules de HTML, el aviso lo pinta SweetAlert2
  if (!codigo || !nombre) {
    return alerta.aviso('Campos vacios', 'Codigo y nombre son obligatorios')
  }
  if (!Number.isInteger(duracion) || duracion <= 0) {
    return alerta.aviso('Duracion invalida', 'Escribe un numero entero mayor a 0')
  }

  guardando.value = true
  try {
    const payload = { codigo, nombre, duracion }
    const r =
      modo.value === 'nuevo'
        ? await cursosService.crear(payload)
        : await cursosService.actualizar(editId.value, payload)

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
    desactivar ? 'Desactivar curso' : 'Activar curso',
    `${fila.codigo} — ${fila.nombre}`
  )
  if (!ok) return

  try {
    const r = desactivar
      ? await cursosService.desactivar(fila._id)
      : await cursosService.activar(fila._id)
    alerta.toast(r.data.msg, 'success')
    await cargar()
  } catch (e) {
    alerta.error('No se pudo cambiar el estado', e.response?.data?.msg || 'Error de conexion')
  }
}

onMounted(cargar)
</script>
