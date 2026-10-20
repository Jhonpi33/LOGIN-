/**
 * @fileoverview Temas propios de las notificaciones (notivue).
 *
 * notivue pinta con variables CSS `--nv-*` que vienen en objetos (lightTheme /
 * darkTheme). Aqui los reutilizamos como base y los sobreescribimos con la
 * paleta del proyecto: azul rey (#4169E1) + gris.
 *
 * Se pasan a <Notification :theme="..."> y cambian segun el modo oscuro.
 *
 * @module styles/temas-notivue
 */
import { lightTheme, darkTheme } from 'notivue'

const base = {
  '--nv-width': '360px',
  '--nv-min-width': '260px',
  '--nv-radius': '14px',
  '--nv-border-width': '1px',
  '--nv-icon-size': '1.35rem',
  '--nv-title-size': '0.95rem',
  '--nv-message-size': '0.88rem',
  '--nv-progress-height': '3px'
}

/** Tema claro: fondo gris claro/blanco, texto azul noche. */
export const temaClaro = {
  ...lightTheme,
  ...base,
  '--nv-shadow': '0 18px 44px rgba(15, 23, 42, 0.20)',
  '--nv-global-bg': '#FFFFFF',
  '--nv-global-fg': '#0F172A',
  '--nv-global-border': '#E2E8F0',
  '--nv-success-accent': '#16A34A',
  '--nv-error-accent': '#DC2626',
  '--nv-warning-accent': '#F59E0B',
  '--nv-info-accent': '#4169E1', // azul rey
  '--nv-promise-accent': '#4169E1'
}

/** Tema oscuro: superficie gris pizarra, acentos claros. */
export const temaOscuro = {
  ...darkTheme,
  ...base,
  '--nv-shadow': '0 18px 44px rgba(0, 0, 0, 0.55)',
  '--nv-global-bg': '#1B2440',
  '--nv-global-fg': '#E2E8F0',
  '--nv-global-border': '#2E3A5C',
  '--nv-success-accent': '#4ADE80',
  '--nv-error-accent': '#F87171',
  '--nv-warning-accent': '#FBBF24',
  '--nv-info-accent': '#8FA9FF', // azul rey claro
  '--nv-promise-accent': '#8FA9FF'
}
