<template>
  <div class="stat-situations">

    <transition name="slide-down">
      <q-banner v-if="errorMsg" class="error-banner q-mb-md" rounded dense>
        <template v-slot:avatar>
          <q-icon name="error_outline" color="white" size="sm" />
        </template>
        {{ errorMsg }}
        <template v-slot:action>
          <q-btn flat color="white" label="Fermer" dense @click="errorMsg = ''" />
        </template>
      </q-banner>
    </transition>

    <!-- FILTRES -->
    <q-card class="filter-panel q-mb-sm" flat>
      <div class="filter-panel__header">
        <q-icon name="tune" size="18px" color="primary" class="q-mr-xs" />
        <span class="filter-panel__header-title">Paramètres de recherche</span>
        <span class="filter-panel__header-hint gt-xs">Branche et période (début ≤ fin)</span>
        <q-space />
        <q-chip
          v-if="hasActiveFilters"
          dense removable color="primary" text-color="white"
          label="Filtres actifs" icon="filter_alt"
          @remove="resetSearch"
        />
      </div>
      <div class="filter-panel__body">
        <q-form ref="filterFormRef" @submit.prevent="searchStats">
          <div class="filter-grid">
            <div class="filter-grid__field">
              <label class="filter-label">
                <q-icon name="location_city" size="13px" class="q-mr-xs" />Centre
              </label>
              <q-select
                v-model="filters.cbxcentre"
                :options="centreOptions"
                outlined dense emit-value map-options
                color="primary" clearable
                class="filter-field"
                placeholder="Tous les centres"
              >
                <template v-slot:prepend>
                  <q-icon name="business" size="xs" color="primary" />
                </template>
              </q-select>
            </div>

            <div class="filter-grid__field">
              <label class="filter-label">
                <q-icon name="account_tree" size="13px" class="q-mr-xs" />Branche
              </label>
              <q-select
                v-model="filters.cbxbranche"
                :options="brancheOptions"
                outlined dense emit-value map-options
                color="primary" class="filter-field"
              >
                <template v-slot:prepend>
                  <q-icon name="category" size="xs" color="primary" />
                </template>
                <template v-slot:selected-item="scope">
                  <q-badge :color="brancheColor(scope.opt.value)" :label="scope.opt.label" style="font-size:0.72rem" />
                </template>
              </q-select>
            </div>

            <div class="filter-grid__field">
              <label class="filter-label">
                <q-icon name="calendar_today" size="13px" class="q-mr-xs" />Début
              </label>
              <q-input
                v-model="filters.txtvaleurdeb"
                name="txtvaleurdeb"
                outlined dense
                placeholder="JJ/MM/AAAA"
                class="filter-field date-field"
                mask="##/##/####"
                hide-bottom-space
                reactive-rules
                :rules="dateDebutRules"
                @update:model-value="onDateDebutChange"
              >
                <template v-slot:append>
                  <q-icon name="edit_calendar" class="cursor-pointer" color="primary" size="xs">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date
                        v-model="filters.txtvaleurdeb"
                        mask="DD/MM/YYYY"
                        today-btn
                        color="primary"
                        :options="dateDebutOptions"
                        @update:model-value="onDateDebutChange"
                      >
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="OK" color="primary" flat dense />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <div class="filter-grid__field">
              <label class="filter-label">
                <q-icon name="calendar_today" size="13px" class="q-mr-xs" />Fin
              </label>
              <q-input
                v-model="filters.txtvaleurfin"
                name="txtvaleurfin"
                outlined dense
                placeholder="JJ/MM/AAAA"
                class="filter-field date-field"
                mask="##/##/####"
                hide-bottom-space
                reactive-rules
                :rules="dateFinRules"
                @update:model-value="onDateFinChange"
              >
                <template v-slot:append>
                  <q-icon name="edit_calendar" class="cursor-pointer" color="primary" size="xs">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date
                        v-model="filters.txtvaleurfin"
                        mask="DD/MM/YYYY"
                        today-btn
                        color="primary"
                        :options="dateFinOptions"
                        @update:model-value="onDateFinChange"
                      >
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="OK" color="primary" flat dense />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <div class="filter-grid__actions">
              <q-btn type="submit" color="primary" icon="search" label="Rechercher"
                unelevated no-caps class="btn-search" :loading="loading" />
              <q-btn color="teal-7" icon="download" label="CSV" unelevated no-caps
                class="btn-export" :disable="dossiers.length === 0" @click="exportCsv">
                <q-tooltip>Exporter en CSV</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-form>
      </div>
    </q-card>

    <!-- TABLE -->
    <q-card class="table-card" flat>
      <div class="table-toolbar">
        <div class="table-toolbar__left">
          <q-icon name="table_rows" size="18px" color="primary" class="q-mr-sm" />
          <div>
            <div class="table-toolbar__title">Résultats</div>
            <div v-if="dossiers.length" class="table-toolbar__sub">
              {{ libelleBranche }} · {{ libellePeriode }}
            </div>
            <button
              v-if="dossiers.length"
              type="button"
              class="overview-trigger q-mt-xs"
              @click="showOverviewDialog = true"
            >
              <q-icon name="analytics" size="16px" />
              <span class="overview-trigger__label">Vue d'ensemble</span>
              <span class="overview-trigger__dot" aria-hidden="true">·</span>
              <span class="overview-trigger__period">{{ libellePeriode }}</span>
              <q-icon name="north_east" size="14px" class="overview-trigger__arrow" />
            </button>
          </div>
        </div>
        <div class="table-toolbar__right">
          <q-badge
            v-if="dossiers.length"
            color="primary"
            text-color="white"
            class="table-count-badge q-mr-sm"
            :label="`${dossiers.length} ligne${dossiers.length > 1 ? 's' : ''}`"
          />
          <q-input
            v-model="tableFilter"
            placeholder="Rechercher dans le tableau…"
            outlined dense clearable hide-bottom-space
            color="primary" class="table-search"
            @update:model-value="val => { tableFilter = toLegacyUppercase(val) }"
          >
            <template v-slot:prepend>
              <q-icon name="search" size="xs" color="primary" />
            </template>
          </q-input>
        </div>
      </div>

      <q-separator />

      <div class="table-scroll-wrap">
        <q-table
          :rows="dossiers"
          :columns="visibleTableColumns"
          row-key="numdossier"
          :grid="tableGrid"
          :loading="loading"
          dense
          bordered
          separator="cell"
          :rows-per-page-options="tableRowsPerPageOptions"
          :pagination="{ rowsPerPage: tableDefaultRowsPerPage }"
          :filter="tableFilter"
          no-data-label="Aucun dossier — renseignez les filtres et cliquez sur Rechercher"
          class="stat-table"
          table-class="stat-table__grid"
        >
          <!-- En-têtes -->
          <template v-slot:header-cell="props">
            <q-th :props="props" class="table-header-cell">
              <span class="table-header-cell__label">{{ props.col.label }}</span>
            </q-th>
          </template>

          <!-- N° ligne -->
          <template v-slot:body-cell-index="props">
            <q-td :props="props" class="td-index">
              {{ props.rowIndex + 1 }}
            </q-td>
          </template>

          <!-- N° Dossier -->
          <template v-slot:body-cell-numdossier="props">
            <q-td :props="props" class="td-nowrap">
              <span class="dossier-num">{{ props.row.numdossier }}</span>
            </q-td>
          </template>

          <!-- Objet — wrap -->
          <template v-slot:body-cell-objet="props">
            <q-td :props="props" class="td-wrap">
              {{ props.row.objet }}
            </q-td>
          </template>

          <!-- Num Assuré -->
          <template v-slot:body-cell-numassu="props">
            <q-td :props="props" class="td-nowrap">
              {{ props.row.numassu }}
            </q-td>
          </template>

          <!-- Requérant — wrap + avatar -->
          <template v-slot:body-cell-requerant="props">
            <q-td :props="props" class="td-wrap">
              <div class="cell-requerant">
                <q-avatar size="22px" color="primary" text-color="white"
                  class="requerant-avatar" style="font-size:9px">
                  {{ initiales(props.row.requerant) }}
                </q-avatar>
                <span class="cell-wrap-text">{{ props.row.requerant }}</span>
              </div>
            </q-td>
          </template>

          <!-- Situation -->
          <template v-slot:body-cell-situation="props">
            <q-td :props="props" class="td-nowrap">
              <q-chip
                dense square
                :color="getSituBg(props.row.situation)"
                :text-color="getSituText(props.row.situation)"
                :icon="getSituIcon(props.row.situation)"
                :label="props.row.situation || '—'"
                class="situ-chip"
              />
            </q-td>
          </template>

          <!-- Date Situ -->
          <template v-slot:body-cell-datesitu="props">
            <q-td :props="props" class="td-nowrap td-date">
              {{ props.row.datesitu }}
            </q-td>
          </template>

          <!-- Localisation — wrap -->
          <template v-slot:body-cell-localisation="props">
            <q-td :props="props" class="td-wrap">
              {{ props.row.localisation }}
            </q-td>
          </template>

          <!-- Date Demande -->
          <template v-slot:body-cell-datedemande="props">
            <q-td :props="props" class="td-nowrap td-date">
              {{ props.row.datedemande }}
            </q-td>
          </template>

          <!-- Initiateur — wrap -->
          <template v-slot:body-cell-initiateur="props">
            <q-td :props="props" class="td-wrap">
              {{ props.row.initiateur }}
            </q-td>
          </template>

          <!-- Date Enreg -->
          <template v-slot:body-cell-dateenreg="props">
            <q-td :props="props" class="td-nowrap td-date">
              {{ props.row.dateenreg }}
            </q-td>
          </template>

          <!-- Num Employeur -->
          <template v-slot:body-cell-numempl="props">
            <q-td :props="props" class="td-nowrap">
              {{ props.row.numempl }}
            </q-td>
          </template>

          <!-- Raison Sociale — wrap -->
          <template v-slot:body-cell-raisonsoc="props">
            <q-td :props="props" class="td-wrap">
              {{ props.row.raisonsoc }}
            </q-td>
          </template>

          <!-- Date Cessation -->
          <template v-slot:body-cell-datecessation="props">
            <q-td :props="props" class="td-nowrap td-date">
              {{ props.row.datecessation }}
            </q-td>
          </template>

          <!-- Grid card mobile -->
          <template v-slot:item="props">
            <div class="mobile-card q-pa-xs">
              <div class="mobile-card__inner">
                <div class="mobile-card__top">
                  <span class="dossier-num">{{ props.row.numdossier }}</span>
                  <q-chip dense square
                    :color="getSituBg(props.row.situation)"
                    :text-color="getSituText(props.row.situation)"
                    :icon="getSituIcon(props.row.situation)"
                    :label="props.row.situation || '—'"
                    class="situ-chip"
                  />
                </div>
                <div class="mobile-card__requerant">
                  <q-avatar size="20px" color="primary" text-color="white"
                    style="font-size:9px; flex-shrink:0" class="q-mr-xs">
                    {{ initiales(props.row.requerant) }}
                  </q-avatar>
                  {{ props.row.requerant }}
                </div>
                <div class="mobile-card__meta">
                  <q-icon name="description" size="12px" color="grey-5" />
                  {{ props.row.objet }}
                </div>
                <div class="mobile-card__meta">
                  <q-icon name="event" size="12px" color="grey-5" />
                  {{ props.row.datedemande }}
                </div>
              </div>
            </div>
          </template>

          <!-- No data -->
          <template v-slot:no-data="{ message }">
            <div class="empty-state">
              <div class="empty-state__icon-wrap">
                <q-icon name="bar_chart" size="3rem" color="primary" style="opacity:.35" />
              </div>
              <div class="empty-state__title">Aucun résultat</div>
              <div class="empty-state__sub">{{ message }}</div>
              <div class="empty-state__hint">
                Sélectionnez une <strong>branche</strong> et une <strong>période</strong>
                puis cliquez sur
                <q-btn flat dense no-caps color="primary" label="Rechercher"
                  icon="search" size="sm" class="q-ml-xs"
                  @click="searchStats" :loading="loading" />
              </div>
            </div>
          </template>

          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>

        </q-table>
      </div>
    </q-card>

    <!-- Dialogue Vue d'ensemble (stats à la demande) -->
    <q-dialog
      v-model="showOverviewDialog"
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card class="overview-dialog">
        <div class="overview-dialog__hero">
          <div class="overview-dialog__hero-icon">
            <q-icon name="insights" size="28px" color="white" />
          </div>
          <div class="overview-dialog__hero-text">
            <div class="overview-dialog__title">Vue d'ensemble</div>
            <div class="overview-dialog__meta">
              <q-badge :color="brancheColor(filters.cbxbranche)" :label="libelleBranche" class="q-mr-xs" />
              <span class="overview-dialog__period">{{ libellePeriode }}</span>
            </div>
          </div>
          <q-btn flat round dense icon="close" color="white" class="overview-dialog__close" v-close-popup>
            <q-tooltip>Fermer</q-tooltip>
          </q-btn>
        </div>

        <q-card-section class="overview-dialog__summary">
          <div class="overview-dialog__total">
            <div class="overview-dialog__total-num">{{ dossiers.length }}</div>
            <div class="overview-dialog__total-label">dossiers au total</div>
          </div>
          <div class="overview-dialog__distrib">
            <div class="overview-dialog__distrib-title">Répartition par situation</div>
            <div class="distrib-bar distrib-bar--lg">
              <div class="distrib-bar__seg distrib-encours"  :style="{ width: pct(countBySitu('cours'))   + '%' }" />
              <div class="distrib-bar__seg distrib-attente"  :style="{ width: pct(countBySitu('attente')) + '%' }" />
              <div class="distrib-bar__seg distrib-transmis" :style="{ width: pct(countBySitu('transmi')) + '%' }" />
              <div class="distrib-bar__seg distrib-liquide"  :style="{ width: pct(countBySitu('liqui'))   + '%' }" />
              <div class="distrib-bar__seg distrib-annule"   :style="{ width: pct(countBySitu('annul'))   + '%' }" />
            </div>
            <div class="distrib-legend distrib-legend--dialog q-mt-sm">
              <span><span class="legend-dot" style="background:#ef6c00" />En cours</span>
              <span><span class="legend-dot" style="background:#1976d2" />En attente</span>
              <span><span class="legend-dot" style="background:#00796b" />Transmis</span>
              <span><span class="legend-dot" style="background:#388e3c" />Liquidés</span>
              <span><span class="legend-dot" style="background:#c62828" />Annulés</span>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="overview-dialog__kpi">
          <div class="kpi-grid kpi-grid--dialog">
            <div class="kpi-item kpi-total">
              <div class="kpi-item__icon-wrap kpi-bg-total"><q-icon name="folder_open" size="20px" color="white" /></div>
              <div class="kpi-item__body">
                <div class="kpi-item__num">{{ dossiers.length }}</div>
                <div class="kpi-item__label">Total</div>
              </div>
              <div class="kpi-item__bar kpi-bar-total" />
            </div>
            <div class="kpi-item kpi-encours">
              <div class="kpi-item__icon-wrap kpi-bg-encours"><q-icon name="pending_actions" size="20px" color="white" /></div>
              <div class="kpi-item__body">
                <div class="kpi-item__num text-orange-8">{{ countBySitu('cours') }}</div>
                <div class="kpi-item__label">En cours</div>
              </div>
              <div class="kpi-item__bar kpi-bar-encours" />
              <div class="kpi-item__pct">{{ pct(countBySitu('cours')) }}%</div>
            </div>
            <div class="kpi-item kpi-attente">
              <div class="kpi-item__icon-wrap kpi-bg-attente"><q-icon name="hourglass_top" size="20px" color="white" /></div>
              <div class="kpi-item__body">
                <div class="kpi-item__num text-blue-7">{{ countBySitu('attente') }}</div>
                <div class="kpi-item__label">En attente</div>
              </div>
              <div class="kpi-item__bar kpi-bar-attente" />
              <div class="kpi-item__pct">{{ pct(countBySitu('attente')) }}%</div>
            </div>
            <div class="kpi-item kpi-transmis">
              <div class="kpi-item__icon-wrap kpi-bg-transmis"><q-icon name="send" size="20px" color="white" /></div>
              <div class="kpi-item__body">
                <div class="kpi-item__num text-teal-7">{{ countBySitu('transmi') }}</div>
                <div class="kpi-item__label">Transmis</div>
              </div>
              <div class="kpi-item__bar kpi-bar-transmis" />
              <div class="kpi-item__pct">{{ pct(countBySitu('transmi')) }}%</div>
            </div>
            <div class="kpi-item kpi-liquide">
              <div class="kpi-item__icon-wrap kpi-bg-liquide"><q-icon name="verified" size="20px" color="white" /></div>
              <div class="kpi-item__body">
                <div class="kpi-item__num text-green-8">{{ countBySitu('liqui') }}</div>
                <div class="kpi-item__label">Liquidés</div>
              </div>
              <div class="kpi-item__bar kpi-bar-liquide" />
              <div class="kpi-item__pct">{{ pct(countBySitu('liqui')) }}%</div>
            </div>
            <div class="kpi-item kpi-annule">
              <div class="kpi-item__icon-wrap kpi-bg-annule"><q-icon name="cancel" size="20px" color="white" /></div>
              <div class="kpi-item__body">
                <div class="kpi-item__num text-red-8">{{ countBySitu('annul') }}</div>
                <div class="kpi-item__label">Annulés</div>
              </div>
              <div class="kpi-item__bar kpi-bar-annule" />
              <div class="kpi-item__pct">{{ pct(countBySitu('annul')) }}%</div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="overview-dialog__actions">
          <q-btn flat no-caps color="primary" label="Fermer" icon="check" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useLiquidationPfStore } from 'src/modules/energizer/stores/liquidationPfStore.js'
