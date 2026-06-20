<template>
  <q-select
    v-model="store.common.CODE_CENTRECNPSC"
    :label="fieldLabel(t('inputassu.centreCNPS'))"
    :class="['depot-pf-centre-cnps-select', requiredFieldClass(true)]"
    :options="centresFiltered"
    option-label="LIB_CENTRE"
    option-value="CODE_CENTRE"
    emit-value
    map-options
    outlined
    dense
    use-input
    input-debounce="0"
    class="depot-pf-centre-cnps-select"
    :rules="[required]"
    @filter="filterCentres"
  >
    <template #prepend>
      <q-icon name="location_city" color="primary" />
    </template>
  </q-select>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { centres as rawCentres } from 'src/modules/shared/data/Centres.js'
import { useDepotPrestationPfStore } from 'src/modules/assure/stores/depotPrestationPfStore.js'
import { useDepotPrestationPfRules } from 'src/modules/assure/composables/useDepotPrestationPfRules.js'

const { t } = useI18n()
const store = useDepotPrestationPfStore()
const { required, fieldLabel, requiredFieldClass } = useDepotPrestationPfRules()

const centresFiltered = ref([...rawCentres])

function filterCentres(val, update) {
  update(() => {
    const needle = (val || '').toLowerCase()
    centresFiltered.value = rawCentres.filter((c) =>
      c.LIB_CENTRE.toLowerCase().includes(needle),
    )
  })
}
</script>
