<template>
  <div class="q-pa-sm stat-situations">

    <!-- ═══════════════════════════════════════════════════════
         FILTRES DE RECHERCHE
    ═══════════════════════════════════════════════════════ -->
    <q-card class="q-mb-sm card-elevated">
      <q-card-section class="bg-primary text-white card-header-rounded q-py-sm">
        <div class="row items-center">
          <q-icon name="insights" size="xs" class="q-mr-xs" />
          <span class="text-body2 text-weight-bold">Statistiques Situations des Dossiers par Branche</span>
        </div>
      </q-card-section>
      <q-card-section class="q-py-sm">
        <q-form @submit.prevent="searchStats" @reset="resetSearch">
          <div class="row q-col-gutter-sm items-end">

            <!-- Centre -->
            <div class="col-12 col-sm-3">
              <q-select
                v-model="filters.centre"
                :options="centreOptions"
                label="Centre"
                outlined dense emit-value map-options color="primary"
                clearable
              />
            </div>

            <!-- Branche -->
            <div class="col-12 col-sm-2">
              <q-select
                v-model="filters.branche"
                :options="brancheOptions"
                label="Branche"
                outlined dense emit-value map-options color="primary"
              />
            </div>

            <!-- Période début -->
            <div class="col-12 col-sm-2">
              <q-input
                v-model="filters.periodeDebut"
                label="Période de Début"
                outlined dense
                bg-color="yellow-1"
                placeholder="JJ/MM/AAAA"
              >
                <template v-slot:append>
                  <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="filters.periodeDebut" mask="DD/MM/YYYY" today-btn color="primary">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="OK" color="primary" flat dense />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <!-- Période fin -->
            <div class="col-12 col-sm-2">
              <q-input
                v-model="filters.periodeFin"
                label="Période de Fin"
                outlined dense
                bg-color="yellow-1"
                placeholder="JJ/MM/AAAA"
              >
                <template v-slot:append>
                  <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="filters.periodeFin" mask="DD/MM/YYYY" today-btn color="primary">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="OK" color="primary" flat dense />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <!-- Boutons -->
            <div class="col-12 col-sm-3">
              <div class="row q-gutter-xs">
                <q-btn type="submit" color="primary" label="Rechercher" icon="search"
                  dense unelevated style="border-radius:8px" :loading="loading" />
                <q-btn type="reset" color="grey-6" label="Annuler" icon="close"
                  dense unelevated style="border-radius:8px" />
                <q-btn color="teal-6" icon="download" label="Export"
                  dense unelevated style="border-radius:8px"
                  :disable="dossiers.length === 0"
                  @click="exportCsv"
                >
                  <q-tooltip>Exporter en CSV</q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <!-- ═══════════════════════════════════════════════════════
         KPI CARDS — RÉSUMÉ PAR SITUATION
    ═══════════════════════════════════════════════════════ -->
    <div v-if="dossiers.length > 0" class="row q-col-gutter-sm q-mb-sm">

      <!-- Total -->
      <div class="col-6 col-sm-4 col-md-2">
        <q-card class="kpi-card kpi-total">
          <q-card-section class="q-pa-sm text-center">
            <q-icon name="folder" size="1.4rem" color="primary" />
            <div class="kpi-count text-primary">{{ dossiers.length }}</div>
            <div class="kpi-label">Total dossiers</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- En Cours -->
      <div class="col-6 col-sm-4 col-md-2">
        <q-card class="kpi-card kpi-encours">
          <q-card-section class="q-pa-sm text-center">
            <q-icon name="pending" size="1.4rem" color="orange-7" />
            <div class="kpi-count text-orange-7">{{ countBySitu('cours') }}</div>
            <div class="kpi-label">En Cours</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- En Attente -->
      <div class="col-6 col-sm-4 col-md-2">
        <q-card class="kpi-card kpi-attente">
          <q-card-section class="q-pa-sm text-center">
            <q-icon name="hourglass_empty" size="1.4rem" color="blue-6" />
            <div class="kpi-count text-blue-6">{{ countBySitu('attente') }}</div>
            <div class="kpi-label">En Attente</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Transmis -->
      <div class="col-6 col-sm-4 col-md-2">
        <q-card class="kpi-card kpi-transmis">
          <q-card-section class="q-pa-sm text-center">
            <q-icon name="send" size="1.4rem" color="teal-6" />
            <div class="kpi-count text-teal-6">{{ countBySitu('transmi') }}</div>
            <div class="kpi-label">Transmis</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Liquidé -->
      <div class="col-6 col-sm-4 col-md-2">
        <q-card class="kpi-card kpi-liquide">
          <q-card-section class="q-pa-sm text-center">
            <q-icon name="check_circle" size="1.4rem" color="positive" />
            <div class="kpi-count text-positive">{{ countBySitu('liqui') }}</div>
            <div class="kpi-label">Liquidés</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Annulés -->
      <div class="col-6 col-sm-4 col-md-2">
        <q-card class="kpi-card kpi-annule">
          <q-card-section class="q-pa-sm text-center">
            <q-icon name="cancel" size="1.4rem" color="negative" />
            <div class="kpi-count text-negative">{{ countBySitu('annul') }}</div>
            <div class="kpi-label">Annulés</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Titre résultat -->
    <div v-if="dossiers.length > 0" class="result-header q-mb-sm">
      <div class="row items-center q-gutter-xs">
        <q-icon name="bar_chart" color="primary" size="sm" />
        <span class="text-subtitle2 text-primary text-weight-bold">
          Situations des Dossiers — {{ libelleBranche }} — {{ libellePeriode }}
        </span>
        <q-badge color="primary" :label="`${dossiers.length} dossier(s)`" />
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
         TABLE DES DOSSIERS
    ═══════════════════════════════════════════════════════ -->
    <q-card class="card-elevated">
      <q-card-section class="q-pa-none">
        <q-table
          :rows="dossiers"
          :columns="tableColumns"
          row-key="numdossier"
          :loading="loading"
          dense flat
          :rows-per-page-options="[20, 50, 100]"
          :filter="tableFilter"
          no-data-label="Aucun dossier — renseignez les filtres et cliquez sur Rechercher"
          class="stat-table"
        >
          <!-- Barre supérieure : filtre rapide -->
          <template v-slot:top-right>
            <q-input
              v-model="tableFilter"
              placeholder="Filtrer…"
              dense outlined
              style="min-width: 180px"
            >
              <template v-slot:append><q-icon name="filter_list" size="xs" /></template>
            </q-input>
          </template>

          <template v-slot:body-cell-index="props">
            <q-td :props="props" class="text-center text-grey-6">{{ props.rowIndex + 1 }}</q-td>
          </template>

          <template v-slot:body-cell-numdossier="props">
            <q-td :props="props">
              <span class="text-primary text-weight-bold" style="font-size:0.8rem">
                {{ props.row.numdossier }}
              </span>
            </q-td>
          </template>

          <template v-slot:body-cell-situation="props">
            <q-td :props="props">
              <q-badge
                :color="getSituColor(props.row.situation)"
                :label="props.row.situation || '—'"
                style="font-size:0.68rem; white-space:nowrap"
              />
            </q-td>
          </template>

          <template v-slot:no-data="{ message }">
            <div class="full-width row flex-center text-grey-6 q-pa-xl">
              <div class="text-center">
                <q-icon name="bar_chart" size="3rem" color="grey-4" class="q-mb-sm" />
                <div class="text-body2">{{ message }}</div>
                <div class="text-caption text-grey-5 q-mt-xs">Sélectionnez une branche et une période puis cliquez sur <b>Rechercher</b></div>
              </div>
            </div>
          </template>

          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
        </q-table>
      </q-card-section>
    </q-card>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useLiquidationPfStore } from 'src/stores/energizer/liquidationPfStore.js'

