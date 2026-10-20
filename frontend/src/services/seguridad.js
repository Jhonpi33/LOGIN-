/**
 * @fileoverview Deteccion de contrasenas debiles o filtradas.
 *
 * Lista local con las contrasenas que mas se repiten en las filtraciones
 * publicas. No se manda NADA al servidor ni a internet: la comprobacion
 * ocurre aqui mismo, en el navegador.
 *
 * Su proposito es sustituir el aviso rojo del navegador ("Cambia tu
 * contrasena") por NUESTRA alerta, con el texto y el estilo de la app.
 *
 * @module services/seguridad
 */
import alerta from './alertas'

const FILTRADAS = [
  '123456',
  '12345678',
  '123456789',
  '1234567890',
  '111111',
  '000000',
  '654321',
  '123123',
  '112233',
  '121212',
  '1234',
  '12345',
  '1234567',
  'password',
  'password1',
  'passw0rd',
  'contrasena',
  'contrasena1',
  'qwerty',
  'qwerty123',
  'qwer1234',
  '1q2w3e4r',
  'abc123',
  'abcd1234',
  'admin',
  'admin123',
  'root',
  'toor',
  'letmein',
  'welcome',
  'iloveyou',
  'monkey',
  'dragon',
  'sunshine',
  'princess',
  'superman',
  'trustno1',
  'football',
  'baseball',
  'starwars',
  'michael',
  'shadow',
  'master',
  'hello',
  'freedom',
  'whatever',
  'qazwsx',
  'asdfgh',
  'zxcvbn',
  '1qaz2wsx',
  'aaaaaa',
  '11111111'
]

/**
 * ¿La contrasena es corta o esta en la lista de filtradas?
 * @param {string} password
 * @returns {boolean}
 */
export function esInsegura(password = '') {
  const p = String(password || '')
    .trim()
    .toLowerCase()

  if (p.length < 6) return true
  return FILTRADAS.includes(p)
}

/**
 * Si la contrasena es insegura muestra NUESTRA alerta (SweetAlert2) y devuelve
 * si el usuario decidio continuar.
 *
 * @param {string} password
 * @returns {Promise<boolean>} true -> seguir adelante, false -> cancelar
 */
export async function avisarSeguridad(password) {
  if (!esInsegura(password)) return true
  return alerta.seguridad()
}
