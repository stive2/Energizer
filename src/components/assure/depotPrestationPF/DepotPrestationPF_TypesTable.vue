<template>
  <q-card flat bordered class="depot-pf-types-table-card">
    <q-card-section class="depot-pf-types-table-card__head">
      <div class="text-h6 text-primary text-weight-bold">
        {{ t('modules.assure.depotPf.typesTable.title') }}
      </div>
      <p class="text-body2 text-grey-8 q-mb-none q-mt-xs">
        {{ t('modules.assure.depotPf.typesTable.lead') }}
      </p>
    </q-card-section>

    <q-separator />

    <q-card-section class="q-pa-none">
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="code"
        flat
        bordered
        hide-bottom
        :rows-per-page-options="[0]"
        class="depot-pf-types-table"
        :row-class="rowClass"
      >
        <template #body-cell-prestation="props">
          <q-td :props="props">
            <div class="row items-center no-wrap q-gutter-sm">
              <q-icon :name="props.row.icon" color="primary" size="22px" />
              <span class="text-weight-medium">{{ props.row.label }}</span>
            </div>
          </q-td>
        </template>
        <template #body-cell-description="props">
          <q-td :props="props" class="depot-pf-types-table__desc">
            {{ props.row.description }}
          </q-td>
        </template>
      </q-table>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDepotPrestationPfStore } from 'src/stores/assure/depotPrestationPfStore.js'
import { listDepotPfTypesReferenceRows } from 'src/data/assure/depotPrestationPfTypes.js'

const props = defineProps({
  selectedTypeCode: { type: String, default: null },
})

const { t } = useI18n()
const store = useDepotPrestationPfStore()

const rows = computed(() => listDepotPfTypesReferenceRows(t, store.assureSexe))

const columns = computed(() => [
  {
    name: 'prestation',
    label: t('modules.assure.depotPf.typesTable.colPrestation'),
    field: 'label',
    align: 'left',
    sortable: true,
  },
  {
    name: 'code',
    label: t('modules.assure.depotPf.typesTable.colCode'),
    field: 'legacyId',
    align: 'center',
    sortable: true,
  },
  {
    name: 'description',
    label: t('modules.assure.depotPf.typesTable.colDescription'),
    field: 'description',
    align: 'left',
  },
  {
    name: 'eligibility',
    label: t('modules.assure.depotPf.typesTable.colEligibility'),
    field: 'eligibility',
    align: 'left',
  },
  {
    name: 'documents',
    label: t('modules.assure.depotPf.typesTable.colDocuments'),
    field: 'documents',
    align: 'left',
  },
])

function rowClass(row) {
  return row.code === props.selectedTypeCode ? 'depot-pf-types-table__row--active' : ''
}
</script>

<style scoped lang="scss">
.depot-pf-types-table-card {
  border-radius: 12px;
  border-color: rgba(21, 101, 192, 0.18);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
}

.depot-pf-types-table-card__head {
  background: linear-gradient(180deg, #e8f4fd 0%, #fff 100%);
}

.depot-pf-types-table :deep(thead tr th) {
  background: #1565c0;
  color: #fff;
  font-weight: 700;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.depot-pf-types-table :deep(tbody tr.depot-pf-types-table__row--active) {
  background: rgba(21, 101, 192, 0.08);
}

.depot-pf-types-table__desc {
  max-width: 280px;
  white-space: normal;
  line-height: 1.35;
  font-size: 0.85rem;
}

@media (max-width: 900px) {
  .depot-pf-types-table :deep(.q-table) {
    display: block;
    overflow-x: auto;
  }
}
</style>
