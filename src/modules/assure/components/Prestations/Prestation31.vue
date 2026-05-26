<template>
  <div class="prestation-31-stub text-grey-7 q-pa-sm">
    Formulaire prestation 31 (accident) — à compléter.
  </div>
</template>

<script setup>
defineOptions({ name: 'Prestation31Form' })

defineProps({
  accidentForm: { type: Object, default: () => ({}) },
  locale: { type: String, default: 'fr' },
  required: { type: Function, default: () => true },
  numberOptions: { type: Array, default: () => [] },
  optionsDn: { type: Function, default: () => true },
})
</script>
