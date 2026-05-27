<template>
  <q-page class="energizer-stats-page">
    <div class="energizer-stats-page__wrap q-mx-auto q-px-sm q-px-md q-pt-md q-pb-lg">
      <div class="row items-center justify-between q-mb-md energizer-stats-header">
        <div>
          <div class="text-h5 text-primary text-weight-bold">{{ t('home.energizerStats.title') }}</div>
          <div class="text-caption text-grey-7 q-mt-xs">{{ t('home.energizerStats.subtitle') }}</div>
        </div>
        <q-btn-toggle
          v-model="period"
          no-caps
          unelevated
          toggle-color="primary"
          color="white"
          text-color="primary"
          :options="periodOptions"
          class="energizer-stats-period"
        />
      </div>

      <q-banner dense rounded class="bg-blue-1 text-primary q-mb-md energizer-stats-banner">
        <template #avatar>
          <q-icon name="info" />
        </template>
        {{ t('home.energizerStats.simulatedNotice') }}
      </q-banner>

      <div class="row q-col-gutter-md q-mb-md">
        <div
          v-for="kpi in kpiCards"
          :key="kpi.key"
          class="col-12 col-sm-6 col-md-3"
        >
          <q-card flat bordered class="energizer-stat-card full-height">
            <q-card-section>
              <div class="row items-center no-wrap">
                <q-avatar :color="kpi.color" text-color="white" :icon="kpi.icon" />
                <div class="q-ml-md col">
                  <div class="text-caption text-grey-7">{{ t(kpi.labelKey) }}</div>
                  <div class="text-h5 text-weight-bold text-grey-9">{{ kpi.value }}</div>
                  <div class="text-caption" :class="kpi.trendClass">
                    <q-icon :name="kpi.trendIcon" size="14px" class="q-mr-xs" />
                    {{ kpi.trendLabel }}
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-lg-5">
          <q-card flat bordered class="energizer-panel-card full-height">
            <q-card-section>
              <div class="text-subtitle1 text-weight-medium text-primary q-mb-md">
                {{ t('home.energizerStats.byDomain') }}
              </div>
              <div
                v-for="item in domainBreakdown"
                :key="item.key"
                class="q-mb-md energizer-domain-row"
              >
                <div class="row items-center justify-between q-mb-xs">
                  <div class="row items-center">
                    <q-icon :name="item.icon" :color="item.color" size="20px" class="q-mr-sm" />
                    <span class="text-body2 text-weight-medium">{{ t(item.labelKey) }}</span>
                  </div>
                  <span class="text-body2 text-weight-bold">{{ item.count }}</span>
                </div>
                <q-linear-progress
                  :value="item.ratio"
                  :color="item.color"
                  track-color="grey-3"
                  rounded
                  size="8px"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-lg-7">
          <q-card flat bordered class="energizer-panel-card full-height">
            <q-card-section>
              <div class="text-subtitle1 text-weight-medium text-primary q-mb-md">
                {{ t('home.energizerStats.weeklyVolume') }}
              </div>
              <div class="energizer-chart">
                <div
                  v-for="bar in weeklyBars"
                  :key="bar.label"
                  class="energizer-chart__group"
                >
                  <div class="energizer-chart__bars">
                    <div
                      class="energizer-chart__bar energizer-chart__bar--reception"
                      :style="{ height: bar.receptionPct + '%' }"
                      :title="t('home.energizerStats.legendReception') + ': ' + bar.reception"
                    />
                    <div
                      class="energizer-chart__bar energizer-chart__bar--rp"
                      :style="{ height: bar.rpPct + '%' }"
                      :title="t('home.energizerStats.legendRp') + ': ' + bar.rp"
                    />
                    <div
                      class="energizer-chart__bar energizer-chart__bar--pf"
                      :style="{ height: bar.pfPct + '%' }"
                      :title="t('home.energizerStats.legendPf') + ': ' + bar.pf"
                    />
                  </div>
                  <span class="energizer-chart__label">{{ bar.label }}</span>
                </div>
              </div>
              <div class="row q-gutter-md q-mt-sm justify-center">
                <div class="row items-center">
                  <span class="energizer-chart__dot energizer-chart__dot--reception" />
                  <span class="text-caption q-ml-xs">{{ t('home.energizerStats.legendReception') }}</span>
                </div>
                <div class="row items-center">
                  <span class="energizer-chart__dot energizer-chart__dot--rp" />
                  <span class="text-caption q-ml-xs">{{ t('home.energizerStats.legendRp') }}</span>
                </div>
                <div class="row items-center">
                  <span class="energizer-chart__dot energizer-chart__dot--pf" />
                  <span class="text-caption q-ml-xs">{{ t('home.energizerStats.legendPf') }}</span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <q-card flat bordered class="energizer-panel-card">
        <q-card-section>
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-subtitle1 text-weight-medium text-primary">
              {{ t('home.energizerStats.recentActivities') }}
            </div>
            <q-chip dense color="primary" text-color="white" icon="history">
              {{ filteredActivities.length }}
            </q-chip>
          </div>
          <q-table
            flat
            bordered
            :rows="filteredActivities"
            :columns="activityColumns"
            row-key="id"
            :pagination="{ rowsPerPage: 8 }"
            class="energizer-activities-table"
          >
            <template #body-cell-domain="props">
              <q-td :props="props">
                <q-chip dense :color="domainColor(props.row.domainKey)" text-color="white" size="sm">
                  {{ t(props.row.domainLabelKey) }}
                </q-chip>
              </q-td>
            </template>
            <template #body-cell-status="props">
              <q-td :props="props">
                <q-badge :color="statusColor(props.row.status)" :label="t(props.row.statusLabelKey)" />
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const SIM_SESSION_PROFILE_KEY = 'energizer-portal-sim-profile'

