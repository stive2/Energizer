<template>
  <q-page class="q-pa-md saisie-elements-rp-page">

    <!-- ════════════════════════════════════════════════
         LANDING : grille de cartes
    ════════════════════════════════════════════════ -->
    <transition name="fade-up" mode="out-in">
      <div v-if="!activePanel" key="grid">
        <div class="q-mb-lg text-center">
          <div class="text-h5 text-primary text-weight-bold">
            {{ t('layout.sidebar.rpSaisieElementsLiquidation') }}
          </div>
        </div>

        <div class="row q-col-gutter-lg justify-center">
          <div
            v-for="(panel, index) in panels"
            :key="panel.id"
            class="col-12 col-sm-6 col-md-4"
          >
            <q-card
              class="panel-card"
              :class="`panel-card--delay-${index}`"
              clickable v-ripple
              @click="selectPanel(panel.id)"
              @keydown.enter="selectPanel(panel.id)"
              tabindex="0"
            >
              <div class="panel-card__stripe" :style="{ background: panel.color }" />
              <q-card-section class="text-center q-pt-md q-pb-xs q-px-sm">
                <div
                  class="panel-card__icon-circle"
                  :style="{ background: panel.color + '1a', border: `2px solid ${panel.color}33` }"
                >
                  <q-icon :name="panel.icon" size="1.8rem" :style="{ color: panel.color }" />
                </div>
                <div class="text-subtitle2 text-weight-bold text-primary q-mt-sm">
                  {{ t(panel.labelKey) }}
                </div>
                <div class="text-caption text-grey-6 q-mt-xs panel-card__desc">
                  {{ panel.description }}
                </div>
              </q-card-section>
              <q-card-actions align="right" class="q-px-sm q-pb-sm q-pt-none">
                <q-btn flat dense :color="panel.btnColor" label="Ouvrir"
                  icon-right="arrow_forward" size="xs"
                  style="text-transform:none; font-weight:600;" />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>
    </transition>

    <!-- ════════════════════════════════════════════════
         VUE COMPOSANT
    ════════════════════════════════════════════════ -->
    <transition name="fade-slide" mode="out-in">
      <div v-if="activePanel" key="component">
        <div class="panel-header q-mb-lg">
          <q-btn flat round icon="arrow_back" color="primary" size="md" @click="goBack">
            <q-tooltip>Retour aux modules</q-tooltip>
          </q-btn>
          <div class="panel-header__info q-ml-sm">
            <div class="row items-center q-gutter-sm">
              <div class="panel-header__icon-dot" :style="{ background: activePanel.color }" />
              <span class="text-h6 text-primary text-weight-bold">{{ t(activePanel.labelKey) }}</span>
            </div>
            <div class="text-caption text-grey-6 q-ml-md">{{ activePanel.description }}</div>
          </div>
          <q-space />
          <div class="row q-gutter-xs gt-sm">
            <q-chip
              v-for="p in panels" :key="p.id"
              :color="activePanelId === p.id ? 'primary' : 'grey-3'"
              :text-color="activePanelId === p.id ? 'white' : 'grey-8'"
              clickable dense :icon="p.icon" size="sm"
              @click="selectPanel(p.id)"
              style="font-size:0.7rem; cursor:pointer;"
            >{{ t(p.labelKey) }}</q-chip>
          </div>
        </div>

        <transition name="component-slide" mode="out-in">
          <component :is="activePanel.component" :key="activePanelId" />
        </transition>
      </div>
    </transition>

  </q-page>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import NewCertificat       from 'src/modules/energizer/components/prestationRP/NewCertificatMedical.vue'
import NewCertificatDeces  from 'src/modules/energizer/components/prestationRP/newcertificatdeces.vue'
import NlleNoteDeFrags     from 'src/modules/energizer/components/prestationRP/nllenotedefrais.vue'
import NewTiersBeneficiaire from 'src/modules/energizer/components/prestationRP/NewTiersBeneficiaire.vue'

defineOptions({ name: 'SaisieElementsRPPage' })