import { usePfModuleTable } from 'src/modules/shared/composables/usePfModuleTable.js'
import { loadPfStatSituationsPage } from 'src/modules/energizer/api/liquidationPfApi.js'
import { toLegacyUppercase } from 'src/modules/energizer/utils/energizerFormInputUtils.js'

defineOptions({ name: 'StatSituationsDossiersParBranche' })

const $q      = useQuasar()
const pfStore = useLiquidationPfStore()

const loading     = ref(false)
const errorMsg    = ref('')
const dossiers    = ref([])
const tableFilter = ref('')
const filterFormRef = ref(null)
const showOverviewDialog = ref(false)

const filters = reactive({
  cbxcentre:    '',
  cbxbranche:   'F',
  txtvaleurdeb: '',
  txtvaleurfin: '',
})

const centreOptions = ref([])

const brancheOptions = [
  { label: 'Prestations Familiales', value: 'F' },
  { label: 'Risques Professionnels', value: 'R' },
  { label: 'Pensions',               value: 'P' },
  { label: 'IMAS',                   value: 'A' },
  { label: 'IMEM',                   value: 'E' },
]

const tableColumns = [
  { name: 'index',        label: 'N°',            field: 'index',        align: 'center', style: 'width:46px' },
  { name: 'numdossier',   label: 'N° Dossier',    field: 'numdossier',   align: 'left',   style: 'width:120px', sortable: true },
  { name: 'objet',        label: 'Objet',          field: 'objet',        align: 'left',   style: 'width:180px', sortable: true },
  { name: 'numassu',      label: 'Num Assuré',     field: 'numassu',      align: 'left',   style: 'width:110px', sortable: true },
  { name: 'requerant',    label: 'Requérant',      field: 'requerant',    align: 'left',   style: 'width:180px', sortable: true },
  { name: 'situation',    label: 'Situation',      field: 'situation',    align: 'left',   style: 'width:130px', sortable: true },
  { name: 'datesitu',     label: 'Date Situ',      field: 'datesitu',     align: 'left',   style: 'width:100px', sortable: true },
  { name: 'localisation', label: 'Localisation',   field: 'localisation', align: 'left',   style: 'width:150px', sortable: true },
  { name: 'datedemande',  label: 'Date Demande',   field: 'datedemande',  align: 'left',   style: 'width:110px', sortable: true },
  { name: 'initiateur',   label: 'Initiateur',     field: 'initiateur',   align: 'left',   style: 'width:140px', sortable: true },
  { name: 'dateenreg',    label: 'Date Enreg',     field: 'dateenreg',    align: 'left',   style: 'width:100px', sortable: true },
  { name: 'numempl',      label: 'Num Empl.',      field: 'numempl',      align: 'left',   style: 'width:110px', sortable: true },
  { name: 'raisonsoc',    label: 'Raison Sociale', field: 'raisonsoc',    align: 'left',   style: 'width:180px', sortable: true },
  { name: 'datecessation',label: 'Date Cessation', field: 'datecessation',align: 'left',   style: 'width:120px', sortable: true },
]

