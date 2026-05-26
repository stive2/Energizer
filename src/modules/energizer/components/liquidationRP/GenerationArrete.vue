<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="text-h6">Génération de l'arrêté</div>
      <p class="text-body2 text-grey-8 q-mt-sm">Écran en cours d'intégration.</p>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  dossier: { type: Object, default: () => ({}) },
  calculs: { type: Object, default: () => ({}) },
})
defineEmits(['arrete-generated'])
</script>
