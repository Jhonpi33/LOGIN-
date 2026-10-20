<template>
  <main class="login-page">
    <q-card class="login-shell" flat>
      <section class="login-showcase">
        <div class="login-brand">
          <span class="login-brand__icon"><q-icon name="school" size="26px" /></span>
          <span>
            <strong>Campus</strong>
            <small>GESTIÓN ACADÉMICA</small>
          </span>
        </div>

        <div class="login-showcase__content">
          <div class="login-eyebrow"><span></span> TU ESPACIO DE APRENDIZAJE</div>
          <h1>Aprender hoy.<br />Llegar más lejos.</h1>
          <p>Todo lo que necesitas para gestionar tus cursos y seguir avanzando, en un solo lugar.</p>

          <div class="login-benefits">
            <div class="login-benefit">
              <q-icon name="auto_stories" />
              <span><strong>Tus cursos</strong><small>Organizados y siempre a tu alcance</small></span>
            </div>
            <div class="login-benefit">
              <q-icon name="groups" />
              <span><strong>Tu comunidad</strong><small>Aprendices y equipo conectados</small></span>
            </div>
          </div>
        </div>

        <div class="login-showcase__footer">
          <span>CRECE A TU PROPIO RITMO</span>
          <q-icon name="north_east" size="18px" />
        </div>
        <div class="login-decoration login-decoration--one"></div>
        <div class="login-decoration login-decoration--two"></div>
      </section>

      <section class="login-form-panel">
        <div class="login-tema">
          <boton-tema />
        </div>

        <div class="login-form-content">
          <div class="login-form-heading">
            <div class="login-form-kicker">BIENVENIDO DE NUEVO</div>
            <h2>Inicia sesión</h2>
            <p>Ingresa tus datos para continuar en tu cuenta.</p>
          </div>

          <q-form class="login-form" @submit.prevent="entrar">
            <q-input
              v-model="form.email"
              type="email"
              outlined
              label="Correo electrónico"
              autocomplete="off"
              name="correo-sesion"
              class="login-input"
            >
              <template #prepend><q-icon name="mail_outline" /></template>
            </q-input>

            <q-input
              v-model="form.password"
              :type="verPassword ? 'text' : 'password'"
              outlined
              label="Contraseña"
              autocomplete="off"
              name="clave-sesion"
              :readonly="esperandoFoco"
              class="login-input"
              @focus="esperandoFoco = false"
            >
              <template #prepend><q-icon name="lock_outline" /></template>
              <template #append>
                <q-btn
                  :icon="verPassword ? 'visibility_off' : 'visibility'"
                  :aria-label="verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  flat
                  round
                  dense
                  @click="verPassword = !verPassword"
                />
              </template>
            </q-input>

            <q-btn
              type="submit"
              color="primary"
              label="Entrar a mi cuenta"
              icon-right="arrow_forward"
              class="login-submit full-width"
              size="md"
              unelevated
              :loading="cargando"
            />
          </q-form>

          <div class="login-demo">
            <q-icon name="info_outline" />
            <div>
              <strong>¿Solo estás explorando?</strong>
              <p>Usuario de prueba: <b>admin@sena.edu.co</b><br />Contraseña: <b>123456</b></p>
            </div>
          </div>

          <div class="login-security">
            <q-icon name="verified_user" />
            <span>Tu información está protegida</span>
          </div>
        </div>
      </section>
    </q-card>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import BotonTema from '../components/BotonTema.vue'
import alerta from '../services/alertas'
import { avisarSeguridad } from '../services/seguridad'

const auth = useAuthStore()
const router = useRouter()

const form = ref({ email: '', password: '' })
const verPassword = ref(false)
const cargando = ref(false)
const esperandoFoco = ref(true)

