<template>
  <q-page class="nouveau-dossier-page q-pa-md">
    <div class="nouveau-dossier-page__wrap q-mx-auto">
      <AppBreadcrumbs :menu-items="energizerMenu" />

      <h1 class="nouveau-dossier-page__title text-h5 text-primary text-weight-bold text-center q-mb-md">
        {{ t('reception.nouveauDossier.pageTitle') }}
      </h1>

      <q-card flat bordered class="nouveau-dossier-page__card">
        <q-card-section class="q-pb-none">
          <h2 class="nouveau-dossier-page__subtitle text-subtitle1 text-primary text-weight-bold text-center q-mb-md">
            {{ t('reception.nouveauDossier.tableTitle') }}
          </h2>
        </q-card-section>

        <q-card-section class="q-pt-sm">
          <div class="nouveau-dossier-page__toolbar row items-center q-mb-md q-gutter-sm">
            <q-btn
              color="primary"
              unelevated
              no-caps
              icon="add_circle"
              :label="t('reception.nouveauDossier.openDialog')"
              @click="openReceptionDialog"
            />
            <q-space />
            <q-input
              v-model="tableFilter"
              dense
              outlined
              clearable
              debounce="250"
              class="nouveau-dossier-page__search"
              :placeholder="t('reception.nouveauDossier.tableSearch')"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <q-table
            flat
            bordered
            class="nouveau-dossier-table"
            :rows="store.savedDossiers"
            :columns="columns"
            row-key="id"
            :filter="tableFilter"
            :filter-method="filterTableRows"
            :loading="loadingTable"
            :no-data-label="t('reception.nouveauDossier.noData')"
            :rows-per-page-label="t('reception.nouveauDossier.rowsPerPage')"
            :pagination-label="paginationLabel"
            v-model:pagination="pagination"
            :rows-per-page-options="[5, 10, 25, 50]"
            binary-state-sort
          >
            <template #header="props">
              <q-tr :props="props" class="nouveau-dossier-table__head-row">
                <q-th v-for="col in props.cols" :key="col.name" :props="props" class="nouveau-dossier-table__head-cell">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template #body-cell-objet="props">
              <q-td :props="props">
                {{ props.row.objet || props.row.libelle_type_pres || '—' }}
              </q-td>
            </template>

            <template #body-cell-code_situ="props">
              <q-td :props="props">
                <q-badge
                  :color="statusColor(props.row.code_situ)"
                  text-color="white"
                  :label="props.row.code_situ || '—'"
                />
              </q-td>
            </template>

            <template #body-cell-createdAt="props">
              <q-td :props="props">
                {{ formatDate(props.row.createdAt || props.row.date_enreg) }}
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <NouveauDossierDialog ref="dialogRef" />
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useNouveauDossierStore } from 'src/modules/energizer/stores/nouveauDossierStore.js'
import NouveauDossierDialog from 'src/modules/energizer/components/nouveauDossier/NouveauDossierDialog.vue'
import AppBreadcrumbs from 'src/modules/shared/components/layout/AppBreadcrumbs.vue'
import { energizerMenu } from 'src/modules/energizer/config/energizerMenu.js'

const { t } = useI18n()
const route = useRoute()
const store = useNouveauDossierStore()
const dialogRef = ref(null)
const loadingTable = ref(false)
const tableFilter = ref('')

const pagination = ref({
  sortBy: 'createdAt',
  descending: true,
  page: 1,
  rowsPerPage: 10,
})

const columns = computed(() => [
  {
    name: 'num_dossier',
    label: t('reception.nouveauDossier.colNumDossier'),
    field: (row) => row.num_dossier || row.id,
    align: 'left',
    sortable: true,
  },
  {
    name: 'objet',
    label: t('reception.nouveauDossier.selectType'),
    field: 'objet',
    align: 'left',
    sortable: true,
  },
  {
    name: 'numassu',
    label: t('reception.nouveauDossier.colNumAssure'),
    field: 'numassu',
    align: 'left',
    sortable: true,
  },
  {
    name: 'nomcomplet',
    label: t('reception.nouveauDossier.colDeposant'),
    field: (row) => row.nomcomplet || row.nomcompletass || '—',
    align: 'left',
    sortable: true,
  },
  {
    name: 'code_situ',
    label: t('reception.nouveauDossier.colStatut'),
    field: 'code_situ',
    align: 'left',
    sortable: true,
  },
  {
    name: 'createdAt',
    label: t('reception.nouveauDossier.createdAt'),
    field: 'createdAt',
    align: 'left',
    sortable: true,
  },
])

function paginationLabel(firstRowIndex, endRowIndex, totalRowsNumber) {
  return t('reception.nouveauDossier.paginationLabel', {
    from: firstRowIndex,
    to: endRowIndex,
    total: totalRowsNumber,
  })
}

function formatDate(val) {
  if (!val) return '—'
  const d = new Date(val)
  return Number.isNaN(d.getTime()) ? String(val) : d.toLocaleString('fr-FR')
}

function statusColor(code) {
  const c = String(code || '').toLowerCase()
  if (c.includes('valid')) return 'positive'
  if (c.includes('cours')) return 'info'
  return 'warning'
}

function filterTableRows(rows, terms) {
  const q = String(terms || '')
    .trim()
    .toLowerCase()
  if (!q) return rows

  return rows.filter((row) => {
    const haystack = [
      row.num_dossier,
      row.id,
      row.objet,
      row.libelle_type_pres,
      row.numassu,
      row.nomcomplet,
      row.nomcompletass,
      row.code_situ,
      row.circuit,
      row.agentName,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}

async function refreshTable() {
  loadingTable.value = true
  try {
    await store.loadSavedDossiers()
  } finally {
    loadingTable.value = false
  }
}

function openReceptionDialog() {
  store.openDialog()
}

watch(
  () => store.dialogOpen,
  (open, wasOpen) => {
    if (wasOpen && !open) refreshTable()
  },
)

watch(
  () => store.lastSubmitResult?.num_dossier,
  (num) => {
    if (num) refreshTable()
  },
)

onMounted(async () => {
  await refreshTable()
  if (route.query.open === 'dialog' || route.query.open === 'FORM1') {
    openReceptionDialog()
  }
})
</script>

<style scoped>
.nouveau-dossier-page__wrap {
  max-width: 1200px;
}

.nouveau-dossier-page__title,
.nouveau-dossier-page__subtitle {
  margin: 0;
  line-height: 1.35;
}

.nouveau-dossier-page__toolbar {
  flex-wrap: wrap;
}

.nouveau-dossier-page__search {
  min-width: 220px;
  max-width: 320px;
}

.nouveau-dossier-table :deep(.nouveau-dossier-table__head-row) {
  background: var(--q-primary);
}

.nouveau-dossier-table :deep(.nouveau-dossier-table__head-cell) {
  color: #fff;
  font-weight: 600;
  font-size: 13px;
}

.nouveau-dossier-table :deep(thead .q-table__sort-icon) {
  color: rgba(255, 255, 255, 0.85);
}
</style>