const { t } = useI18n()
const route  = useRoute()
const router = useRouter()

const panels = [
  {
    id: 'certificats',
    labelKey: 'layout.sidebar.rpCertificatsMedicaux',
    icon: 'medical_information',
    color: '#00897B',
    btnColor: 'teal',
    description: 'Saisie des certificats médicaux de prise en charge RP',
    component: NewCertificat,
  },
  {
    id: 'certDeces',
    labelKey: 'layout.sidebar.rpCertDecesGenre',
    icon: 'article',
    color: '#C62828',
    btnColor: 'red',
    description: 'Certificat médical de décès et genre de mort',
    component: NewCertificatDeces,
  },
  {
    id: 'tiersBeneficiaire',
    labelKey: 'layout.sidebar.rpTiersBeneficiaire',
    icon: 'group_add',
    color: '#1976D2',
    btnColor: 'primary',
    description: 'Création ou mise à jour d\'un tiers bénéficiaire AT/MP',
    component: NewTiersBeneficiaire,
  },
  {
    id: 'noteDeFrags',
    labelKey: 'layout.sidebar.rpNoteDeFrags',
    icon: 'receipt_long',
    color: '#F57C00',
    btnColor: 'orange',
    description: 'Note de frais médicaux engagés',
    component: NlleNoteDeFrags,
  },
]

const panelById    = Object.fromEntries(panels.map(p => [p.id, p]))
const activePanelId = ref(null)
const activePanel   = computed(() => activePanelId.value ? panelById[activePanelId.value] ?? null : null)

function selectPanel(id) {
  activePanelId.value = id
  router.replace({ query: { ...route.query, panel: id } })
}

function goBack() {
  activePanelId.value = null
  const query = { ...route.query }
  delete query.panel
  router.replace({ query })
}

watch(
  () => route.query.panel,
  (panel) => {
    if (typeof panel === 'string' && panelById[panel]) {
      activePanelId.value = panel
    } else if (!panel) {
      activePanelId.value = null
    }
  },
  { immediate: true },
)
</script>

<style scoped>
.panel-card {
  border-radius: 14px;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  overflow: hidden;
  animation: cardFadeUp 0.4s ease both;
  outline: none;
}
.panel-card:hover { transform: translateY(-6px); box-shadow: 0 12px 32px rgba(0,0,0,0.14); }
.panel-card:focus-visible { box-shadow: 0 0 0 3px rgba(25,118,210,0.4); }
.panel-card__stripe { height: 5px; width: 100%; }
.panel-card__icon-circle {
  width: 56px; height: 56px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto; transition: transform 0.2s ease;
}
.panel-card:hover .panel-card__icon-circle { transform: scale(1.12); }
.panel-card__desc { min-height: 28px; line-height: 1.3; font-size: 0.7rem; }
.panel-card--delay-0 { animation-delay: 0ms; }
.panel-card--delay-1 { animation-delay: 70ms; }
.panel-card--delay-2 { animation-delay: 140ms; }
.panel-card--delay-3 { animation-delay: 210ms; }
@keyframes cardFadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
.panel-header {
  display: flex; align-items: flex-start;
  padding: 12px 16px; background: white; border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06); border: 1px solid #e8e8e8;
  flex-wrap: wrap; gap: 8px;
}
.panel-header__info { display: flex; flex-direction: column; justify-content: center; }
.panel-header__icon-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

.fade-up-enter-active { transition: opacity 0.35s ease, transform 0.35s ease; }
.fade-up-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-up-enter-from  { opacity: 0; transform: translateY(16px); }
.fade-up-leave-to    { opacity: 0; transform: translateY(-8px); }

.fade-slide-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-slide-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-slide-enter-from   { opacity: 0; transform: translateX(20px); }
.fade-slide-leave-to     { opacity: 0; transform: translateX(-12px); }

.component-slide-enter-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.component-slide-leave-active { transition: opacity 0.15s ease; }
.component-slide-enter-from   { opacity: 0; transform: translateY(12px); }
.component-slide-leave-to     { opacity: 0; }
</style>
