<template>
  <q-page class="assure-home-page">
    <div class="assure-home-page__wrap q-mx-auto q-px-sm q-px-md q-pt-md q-pb-lg">
      <q-card flat bordered class="assure-home-hero q-mb-lg">
        <q-card-section class="assure-home-hero__body row items-center no-wrap">
          <div class="assure-home-hero__icon-wrap flex flex-center">
            <q-icon name="health_and_safety" size="32px" color="primary" />
          </div>
          <div class="col q-pl-md">
            <div class="assure-home-hero__title text-h6 text-weight-bold text-primary">
              {{ heroTitle }}
            </div>
            <div class="assure-home-hero__lead text-body2 text-grey-8 q-mt-xs">
              {{ t('home.assureStats.welcomeLead') }}
            </div>
          </div>
          <q-chip
            v-if="dashboard?.account"
            :color="dashboard.account.active ? 'positive' : 'warning'"
            text-color="white"
            icon="verified_user"
            size="sm"
            class="assure-home-hero__chip gt-xs"
          >
            {{
              dashboard.account.active
                ? t('home.assureStats.accountActive')
                : t('home.assureStats.accountInactive')
            }}
          </q-chip>
        </q-card-section>
      </q-card>

      <q-banner
        v-if="dashboard && !dashboard.account?.active"
        dense
        rounded
        class="bg-orange-1 text-orange-10 q-mb-md"
      >
        <template #avatar>
          <q-icon name="info" color="orange-9" />
        </template>
        {{ t('home.assureStats.inactiveNotice') }}
      </q-banner>

      <div v-if="loading" class="flex flex-center q-pa-xl">
        <q-spinner color="primary" size="40px" />
      </div>

      <template v-else-if="dashboard">
        <div class="row q-col-gutter-md q-mb-md">
          <div v-for="kpi in kpiCards" :key="kpi.key" class="col-12 col-sm-6 col-md-4">
            <q-card flat bordered class="assure-stat-card full-height">
              <q-card-section>
                <div class="row items-center no-wrap">
                  <q-avatar :color="kpi.color" text-color="white" :icon="kpi.icon" />
                  <div class="q-ml-md col">
                    <div class="text-caption text-grey-7">{{ kpi.label }}</div>
                    <div class="text-h6 text-weight-bold text-grey-9">{{ kpi.value }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div class="text-subtitle1 text-weight-medium text-primary q-mb-sm">
          {{ t('home.assureStats.quickActions') }}
        </div>
        <div class="row q-col-gutter-md">
          <div
            v-for="action in quickActionCards"
            :key="action.id"
            class="col-12 col-sm-6 col-md-4"
          >
            <q-card
              flat
              bordered
              class="assure-action-card full-height cursor-pointer"
              :class="{ 'assure-action-card--disabled': !action.enabled }"
              @click="action.enabled && goTo(action.route)"
            >
              <q-card-section>
                <div class="row items-center no-wrap">
                  <q-avatar
                    :color="action.enabled ? 'primary' : 'grey-5'"
                    text-color="white"
                    :icon="action.icon"
                  />
                  <div class="q-ml-md col">
                    <div class="text-body1 text-weight-medium">{{ action.title }}</div>
                    <div class="text-caption text-grey-7">{{ action.subtitle }}</div>
                  </div>
                  <q-icon v-if="action.enabled" name="chevron_right" color="grey-6" />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { fetchAssureHomeDashboard } from 'src/modules/assure/api/assureHomeApi.js'
import { buildAssureHomeFallbackDashboard } from 'src/modules/assure/utils/assureHomeFallback.js'
import { isInsuredSessionActive } from 'src/modules/shared/utils/portalSimAuthSession.js'

const { t } = useI18n()
const router = useRouter()

const loading = ref(true)
const dashboard = ref(null)

const heroTitle = computed(() => {
  const name = dashboard.value?.user?.displayName
  if (name) {
    return t('home.assureStats.welcomeNamed', { name })
  }
  return t('home.assureStats.welcomeTitle')
})

const kpiCards = computed(() => {
  const d = dashboard.value
  if (!d) return []
  return [
    {
      key: 'matricule',
      label: t('home.assureStats.kpiMatricule'),
      value: d.user?.num_assu || '—',
      icon: 'badge',
      color: 'primary',
    },
    {
      key: 'centre',
      label: t('home.assureStats.kpiCentre'),
      value: d.user?.lib_centre || '—',
      icon: 'location_city',
      color: 'teal',
    },
    {
      key: 'depot',
      label: t('home.assureStats.kpiDepotPf'),
      value: d.depotPf?.available
        ? t('home.assureStats.kpiDepotAvailable')
        : t('home.assureStats.kpiDepotUnavailable'),
      icon: 'family_restroom',
      color: d.depotPf?.available ? 'positive' : 'grey',
    },
  ]
})

const ACTION_I18N = {
  'depot-pf': {
    titleKey: 'home.assureStats.actionDepotPfTitle',
    subtitleKey: 'home.assureStats.actionDepotPfLead',
  },
  'depot-dossier': {
    titleKey: 'home.assureStats.actionDepotDossierTitle',
    subtitleKey: 'home.assureStats.actionDepotDossierLead',
  },
  'mon-compte': {
    titleKey: 'home.assureStats.actionAccountTitle',
    subtitleKey: 'home.assureStats.actionAccountLead',
  },
}

const quickActionCards = computed(() => {
  const actions = dashboard.value?.quickActions || []
  return actions.map((a) => {
    const i18n = ACTION_I18N[a.id] || {}
    return {
      id: a.id,
      route: a.route,
      icon: a.icon,
      enabled: a.enabled !== false,
      title: t(i18n.titleKey || 'home.assureStats.quickActions'),
      subtitle: t(i18n.subtitleKey || ''),
    }
  })
})

function goTo(routeName) {
  if (!routeName) return
  router.push({ name: routeName })
}

function isAuthError(error) {
  const status = error?.response?.status
  return status === 401 || status === 403
}

onMounted(async () => {
  if (!isInsuredSessionActive()) {
    router.replace({ name: 'assure-login' })
    return
  }
  loading.value = true
  try {
    dashboard.value = await fetchAssureHomeDashboard()
  } catch (e) {
    if (isAuthError(e)) {
      dashboard.value = buildAssureHomeFallbackDashboard()
      return
    }
    dashboard.value = buildAssureHomeFallbackDashboard()
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.assure-home-page {
  background: linear-gradient(180deg, #f0f7fc 0%, #fafcfe 42%, #ffffff 100%);
  min-height: 100%;
}

.assure-home-page__wrap {
  max-width: 1200px;
}

.assure-home-hero {
  border-radius: 16px;
  border: 1px solid rgba(25, 118, 210, 0.12);
  background: linear-gradient(135deg, #ffffff 0%, #f3f9ff 55%, #e8f4fd 100%);
  box-shadow: 0 4px 24px rgba(25, 118, 210, 0.08);
}

.assure-home-hero__body {
  padding: 1.1rem 1.25rem;
}

.assure-home-hero__icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(25, 118, 210, 0.1);
  flex-shrink: 0;
}

.assure-home-hero__title {
  line-height: 1.25;
}

.assure-home-hero__lead {
  line-height: 1.45;
  max-width: 36rem;
}

.assure-home-hero__chip {
  flex-shrink: 0;
}

.assure-stat-card,
.assure-action-card {
  border-radius: 12px;
  transition: box-shadow 0.2s ease, transform 0.15s ease;
}

.assure-action-card:not(.assure-action-card--disabled):hover {
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.12);
  transform: translateY(-1px);
}

.assure-action-card--disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

@media (max-width: 599px) {
  .assure-home-hero__body {
    flex-wrap: wrap;
  }

  .assure-home-hero__chip {
    margin-top: 0.5rem;
    margin-left: calc(56px + 0.75rem);
  }
}
</style>
