<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">Suppression d'un encaissement employeur</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-form @submit.prevent="onSubmit" class="q-gutter-md">
          <q-input v-model="matriculeEmployeur" label="Matricule employeur" filled />
          <q-input v-model="numeroPiece" label="N° Pièce / Référence" filled />
          <q-btn color="negative" icon="delete" label="Supprimer" @click="onSubmit" />
          <q-btn flat color="primary" label="Fermer" @click="emit('close')" />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>
<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const emit = defineEmits(['close'])
const $q = useQuasar()

const matriculeEmployeur = ref('')
const numeroPiece = ref('')

function onSubmit() {
  $q.notify({ message: "Suppression simulée (placeholder)", color: 'negative' })
}
</script>