const period = ref('month')

const periodOptions = computed(() => [
  { label: t('home.energizerStats.periodWeek'), value: 'week' },
  { label: t('home.energizerStats.periodMonth'), value: 'month' },
])

const periodMultiplier = computed(() => {
  if (period.value === 'week') return 0.28
  return 1
})

const baseKpis = {
  total: 248,
  reception: 94,
  liquidationRp: 86,
  liquidationPf: 68,
}

const kpiCards = computed(() => {
  const m = periodMultiplier.value
  const fmt = (n) => Math.round(n * m)
  return [
    {
      key: 'total',
      labelKey: 'home.energizerStats.kpiTotal',
      icon: 'insights',
      color: 'primary',
      value: fmt(baseKpis.total),
      trendIcon: 'trending_up',
      trendClass: 'text-positive',
      trendLabel: t('home.energizerStats.trendUp', { pct: 12 }),
    },
    {
      key: 'reception',
      labelKey: 'home.energizerStats.kpiReception',
      icon: 'inbox',
      color: 'blue-7',
      value: fmt(baseKpis.reception),
      trendIcon: 'trending_up',
      trendClass: 'text-positive',
      trendLabel: t('home.energizerStats.trendUp', { pct: 8 }),
    },
    {
      key: 'rp',
      labelKey: 'home.energizerStats.kpiRp',
      icon: 'elderly',
      color: 'indigo-6',
      value: fmt(baseKpis.liquidationRp),
      trendIcon: 'trending_flat',
      trendClass: 'text-grey-7',
      trendLabel: t('home.energizerStats.trendFlat'),
    },
    {
      key: 'pf',
      labelKey: 'home.energizerStats.kpiPf',
      icon: 'family_restroom',
      color: 'teal-7',
      value: fmt(baseKpis.liquidationPf),
      trendIcon: 'trending_up',
      trendClass: 'text-positive',
      trendLabel: t('home.energizerStats.trendUp', { pct: 5 }),
    },
  ]
})

const domainBreakdown = computed(() => {
  const m = periodMultiplier.value
  const reception = Math.round(baseKpis.reception * m)
  const rp = Math.round(baseKpis.liquidationRp * m)
  const pf = Math.round(baseKpis.liquidationPf * m)
  const total = reception + rp + pf || 1
  return [
    {
      key: 'reception',
      labelKey: 'home.energizerStats.domainReception',
      icon: 'inbox',
      color: 'blue-7',
      count: reception,
      ratio: reception / total,
    },
    {
      key: 'rp',
      labelKey: 'home.energizerStats.domainRp',
      icon: 'elderly',
      color: 'indigo-6',
      count: rp,
      ratio: rp / total,
    },
    {
      key: 'pf',
      labelKey: 'home.energizerStats.domainPf',
      icon: 'family_restroom',
      color: 'teal-7',
      count: pf,
      ratio: pf / total,
    },
  ]
})