const { visibleTableColumns, tableGrid, tableRowsPerPageOptions, tableDefaultRowsPerPage } =
  usePfModuleTable(tableColumns, {
    mobileCols:   ['index', 'numdossier', 'requerant', 'situation'],
    tabletHidden: ['localisation', 'initiateur', 'dateenreg', 'numempl', 'raisonsoc', 'datecessation'],
    rowsPerPageDesktop: [20, 50, 100],
  })

onMounted(async () => {
  loading.value = true
  try {
    const { centres, dossiers: rows } = await loadPfStatSituationsPage()
    if (centres?.length) centreOptions.value = centres
    dossiers.value = Array.isArray(rows) ? rows : []
  } catch (e) {
    dossiers.value = []
    errorMsg.value = e?.message || 'Impossible de charger les statistiques.'
  } finally {
    loading.value = false
  }
})

const hasActiveFilters = computed(() =>
  !!(filters.cbxcentre || filters.txtvaleurdeb || filters.txtvaleurfin || filters.cbxbranche !== 'F')
)
const libelleBranche = computed(() => {
  const opt = brancheOptions.find(o => o.value === filters.cbxbranche)
  return opt ? opt.label : '—'
})
const libellePeriode = computed(() => {
  if (filters.txtvaleurdeb && filters.txtvaleurfin)
    return `du ${filters.txtvaleurdeb} au ${filters.txtvaleurfin}`
  if (filters.txtvaleurdeb) return `depuis le ${filters.txtvaleurdeb}`
  return 'Toute période'
})

