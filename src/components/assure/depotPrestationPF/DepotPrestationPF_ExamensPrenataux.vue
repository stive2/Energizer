<template>
  <div class="depot-pf-form-section">
    <div class="depot-pf-examens-groupe__title text-primary">
      {{ t('modules.assure.depotPf.examensPrenatauxTitre') }}
    </div>

    <div class="depot-pf-examens-groupe q-mb-md">
      <div class="depot-pf-examens-groupe__title">
        {{ t('inputassu.premier_examen_prenatal') }}
      </div>
      <div class="depot-pf-row-examen-premier row items-center justify-between">
        <q-input
          v-model="f.datePremierExamen"
          class="depot-pf-field-date-compact"
          :label="t('inputassu.date_premier_examen')"
          outlined
          dense
          mask="##/##/####"
          :rules="premierActif ? [required] : []"
        >
          <template #append>
            <q-icon name="event" color="primary" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="f.datePremierExamen" mask="DD/MM/YYYY" :options="optionsDn">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup :label="t('form.confirm')" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <div class="depot-pf-checkbox-inline">
          <q-checkbox v-model="f.allocations1" :label="t('inputassu.allocations_numero_1')" />
          <q-checkbox v-model="f.fraisMedicaux1" :label="t('inputassu.frais_medicaux')" />
        </div>
      </div>
      <div class="depot-pf-examens-fichiers row items-start justify-between q-mt-sm">
        <DepotPrestationPF_FichierPiece
          v-model="f.certificatPremier"
          :label="t('inputassu.certificat_premier_examen')"
          :rules="premierActif ? [required, fileTypesPieces] : []"
        />
        <DepotPrestationPF_FichierPiece
          v-model="f.fraisMedicauxPremier"
          :label="t('inputassu.frais_medicaux_premier_examen')"
          :rules="premierActif && f.fraisMedicaux1 ? [required, fileTypesPieces] : []"
        />
      </div>
    </div>

    <div class="depot-pf-examens-groupe">
      <div class="depot-pf-examens-groupe__title">
        {{ t('inputassu.deuxieme_examen_prenatal') }}
      </div>
      <div class="depot-pf-row-examen-deuxieme row items-end justify-between">
        <q-input
          v-model="f.dateDeuxiemeExamen"
          class="depot-pf-field-date-compact depot-pf-field-date-deuxieme"
          :label="t('inputassu.date_deuxieme_examen')"
          stack-label
          outlined
          dense
          mask="##/##/####"
          :rules="deuxiemeActif ? [required] : []"
        >
          <template #append>
            <q-icon name="event" color="primary" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date v-model="f.dateDeuxiemeExamen" mask="DD/MM/YYYY" :options="optionsDn">
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup :label="t('form.confirm')" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-input
          v-model="f.dateProbableAccouchement"
          class="depot-pf-field-date-compact depot-pf-field-date-deuxieme depot-pf-field-date-accouchement"
          :label="t('inputassu.date_probable_accouchement')"
          stack-label
          outlined
          dense
          mask="##/##/####"
          :rules="deuxiemeActif ? [required] : []"
        >
          <template #append>
            <q-icon name="event" color="primary" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-date
                  v-model="f.dateProbableAccouchement"
                  mask="DD/MM/YYYY"
                  :options="optionsDn"
                >
                  <div class="row items-center justify-end">
                    <q-btn v-close-popup :label="t('form.confirm')" color="primary" flat />
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <div class="depot-pf-checkbox-inline depot-pf-row-examen-deuxieme__checks">
          <q-checkbox v-model="f.allocations2" :label="t('inputassu.allocations_numero_2')" />
          <q-checkbox v-model="f.fraisMedicaux2" :label="t('inputassu.frais_medicaux')" />
        </div>
      </div>
      <div class="depot-pf-examens-fichiers row items-start justify-between q-mt-sm">
        <DepotPrestationPF_FichierPiece
          v-model="f.certificatDeuxieme"
          :label="t('inputassu.certificat_medical_huitieme_mois_grossesse')"
          :rules="deuxiemeActif ? [required, fileTypesPieces] : []"
        />
        <DepotPrestationPF_FichierPiece
          v-model="f.fraisMedicauxDeuxieme"
          :label="t('inputassu.frais_medicaux_deuxieme_examen')"
          :rules="deuxiemeActif && f.fraisMedicaux2 ? [required, fileTypesPieces] : []"
        />
      </div>
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
const f = computed(() => store.examensPrenataux)
const { required, optionsDn, fileTypesPieces } = useDepotPrestationPfRules()

function hasDate(val) {
  return String(val || '').replace(/\D/g, '').length >= 8
}

const premierActif = computed(
  () =>
    hasDate(f.value.datePremierExamen) ||
    f.value.allocations1 ||
    f.value.fraisMedicaux1,
)

const deuxiemeActif = computed(
  () =>
    hasDate(f.value.dateDeuxiemeExamen) ||
    hasDate(f.value.dateProbableAccouchement) ||
    f.value.allocations2 ||
    f.value.fraisMedicaux2,
)
</script>
