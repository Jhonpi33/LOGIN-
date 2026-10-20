<template>
  <q-page class="q-pa-md">
    <section class="inicio-hero q-mb-lg">
      <div class="inicio-hero__copy">
        <div class="inicio-hero__eyebrow">PANEL ACADÉMICO</div>
        <h1>Hola, {{ auth.nombre }}</h1>
        <p>Tu espacio para organizar cursos y acompañar el progreso de los aprendices.</p>
      </div>
      <q-btn
        :to="{ name: 'cursos' }"
        icon-right="arrow_forward"
        label="Explorar cursos"
        unelevated
        class="inicio-hero__action"
      />
      <q-icon name="auto_stories" class="inicio-hero__art" />
    </section>

    <encabezado-vista
      titulo="Inicio"
      :subtitulo="'Panel general — ' + auth.nombre"
      icono="dashboard"
      color="primary"
    />

    <!-- Tarjetas de resumen -->
    <div class="row q-col-gutter-md">
      <div v-for="c in tarjetas" :key="c.label" class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="q-pa-md">
          <div class="row items-center no-wrap">
            <q-avatar :color="c.color" text-color="white" size="54px" :icon="c.icono" />
            <div class="q-ml-md">
              <div class="text-h4 text-weight-bold">{{ c.valor }}</div>
              <div class="text-caption text-grey-7">{{ c.label }}</div>
            </div>
          </div>
        </q-card>
      </div>
    </div>

    <!-- Accesos rapidos -->
    <q-card flat bordered class="q-mt-lg">
      <q-card-section>
        <div class="text-h6">Accesos rapidos</div>
        <div class="text-caption text-grey-7">Entra a cada seccion desde aqui o desde el menu lateral.</div>
      </q-card-section>

      <q-separator />

      <q-card-section class="row q-col-gutter-md">
        <div v-for="a in accesos" :key="a.ruta" class="col-12 col-sm-6 col-md-4">
          <!--
            OJO: q-card NO acepta "to" (solo q-item/q-btn lo hacen), por eso la
            navegación se hace con router.push en @click.
          -->
          <q-card
            class="acceso cursor-pointer"
            flat
            bordered
            role="link"
            tabindex="0"
            @click="ir(a.ruta)"
            @keydown.enter="ir(a.ruta)"
            @keydown.space.prevent="ir(a.ruta)"
          >
            <q-card-section class="row items-center no-wrap q-gutter-md">
              <q-avatar :color="a.color" text-color="white" size="48px" :icon="a.icono" />
              <div class="col">
                <div class="text-subtitle1 text-weight-medium">{{ a.titulo }}</div>
                <div class="text-caption text-grey-7">{{ a.texto }}</div>
              </div>
              <q-icon name="arrow_forward" class="acceso-flecha col-auto" size="22px" />
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import EncabezadoVista from '../components/EncabezadoVista.vue'
import { useAuthStore } from '../stores/auth.store'
import { cursosService } from '../services/cursos.service'
import { aprendicesService } from '../services/aprendices.service'
import alerta from '../services/alertas'

const auth = useAuthStore()
const router = useRouter()

/** Navega a una sección desde los accesos rápidos */
function ir(nombre) {
  router.push({ name: nombre })
}

const cursos = ref([])
const aprendices = ref([])
const cargando = ref(true)

const tarjetas = computed(() => [
  { label: 'Cursos totales', valor: cursos.value.length, icono: 'menu_book', color: 'primary' },
  {
    label: 'Cursos activos',
    valor: cursos.value.filter((c) => c.status === 0).length,
    icono: 'check_circle',
    color: 'positive'
  },
  { label: 'Aprendices', valor: aprendices.value.length, icono: 'groups', color: 'secondary' },
  {
    label: 'Aprendices inactivos',
    valor: aprendices.value.filter((a) => a.status !== 0).length,
    icono: 'person_off',
    color: 'negative'
  }
])

const accesos = [
  { ruta: 'cursos', titulo: 'Cursos', texto: 'Crear, editar y activar cursos', icono: 'menu_book', color: 'primary' },
  { ruta: 'aprendices', titulo: 'Aprendices', texto: 'Gestionar aprendices y su curso', icono: 'groups', color: 'secondary' },
  { ruta: 'usuarios', titulo: 'Usuarios', texto: 'Mi cuenta y nuevos usuarios', icono: 'manage_accounts', color: 'accent' }
]

async function cargar() {
  cargando.value = true
  try {
    const [c, a] = await Promise.all([cursosService.listar(), aprendicesService.listar()])
    cursos.value = c.data
    aprendices.value = a.data
  } catch (e) {
    alerta.error('No se pudo cargar el panel', e.response?.data?.msg || 'Error de conexion')
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)
</script>

<style scoped>
.inicio-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 190px;
  overflow: hidden;
  padding: 32px 38px;
  border: 1px solid rgba(65, 105, 225, 0.12);
  border-radius: 22px;
  background:
    radial-gradient(circle at 85% 40%, rgba(65, 105, 225, 0.15), transparent 24%),
    linear-gradient(110deg, #fff 0%, #f0f4ff 100%);
}

.inicio-hero__copy {
  z-index: 1;
  max-width: 600px;
}

.inicio-hero__eyebrow {
  color: #4169e1;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.inicio-hero h1 {
  margin: 10px 0 7px;
  color: #17243e;
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  font-weight: 750;
  letter-spacing: -0.045em;
}

.inicio-hero p {
  margin: 0;
  color: #71809a;
  line-height: 1.6;
}

.inicio-hero__action {
  z-index: 1;
  min-height: 46px;
  padding: 0 16px;
  color: #fff;
  background: #4169e1;
}

.inicio-hero__art {
  position: absolute;
  right: 19%;
  color: rgba(65, 105, 225, 0.08);
  font-size: 180px;
  transform: rotate(-12deg);
}

.acceso {
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}
.acceso:hover,
.acceso:focus-visible {
  border-color: var(--q-primary);
  box-shadow: 0 8px 20px rgba(65, 105, 225, 0.22);
  transform: translateY(-3px);
  outline: none;
}
.acceso-flecha {
  color: var(--q-primary);
  opacity: 0.45;
  transition: opacity 0.18s ease, transform 0.18s ease;
}

body.body--dark .inicio-hero {
  border-color: #2a3855;
  background:
    radial-gradient(circle at 85% 40%, rgba(120, 149, 255, 0.13), transparent 24%),
    linear-gradient(110deg, #151f34 0%, #182644 100%);
}

body.body--dark .inicio-hero h1 {
  color: #e6ecf8;
}

body.body--dark .inicio-hero p {
  color: #9aa9c2;
}

body.body--dark .inicio-hero__art {
  color: rgba(120, 149, 255, 0.1);
}

.acceso:hover .acceso-flecha,
.acceso:focus-visible .acceso-flecha {
  opacity: 1;
  transform: translateX(4px);
}

@media (max-width: 599px) {
  .inicio-hero {
    align-items: flex-start;
    flex-direction: column;
    gap: 20px;
    padding: 25px 22px;
  }

  .inicio-hero__art {
    right: -8px;
    bottom: 15px;
    font-size: 120px;
  }
}
</style>
