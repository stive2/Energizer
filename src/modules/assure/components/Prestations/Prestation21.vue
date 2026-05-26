<template>
  <div class="prestation-21-stub text-grey-7 q-pa-sm">
    Formulaire prestation 21 (revenus / activité) — à compléter.
  </div>
</template>

<script setup>
defineOptions({ name: 'Prestation21Form' })

defineProps({
  revenus: { type: Object, default: () => ({}) },
  activite: { type: Object, default: () => ({}) },
  fichierJoint: { type: [Object, File], default: null },
  revenusColumns: { type: Array, default: () => [] },
  activiteColumns: { type: Array, default: () => [] },
  validationOptions: { type: Array, default: () => [] },
  typePrestationOptions: { type: Array, default: () => [] },
  consulterRevenus: { type: Function, default: () => {} },
  consulterActivite: { type: Function, default: () => {} },
  onRejected: { type: Function, default: () => {} },
  locale: { type: String, default: 'fr' },
  required: { type: Function, default: () => true },
  optionsDn: { type: Function, default: () => true },
})
</script>