function countBySitu (kw) {
  return dossiers.value.filter(d => d.situation?.toLowerCase().includes(kw)).length
}
function pct (n) {
  if (!dossiers.value.length) return 0
  return Math.round((n / dossiers.value.length) * 100)
}
function initiales (name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
}
function brancheColor (val) {
  return { F:'indigo', R:'deep-orange', P:'purple', A:'cyan-8', E:'teal-8' }[val] || 'primary'
}
function getSituBg (s) {
  if (!s) return 'grey-2'
  const v = s.toLowerCase()
  if (v.includes('cours'))   return 'orange-1'
  if (v.includes('attente')) return 'blue-1'
  if (v.includes('transmi')) return 'teal-1'
  if (v.includes('liqui'))   return 'green-1'
  if (v.includes('annul'))   return 'red-1'
  return 'grey-2'
}
function getSituText (s) {
  if (!s) return 'grey-7'
  const v = s.toLowerCase()
  if (v.includes('cours'))   return 'orange-9'
  if (v.includes('attente')) return 'blue-9'
  if (v.includes('transmi')) return 'teal-9'
  if (v.includes('liqui'))   return 'green-9'
  if (v.includes('annul'))   return 'red-9'
  return 'grey-7'
}
function getSituIcon (s) {
  if (!s) return 'circle'
  const v = s.toLowerCase()
  if (v.includes('cours'))   return 'pending_actions'
  if (v.includes('attente')) return 'hourglass_top'
  if (v.includes('transmi')) return 'send'
  if (v.includes('liqui'))   return 'verified'
  if (v.includes('annul'))   return 'cancel'
  return 'circle'
}