defineOptions({ name: 'StatSituationsDossiersParBranche' })

const $q = useQuasar()
const pfStore = useLiquidationPfStore()

// ─── État ────────────────────────────────────────────────────────
const loading     = ref(false)
const dossiers    = ref([])
const tableFilter = ref('')

// ─── Filtres ─────────────────────────────────────────────────────
const filters = reactive({
  centre:      '',
  branche:     'F',
  periodeDebut: '',
  periodeFin:  '',
})

// ─── Options des selects ─────────────────────────────────────────
const centreOptions = [
  { label: 'CPS YAOUNDÉ INDÉPENDANCE', value: '201' },
  { label: 'CPS DOUALA AKWA',          value: '101' },
  { label: 'CPS BAFOUSSAM',            value: '301' },
  { label: 'CPS GAROUA',               value: '401' },
]

const brancheOptions = [
  { label: 'Prestations Familiales',  value: 'F' },
  { label: 'Risques Professionnels',  value: 'R' },
  { label: 'Pensions',                value: 'P' },
  { label: 'IMAS',                    value: 'A' },
  { label: 'IMEM',                    value: 'E' },
]

// ─── Colonnes de la table ─────────────────────────────────────────
const tableColumns = [
  { name: 'index',        label: 'N°',            field: 'index',        align: 'center', style: 'width:45px' },
  { name: 'numdossier',   label: 'N° Dossier',    field: 'numdossier',   align: 'left', sortable: true },
  { name: 'objet',        label: 'Objet',          field: 'objet',        align: 'left', sortable: true },
  { name: 'numassu',      label: 'Num Assuré',     field: 'numassu',      align: 'left', sortable: true },
  { name: 'requerant',    label: 'Requérant',      field: 'requerant',    align: 'left', sortable: true },
  { name: 'situation',    label: 'Situation',      field: 'situation',    align: 'left', sortable: true },
  { name: 'datesitu',     label: 'Date Situ',      field: 'datesitu',     align: 'left', sortable: true },
  { name: 'localisation', label: 'Localisation',   field: 'localisation', align: 'left', sortable: true },
  { name: 'datedemande',  label: 'Date Demande',   field: 'datedemande',  align: 'left', sortable: true },
  { name: 'initiateur',   label: 'Initiateur',     field: 'initiateur',   align: 'left', sortable: true },
  { name: 'dateenreg',    label: 'Date Enreg',     field: 'dateenreg',    align: 'left', sortable: true },
  { name: 'numempl',      label: 'Num Employeur',  field: 'numempl',      align: 'left', sortable: true },
  { name: 'raisonsoc',    label: 'Raison Sociale', field: 'raisonsoc',    align: 'left', sortable: true },
  { name: 'datecessation',label: 'Date Cessation', field: 'datecessation',align: 'left', sortable: true },
]