async function entrar() {
  const email = form.value.email.trim()
  const password = form.value.password

  // Validacion propia (sin :rules de HTML)
  if (!email || !password) {
    return alerta.aviso('Campos vacios', 'Escribe tu correo y tu contrasena')
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return alerta.aviso('Correo invalido', 'Revisa el formato del correo electronico')
  }

  // Si la clave es debil o filtrada sale NUESTRA alerta en lugar del aviso rojo
  const seguir = await avisarSeguridad(password)
  if (!seguir) return

  cargando.value = true
  try {
    await auth.login(email, password)
    await alerta.exito('Bienvenido', auth.nombre)
    router.push({ name: 'home' })
  } catch (e) {
    // El backend responde 400 con { msg } para correo inexistente o clave mala.
    alerta.error(
      'No se pudo iniciar sesion',
      e.response?.data?.msg || 'Error de conexion con el servidor'
    )
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 40px;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 7% 9%, rgba(65, 105, 225, 0.13), transparent 34%),
    radial-gradient(ellipse at 92% 95%, rgba(30, 58, 138, 0.09), transparent 32%),
    #f3f6fc;
}

.login-shell {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 0.92fr;
  width: min(1080px, 100%);
  min-height: 650px;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 30px;
  background: #fff;
  box-shadow: 0 32px 90px rgba(20, 42, 94, 0.16);
}

.login-showcase {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 650px;
  overflow: hidden;
  padding: 42px 48px 34px;
  color: #fff;
  background:
    radial-gradient(ellipse at 82% 78%, rgba(112, 148, 255, 0.34), transparent 32%),
    linear-gradient(145deg, #3158d5 0%, #2448b6 48%, #172e75 100%);
}

.login-brand {
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.login-brand__icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.14);
}

.login-brand strong,
.login-brand small {
  display: block;
}

.login-brand strong {
  font-size: 1.08rem;
  letter-spacing: 0.01em;
}

.login-brand small {
  margin-top: 3px;
  color: rgba(255, 255, 255, 0.66);
  font-size: 0.63rem;
  font-weight: 700;
  letter-spacing: 0.15em;
}

.login-showcase__content {
  z-index: 1;
  max-width: 430px;
  margin: 50px 0;
}

.login-eyebrow,
.login-showcase__footer {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.76);
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.login-eyebrow span {
  width: 23px;
  height: 2px;
  border-radius: 2px;
  background: #a8c0ff;
}

.login-showcase h1 {
  margin: 22px 0 15px;
  color: #fff;
  font-size: clamp(2.5rem, 4.1vw, 3.65rem);
  font-weight: 700;
  letter-spacing: -0.055em;
  line-height: 1.06;
}

.login-showcase__content > p {
  max-width: 370px;
  margin: 0;
  color: rgba(255, 255, 255, 0.76);
  font-size: 1rem;
  line-height: 1.75;
}

.login-benefits {
  display: grid;
  gap: 16px;
  margin-top: 38px;
}

.login-benefit {
  display: flex;
  align-items: center;
  gap: 14px;
}

.login-benefit > .q-icon {
  display: grid;
  width: 43px;
  height: 43px;
  flex: 0 0 43px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 21px;
}

.login-benefit strong,
.login-benefit small {
  display: block;
}

.login-benefit strong {
  font-size: 0.91rem;
}

.login-benefit small {
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.66);
  font-size: 0.77rem;
}