const weeklyBase = [
  { labelKey: 'home.energizerStats.week1', reception: 18, rp: 14, pf: 11 },
  { labelKey: 'home.energizerStats.week2', reception: 22, rp: 19, pf: 15 },
  { labelKey: 'home.energizerStats.week3', reception: 26, rp: 21, pf: 17 },
  { labelKey: 'home.energizerStats.week4', reception: 28, rp: 32, pf: 25 },
]

const weeklyBars = computed(() => {
  const m = period.value === 'week' ? 0.45 : 1
  return weeklyBase.map((w) => {
    const reception = Math.round(w.reception * m)
    const rp = Math.round(w.rp * m)
    const pf = Math.round(w.pf * m)
    const max = Math.max(reception, rp, pf, 1)
    return {
      label: t(w.labelKey),
      reception,
      rp,
      pf,
      receptionPct: Math.round((reception / max) * 100),
      rpPct: Math.round((rp / max) * 100),
      pfPct: Math.round((pf / max) * 100),
    }
  })
})

const allActivities = [
  {
    id: 'A-2401',
    date: '16/05/2026 09:42',
    domainKey: 'reception',
    domainLabelKey: 'home.energizerStats.domainReception',
    actionKey: 'home.energizerStats.actionReceptionNew',
    agent: 'M. Nguema',
    status: 'completed',
    statusLabelKey: 'home.energizerStats.statusCompleted',
  },
  {
    id: 'A-2402',
    date: '16/05/2026 10:15',
    domainKey: 'rp',
    domainLabelKey: 'home.energizerStats.domainRp',
    actionKey: 'home.energizerStats.actionRpDossier',
    agent: 'S. Abega',
    status: 'in_progress',
    statusLabelKey: 'home.energizerStats.statusInProgress',
  },
  {
    id: 'A-2403',
    date: '16/05/2026 11:03',
    domainKey: 'pf',
    domainLabelKey: 'home.energizerStats.domainPf',
    actionKey: 'home.energizerStats.actionPfElements',
    agent: 'C. Fotso',
    status: 'completed',
    statusLabelKey: 'home.energizerStats.statusCompleted',
  },
  {
    id: 'A-2404',
    date: '15/05/2026 16:28',
    domainKey: 'rp',
    domainLabelKey: 'home.energizerStats.domainRp',
    actionKey: 'home.energizerStats.actionRpCert',
    agent: 'J. Mballa',
    status: 'completed',
    statusLabelKey: 'home.energizerStats.statusCompleted',
  },
  {
    id: 'A-2405',
    date: '15/05/2026 14:10',
    domainKey: 'reception',
    domainLabelKey: 'home.energizerStats.domainReception',
    actionKey: 'home.energizerStats.actionReceptionNew',
    agent: 'P. Essomba',
    status: 'pending',
    statusLabelKey: 'home.energizerStats.statusPending',
  },
  {
    id: 'A-2406',
    date: '15/05/2026 09:55',
    domainKey: 'pf',
    domainLabelKey: 'home.energizerStats.domainPf',
    actionKey: 'home.energizerStats.actionPfAlloc',
    agent: 'A. Tchinda',
    status: 'in_progress',
    statusLabelKey: 'home.energizerStats.statusInProgress',
  },
  {
    id: 'A-2407',
    date: '14/05/2026 17:40',
    domainKey: 'rp',
    domainLabelKey: 'home.energizerStats.domainRp',
    actionKey: 'home.energizerStats.actionRpLiquidation',
    agent: 'M. Nguema',
    status: 'completed',
    statusLabelKey: 'home.energizerStats.statusCompleted',
  },
  {
    id: 'A-2408',
    date: '14/05/2026 08:20',
    domainKey: 'reception',
    domainLabelKey: 'home.energizerStats.domainReception',
    actionKey: 'home.energizerStats.actionReceptionValidate',
    agent: 'S. Abega',
    status: 'completed',
    statusLabelKey: 'home.energizerStats.statusCompleted',
  },
]