// ─── Données de test ─────────────────────────────────────────────
const MOCK_DOSSIERS = [
  { numdossier: 'F2026-001', objet: 'PF', numassu: '5-20-97-123456-78', requerant: 'KAMGA Marie-Claire', situation: 'En Cours de Traitement', datesitu: '15/03/2026', localisation: 'Bureau Liquidation', datedemande: '15/03/2026', initiateur: 'AGENT01', dateenreg: '15/03/2026', numempl: '1-20-97-001234', raisonsoc: 'SOCIÉTÉ DEMO SARL', datecessation: '' },
  { numdossier: 'F2026-002', objet: 'PF', numassu: '5-20-97-654321-12', requerant: 'NKOA Sylvie', situation: 'En attente de pièces', datesitu: '02/04/2026', localisation: 'Secrétariat', datedemande: '02/04/2026', initiateur: 'AGENT02', dateenreg: '02/04/2026', numempl: '1-20-97-005678', raisonsoc: 'ENTREPRISE NORD SARL', datecessation: '' },
  { numdossier: 'F2026-003', objet: 'PF', numassu: '5-20-97-987654-55', requerant: 'MBELLA Claire', situation: 'Transmis au superviseur', datesitu: '20/04/2026', localisation: 'Superviseur', datedemande: '20/04/2026', initiateur: 'AGENT01', dateenreg: '20/04/2026', numempl: '1-20-97-009012', raisonsoc: 'CABINET CONSEIL SUD', datecessation: '' },
  { numdossier: 'F2026-004', objet: 'IJ', numassu: '5-20-97-111222-33', requerant: 'ATANGANA Patience', situation: 'Annuler Liquidation', datesitu: '03/05/2026', localisation: 'Archivage', datedemande: '01/05/2026', initiateur: 'AGENT03', dateenreg: '01/05/2026', numempl: '1-20-97-003344', raisonsoc: 'IMPORT EXPORT CENTRE', datecessation: '31/12/2025' },
  { numdossier: 'F2026-005', objet: 'AF', numassu: '5-20-97-333444-11', requerant: 'BIYONG Albertine', situation: 'En Cours de Traitement', datesitu: '10/01/2026', localisation: 'Bureau Liquidation', datedemande: '10/01/2026', initiateur: 'AGENT02', dateenreg: '10/01/2026', numempl: '1-20-97-007890', raisonsoc: 'SOCIETE BIYONG ET FILS', datecessation: '' },
  { numdossier: 'F2026-006', objet: 'PF', numassu: '5-20-97-555666-22', requerant: 'OTTOU Jeanne', situation: 'Liquidé', datesitu: '15/02/2026', localisation: 'Payement', datedemande: '15/01/2026', initiateur: 'AGENT01', dateenreg: '15/01/2026', numempl: '1-20-97-011223', raisonsoc: 'OTTOU BUSINESS', datecessation: '' },
  { numdossier: 'F2026-007', objet: 'AF', numassu: '5-20-97-777888-44', requerant: 'EKOA Martine', situation: 'En attente de pièces', datesitu: '07/03/2026', localisation: 'Guichet', datedemande: '05/03/2026', initiateur: 'AGENT04', dateenreg: '05/03/2026', numempl: '1-20-97-013456', raisonsoc: 'MANUTENTION DU SUD', datecessation: '' },
  { numdossier: 'F2026-008', objet: 'PF', numassu: '5-20-97-999000-66', requerant: 'MBIA Carine', situation: 'En Cours de Traitement', datesitu: '22/04/2026', localisation: 'Bureau Liquidation', datedemande: '20/04/2026', initiateur: 'AGENT02', dateenreg: '20/04/2026', numempl: '1-20-97-015678', raisonsoc: 'ENERGIE NORD', datecessation: '' },
  { numdossier: 'F2026-009', objet: 'IJ', numassu: '5-20-97-112233-77', requerant: 'FOUDA Bernadette', situation: 'Transmis au superviseur', datesitu: '05/05/2026', localisation: 'Superviseur', datedemande: '01/05/2026', initiateur: 'AGENT03', dateenreg: '01/05/2026', numempl: '1-20-97-017890', raisonsoc: 'FOUDA TRADING', datecessation: '' },
  { numdossier: 'F2026-010', objet: 'PF', numassu: '5-20-97-445566-88', requerant: 'NGONO Rose', situation: 'Liquidé', datesitu: '10/03/2026', localisation: 'Payement', datedemande: '01/03/2026', initiateur: 'AGENT01', dateenreg: '01/03/2026', numempl: '1-20-97-020123', raisonsoc: 'NGONO & ASSOCIES', datecessation: '' },
]

