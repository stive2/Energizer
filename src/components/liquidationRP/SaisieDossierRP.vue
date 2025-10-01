<template>
  <div class="saisie-dossier-rp">
    <q-card class="q-pa-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="description" class="q-mr-sm" />
          Saisie Dossier RP
        </div>

        <q-form @submit="onSubmit" class="q-gutter-md">
          <div class="row q-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="dossier.numeroDossier"
                label="Numéro du dossier"
                outlined
                :rules="[val => !!val || 'Le numéro est requis']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="dossier.nomAssure"
                label="Nom de l'assuré"
                outlined
                :rules="[val => !!val || 'Le nom est requis']"
              />
            </div>
          </div>

          <div class="row q-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="dossier.dateNaissance"
                label="Date de naissance"
                type="date"
                outlined
              />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="dossier.typeLiquidation"
                :options="typesLiquidation"
                label="Type de liquidation"
                outlined
                emit-value
                map-options
              />
            </div>
          </div>

          <q-input
            v-model="dossier.observations"
            label="Observations"
            type="textarea"
            outlined
            rows="3"
          />

          <div class="q-mt-md">
            <q-btn
              type="submit"
              color="primary"
              label="Enregistrer"
              :loading="loading"
            />
            <q-btn
              flat
              color="grey"
              label="Annuler"
              class="q-ml-sm"
              @click="onReset"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

export default {
  name: 'SaisieDossierRP',
  emits: ['dossier-saved'],
  setup(props, { emit }) {
    const $q = useQuasar()
    const loading = ref(false)

    const dossier = ref({
      numeroDossier: '',
      nomAssure: '',
      dateNaissance: '',
      typeLiquidation: '',
      observations: ''
    })

    const typesLiquidation = [
      { label: 'Liquidation normale', value: 'normale' },
      { label: 'Liquidation anticipée', value: 'anticipee' },
      { label: 'Liquidation différée', value: 'differee' }
    ]

    const onSubmit = async () => {
      loading.value = true
      try {
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 1000))

        $q.notify({
          type: 'positive',
          message: 'Dossier RP enregistré avec succès'
        })

        emit('dossier-saved', dossier.value)
        onReset()
      } catch {
        $q.notify({
          type: 'negative',
          message: 'Erreur lors de l\'enregistrement'
        })
      } finally {
        loading.value = false
      }
    }

    const onReset = () => {
      dossier.value = {
        numeroDossier: '',
        nomAssure: '',
        dateNaissance: '',
        typeLiquidation: '',
        observations: ''
      }
    }

    return {
      dossier,
      typesLiquidation,
      loading,
      onSubmit,
      onReset
    }
  }
}
</script>

<style scoped>
.saisie-dossier-rp {
  max-width: 800px;
  margin: 0 auto;
}
</style>
