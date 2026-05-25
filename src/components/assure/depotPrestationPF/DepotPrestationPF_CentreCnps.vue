<template>
  <div class="depot-pf-form-section" :class="{ 'depot-pf-centre-cnps--centered': centered }">
    <div v-if="showSectionHeading" class="depot-pf-section-heading">
      {{ t('modules.assure.depotPf.sectionPrestation') }}
    </div>
    <div class="depot-pf-centre-cnps-select-wrap">
      <DepotPrestationPF_CentreCnpsSelect />
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import DepotPrestationPF_CentreCnpsSelect from './DepotPrestationPF_CentreCnpsSelect.vue'

defineProps({
  showSectionHeading: { type: Boolean, default: true },
  centered: { type: Boolean, default: false },
})

const { t } = useI18n()
</script>
