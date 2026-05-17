<template>
  <div class="depot-pf-form-section">
    <div class="text-subtitle1 text-primary">{{ t('inputassu.informations_principales') }}</div>
    <div class="depot-pf-form-grid-2">
      <q-input
        v-model="f.dateSignatureDossier"
        class="depot-pf-field-date-compact"
        :label="t('inputassu.date_signature_dossier_employeur')"
        outlined
        dense
        mask="##/##/####"
        :rules="[required]"
      >
        <template #append>
          <q-icon name="event" color="primary" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="f.dateSignatureDossier" mask="DD/MM/YYYY" :options="optionsDn">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup :label="t('form.confirm')" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      <q-input
        v-model="f.dateEmbauche"
        class="depot-pf-field-date-compact"
        :label="t('inputassu.date_embauche')"
        outlined
        dense
        mask="##/##/####"
        :rules="[required]"
      >
        <template #append>
          <q-icon name="event" color="primary" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="f.dateEmbauche" mask="DD/MM/YYYY" :options="optionsDn">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup :label="t('form.confirm')" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>
    <q-input
      v-model="f.heuresTravaillees"
      :label="t('inputassu.nombre_heures_travaillees_mois_embauche')"
      outlined
      dense
      :rules="[required]"
    />
    <div class="depot-pf-form-grid-2">
      <q-input
        v-model.number="f.nombreEnfantsMoins6"
        type="number"
        min="0"
        :label="t('inputassu.nombre_nouveaux_enfants_moins_six_ans')"
        outlined
        dense
      />
      <q-input
        v-model.number="f.nombreEnfantsPlus6"
        type="number"
        min="0"
        :label="t('inputassu.nombre_nouveaux_enfants_plus_six_ans')"
        outlined
        dense
      />
    </div>
    <q-input
      v-model.number="f.nombreEnfantsReconnus"
      type="number"
      min="0"
      :label="t('inputassu.nombre_nouveaux_enfants_reconnus')"
      outlined
      dense
    />

    <div class="text-subtitle1 text-primary">{{ t('inputassu.pieces_complementaires') }}</div>
    <div class="depot-pf-form-grid-3">
      <DepotPrestationPF_FichierPiece
        v-model="f.attestationNonPerceptionAF"
        :label="t('inputassu.attestation_non_perception_af')"
        :rules="[fileTypesPieces]"
      />
      <DepotPrestationPF_FichierPiece
        v-model="f.acteMariageCertifie"
        :label="t('inputassu.acte_mariage_certifie')"
        :rules="[fileTypesPieces]"
      />
      <DepotPrestationPF_FichierPiece
        v-model="f.originalActeMariage"
        :label="t('inputassu.original_acte_mariage')"
        :rules="[fileTypesPieces]"
      />
    </div>

    <div v-if="totalActes > 0" class="text-subtitle2">
      {{ t('inputassu.actes_naissance_supplementaires') }}
    </div>
    <div v-if="totalActes > 0" class="depot-pf-form-grid-3">
      <DepotPrestationPF_FichierPiece
        v-for="idx in totalActes"
        :key="idx"
        :model-value="f.actesNaissanceSupplementaires[`acte_${idx}`]"
        :label="`${t('inputassu.acte_naissance_supplementaire')} ${idx}`"
        :rules="[required, fileTypesPieces]"
        @update:model-value="(file) => (f.actesNaissanceSupplementaires[`acte_${idx}`] = file)"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDepotPrestationPfStore } from 'src/stores/assure/depotPrestationPfStore.js'
import { useDepotPrestationPfRules } from 'src/composables/assure/useDepotPrestationPfRules.js'
import DepotPrestationPF_FichierPiece from './DepotPrestationPF_FichierPiece.vue'

const { t } = useI18n()
const store = useDepotPrestationPfStore()
const f = computed(() => store.allocations)
const { required, optionsDn, fileTypesPieces } = useDepotPrestationPfRules()

const totalActes = computed(() => {
  const a = parseInt(f.value.nombreEnfantsMoins6 || 0, 10)
  const b = parseInt(f.value.nombreEnfantsPlus6 || 0, 10)
  const c = parseInt(f.value.nombreEnfantsReconnus || 0, 10)
  return a + b + c
})
</script>
