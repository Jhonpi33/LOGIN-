/**
 * @fileoverview Preferencias de interfaz (modo oscuro/claro).
 *
 * Se guarda en localStorage con pinia-plugin-persistedstate, asi la app
 * recuerda el tema elegido entre sesiones.
 *
 * @module stores/preferencias.store
 */
import { defineStore } from 'pinia'

export const usePreferenciasStore = defineStore('preferencias', {
  state: () => ({
    /** true = modo oscuro */
    oscuro: false
  }),

  actions: {
    alternar() {
      this.oscuro = !this.oscuro
    },
    usar(v) {
      this.oscuro = !!v
    }
  },

  persist: true
})