function parseFrDate (str) {
  const value = String(str ?? '').trim()
  if (value.length !== 10) return null
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return null
  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) return null
  return date
}

function compareFrDates (a, b) {
  const da = parseFrDate(a)
  const db = parseFrDate(b)
  if (!da || !db) return null
  return da.getTime() - db.getTime()
}

function qDateToTime (dateStr) {
  const parts = String(dateStr ?? '').split('/')
  if (parts.length !== 3) return null
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  return Number.isNaN(date.getTime()) ? null : date.getTime()
}

function dateDebutOptions (dateStr) {
  if (!filters.txtvaleurfin) return true
  const fin = parseFrDate(filters.txtvaleurfin)
  const candidate = qDateToTime(dateStr)
  if (!fin || candidate == null) return true
  return candidate <= fin.getTime()
}

function dateFinOptions (dateStr) {
  if (!filters.txtvaleurdeb) return true
  const deb = parseFrDate(filters.txtvaleurdeb)
  const candidate = qDateToTime(dateStr)
  if (!deb || candidate == null) return true
  return candidate >= deb.getTime()
}

function onDateDebutChange () {
  filterFormRef.value?.validate(['txtvaleurdeb', 'txtvaleurfin'])
}

function onDateFinChange () {
  filterFormRef.value?.validate(['txtvaleurdeb', 'txtvaleurfin'])
}

const dateDebutRules = [
  val => {
    const value = String(val ?? '').trim()
    if (!value) return true
    return parseFrDate(value) ? true : 'Format attendu : JJ/MM/AAAA'
  },
  val => {
    const deb = String(val ?? '').trim()
    const fin = String(filters.txtvaleurfin ?? '').trim()
    if ((deb && !fin) || (!deb && fin)) return 'Renseignez aussi la date de fin'
    return true
  },
  val => {
    const deb = String(val ?? '').trim()
    const fin = String(filters.txtvaleurfin ?? '').trim()
    if (!deb || !fin) return true
    const cmp = compareFrDates(deb, fin)
    if (cmp == null) return true
    return cmp <= 0 || 'La date de début doit être antérieure ou égale à la date de fin'
  },
]

const dateFinRules = [
  val => {
    const value = String(val ?? '').trim()
    if (!value) return true
    return parseFrDate(value) ? true : 'Format attendu : JJ/MM/AAAA'
  },
  val => {
    const deb = String(filters.txtvaleurdeb ?? '').trim()
    const fin = String(val ?? '').trim()
    if ((deb && !fin) || (!deb && fin)) return 'Renseignez aussi la date de début'
    return true
  },
  val => {
    const deb = String(filters.txtvaleurdeb ?? '').trim()
    const fin = String(val ?? '').trim()
    if (!deb || !fin) return true
    const cmp = compareFrDates(deb, fin)
    if (cmp == null) return true
    return cmp <= 0 || 'La date de fin doit être postérieure ou égale à la date de début'
  },
]

async function searchStats () {
  const valid = await filterFormRef.value?.validate()
  if (valid === false) {
    $q.notify({ type: 'negative', message: 'Corrigez les dates de période avant de rechercher.', position: 'top' })
    return
  }

  loading.value = true ; errorMsg.value = ''
  try {
    dossiers.value = await pfStore.searchStatistiques({ ...filters })
    if (!dossiers.value.length)
      $q.notify({ type:'info', message:'Aucun dossier trouvé', position:'top' })
    else
      $q.notify({ type:'positive', message:`${dossiers.value.length} dossier(s) trouvé(s)`, position:'top', timeout:1500 })
  } catch (e) {
    dossiers.value = [] ; errorMsg.value = e?.message || 'Échec de la recherche.'
  } finally { loading.value = false }
}

async function resetSearch () {
  Object.assign(filters, { cbxcentre:'', cbxbranche:'F', txtvaleurdeb:'', txtvaleurfin:'' })
  tableFilter.value = '' ; errorMsg.value = ''
  filterFormRef.value?.resetValidation()
  loading.value = true
  try {
    const { dossiers: rows } = await loadPfStatSituationsPage()
    dossiers.value = Array.isArray(rows) ? rows : []
  } catch (e) {
    dossiers.value = [] ; errorMsg.value = e?.message || 'Impossible de recharger.'
  } finally { loading.value = false }
}

function exportCsv () {
  const cols = tableColumns.filter(c => c.name !== 'index')
  const csv  = [
    cols.map(c => c.label).join(';'),
    ...dossiers.value.map(d =>
      cols.map(c => `"${(d[c.field] ?? '').toString().replace(/"/g,'""')}"`).join(';')
    )
  ].join('\n')
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob(['\uFEFF'+csv], { type:'text/csv;charset=utf-8;' })),
    download: `stat_dossiers_${filters.cbxbranche}_${Date.now()}.csv`
  })
  a.click() ; URL.revokeObjectURL(a.href)
  $q.notify({ type:'positive', message:'Export CSV généré', position:'top', timeout:1500 })
}
</script>

<style scoped>
/* ═══════════════════════════════════════════════
   LAYOUT
═══════════════════════════════════════════════ */
.stat-situations {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 8px 24px;
}

