<template>
  <div class="depot-pf-form-section depot-pf-examens-form">
    <div class="depot-pf-form-main-title depot-pf-form-main-title--center text-primary">
      {{ t('inputassu.remboursement_examens_prenataux') }}
    </div>
    <DepotPrestationPF_ExamensPremier />
    <DepotPrestationPF_ExamensDeuxieme />
    <div class="depot-pf-examens-zone-commune">
      <div class="depot-pf-centre-cnps-select-wrap">
        <DepotPrestationPF_CentreCnpsSelect />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import DepotPrestationPF_ExamensPremier from './DepotPrestationPF_ExamensPremier.vue'
import DepotPrestationPF_ExamensDeuxieme from './DepotPrestationPF_ExamensDeuxieme.vue'
import DepotPrestationPF_CentreCnpsSelect from './DepotPrestationPF_CentreCnpsSelect.vue'

const { t } = useI18n()
</script>
