<template>
  <q-page class="q-pa-sm">
    <!-- Header avec navigation -->
    <!-- Fil d'ariane informatif (non interactif) -->
    <div class="text-caption text-primary q-mb-sm font-weight-bold">
      <q-icon name="home" class="q-mr-xs" />
      {{ $t('breadcrumbs.home') }} > {{ $t('breadcrumbs.controller_management') }} >
      {{ $t('breadcrumbs.control_results') }}
      <span v-if="currentComponent"> > {{ componentName }}</span>
    </div>

    <div class="row items-start">
      <q-btn
        icon="arrow_back"
        color="primary"
        @click="goBack"
        class="q-mr-sm"
        size="sm"
        :label="$t('buttons.back')"
      />
    </div>
    <div class="text-center">
      <h6 class="text-h6 text-primary q-mb-none">
        {{ currentComponent ? componentName : $t('titles.control_results_management') }}
      </h6>
      <p class="text-subtitle2 text-grey-7 q-ma-none">
        {{ currentComponent ? getComponentDescription() : '' }}
      </p>
    </div>
    <!-- Sélection du composant si aucun n'est sélectionné -->
    <div v-if="!currentComponent">
      <!-- Filtre de recherche -->
      <div class="row justify-center q-mb-sm">
        <q-input
          outlined
          dense
          v-model="searchFilter"
          :placeholder="$t('placeholders.search')"
          style="max-width: 350px; width: 100%"
          class="search-input"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append>
            <q-btn
              v-if="searchFilter"
              flat
              dense
              round
              icon="close"
              @click="searchFilter = ''"
              size="xs"
            />
          </template>
        </q-input>
      </div>

      <!-- Compteur d'éléments -->
      <div class="text-caption text-grey-7 text-center q-mb-sm">
        {{ filteredComposants.length }} {{ $t('labels.components_found') }}
      </div>

      <!-- Grille des composants - 4 par ligne -->
      <div class="components-grid">
        <div class="row q-gutter-sm justify-center">
          <q-card
            v-for="composant in filteredComposants"
            :key="composant.id"
            class="component-card cursor-pointer hoverable"
            @click="selectComposant(composant)"
          >
            <q-card-section class="text-center q-pa-md">
              <q-icon :name="composant.icon" size="48px" color="primary" class="q-mb-sm" />
              <div class="text-subtitle1 text-primary q-mb-xs font-weight-medium">
                {{ composant.name }}
              </div>
              <div class="text-body2 text-grey-7 description-text">{{ composant.description }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Affichage du composant sélectionné -->
    <div v-else class="component-wrapper">
      <!-- Contenu du composant -->
      <div class="component-content">
        <!-- Saisie des résultats -->
        <div v-if="currentComponent === 'SAISIE_RESULTATS'">
          <SaisieResultats />
        </div>

        <!-- Modification des rapports -->
        <div v-else-if="currentComponent === 'MOD_RAPPORT_CTRLE'">
          <ModRapportCtrle />
        </div>

        <!-- Validation des rapports -->
        <div v-else-if="currentComponent === 'VALID_RAPPORT_CTRLE'">
          <ValidRapportCtrle />
        </div>

        <!-- annulation des rapports -->
        <div v-else-if="currentComponent === 'CANCEL_RAPPORT_CTRLE'">
          <AnnulerRapportCtrle />
        </div>

        <!-- notification des rapports -->
        <div v-else-if="currentComponent === 'NOTIFY_RAPPORT_CTRLE'">
          <NotifierRapportCtrle />
        </div>

        <!-- notification des rapports -->
        <div v-else-if="currentComponent === 'CONSULT_RAPPORT_CTRLE'">
          <ConsultRapportCtrle />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SaisieResultats from 'components/gestionsControleurs/resultatsControles/SaisieResultats.vue'
import ModRapportCtrle from 'components/gestionsControleurs/resultatsControles/ModRapportCtrle.vue'
import ValidRapportCtrle from 'components/gestionsControleurs/resultatsControles/ValidRapportCtrle.vue'
import AnnulerRapportCtrle from 'components/gestionsControleurs/resultatsControles/AnnulerRapportCtrle.vue'
import NotifierRapportCtrle from 'components/gestionsControleurs/resultatsControles/NotifierRapportCtrle.vue'
import ConsultRapportCtrle from 'components/gestionsControleurs/resultatsControles/ConsultRapportCtrle.vue'

const route = useRoute()
const router = useRouter()

// Variables réactives
const currentComponent = ref('')
const componentName = ref('')
const searchFilter = ref('')

// Composants disponibles
const composantsResultatControle = [
  {
    id: 1,
    name: 'Saisie des résultats',
    description: 'Saisir les résultats des contrôles',
    code: 'SAISIE_RESULTATS',
    icon: 'edit_note',
  },
  {
    id: 2,
    name: 'Modification des rapports',
    description: 'Modifier les rapports de contrôle existants',
    code: 'MOD_RAPPORT_CTRLE',
    icon: 'edit_document',
  },
  {
    id: 3,
    name: 'Validation des rapports',
    description: 'Valider les rapports de contrôle',
    code: 'VALID_RAPPORT_CTRLE',
    icon: 'verified',
  },
  {
    id: 4,
    name: 'Annulation des rapports',
    description: 'Annuler des rapports de contrôle',
    code: 'CANCEL_RAPPORT_CTRLE',
    icon: 'cancel',
  },
  {
    id: 5,
    name: 'Notification des rapports',
    description: 'Notifier les rapports de contrôle',
    code: 'NOTIFY_RAPPORT_CTRLE',
    icon: 'send',
  },
  {
    id: 6,
    name: 'Consultation des résultats de contrôles employeur',
    description: 'Consulter les résultats de contrôle',
    code: 'CONSULT_RAPPORT_CTRLE',
    icon: 'folder',
  },
]

// Computed
const getComponentDescription = () => {
  const composant = composantsResultatControle.find((c) => c.code === currentComponent.value)
  return composant ? composant.description : ''
}

const filteredComposants = computed(() => {
  const term = (searchFilter.value || '').toLowerCase().trim()
  if (!term) return composantsResultatControle
  return composantsResultatControle.filter((c) =>
    [c.name, c.description].some((v) => (v || '').toLowerCase().includes(term)),
  )
})

// Méthodes
const selectComposant = (composant) => {
  currentComponent.value = composant.code
  componentName.value = composant.name
  router.replace({
    path: route.path,
    query: { ...route.query, component: composant.code, componentName: composant.name },
  })
}

const clearComponent = () => {
  currentComponent.value = ''
  componentName.value = ''
  const rest = { ...route.query }
  delete rest.component
  delete rest.componentName
  router.replace({ path: route.path, query: rest })
}

const goBack = () => {
  if (currentComponent.value) {
    clearComponent()
  } else {
    router.push('/')
  }
}

// Initialisation
onMounted(() => {
  if (route.query.component) {
    currentComponent.value = route.query.component
    componentName.value = route.query.componentName || ''
  }
})

// Réagir aux changements d'URL
watch(
  () => route.query,
  (q) => {
    if (q && q.component) {
      currentComponent.value = String(q.component)
      componentName.value = String(q.componentName || '')
    } else {
      currentComponent.value = ''
      componentName.value = ''
    }
  },
  { deep: true },
)
</script>

<style scoped>
/* Container principal optimisé */
.q-page {
  max-width: 100vw;
  overflow-x: hidden;
}

/* Grille des composants */
.components-grid {
  max-height: calc(100vh - 220px);
  overflow-y: auto;
  padding: 0 8px;
}

/* Cards des composants - 4 par ligne */
.component-card {
  width: calc(25% - 12px);
  min-width: 200px;
  max-width: 280px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

/* Responsive pour les cards */
@media (max-width: 1200px) {
  .component-card {
    width: calc(33.333% - 12px);
  }
}

@media (max-width: 800px) {
  .component-card {
    width: calc(50% - 12px);
  }
}

@media (max-width: 500px) {
  .component-card {
    width: calc(100% - 12px);
  }
}

/* Effet hover optimisé */
.hoverable:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Texte de description limité */
.description-text {
  font-size: 12px;
  line-height: 1.3;
  height: 32px;
  overflow: hidden;
  display: -webkit-box;

  -webkit-box-orient: vertical;
}

/* Input de recherche */
.search-input {
  border-radius: 8px;
}

/* Wrapper du composant sélectionné */
.component-wrapper {
  height: calc(100vh - 140px);
  overflow-y: auto;
}

.component-content {
  min-height: 100%;
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
}

/* Styles globaux optimisés */
.q-btn {
  border-radius: 6px;
}

.q-input {
  border-radius: 6px;
}

/* Scrollbar personnalisée */
.components-grid::-webkit-scrollbar,
.component-wrapper::-webkit-scrollbar {
  width: 6px;
}

.components-grid::-webkit-scrollbar-track,
.component-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.components-grid::-webkit-scrollbar-thumb,
.component-wrapper::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.components-grid::-webkit-scrollbar-thumb:hover,
.component-wrapper::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* Suppression des espaces inutiles */
.q-gutter-sm > * {
  margin: 4px;
}

/* Optimisation pour petits écrans */
@media (max-width: 600px) {
  .q-page {
    padding: 8px;
  }

  .text-h6 {
    font-size: 1.1rem;
  }

  .component-content {
    padding: 12px;
  }
}
</style>
