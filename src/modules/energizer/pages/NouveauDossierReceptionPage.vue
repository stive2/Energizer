<template>
  <q-page class="nouveau-dossier-page q-pa-md">
    <div class="nouveau-dossier-page__wrap q-mx-auto">
      <div class="nouveau-dossier-page__title-row">
        <span class="nouveau-dossier-page__title-icon">
          <q-icon name="folder_special" size="26px" />
        </span>
        <h1 class="nouveau-dossier-page__title text-h5 text-weight-bold q-mb-none">
          {{ t('reception.nouveauDossier.pageTitle') }}
        </h1>
      </div>

      <q-card flat class="nouveau-dossier-page__card">
        <q-card-section class="q-pb-none">
          <div class="nouveau-dossier-page__subtitle-row">
            <h2 class="nouveau-dossier-page__subtitle text-subtitle1 text-weight-bold q-mb-none">
              {{ t('reception.nouveauDossier.tableTitle') }}
            </h2>
            <span
              class="nouveau-dossier-page__count"
              :class="{ 'nouveau-dossier-page__count--loading': store.isLoadingSavedDossiers }"
            >
              <q-icon name="format_list_bulleted" size="14px" />
              {{ store.savedDossiers.length }}
            </span>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-sm">
          <div class="nouveau-dossier-page__toolbar row items-center q-mb-md q-gutter-sm">
            <q-btn
              unelevated
              no-caps
              icon="post_add"
              :label="t('reception.nouveauDossier.openDialog')"
              class="nouveau-dossier-page__btn-add"
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
              :loading="store.isLoadingSavedDossiers"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <div class="nouveau-dossier-page__table-wrap">
            <q-table
              flat
              class="nouveau-dossier-table"
              :rows="store.savedDossiers"
              :columns="columns"
              row-key="id"
              :loading="store.isLoadingSavedDossiers"
              :loading-label="t('reception.nouveauDossier.tableLoading')"
              :no-data-label="t('reception.nouveauDossier.noData')"
              :rows-per-page-label="t('reception.nouveauDossier.rowsPerPage')"
              :pagination-label="paginationLabel"
              v-model:pagination="pagination"
              :rows-per-page-options="[5, 10, 25, 50]"
              binary-state-sort
            >
              <template #loading>
                <q-inner-loading
                  showing
                  color="primary"
                  :label="t('reception.nouveauDossier.tableLoading')"
                >
                  <q-spinner-dots size="40px" color="primary" />
                </q-inner-loading>
              </template>

              <template #header="props">
                <q-tr :props="props" class="nouveau-dossier-table__head-row">
                  <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                    class="nouveau-dossier-table__head-cell"
                  >
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>

              <template #body-cell-num_dossier="props">
                <q-td :props="props">
                  <button
                    type="button"
                    class="nouveau-dossier-page__dossier-chip"
                    :disabled="openingDossierId === (props.row.num_dossier || props.row.id)"
                    @click="openDossierFromTable(props.row)"
                  >
                    <q-spinner
                      v-if="openingDossierId === (props.row.num_dossier || props.row.id)"
                      color="primary"
                      size="14px"
                      class="nouveau-dossier-page__dossier-chip-spinner"
                    />
                    <q-icon
                      v-else
                      name="description"
                      size="15px"
                      class="nouveau-dossier-page__dossier-chip-icon"
                    />
                    <span class="nouveau-dossier-page__dossier-chip-text">
                      {{ props.row.num_dossier || props.row.id }}
                    </span>
                  </button>
                </q-td>
              </template>

              <template #body-cell-objet="props">
                <q-td :props="props">
                  <span
                    class="nouveau-dossier-page__cell-text"
                    :title="props.row.objet || props.row.libelle_type_pres || ''"
                  >
                    {{ props.row.objet || props.row.libelle_type_pres || '—' }}
                  </span>
                </q-td>
              </template>

              <template #body-cell-code_situ="props">
                <q-td :props="props">
                  <span
                    class="nouveau-dossier-page__status-pill"
                    :class="`nouveau-dossier-page__status-pill--${statusColor(props.row.code_situ)}`"
                  >
                    <q-icon :name="statusIcon(props.row.code_situ)" size="14px" />
                    {{ props.row.code_situ || '—' }}
                  </span>
                </q-td>
              </template>

              <template #body-cell-createdAt="props">
                <q-td :props="props">
                  <span class="nouveau-dossier-page__date-cell">
                    <q-icon name="event" size="14px" />
                    {{ formatDate(props.row.createdAt || props.row.date_enreg) }}
                  </span>
                </q-td>
              </template>
            </q-table>
          </div>
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