/* ═══════════════════════════════════════════════
   ERROR BANNER
═══════════════════════════════════════════════ */
.error-banner {
  background: linear-gradient(135deg,#c62828,#e53935) !important;
  border-radius: 12px; color: white;
}

/* ═══════════════════════════════════════════════
   FILTER PANEL
═══════════════════════════════════════════════ */
.filter-panel {
  border-radius:16px !important;
  border:1px solid rgba(25,118,210,0.14) !important;
  box-shadow:0 4px 20px rgba(25,118,210,0.08),0 1px 4px rgba(0,0,0,.04) !important;
  overflow:hidden;
}
.filter-panel__header {
  display:flex; align-items:center; flex-wrap:wrap; gap:8px;
  padding:10px 16px;
  background:linear-gradient(90deg,rgba(25,118,210,.07),rgba(25,118,210,.02));
  border-bottom:1px solid rgba(25,118,210,0.1);
}
.filter-panel__header-title {
  font-size:.82rem; font-weight:700; color:#1565c0;
  text-transform:uppercase; letter-spacing:.6px;
}
.filter-panel__header-hint {
  font-size: 0.72rem;
  color: #78909c;
  font-weight: 500;
  margin-left: 4px;
}
.filter-panel__body { padding:12px 16px 14px; background:#fafbff; }

.filter-grid {
  display: grid;
  grid-template-columns: minmax(130px, 1fr) minmax(150px, 1.15fr) minmax(120px, 0.9fr) minmax(120px, 0.9fr) auto;
  gap: 10px 14px;
  align-items: end;
}
.filter-grid__field { min-width: 0; }
.filter-grid__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-label {
  display:flex; align-items:center; margin-bottom:4px;
  font-size:.72rem; font-weight:700; color:#546e7a;
  text-transform:uppercase; letter-spacing:.4px;
}

.filter-field :deep(.q-field__control) { border-radius:10px; background:#fff; }
.date-field   :deep(.q-field__control) { background:#fffde7; }

.btn-search {
  border-radius:10px; font-weight:700; font-size:.82rem;
  min-height:36px; padding:0 16px;
  box-shadow:0 4px 12px rgba(25,118,210,.3);
  transition:box-shadow .2s,transform .15s;
}
.btn-search:hover { box-shadow:0 6px 18px rgba(25,118,210,.42); transform:translateY(-1px); }

.btn-export {
  border-radius:10px; font-weight:700; font-size:.82rem;
  min-height:36px; padding:0 12px;
  box-shadow:0 4px 12px rgba(0,121,107,.25);
  transition:box-shadow .2s,transform .15s;
}
.btn-export:hover { box-shadow:0 6px 18px rgba(0,121,107,.38); transform:translateY(-1px); }

/* ═══════════════════════════════════════════════
   VUE D'ENSEMBLE — déclencheur + dialogue
═══════════════════════════════════════════════ */
.overview-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 4px 8px;
  border: 1px solid rgba(25, 118, 210, 0.22);
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(25, 118, 210, 0.06), rgba(25, 118, 210, 0.02));
  color: #1565c0;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, transform 0.15s ease;
}
.overview-trigger:hover {
  background: rgba(25, 118, 210, 0.1);
  border-color: rgba(25, 118, 210, 0.38);
  box-shadow: 0 2px 10px rgba(25, 118, 210, 0.14);
  transform: translateY(-1px);
}
.overview-trigger__label { font-weight: 700; }
.overview-trigger__dot { color: #90a4ae; font-weight: 400; }
.overview-trigger__period { color: #546e7a; font-weight: 500; }
.overview-trigger__arrow { opacity: 0.65; margin-left: 2px; }

.overview-dialog {
  width: min(92vw, 860px);
  max-width: 860px;
  border-radius: 18px !important;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(13, 71, 161, 0.22), 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}
.overview-dialog__hero {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px 20px 18px;
  background: linear-gradient(135deg, #1565c0 0%, #1976d2 48%, #42a5f5 100%);
  color: #fff;
  position: relative;
}
.overview-dialog__hero-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.22);
}
.overview-dialog__hero-text { flex: 1; min-width: 0; padding-right: 36px; }
.overview-dialog__title {
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.2px;
  line-height: 1.2;
}
.overview-dialog__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
  font-size: 0.78rem;
  opacity: 0.95;
}
.overview-dialog__period { font-weight: 500; }
.overview-dialog__close { position: absolute; top: 12px; right: 12px; }

.overview-dialog__summary {
  display: flex;
  align-items: stretch;
  gap: 20px;
  padding: 20px 22px !important;
  background: #f8fafc;
}
.overview-dialog__total {
  flex: 0 0 auto;
  min-width: 120px;
  padding: 12px 16px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid rgba(21, 101, 192, 0.12);
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.overview-dialog__total-num {
  font-size: 2rem;
  font-weight: 900;
  color: #1565c0;
  line-height: 1;
  letter-spacing: -0.5px;
}
.overview-dialog__total-label {
  margin-top: 4px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #78909c;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.overview-dialog__distrib { flex: 1; min-width: 0; }
.overview-dialog__distrib-title {
  font-size: 0.74rem;
  font-weight: 700;
  color: #546e7a;
  text-transform: uppercase;
  letter-spacing: 0.45px;
  margin-bottom: 10px;
}
.overview-dialog__kpi { padding: 18px 22px 8px !important; }
.overview-dialog__actions {
  padding: 10px 16px 14px !important;
  background: #fafbff;
  border-top: 1px solid rgba(21, 101, 192, 0.08);
}

@media (max-width: 640px) {
  .overview-dialog__summary {
    flex-direction: column;
    gap: 14px;
  }
  .overview-dialog__total { min-width: 0; }
}

/* ═══════════════════════════════════════════════
   KPI (dialogue)
═══════════════════════════════════════════════ */
.kpi-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:12px; }
.kpi-grid--dialog { grid-template-columns: repeat(3, 1fr); gap: 10px; }
@media(max-width:960px){ .kpi-grid--dialog{ grid-template-columns:repeat(2,1fr); } }
@media(max-width:600px){ .kpi-grid--dialog{ grid-template-columns:repeat(2,1fr); } }

.kpi-item {
  position:relative; background:#fff; border-radius:14px;
  padding:12px 12px 8px; overflow:hidden;
  display:flex; flex-direction:column; align-items:flex-start; gap:8px;
  box-shadow:0 2px 12px rgba(0,0,0,.06),0 1px 3px rgba(0,0,0,.04);
  border:1px solid rgba(0,0,0,.06);
}
.kpi-grid--dialog .kpi-item { padding: 11px 11px 8px; }

.kpi-item__icon-wrap {
  width:40px;height:40px;border-radius:11px;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 4px 10px rgba(0,0,0,.15);
}
.kpi-bg-total   { background:linear-gradient(135deg,#1565c0,#42a5f5); }
.kpi-bg-encours { background:linear-gradient(135deg,#e65100,#ffa726); }
.kpi-bg-attente { background:linear-gradient(135deg,#1565c0,#64b5f6); }
.kpi-bg-transmis{ background:linear-gradient(135deg,#00695c,#4db6ac); }
.kpi-bg-liquide { background:linear-gradient(135deg,#2e7d32,#81c784); }
.kpi-bg-annule  { background:linear-gradient(135deg,#b71c1c,#ef9a9a); }

.kpi-item__body  { flex:1; width:100%; }
.kpi-item__num   { font-size:1.5rem; font-weight:900; line-height:1; letter-spacing:-.5px; }
.kpi-grid--dialog .kpi-item__num { font-size: 1.35rem; }
.kpi-total .kpi-item__num { color:#1565c0; }
.kpi-item__label { font-size:.67rem; font-weight:700; color:#90a4ae; text-transform:uppercase; letter-spacing:.5px; margin-top:3px; }
.kpi-item__pct   { position:absolute; top:10px; right:12px; font-size:.68rem; font-weight:800; color:rgba(0,0,0,.18); background:rgba(0,0,0,.04); border-radius:6px; padding:2px 6px; }

.kpi-item__bar { position:absolute; bottom:0; left:0; right:0; height:3px; border-radius:0 0 14px 14px; }
.kpi-bar-total   { background:#1976d2; }
.kpi-bar-encours { background:#ef6c00; }
.kpi-bar-attente { background:#1565c0; }
.kpi-bar-transmis{ background:#00796b; }
.kpi-bar-liquide { background:#2e7d32; }
.kpi-bar-annule  { background:#c62828; }

.distrib-bar { display:flex; height:10px; border-radius:8px; overflow:hidden; background:#e8eaf6; gap:2px; }
.distrib-bar--lg { height: 14px; border-radius: 10px; }
.distrib-bar__seg { height:100%; transition:width .6s cubic-bezier(.4,0,.2,1); border-radius:4px; min-width:2px; }
.distrib-encours  { background:#ef6c00; }
.distrib-attente  { background:#1976d2; }
.distrib-transmis { background:#00796b; }
.distrib-liquide  { background:#388e3c; }
.distrib-annule   { background:#c62828; }

.distrib-legend { display:flex; align-items:center; flex-wrap:wrap; gap:4px; font-size:.72rem; color:#78909c; }
.distrib-legend--dialog {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 6px 10px;
  font-size: 0.74rem;
}
.distrib-legend--dialog span {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
.legend-dot { display:inline-block; width:9px; height:9px; border-radius:50%; margin-right:3px; vertical-align:middle; }

/* ═══════════════════════════════════════════════
   TABLE CARD
═══════════════════════════════════════════════ */
.table-card {
  border-radius:16px !important;
  border:1px solid rgba(25,118,210,0.12) !important;
  box-shadow:0 4px 24px rgba(25,118,210,0.08),0 1px 4px rgba(0,0,0,.04) !important;
  overflow:hidden;
}

.table-toolbar {
  display:flex; align-items:center; justify-content:space-between;
  padding:14px 20px; gap:12px; flex-wrap:wrap;
  background:linear-gradient(90deg,rgba(25,118,210,.06),#fafbff);
}
.table-toolbar__left  { display:flex; align-items:center; }
.table-toolbar__title { font-size:.9rem; font-weight:700; color:#1565c0; }
.table-toolbar__sub   { font-size:.74rem; color:#90a4ae; margin-top:1px; }
.table-count-badge    { font-size: 0.72rem; font-weight: 700; padding: 4px 10px; border-radius: 8px; }
.table-search { min-width:240px; }
.table-search :deep(.q-field__control) { border-radius:10px; }

/* Scroll horizontal si besoin sur petits écrans */
.table-scroll-wrap {
  overflow-x: auto;
  padding: 0 12px 12px;
  background: linear-gradient(180deg, #f8fafc 0%, #fff 48px);
}

/* ── Grille tableau (lignes H + V comme legacy border:1px solid) ── */
.stat-table {
  background: #fff;
  border-radius: 0 0 12px 12px;
}

.stat-table :deep(.q-table__container) {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(21, 101, 192, 0.22);
}

.stat-table :deep(.q-table__middle) {
  max-height: min(68vh, 720px);
  overflow: auto;
}

.stat-table :deep(table.stat-table__grid) {
  border-collapse: separate;
  border-spacing: 0;
  width: 100%;
}

.stat-table :deep(thead) {
  position: sticky;
  top: 0;
  z-index: 3;
}

.stat-table :deep(thead tr) {
  box-shadow: 0 2px 0 rgba(13, 71, 161, 0.35);
}

.table-header-cell {
  background: linear-gradient(180deg, #1976d2 0%, #1565c0 100%) !important;
  color: #fff !important;
  font-size: 0.71rem !important;
  font-weight: 700 !important;
  text-transform: uppercase;
  letter-spacing: 0.45px;
  white-space: nowrap;
  padding: 9px 10px !important;
  border: 1px solid rgba(13, 71, 161, 0.55) !important;
  border-bottom: 2px solid #0d47a1 !important;
  vertical-align: middle;
}

.table-header-cell__label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* ── Cellules corps ── */
.stat-table :deep(tbody td) {
  font-size: 0.78rem;
  color: #37474f;
  padding: 8px 10px !important;
  border: 1px solid rgba(21, 101, 192, 0.16) !important;
  vertical-align: top;
  transition: background 0.14s ease, box-shadow 0.14s ease;
}

.stat-table :deep(tbody tr:nth-child(even) td) {
  background: #f3f7fb;
}

.stat-table :deep(tbody tr:nth-child(odd) td) {
  background: #fff;
}

.stat-table :deep(tbody tr:hover td) {
  background: rgba(25, 118, 210, 0.09) !important;
  box-shadow: inset 0 0 0 1px rgba(25, 118, 210, 0.12);
}

.stat-table :deep(tbody tr:last-child td) {
  border-bottom: 1px solid rgba(21, 101, 192, 0.22) !important;
}

/* Colonne N° : séparation visuelle */
.stat-table :deep(tbody td.td-index) {
  background: #e8eef5 !important;
  border-right: 1px solid rgba(21, 101, 192, 0.28) !important;
  font-weight: 800;
}

.stat-table :deep(thead th:first-child) {
  border-left: 2px solid #0d47a1 !important;
}

.stat-table :deep(tbody td:first-child) {
  border-left: 2px solid rgba(21, 101, 192, 0.2) !important;
}

/* Pagination */
.stat-table :deep(.q-table__bottom) {
  border-top: 2px solid rgba(21, 101, 192, 0.14);
  background: linear-gradient(90deg, #f5f8fc, #fafbff);
  padding: 8px 12px;
  font-size: 0.78rem;
  color: #546e7a;
}

.stat-table :deep(.q-table__sort-icon) {
  color: rgba(255, 255, 255, 0.85) !important;
  opacity: 1;
}

/* ── CELLULE WRAP (texte libre, retour à la ligne) ──
   On fixe une largeur et on laisse le texte se casser naturellement.
   white-space:normal  → autorise le retour à la ligne
   word-break:break-word → casse même les mots sans espace (ex: codes longs)
   overflow-wrap:anywhere → idem, plus agressif pour les navigateurs modernes
─────────────────────────────────────────────────── */
.td-wrap {
  white-space: normal !important;
  word-break: break-word !important;
  overflow-wrap: anywhere !important;
  min-width: 120px;
}

/* ── CELLULE NOWRAP (dates, numéros courts) ──
   On empêche le retour à la ligne pour garder la lisibilité.
─────────────────────────────────────────────────── */
.td-nowrap {
  white-space: nowrap !important;
}

/* ── Dates : police chiffres fixes, couleur douce ── */
.td-date {
  font-size: 0.74rem !important;
  color: #607d8b !important;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.2px;
}

/* ── Index ── */
.td-index {
  font-size: 0.68rem !important;
  color: #546e7a !important;
  font-weight: 800;
  text-align: center;
  white-space: nowrap !important;
  font-variant-numeric: tabular-nums;
}

/* ── N° dossier ── */
.dossier-num {
  display: inline-block;
  font-weight: 800;
  color: #0d47a1;
  font-size: 0.8rem;
  letter-spacing: 0.2px;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(25, 118, 210, 0.08);
  border: 1px solid rgba(25, 118, 210, 0.18);
}

/* ── Requérant : avatar + texte wrappé ── */
.cell-requerant {
  display: flex;
  align-items: flex-start;   /* avatar en haut quand le nom passe en 2 lignes */
  gap: 7px;
}
.requerant-avatar { flex-shrink: 0; margin-top: 1px; }
.cell-wrap-text   {
  white-space: normal;
  word-break: break-word;
  overflow-wrap: anywhere;
}

/* ── Situation chip ── */
.situ-chip {
  font-size: 0.67rem !important;
  font-weight: 700 !important;
  border-radius: 6px !important;
  height: 22px !important;
  letter-spacing: 0.2px;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

/* ═══════════════════════════════════════════════
   MOBILE CARD
═══════════════════════════════════════════════ */
.mobile-card { width:100%; }
.mobile-card__inner {
  background:#fff;
  border:1px solid rgba(21, 101, 192, 0.2);
  border-radius:12px;
  padding:12px 14px;
  box-shadow:0 2px 8px rgba(0,0,0,.05);
  display:flex;
  flex-direction:column;
  gap:6px;
  border-left: 4px solid #1976d2;
}
.mobile-card__top       { display:flex; align-items:center; justify-content:space-between; gap:6px; }
.mobile-card__requerant {
  display:flex; align-items:flex-start; gap:6px;
  font-size:.8rem; font-weight:600; color:#37474f;
  word-break:break-word;
}
.mobile-card__meta {
  display:flex; align-items:flex-start; gap:4px;
  font-size:.72rem; color:#90a4ae;
  word-break:break-word;
}

/* ═══════════════════════════════════════════════
   EMPTY STATE
═══════════════════════════════════════════════ */
.empty-state { display:flex;flex-direction:column;align-items:center;padding:56px 24px;text-align:center; }
.empty-state__icon-wrap {
  width:80px;height:80px;border-radius:24px;
  background:rgba(25,118,210,.06);
  display:flex;align-items:center;justify-content:center;
  margin-bottom:16px;border:2px dashed rgba(25,118,210,.2);
}
.empty-state__title { font-size:1rem; font-weight:700; color:#546e7a; margin-bottom:6px; }
.empty-state__sub   { font-size:.8rem; color:#b0bec5; }
.empty-state__hint  {
  font-size:.8rem; color:#78909c; margin-top:10px;
  display:flex; align-items:center; flex-wrap:wrap; justify-content:center; gap:2px;
}

/* ═══════════════════════════════════════════════
   ANIMATIONS
═══════════════════════════════════════════════ */
.slide-down-enter-active,.slide-down-leave-active { transition:all .3s cubic-bezier(.4,0,.2,1); }
.slide-down-enter-from,.slide-down-leave-to       { opacity:0; transform:translateY(-12px); }
.fade-up-enter-active { transition:all .4s cubic-bezier(.34,1.56,.64,1); }
.fade-up-enter-from   { opacity:0; transform:translateY(16px); }
.pop-enter-active { transition:all .4s cubic-bezier(.34,1.56,.64,1); }
.pop-enter-from   { opacity:0; transform:scale(.6); }

@media(max-width:600px){
  .stat-situations      { padding:0 4px 20px; }
  .filter-panel__body   { padding:10px 12px; }
  .filter-grid {
    grid-template-columns: 1fr 1fr;
  }
  .filter-grid__actions {
    grid-column: 1 / -1;
    justify-content: stretch;
  }
  .filter-grid__actions .btn-search,
  .filter-grid__actions .btn-export {
    flex: 1 1 auto;
  }
  .table-toolbar        { padding:10px 14px; }
  .table-search         { min-width:0; width:100%; }
}
@media(max-width:959px) and (min-width:601px){
  .filter-grid {
    grid-template-columns: 1fr 1fr;
  }
  .filter-grid__actions {
    grid-column: 1 / -1;
    justify-content: flex-end;
  }
}
</style>