.login-showcase__footer {
  z-index: 1;
  justify-content: space-between;
  padding-top: 19px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.login-showcase__footer .q-icon {
  color: rgba(255, 255, 255, 0.78);
}

.login-decoration {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 50%;
  pointer-events: none;
}

.login-decoration--one {
  top: 22%;
  right: -155px;
  width: 360px;
  height: 360px;
}

.login-decoration--two {
  right: -89px;
  bottom: -215px;
  width: 390px;
  height: 390px;
  background: rgba(255, 255, 255, 0.035);
}

.login-form-panel {
  position: relative;
  display: grid;
  place-items: center;
  padding: 64px 56px;
  background: #fff;
}

.login-tema {
  position: absolute;
  top: 24px;
  right: 26px;
  color: #64748b;
}

.login-form-content {
  width: min(100%, 370px);
}

.login-form-kicker {
  margin-bottom: 11px;
  color: #4169e1;
  font-size: 0.69rem;
  font-weight: 800;
  letter-spacing: 0.15em;
}

.login-form-heading h2 {
  margin: 0;
  color: #14213d;
  font-size: 2.15rem;
  font-weight: 750;
  letter-spacing: -0.045em;
  line-height: 1.2;
}

.login-form-heading p {
  margin: 10px 0 30px;
  color: #71809a;
  font-size: 0.91rem;
  line-height: 1.6;
}

.login-form {
  display: grid;
  gap: 8px;
}

.login-input :deep(.q-field__control) {
  min-height: 58px;
  border-radius: 13px;
  background: #fbfcff;
}

.login-input :deep(.q-field__prepend) {
  color: #7185b0;
}

.login-submit {
  min-height: 54px;
  margin-top: 10px;
  border-radius: 13px;
  box-shadow: 0 10px 22px rgba(49, 88, 213, 0.23);
  font-weight: 700;
  letter-spacing: 0.01em;
}

.login-demo {
  display: flex;
  gap: 12px;
  margin-top: 27px;
  padding: 15px 16px;
  border: 1px solid #e5eaf5;
  border-radius: 14px;
  background: #f7f9fe;
  color: #52627f;
  font-size: 0.78rem;
  line-height: 1.65;
}

.login-demo > .q-icon {
  flex: 0 0 auto;
  margin-top: 1px;
  color: #4169e1;
  font-size: 19px;
}

.login-demo strong {
  color: #263653;
  font-size: 0.81rem;
}

.login-demo p {
  margin: 4px 0 0;
}

.login-demo b {
  color: #344c7b;
  font-weight: 700;
}

.login-security {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin-top: 23px;
  color: #8a96aa;
  font-size: 0.73rem;
}

.login-security .q-icon {
  color: #38a169;
  font-size: 16px;
}

body.body--dark .login-page {
  background:
    radial-gradient(ellipse at 7% 9%, rgba(65, 105, 225, 0.19), transparent 34%),
    radial-gradient(ellipse at 92% 95%, rgba(30, 58, 138, 0.22), transparent 32%),
    #0b1120;
}

body.body--dark .login-shell {
  border-color: #293654;
  background: #111a2e;
  box-shadow: 0 32px 90px rgba(0, 0, 0, 0.38);
}

body.body--dark .login-form-panel {
  background: #111a2e;
}

body.body--dark .login-form-heading h2 {
  color: #f1f5ff;
}

body.body--dark .login-form-heading p,
body.body--dark .login-tema {
  color: #a2aec4;
}

body.body--dark .login-input :deep(.q-field__control) {
  background: #17233a;
}

body.body--dark .login-demo {
  border-color: #2b3a59;
  background: #17233a;
  color: #b4c0d6;
}

body.body--dark .login-demo strong,
body.body--dark .login-demo b {
  color: #e0e8fa;
}

body.body--dark .login-security {
  color: #a2aec4;
}

@media (max-width: 800px) {
  .login-page {
    padding: 22px;
  }

  .login-shell {
    grid-template-columns: 1fr;
    max-width: 540px;
  }

  .login-showcase {
    min-height: auto;
    padding: 28px 30px;
  }

  .login-showcase__content {
    margin: 42px 0 36px;
  }

  .login-showcase h1 {
    font-size: 2.55rem;
  }

  .login-benefits {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 26px;
  }

  .login-benefit {
    align-items: flex-start;
    gap: 9px;
  }

  .login-benefit > .q-icon {
    width: 36px;
    height: 36px;
    flex-basis: 36px;
    border-radius: 11px;
    font-size: 18px;
  }

  .login-benefit small {
    font-size: 0.69rem;
  }

  .login-form-panel {
    padding: 56px 32px 36px;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 12px;
  }

  .login-shell {
    border-radius: 22px;
  }

  .login-showcase {
    padding: 23px 22px;
  }

  .login-brand__icon {
    width: 42px;
    height: 42px;
    border-radius: 13px;
  }

  .login-showcase__content {
    margin: 34px 0 28px;
  }

  .login-showcase h1 {
    font-size: 2.22rem;
  }

  .login-showcase__content > p {
    font-size: 0.9rem;
  }

  .login-benefits {
    grid-template-columns: 1fr;
    gap: 13px;
  }

  .login-form-panel {
    padding: 58px 22px 28px;
  }

  .login-tema {
    top: 15px;
    right: 15px;
  }

  .login-form-heading h2 {
    font-size: 1.85rem;
  }
}
</style>