const { t } = useI18n()
const route = useRoute()
const store = useNouveauDossierStore()
const dialogRef = ref(null)
const openingDossierId = ref(null)
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
    classes: 'nouveau-dossier-page__cell--mono',
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

function statusIcon(code) {
  const c = String(code || '').toLowerCase()
  if (c.includes('valid')) return 'check_circle'
  if (c.includes('cours')) return 'autorenew'
  return 'schedule'
}

async function refreshTable() {
  const q = String(tableFilter.value ?? '').trim()
  await store.loadSavedDossiers(q ? { num_dossier: q } : {})
}

function openReceptionDialog() {
  store.openDialog()
}

async function openDossierFromTable(row) {
  const id = row?.num_dossier || row?.id
  if (!id || openingDossierId.value) return
  openingDossierId.value = id
  try {
    await store.openDossierFromCorbeille(row)
  } finally {
    openingDossierId.value = null
  }
}

watch(
  () => store.dialogOpen,
  (open, wasOpen) => {
    if (wasOpen && !open) refreshTable()
  },
)

watch(tableFilter, () => {
  refreshTable()
})

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
/* ============================================================
   1. TOKENS
   ============================================================ */
.nouveau-dossier-page {
  --ndp-bg-1: #f3f6fc;
  --ndp-bg-2: #e9eef9;
  --ndp-ink: #1d2540;
  --ndp-ink-soft: #5b6478;
  --ndp-ink-faint: #8993a8;
  --ndp-line: #e4e8f1;
  --ndp-card: #ffffff;
  --ndp-accent: var(--q-primary, #1a56db);
  --ndp-accent-soft: #eaf0ff;
  --ndp-accent-soft: color-mix(in srgb, var(--ndp-accent) 10%, white);
  --ndp-accent-ring: rgba(26, 86, 219, 0.18);
  --ndp-accent-ring: color-mix(in srgb, var(--ndp-accent) 22%, transparent);
  --ndp-positive: #1ea97c;
  --ndp-positive-soft: #e7f8f0;
  --ndp-info: #3573e0;
  --ndp-info-soft: #eaf1ff;
  --ndp-warning: #c97f1d;
  --ndp-warning-soft: #fdf1e0;
  --ndp-radius-lg: 18px;
  --ndp-radius-md: 12px;
  --ndp-shadow-card: 0 1px 2px rgba(29, 37, 64, 0.04), 0 16px 40px -20px rgba(29, 37, 64, 0.28);
  font-family: 'Plus Jakarta Sans', 'Segoe UI', Roboto, system-ui, sans-serif;

  min-height: 100%;
  background: radial-gradient(
    120% 140% at 100% 0%,
    var(--ndp-bg-2) 0%,
    var(--ndp-bg-1) 55%,
    #fbfcfe 100%
  );
}

/* ============================================================
   2. LAYOUT / HEADER
   ============================================================ */
.nouveau-dossier-page__wrap {
  max-width: 1200px;
}

.nouveau-dossier-page__title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 22px;
}

.nouveau-dossier-page__title-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  color: #fff;
  background: linear-gradient(
    145deg,
    var(--ndp-accent),
    color-mix(in srgb, var(--ndp-accent) 70%, #0b1730)
  );
  box-shadow: 0 8px 18px -8px var(--ndp-accent-ring);
}

.nouveau-dossier-page__title {
  margin: 0;
  line-height: 1.3;
  color: var(--ndp-ink);
  letter-spacing: -0.01em;
}

