<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h6">Enregistrer un encaissement des assurés volontaires</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <q-form @submit.prevent="onSubmit" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <q-input class="col-12 col-md-4" v-model="numAssure" label="N° Assuré" filled />
            <q-input class="col-12 col-md-4" v-model="periode" label="Période (MM/AAAA)" filled />
            <q-input class="col-12 col-md-4" v-model.number="montant" type="number" label="Montant (FCFA)" filled />
          </div>
          <q-btn color="positive" icon="save" label="Enregistrer" @click="onSubmit" />
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

const numAssure = ref('AV0001')
const periode = ref('01/2025')
const montant = ref(0)

function onSubmit() {
  $q.notify({ message: 'Enregistrement AV simulé (placeholder)', color: 'positive' })
}
</script>
