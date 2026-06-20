<template>
  <div class="depot-pf-examens-groupe depot-pf-examens-groupe--centred">
    <div class="depot-pf-examens-groupe__title depot-pf-examens-groupe__title--center text-primary">
      {{ t('inputassu.premier_examen_prenatal') }}
    </div>

    <div class="depot-pf-row-examen-premier row items-center justify-center">
      <q-input
        v-model="f.dateExam1Date"
        :class="['depot-pf-field-date-compact', requiredFieldClass(premierActif)]"
        :label="fieldLabel(t('inputassu.date_premier_examen'))"
        stack-label
        outlined
        dense
        mask="##/##/####"
        :rules="premierActif ? [required] : []"
      >
        <template #prepend>
          <q-icon name="event" color="primary" />
        </template>
        <template #append>
          <q-icon name="calendar_month" color="primary" class="cursor-pointer">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date v-model="f.dateExam1Date" mask="DD/MM/YYYY" :options="optionsDn">
                <div class="row items-center justify-end">
                  <q-btn v-close-popup :label="t('form.confirm')" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <div class="depot-pf-checkbox-inline">
        <DepotPrestationPF_CheckboxField
          v-model="f.AP1ChBo"
          icon="looks_one"
          :label="t('inputassu.allocations_numero_1')"
        />
        <DepotPrestationPF_CheckboxField
          v-model="f.FM1ChBo"
          icon="medication"
          :label="t('inputassu.frais_medicaux')"
        />
      </div>
    </div>

    <div class="depot-pf-examens-fichiers row items-start justify-center q-mt-sm">
      <DepotPrestationPF_FichierPiece
        v-model="f[PF_PIECE.CERT_AP1]"
        :label="t('inputassu.certificat_premier_examen')"
        :mark-required="premierActif"
        :rules="premierActif ? [required, fileTypesPieces] : []"
      />
      <DepotPrestationPF_FichierPiece
        v-model="f[PF_PIECE.FRAIS_AP1]"
        :label="t('inputassu.frais_medicaux_premier_examen')"
        :mark-required="premierActif && f.FM1ChBo"
        :rules="premierActif && f.FM1ChBo ? [required, fileTypesPieces] : []"
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

const premierActif = computed(
  () => hasDate(f.value.dateExam1Date) || f.value.AP1ChBo || f.value.FM1ChBo,
)
</script>
