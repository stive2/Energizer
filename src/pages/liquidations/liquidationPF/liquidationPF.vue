<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-gutter-sm q-mb-md">
      <q-breadcrumbs separator-icon="chevron_right">
        <q-breadcrumbs-el icon="home" :label="$t('home.title')" to="/" />
        <q-breadcrumbs-el :label="$t('LiquidationPF.mainCardTitle')" to="/liquidations/liquidationPF/liquidationPF" />
        <q-breadcrumbs-el v-if="step > 0" :label="currentStepLabel" />
      </q-breadcrumbs>
      <q-space />
      <q-btn flat dense round icon="arrow_back" v-if="step > 0" @click="goBack" />
    </div>

    <!-- Step 0 trigger to open first dialog -->
    <div class="column items-center">
      <q-card class="q-pa-lg text-center" :style="$q.screen.lt.sm ? 'width: 95vw;' : 'width: 900px;'">
        <div class="text-h6 q-mb-xs">{{ $t('LiquidationPF.mainCardTitle') }}</div>
        <div class="text-caption text-grey-7 q-mb-md">{{ $t('LiquidationPF.mainCardSubtitle') }}</div>
        <q-btn color="primary" icon="open_in_new" :label="$t('pages.index.continue')" @click="openFirstDialog" />
      </q-card>
    </div>

    <!-- First dialog: main categories/cards -->
    <q-dialog v-model="firstDialog" persistent>
      <q-card class="q-pa-md" :style="$q.screen.lt.sm ? 'width: 95vw;' : 'width: 90vw; max-width: 1200px;'">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-primary">
            <q-icon name="dashboard_customize" class="q-mr-sm" />
            {{ $t('LiquidationPF.mainCardTitle') }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-md justify-center">
            <q-card v-for="item in categories" :key="item.code" class="q-ma-xs col-12 col-sm-6 col-md-4 col-lg-3 cursor-pointer hoverable q-mb-md" :style="{ borderRadius: '16px' }" @click="selectCategory(item)">
              <q-card-section class="text-center">
                <q-icon :name="item.icon" size="48px" color="primary" class="q-mb-md" />
                <div class="text-h6 text-primary">{{ $t(item.name) }}</div>
                <div class="text-caption text-grey-7">{{ $t(item.description) }}</div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Second dialog: list of PF components -->
    <q-dialog v-model="secondDialog" persistent>
      <q-card class="q-pa-md" :style="$q.screen.lt.sm ? 'width: 95vw;' : 'width: 90vw; max-width: 1200px;'">
        <q-card-section class="row items-center q-pb-none">
          <q-btn icon="arrow_back" flat round dense class="q-mr-sm" @click="goBackToFirst" />
          <div class="text-h6 text-primary">
            <q-icon name="list_alt" class="q-mr-sm" />
            {{ $t(selectedCategory?.name) }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <div class="row items-center q-gutter-md justify-center q-mb-md">
            <q-input outlined dense v-model="search" :placeholder="$t('pages.index.searchComponent')" style="max-width: 400px; width: 100%">
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
              <template v-slot:append>
                <q-btn v-if="search" flat dense round icon="close" @click="search = ''" />
              </template>
            </q-input>
            <div class="text-caption text-grey-7">{{ filteredComponents.length }} {{ $t('home.foundServices') }}</div>
          </div>
          <div class="row q-col-gutter-md justify-center" :style="{ maxHeight: dialogContentHeight, overflowY: 'auto' }">
            <q-card v-for="comp in filteredComponents" :key="comp.code" class="q-ma-xs col-12 col-sm-6 col-md-4 col-lg-3 cursor-pointer hoverable q-mb-md" :style="{ borderRadius: '16px' }" @click="navigateToComponent(comp)">
              <q-card-section class="text-center">
                <q-icon :name="comp.icon" size="48px" color="primary" class="q-mb-md" />
                <div class="text-h6 text-primary">{{ $t(comp.name) }}</div>
                <div class="text-caption text-grey-7">{{ $t(comp.description) }}</div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>

</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

// Step management for breadcrumb/back
const step = ref(0)
const currentStepLabel = computed(() => (step.value === 1 ? t('LiquidationPF.select') : t('LiquidationPF.details')))

// Dialog states
const firstDialog = ref(false)
const secondDialog = ref(false)

const openFirstDialog = () => {
  firstDialog.value = true
  step.value = 0
}

const goBack = () => {
  if (secondDialog.value) {
    goBackToFirst()
  } else if (firstDialog.value) {
    firstDialog.value = false
    step.value = 0
  }
}

// Categories (first level)
const categories = [
  {
    code: 'SAISIE',
    name: 'LiquidationPF.categoryInputName',
    description: 'LiquidationPF.categoryInputDesc',
    icon: 'edit_document',
  },
  /* {
    code: 'CONSULT',
    name: 'LiquidationPF.categoryStatsName',
    description: 'LiquidationPF.categoryStatsDesc',
    icon: 'query_stats',
  }, */
]

const selectedCategory = ref(null)
const selectCategory = (item) => {
  selectedCategory.value = item
  firstDialog.value = false
  secondDialog.value = true
  step.value = 1
}

const goBackToFirst = () => {
  secondDialog.value = false
  firstDialog.value = true
  step.value = 0
}

// PF components (second level)
const componentsPF = [
  {
    code: 'allocationsFamiliales',
    name: 'LiquidationPF.allocFamName',
    description: 'LiquidationPF.allocFamDesc',
    icon: 'family_restroom',
    path: '/liquidations/liquidationPF/allocationsFamiliales',
  },
  {
    code: 'aperiodique',
    name: 'LiquidationPF.aperiodiqueName',
    description: 'LiquidationPF.aperiodiqueDesc',
    icon: 'event_busy',
    path: '/liquidations/liquidationPF/aperiodique',
  },
  {
    code: 'saisieReprises',
    name: 'LiquidationPF.saisieReprisesName',
    description: 'LiquidationPF.saisieReprisesDesc',
    icon: 'restart_alt',
    path: '/liquidations/liquidationPF/saisieReprises',
  },
  {
    code: 'periodeActive',
    name: 'LiquidationPF.periodeActiveName',
    description: 'LiquidationPF.periodeActiveDesc',
    icon: 'calendar_month',
    path: '/liquidations/liquidationPF/periodeActive',
  },
  {
    code: 'pieceMaintienDroit',
    name: 'LiquidationPF.pieceMaintienName',
    description: 'LiquidationPF.pieceMaintienDesc',
    icon: 'description',
    path: '/liquidations/liquidationPF/pieceMaintienDroit',
  },
  {
    code: 'statistiques',
    name: 'LiquidationPF.statsName',
    description: 'LiquidationPF.statsDesc',
    icon: 'insights',
    path: '/liquidations/liquidationPF/statistiques',
  },
]

const search = ref('')
const filteredComponents = computed(() => {
  const term = (search.value || '').toLowerCase().trim()
  if (!term) return componentsPF
  return componentsPF.filter((c) => [c.name, c.description].some((v) => (v || '').toLowerCase().includes(term)))
})

const dialogContentHeight = computed(() => {
  const perItem = 200
  const viewport = typeof window !== 'undefined' ? window.innerHeight : 800
  const maxAvail = Math.max(400, viewport - 220)
  const desired = Math.min(filteredComponents.value.length * perItem, maxAvail)
  return `${desired}px`
})

const navigateToComponent = (comp) => {
  // Close dialog then navigate
  secondDialog.value = false
  firstDialog.value = false
  router.push({ path: comp.path })
}

onMounted(() => {
  // Auto-open the first dialog when landing on this page
  openFirstDialog()
})
</script>

<style scoped>
.hoverable:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  background-color: ghostwhite;
}
</style>


