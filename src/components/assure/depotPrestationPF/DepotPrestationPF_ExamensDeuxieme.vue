<template>

  <div class="depot-pf-examens-groupe depot-pf-examens-groupe--centred">

    <div class="depot-pf-examens-groupe__title depot-pf-examens-groupe__title--center">

      {{ t('inputassu.deuxieme_examen_prenatal') }}

    </div>

    <div class="depot-pf-row-examen-deuxieme row items-end justify-center">

      <q-input

        v-model="f.dateExam2"

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

        class="depot-pf-field-date-compact depot-pf-field-date-deuxieme"

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

        <q-checkbox v-model="f.AP2ChBo" :label="t('inputassu.allocations_numero_2')" />

        <q-checkbox v-model="f.FM2ChBo" :label="t('inputassu.frais_medicaux')" />

      </div>

    </div>

    <div class="depot-pf-examens-fichiers row items-start justify-center q-mt-sm">

      <DepotPrestationPF_FichierPiece

        v-model="f[PF_PIECE.CERT_AP2]"

        :label="t('inputassu.certificat_medical_huitieme_mois_grossesse')"

        :rules="deuxiemeActif ? [required, fileTypesPieces] : []"

      />

      <DepotPrestationPF_FichierPiece

        v-model="f[PF_PIECE.FRAIS_AP2]"

        :label="t('inputassu.frais_medicaux_deuxieme_examen')"

        :rules="deuxiemeActif && f.FM2ChBo ? [required, fileTypesPieces] : []"

      />

    </div>

  </div>

</template>



<script setup>

import { computed } from 'vue'

import { useI18n } from 'vue-i18n'

import { PF_PIECE } from 'src/data/assure/depotPrestationPfLegacyFields.js'

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



const deuxiemeActif = computed(

  () =>

    hasDate(f.value.dateExam2) ||

    hasDate(f.value.dateAccoProb) ||

    f.value.AP2ChBo ||

    f.value.FM2ChBo,

)

</script>