const filteredActivities = computed(() => {
  const limit = period.value === 'week' ? 5 : allActivities.length
  return allActivities.slice(0, limit)
})

const activityColumns = computed(() => [
  {
    name: 'date',
    label: t('home.energizerStats.colDate'),
    field: 'date',
    align: 'left',
    sortable: true,
  },
  {
    name: 'domain',
    label: t('home.energizerStats.colDomain'),
    field: 'domain',
    align: 'left',
  },
  {
    name: 'action',
    label: t('home.energizerStats.colAction'),
    field: (row) => t(row.actionKey),
    align: 'left',
  },
  {
    name: 'agent',
    label: t('home.energizerStats.colAgent'),
    field: 'agent',
    align: 'left',
  },
  {
    name: 'status',
    label: t('home.energizerStats.colStatus'),
    field: 'status',
    align: 'center',
  },
])

function domainColor(key) {
  if (key === 'reception') return 'blue-7'
  if (key === 'rp') return 'indigo-6'
  if (key === 'pf') return 'teal-7'
  return 'grey'
}

function statusColor(status) {
  if (status === 'completed') return 'positive'
  if (status === 'in_progress') return 'warning'
  return 'grey-6'
}

function readSimProfileFromSession() {
  if (typeof sessionStorage === 'undefined') return null
  const p = sessionStorage.getItem(SIM_SESSION_PROFILE_KEY)
  return p === 'internal' ? 'internal' : null
}

function handleOpenQuery(open) {
  if (open === 'FORM1' || open === 'reception' || open === 'dialog') {
    router.push({ name: 'energizer-reception-nouveau-dossier', query: { open: 'dialog' } })
  }
}

onMounted(() => {
  if (readSimProfileFromSession() !== 'internal') {
    router.replace({ name: 'energizer-login' })
    return
  }
  handleOpenQuery(route.query.open)
})

watch(
  () => route.query.open,
  (open) => handleOpenQuery(open),
)
</script>

<style scoped>
.energizer-stats-page {
  min-height: 100%;
  background: linear-gradient(155deg, #e8f4fc 0%, #f5f9fc 100%);
}

.energizer-stats-page__wrap {
  max-width: 1280px;
}

.energizer-stats-header {
  flex-wrap: wrap;
  gap: 12px;
}

.energizer-stats-period {
  border: 1px solid rgba(21, 101, 192, 0.2);
  border-radius: 8px;
}

.energizer-stats-banner {
  border: 1px solid rgba(21, 101, 192, 0.15);
}

.energizer-stat-card,
.energizer-panel-card {
  border-radius: 12px !important;
  border-color: rgba(21, 101, 192, 0.14) !important;
  background: #fff !important;
  box-shadow: 0 1px 8px rgba(21, 101, 192, 0.08);
}

.energizer-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  min-height: 180px;
  padding-top: 8px;
}

.energizer-chart__group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;
}

.energizer-chart__bars {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 3px;
  height: 140px;
  width: 100%;
}

.energizer-chart__bar {
  width: 12px;
  min-height: 4px;
  border-radius: 4px 4px 0 0;
  transition: height 0.25s ease;
}

.energizer-chart__bar--reception {
  background: #1976d2;
}

.energizer-chart__bar--rp {
  background: #3949ab;
}

.energizer-chart__bar--pf {
  background: #00897b;
}

.energizer-chart__label {
  font-size: 0.7rem;
  color: #616161;
  margin-top: 6px;
  text-align: center;
}

.energizer-chart__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.energizer-chart__dot--reception {
  background: #1976d2;
}

.energizer-chart__dot--rp {
  background: #3949ab;
}

.energizer-chart__dot--pf {
  background: #00897b;
}

.energizer-activities-table :deep(thead tr th) {
  background-color: var(--q-primary) !important;
  color: #fff !important;
  font-weight: 600;
}

.energizer-activities-table :deep(thead tr th .q-icon),
.energizer-activities-table :deep(thead tr th .q-table__sort-icon) {
  color: #fff !important;
  opacity: 1;
}
</style>
