import { push } from 'notivue'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import '../styles/alertas.css' // IMPORTANTE: va despues del css de la libreria

/**
 * Capa unica de alertas: TODO mensaje pasa por aqui.
 *
 *   TIPO "AVISO"  -> notivue (toast que entra arriba centrado y se cierra solo)
 *     alerta.exito('Guardado', 'Todo salio bien')
 *     alerta.error('No se pudo conectar')
 *     alerta.aviso('Campos vacios')
 *     alerta.toast('Sesion cerrada', 'info')
 *
 *   TIPO "DIALOGO" -> SweetAlert2 (modales con botones; notivue no hace modales)
 *     if (await alerta.confirmar('Eliminar curso?')) { ... }
 *     const seguir = await alerta.seguridad()
 *
 * Nada de Notify de Quasar ni ventanas del navegador.
 */

function notificar(tipo, titulo, texto = '') {
  const opts = { title: titulo, message: texto }

  if (tipo === 'success') return push.success(opts)
  if (tipo === 'error') return push.error(opts)
  if (tipo === 'warning') return push.warning(opts)
  return push.info(opts)
}

// Base para los MODALES (no para los toasts)
const base = Swal.mixin({
  reverseButtons: true,
  confirmButtonText: 'Aceptar',
  cancelButtonText: 'Cancelar',
  showCloseButton: false,
  allowOutsideClick: true,
  heightAuto: false,
  padding: '1.7rem 1.6rem 1.4rem',
  customClass: {
    popup: 'alerta-popup',
    title: 'alerta-titulo',
    htmlContainer: 'alerta-texto',
    icon: 'alerta-icono',
    confirmButton: 'alerta-boton alerta-boton--ok',
    cancelButton: 'alerta-boton alerta-boton--no'
  }
})

export const alerta = {
  // ---- Avisos (notivue) -----------------------------------------------
  exito(titulo, texto = '') {
    return notificar('success', titulo, texto)
  },

  error(titulo, texto = '') {
    return notificar('error', titulo, texto)
  },

  aviso(titulo, texto = '') {
    return notificar('warning', titulo, texto)
  },

  /** Aviso informativo (icono azul) */
  info(titulo, texto = '') {
    return notificar('info', titulo, texto)
  },

  /**
   * Aviso chico centrado arriba.
   * @param {string} titulo
   * @param {'info'|'success'|'error'|'warning'} tipo
   */
  toast(titulo, tipo = 'info') {
    return notificar(tipo, titulo, '')
  },

  // Cierra todos los avisos pendientes (util en paginas con muchas cargas)
  limpiarAvisos() {
    push.destroyAll()
  },

  // ---- Dialogos (SweetAlert2) -----------------------------------------

  // Devuelve true / false: sirve con "if (await alerta.confirmar(...))"
  confirmar(titulo, texto = '') {
    return base
      .fire({
        icon: 'question',
        title: titulo,
        text: texto,
        showCancelButton: true,
        focusConfirm: false
      })
      .then((r) => r.isConfirmed)
  },

  /**
   * Aviso de contrasena debil o filtrada: sustituye al aviso rojo del
   * navegador por una alerta de la propia app.
   * @returns {Promise<boolean>} true si el usuario decide continuar
   */
  seguridad() {
    return base
      .fire({
        icon: 'warning',
        title: 'Violación de la seguridad de los datos',
        text:
          'La contraseña que intentas usar es demasiado común o aparece en ' +
          'filtraciones conocidas. Usa una contraseña única y segura para ' +
          'proteger tu cuenta.',
        showCancelButton: true,
        confirmButtonText: 'Continuar igual',
        cancelButtonText: 'Cancelar',
        allowOutsideClick: false,
        allowEscapeKey: false
      })
      .then((r) => r.isConfirmed)
  },

  // Mientras el backend piensa: overlay con spinner.
  cargando(texto = 'Un momento...') {
    base.fire({
      title: texto,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading()
    })
  },

  cerrarCarga() {
    Swal.close()
  }
}

export default alerta