/* ============================================================
   3. CARD — signature "pochette de dossier"
   ============================================================ */
.nouveau-dossier-page__card {
  position: relative;
  border: 1px solid var(--ndp-line);
  border-radius: var(--ndp-radius-lg);
  background: var(--ndp-card);
  box-shadow: var(--ndp-shadow-card);
  overflow: visible;
  animation: ndp-rise 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.nouveau-dossier-page__card::before {
  content: '';
  position: absolute;
  top: -13px;
  left: 26px;
  width: 58px;
  height: 26px;
  background: linear-gradient(
    145deg,
    var(--ndp-accent),
    color-mix(in srgb, var(--ndp-accent) 65%, #0b1730)
  );
  border-radius: 9px 9px 0 0;
  box-shadow: 0 -3px 10px -2px rgba(0, 0, 0, 0.18);
}

.nouveau-dossier-page__card::after {
  content: 'folder_open';
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  position: absolute;
  top: -8px;
  left: 38px;
  font-size: 18px;
  line-height: 1;
  color: #fff;
}

.nouveau-dossier-page__subtitle-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.nouveau-dossier-page__subtitle {
  margin: 0;
  line-height: 1.35;
  color: var(--ndp-ink);
}

.nouveau-dossier-page__count {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: var(--ndp-accent);
  background: var(--ndp-accent-soft);
  transition: opacity 0.2s ease;
}

.nouveau-dossier-page__count--loading {
  opacity: 0.55;
}

/* ============================================================
   4. TOOLBAR
   ============================================================ */
.nouveau-dossier-page__toolbar {
  flex-wrap: wrap;
}

.nouveau-dossier-page__btn-add {
  color: #fff;
  font-weight: 600;
  letter-spacing: 0.01em;
  padding: 10px 20px;
  border-radius: 999px;
  background: linear-gradient(
    135deg,
    var(--ndp-accent),
    color-mix(in srgb, var(--ndp-accent) 72%, #0b1730)
  );
  box-shadow: 0 10px 24px -10px var(--ndp-accent-ring);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.nouveau-dossier-page__btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px -10px var(--ndp-accent-ring);
}

.nouveau-dossier-page__btn-add:active {
  transform: translateY(0);
}

.nouveau-dossier-page__btn-add:deep(.q-icon) {
  transition: transform 0.18s ease;
}

.nouveau-dossier-page__btn-add:hover :deep(.q-icon) {
  transform: scale(1.12) rotate(-4deg);
}

.nouveau-dossier-page__search {
  min-width: 240px;
  max-width: 340px;
  flex: 1 1 240px;
}

.nouveau-dossier-page__search :deep(.q-field__control) {
  border-radius: 999px;
  background: #fff;
  transition:
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.nouveau-dossier-page__search :deep(.q-field__control):before {
  border-color: var(--ndp-line);
}

.nouveau-dossier-page__search.q-field--focused :deep(.q-field__control) {
  box-shadow: 0 0 0 4px var(--ndp-accent-ring);
}

.nouveau-dossier-page__search :deep(.q-field__prepend .q-icon) {
  color: var(--ndp-accent);
}

/* ============================================================
   5. TABLE
   ============================================================ */
.nouveau-dossier-page__table-wrap {
  border-radius: var(--ndp-radius-md);
  border: 1px solid var(--ndp-line);
  overflow: hidden;
}

.nouveau-dossier-table {
  position: relative;
  min-height: 160px;
}

.nouveau-dossier-table :deep(.q-table__container) {
  scrollbar-width: thin;
  scrollbar-color: var(--ndp-accent) transparent;
}

.nouveau-dossier-table :deep(.q-table__container::-webkit-scrollbar) {
  height: 8px;
}

.nouveau-dossier-table :deep(.q-table__container::-webkit-scrollbar-thumb) {
  background: color-mix(in srgb, var(--ndp-accent) 45%, transparent);
  border-radius: 999px;
}

.nouveau-dossier-table :deep(.nouveau-dossier-table__head-row) {
  background: linear-gradient(
    120deg,
    var(--ndp-accent),
    color-mix(in srgb, var(--ndp-accent) 78%, #0b1730)
  );
}

.nouveau-dossier-table :deep(.nouveau-dossier-table__head-cell) {
  color: #fff;
  font-weight: 700;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-top: 14px;
  padding-bottom: 14px;
}

.nouveau-dossier-table :deep(thead .q-table__sort-icon) {
  color: rgba(255, 255, 255, 0.85);
}

.nouveau-dossier-table :deep(tbody tr) {
  transition: background-color 0.15s ease;
  position: relative;
}

.nouveau-dossier-table :deep(tbody tr:nth-child(even)) {
  background: #fafbfe;
}

.nouveau-dossier-table :deep(tbody tr:hover) {
  background: var(--ndp-accent-soft);
}

.nouveau-dossier-table :deep(tbody tr td) {
  border-bottom: 1px solid var(--ndp-line);
  color: var(--ndp-ink);
  font-size: 13.5px;
}

.nouveau-dossier-table :deep(.nouveau-dossier-page__cell--mono) {
  font-family: 'JetBrains Mono', 'Roboto Mono', ui-monospace, monospace;
  letter-spacing: 0.01em;
  color: var(--ndp-ink-soft);
}

.nouveau-dossier-table :deep(.q-table__bottom) {
  border-top: 1px solid var(--ndp-line);
  color: var(--ndp-ink-soft);
  font-size: 12.5px;
}

.nouveau-dossier-table :deep(.q-table__bottom .q-field) {
  font-size: 12.5px;
}

/* ---- cell content helpers ---- */
.nouveau-dossier-page__cell-text {
  display: inline-block;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

.nouveau-dossier-page__date-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--ndp-ink-soft);
  font-variant-numeric: tabular-nums;
}

/* ---- dossier chip (num_dossier link) ---- */
.nouveau-dossier-page__dossier-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--ndp-accent-soft);
  border: 1px solid transparent;
  padding: 5px 12px;
  border-radius: 999px;
  color: var(--ndp-accent);
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}

.nouveau-dossier-page__dossier-chip:hover:not(:disabled) {
  border-color: var(--ndp-accent);
  box-shadow: 0 6px 14px -8px var(--ndp-accent-ring);
  transform: translateY(-1px);
}

.nouveau-dossier-page__dossier-chip:focus-visible {
  outline: 2px solid var(--ndp-accent);
  outline-offset: 2px;
}

.nouveau-dossier-page__dossier-chip:disabled {
  opacity: 0.65;
  cursor: wait;
}

.nouveau-dossier-page__dossier-chip-text {
  font-variant-numeric: tabular-nums;
}

/* ---- status pill ---- */
.nouveau-dossier-page__status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 11px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.nouveau-dossier-page__status-pill--positive {
  color: var(--ndp-positive);
  background: var(--ndp-positive-soft);
}

.nouveau-dossier-page__status-pill--info {
  color: var(--ndp-info);
  background: var(--ndp-info-soft);
}

.nouveau-dossier-page__status-pill--warning {
  color: var(--ndp-warning);
  background: var(--ndp-warning-soft);
}

/* ============================================================
   6. MOTION
   ============================================================ */
@keyframes ndp-rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .nouveau-dossier-page__card,
  .nouveau-dossier-page__btn-add,
  .nouveau-dossier-page__dossier-chip {
    animation: none !important;
    transition: none !important;
  }
}

/* ============================================================
   7. RESPONSIVE
   ============================================================ */
@media (max-width: 599px) {
  .nouveau-dossier-page__title-row {
    gap: 8px;
  }

  .nouveau-dossier-page__title-icon {
    width: 34px;
    height: 34px;
  }

  .nouveau-dossier-page__search {
    min-width: 100%;
    max-width: 100%;
  }

  .nouveau-dossier-page__btn-add {
    width: 100%;
    justify-content: center;
  }

  .nouveau-dossier-page__cell-text {
    max-width: 140px;
  }
}
</style>
