<template>
  <q-btn
    :icon="prefs.oscuro ? 'light_mode' : 'dark_mode'"
    :aria-label="prefs.oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
    :title="prefs.oscuro ? 'Modo claro' : 'Modo oscuro'"
    flat
    round
    dense
    size="sm"
    @click="alternar"
  >
    <q-tooltip>{{ prefs.oscuro ? 'Modo claro' : 'Modo oscuro' }}</q-tooltip>
  </q-btn>
</template>

<script setup>
import { usePreferenciasStore } from '../stores/preferencias.store'

const prefs = usePreferenciasStore()

function alternar() {
  prefs.alternar()
}
</script>
