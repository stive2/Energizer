<template>
  <div class="annule-mise-demeure">
    <q-card class="q-pa-lg">
      <div class="text-h6 q-mb-md">Annulation des Mises en Demeure</div>

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
    message: 'Mise en demeure annulée avec succès !'
  })
  resetForm()
}

const resetForm = () => {
  formData.value = {

  }
}


</script>

<style scoped>
.annule-mise-demeure {
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