onMounted(async () => {
  try {
    const list = await pfStore.searchStatistiques({ ...filters })
    dossiers.value = list?.length ? list : MOCK_DOSSIERS
  } catch {
    dossiers.value = MOCK_DOSSIERS
  }
})

// ─── Computed ─────────────────────────────────────────────────────
const libelleBranche = computed(() => {
  const opt = brancheOptions.find(o => o.value === filters.branche)
  return opt ? opt.label : '—'
})

const libellePeriode = computed(() => {
  if (filters.periodeDebut && filters.periodeFin) {
    return `du ${filters.periodeDebut} au ${filters.periodeFin}`
  }
  if (filters.periodeDebut) return `depuis le ${filters.periodeDebut}`
  return 'Toute période'
})

// ─── KPI helpers ──────────────────────────────────────────────────
function countBySitu(keyword) {
  return dossiers.value.filter(d =>
    d.situation?.toLowerCase().includes(keyword)
  ).length
}

// ─── Couleur badge situation ──────────────────────────────────────
function getSituColor(situ) {
  if (!situ) return 'grey-5'
  const s = situ.toLowerCase()
  if (s.includes('cours'))   return 'orange-7'
  if (s.includes('attente')) return 'blue-6'
  if (s.includes('transmi')) return 'teal-6'
  if (s.includes('liqui'))   return 'positive'
  if (s.includes('annul'))   return 'negative'
  return 'grey-6'
}

