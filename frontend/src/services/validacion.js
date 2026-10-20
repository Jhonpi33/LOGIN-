import { nextTick } from 'vue'
import alerta from './alertas'

/**
 * Validacion de formularios GUIANDO UN SOLO CAMPO A LA VEZ.
 *
 * En vez de avisar "documento, nombre y correo son obligatorios" de golpe
 * (que deja al usuario sin saber por donde empezar), se recorren los campos
 * EN EL ORDEN EN QUE SE VEN EN LA PANTALLA y se detiene en el PRIMERO que
 * falla. Ese campo:
 *   1. se pinta de rojo
 *   2. se deja enfocado (el cursor ya queda ahi)
 *   3. lanza SOLO ese aviso
 * Cuando el usuario lo corrige y vuelve a pulsar Guardar, aparece el
 * siguiente campo mal. Asi se va de uno en uno.
 *
 * USO:
 *
 *   const errores = ref({ documento: false, nombre: false })
 *   const refDocumento = ref(null)   // va como ref="refDocumento" en el q-input
 *
 *   async function guardar() {
 *     const ok = await validarCampoAVez(
 *       [
 *         { clave: 'documento', ref: refDocumento, ok: !!documento,
 *           titulo: 'Falta el documento', mensaje: 'Escribe el numero de documento' },
 *         { clave: 'nombre', ref: refNombre, ok: !!nombre,
 *           titulo: 'Falta el nombre', mensaje: 'Escribe el nombre completo' }
 *       ],
 *       errores
 *     )
 *     if (!ok) return   // ya quedo avisado y enfocado: no sigue
 *     ...
 *   }
 *
 * Y en el template:  <q-input v-model="form.x" :error="errores.x" ... />
 *
 * @param {Array}  campos - en orden visual: { clave, ref, ok, titulo, mensaje }
 * @param {Object} errores - objeto reactivo { clave: boolean } pintado en :error
 * @returns {Promise<boolean>} true si todo esta bien
 */
export async function validarCampoAVez(campos, errores) {
  // 1) se borran los rojos anteriores: solo uno queda marcado por vez
  for (const clave of Object.keys(errores.value ?? errores)) {
    const obj = errores.value ?? errores
    obj[clave] = false
  }

  // 2) se busca el PRIMERO que no cumpla, siguiendo el orden del formulario
  const malo = campos.find((c) => !c.ok)
  if (!malo) return true

  // 3) se marca de rojo
  if (malo.clave) {
    const obj = errores.value ?? errores
    obj[malo.clave] = true
  }

  // 4) se enfoca el campo (Quasar expone .focus() en el q-input)
  if (malo.ref) {
    nextTick(() => malo.ref.value?.focus?.())
  }

  // 5) se avisa SOLO de ese campo
  await alerta.aviso(malo.titulo, malo.mensaje)
  return false
}

/**
 * Quita el rojo de UN campo cuando el usuario empieza a escribir en el.
 * Va en @update:model-value del q-input:
 *
 *   <q-input v-model="form.x" :error="errores.x"
 *            @update:model-value="errores.x = false" />
 */
export function limpiarError(errores, clave) {
  const obj = errores.value ?? errores
  if (clave in obj) obj[clave] = false
}
