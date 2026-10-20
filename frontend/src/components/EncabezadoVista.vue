<template>
  <div class="row items-center q-col-gutter-sm q-mb-lg">
    <div class="col-auto">
      <div class="encabezado-icono" :class="`bg-${color}`">
        <q-icon :name="icono" color="white" size="26px" />
      </div>
    </div>

    <div class="col">
      <div class="text-h5 text-weight-bold">{{ titulo }}</div>
      <div class="text-caption text-grey-7">{{ subtitulo }}</div>
    </div>

    <div class="col-12 col-sm-auto row q-gutter-sm justify-end">
      <slot name="acciones" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  titulo: { type: String, required: true },
  subtitulo: { type: String, default: '' },
  icono: { type: String, default: 'dashboard' },
  color: { type: String, default: 'primary' }
})
</script>

<style scoped>
.encabezado-icono {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.18);
}
</style>