// ─── Recherche ────────────────────────────────────────────────────
async function searchStats() {
  loading.value = true
  try {
    dossiers.value = await pfStore.searchStatistiques({ ...filters })
    if (!dossiers.value.length) {
      $q.notify({ type: 'info', message: 'Aucun dossier trouvé pour ces critères', position: 'top' })
    } else {
      $q.notify({
        type: 'positive',
        message: `${dossiers.value.length} dossier(s) trouvé(s)`,
        position: 'top',
        timeout: 1500,
      })
    }
  } catch {
    dossiers.value = MOCK_DOSSIERS.filter(d =>
      !filters.branche || d.numdossier.startsWith(filters.branche),
    )
  } finally {
    loading.value = false
  }
}

function resetSearch() {
  filters.centre       = ''
  filters.branche      = 'F'
  filters.periodeDebut = ''
  filters.periodeFin   = ''
  tableFilter.value    = ''
  dossiers.value = MOCK_DOSSIERS
}

// ─── Export CSV ───────────────────────────────────────────────────
function exportCsv() {
  const headers = tableColumns.filter(c => c.name !== 'index').map(c => c.label)
  const fields  = tableColumns.filter(c => c.name !== 'index').map(c => c.field)
  const rows = dossiers.value.map(d =>
    fields.map(f => `"${(d[f] ?? '').toString().replace(/"/g, '""')}"`)
  )
  const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = `stat_dossiers_${filters.branche}_${Date.now()}.csv`
  link.click()
  URL.revokeObjectURL(url)
  $q.notify({ type: 'positive', message: 'Export CSV généré', position: 'top', timeout: 1500 })
}
</script>

<style scoped>
.stat-situations {
  max-width: 1600px;
  margin: 0 auto;
}

.card-elevated {
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.card-header-rounded {
  border-radius: 15px 15px 0 0;
}

/* ── KPI Cards ─────────────────────────────────────────── */
.kpi-card {
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.07);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}

.kpi-total   { border-top: 3px solid #1976d2; }
.kpi-encours { border-top: 3px solid #ef6c00; }
.kpi-attente { border-top: 3px solid #1565c0; }
.kpi-transmis{ border-top: 3px solid #00796b; }
.kpi-liquide { border-top: 3px solid #2e7d32; }
.kpi-annule  { border-top: 3px solid #c62828; }

.kpi-count {
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1.1;
  margin: 4px 0 2px;
}

.kpi-label {
  font-size: 0.68rem;
  color: #757575;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* ── Titre résultat ─────────────────────────────────────── */
.result-header {
  background: linear-gradient(to right, rgba(25, 118, 210, 0.06), transparent);
  border-left: 4px solid #1976d2;
  padding: 6px 12px;
  border-radius: 0 8px 8px 0;
}

/* ── Table stats ─────────────────────────────────────────── */
.stat-table { border-radius: 15px; }

.stat-table :deep(.q-table__top) {
  padding: 8px 16px;
  background: #fafafa;
  border-radius: 15px 15px 0 0;
}

.stat-table :deep(.q-table__bottom) {
  background: #fafafa;
  border-radius: 0 0 15px 15px;
}

.stat-table :deep(thead tr th) {
  font-size: 0.72rem;
  font-weight: 700;
  color: #1976d2;
  background: rgba(25, 118, 210, 0.05);
  white-space: nowrap;
}

.stat-table :deep(tbody tr:hover) {
  background: rgba(25, 118, 210, 0.04) !important;
}
</style>
