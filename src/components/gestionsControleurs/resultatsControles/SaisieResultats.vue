<template>
  <div class="saisie-resultats">
    <q-card class="q-pa-lg">
      <div class="text-h6 q-mb-md">Saisie des Résultats de Contrôle</div>

      <q-form @submit="onSubmit" class="q-gutter-md">



      </q-form>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Données du formulaire
const formData = ref({

})

// Méthodes
const onSubmit = () => {
  $q.notify({
    type: 'positive',
    message: 'Résultat de contrôle enregistré avec succès !'
  })
  resetForm()
}

const resetForm = () => {
  formData.value = {

  }
}
</script>

<style scoped>
.saisie-resultats {
  max-width: 800px;
  margin: 0 auto;
}

.q-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.q-btn {
  border-radius: 8px;
}

.q-input, .q-select, .q-textarea {
  border-radius: 8px;
}
</style>
