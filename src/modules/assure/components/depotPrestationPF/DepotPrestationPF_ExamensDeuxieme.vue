<template>
  <div class="depot-pf-examens-groupe depot-pf-examens-groupe--centred">
    <div class="depot-pf-examens-groupe__title depot-pf-examens-groupe__title--center text-primary">
      {{ t('inputassu.deuxieme_examen_prenatal') }}
    </div>

    <div class="depot-pf-row-examen-deuxieme row items-end justify-center">
      <q-input
        v-model="f.dateExam2"
        :class="['depot-pf-field-date-compact', 'depot-pf-field-date-deuxieme', requiredFieldClass(deuxiemeActif)]"
        :label="fieldLabel(t('inputassu.date_deuxieme_examen'))"
        stack-label
        outlined
        dense
        mask="##/##/####"
        :rules="deuxiemeActif ? [required] : []"
      >
        <template #prepend>
          <q-icon name="event" color="primary" />
        </template>
        <template #append>
          <q-icon name="calendar_month" color="primary" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="f.dateExam2" mask="DD/MM/YYYY" :options="optionsDn">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup :label="t('form.confirm')" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-input
        v-model="f.dateAccoProb"
        :class="['depot-pf-field-date-compact', 'depot-pf-field-date-deuxieme', requiredFieldClass(deuxiemeActif)]"
        :label="fieldLabel(t('inputassu.date_probable_accouchement'))"
        stack-label
        outlined
        dense
        mask="##/##/####"
        :rules="deuxiemeActif ? [required] : []"
      >
        <template #prepend>
          <q-icon name="pregnant_woman" color="primary" />
        </template>
        <template #append>
          <q-icon name="calendar_month" color="primary" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="f.dateAccoProb" mask="DD/MM/YYYY" :options="optionsDn">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup :label="t('form.confirm')" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <div class="depot-pf-checkbox-inline depot-pf-row-examen-deuxieme__checks">
        <DepotPrestationPF_CheckboxField
          v-model="f.AP2ChBo"
          icon="looks_two"
          :label="t('inputassu.allocations_numero_2')"
        />
        <DepotPrestationPF_CheckboxField
          v-model="f.FM2ChBo"
          icon="medication"
          :label="t('inputassu.frais_medicaux')"
        />
      </div>
    </div>

    <div class="depot-pf-examens-fichiers row items-start justify-center q-mt-sm">
      <DepotPrestationPF_FichierPiece
        v-model="f[PF_PIECE.CERT_AP2]"
        :label="t('inputassu.certificat_medical_huitieme_mois_grossesse')"
        :mark-required="deuxiemeActif"
        :rules="deuxiemeActif ? [required, fileTypesPieces] : []"
      />
      <DepotPrestationPF_FichierPiece
        v-model="f[PF_PIECE.FRAIS_AP2]"
        :label="t('inputassu.frais_medicaux_deuxieme_examen')"
        :mark-required="deuxiemeActif && f.FM2ChBo"
        :rules="deuxiemeActif && f.FM2ChBo ? [required, fileTypesPieces] : []"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PF_PIECE } from 'src/modules/assure/data/depotPrestationPfLegacyFields.js'
import { useDepotPrestationPfStore } from 'src/modules/assure/stores/depotPrestationPfStore.js'
import { useDepotPrestationPfRules } from 'src/modules/assure/composables/useDepotPrestationPfRules.js'
import DepotPrestationPF_FichierPiece from './DepotPrestationPF_FichierPiece.vue'
import DepotPrestationPF_CheckboxField from './DepotPrestationPF_CheckboxField.vue'

const { t } = useI18n()
const store = useDepotPrestationPfStore()
const f = computed(() => store.examensPrenataux)
const { required, fieldLabel, requiredFieldClass, optionsDn, fileTypesPieces } = useDepotPrestationPfRules()

function hasDate(val) {
  return String(val || '').replace(/\D/g, '').length >= 8
}

const deuxiemeActif = computed(
  () =>
    hasDate(f.value.dateExam2) ||
    hasDate(f.value.dateAccoProb) ||
    f.value.AP2ChBo ||
    f.value.FM2ChBo,
)
</script>
