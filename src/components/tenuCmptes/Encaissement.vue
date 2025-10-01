<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <!-- Carte : Saisie des éléments de liquidation -->
  <q-card
    class="main-card q-pa-lg"
    @click="showElements = true"
    v-if="!showLiquidation && !showElements && !currentComponent"
  >
    <div class="card-content">
      <q-icon name="money" size="3rem" class="text-primary q-mb-md" />
      <div class="text-h4 text-primary font-weight-bold">
        {{$t('Gestion des encaissements de cotisations')}}
      </div>
      <div class="text-subtitle1 text-grey-6 q-mt-sm font-weight-medium">
        {{$t('LiquidationPF.saisieCardSubtitle')}}
      </div>
    </div>
    <q-btn
      flat
      color="primary"
      icon="arrow_back"
      :label="$t('LiquidationPF.saisieCardBack')"
      class="q-mt-lg font-weight-bold"
       @click.stop="emitClose"
    />
  </q-card>
 <q-dialog v-model="showElements" persistent full-width>
  <!-- Interface avec sidebar et contenu principal -->
  <div
    v-if="showElements"
    class="liquidation-interface"
  >
    <!-- Header -->
    <div class="header-bar">
      <q-btn
        flat
        color="primary"
        icon="arrow_back"
        :label="$t('LiquidationPF.headerBack')"
        class="text-primary font-weight-bold"
        @click="goBack"
      />
      <div class="header-title">
        <span class="text-h6 text-primary font-weight-bold">{{$t('Elements d\' encaissement')}}</span>
      </div>
    </div>

        <!-- Layout principal -->
        <div class="main-layout">
          <!-- Sidebar -->
          <div class="sidebar">
            <div class="sidebar-content">
              <q-list>
                <q-item
                  v-for="item in items"
                  :key="item.label"
                  clickable
                  v-ripple
                  class="sidebar-item"
                  :class="{
                    'active-item': currentComponent === item.component,
                    'focused-item': focusedItem === item.label
                  }"
                  @click="openForm(item.component); focusedItem = item.label"
                  tabindex="0"
                  @keydown.enter="openForm(item.component); focusedItem = item.label"
                  @keydown.space="openForm(item.component); focusedItem = item.label"
                  @focus="focusedItem = item.label"
                >
                  <q-item-section avatar>
                    <q-icon :name="item.icon" class="text-primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-primary font-weight-bold">{{ getSidebarKey(item.key) }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>

          <!-- Contenu principal -->
          <div class="content-area">
            <transition name="fade-slide" mode="out-in">
              <component
                :is="currentComponent"
                v-if="currentComponent"
                @close="currentComponent = null"
                class="component-content"
              />
              <div v-else class="placeholder-content">
                <q-icon name="touch_app" size="4rem" class="text-primary q-mb-md" />
                <div class="text-h6 text-primary q-mb-sm font-weight-bold">
                  {{$t('LiquidationPF.placeholderSelect')}}
                </div>
                <div class="text-body2 text-grey-6 font-weight-medium">
                  {{$t('LiquidationPF.placeholderChoose')}}
                </div>
              </div>
            </transition>
          </div>
        </div>

   </div>
  </q-dialog>
</template>
<script setup>

import { ref } from 'vue'
import ValiderEncaissement from './ValiderEncaissement.vue'
import SaisieEncaissement from './SaisieEncaissement.vue'
import SuppressionEncaissement from './SuppressionEncaissement.vue'
import EnregistrementEncaissement from './EnregistrementEncaissement.vue'


const emit = defineEmits(['close'])
const showLiquidation = ref(false)
const showElements = ref(false)
const currentComponent = ref(null)
const focusedItem = ref(null)


const items = [
   { key: 'validerEncaissement', label: 'Valider Encaissements', icon: 'check_circle', component: ValiderEncaissement },
   { key: 'saisieEncaissement', label: 'Saisie Encaissements', icon: 'playlist_add', component: SaisieEncaissement },
   { key: 'supEncaissement', label: 'Suppression Encaissements', icon: 'delete', component: SuppressionEncaissement },
   { key: 'enregEncaissement', label: 'Enregistrement Encaissements', icon: 'person_add', component: EnregistrementEncaissement },
]

function openForm(comp) {
  currentComponent.value = comp
}

function goBack() {
  if (currentComponent.value) {
    currentComponent.value = null
  } else if (showElements.value) {
    showElements.value = false
  } else {
    showLiquidation.value = false
  }
}

function emitClose() {
  emit('close')
}


// Fonction utilitaire: mappe une clé vers le libellé à afficher dans la sidebar
// Clés possibles: 'validerEncaissement', 'saisieEncaissement', 'supEncaissement', 'enregEncaissement'
function getSidebarKey(key) {
  switch (key) {
    case 'validerEncaissement':
      return 'Valider les saisies, Générer, Éditer, exporter une quittance';
    case 'saisieEncaissement':
      return 'saisir un encaissement des cotisation employeur';
    case 'supEncaissement':
      return "Supprimer une saisie d'encaissement employeur";
    case 'enregEncaissement':
      return "Enregistrer un encaissement des assurés volontaires";
    default:
      return key;
  }
}


</script>

<style scoped>
/* Carte principale */
.main-card {
  max-width: 80%;
  width: 80%;
  margin: 0 auto;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: 'Roboto', 'Segoe UI', sans-serif;
}

.main-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.card-content {
  text-align: center;
  padding: 2rem;
}

.card-content .text-h4 {
  font-weight: 700 !important;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.card-content .text-subtitle1 {
  font-weight: 500 !important;
  line-height: 1.4;
}

/* Interface principale */
.liquidation-interface {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fafafa;
  font-family: 'Roboto', 'Segoe UI', sans-serif;
  max-width: 80%;
  width: 80%;
  margin: 0 auto;
}

/* Header */
.header-bar {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-title {
  margin-left: 1rem;
}

.header-title .text-h6 {
  font-weight: 700 !important;
  letter-spacing: -0.25px;
}

/* Layout principal */
.main-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

.sidebar-content {
  padding: 1.5rem;
}

.sidebar-item {
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s ease;
  font-weight: 500;
  outline: none;
}

.sidebar-item:hover {
  background-color: rgba(25, 118, 210, 0.08);
  transform: translateX(2px);
}

.sidebar-item:focus {
  background-color: rgba(25, 118, 210, 0.12);
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.3);
  transform: translateX(2px);
  outline: none;
}

.sidebar-item:focus-visible {
  background-color: rgba(25, 118, 210, 0.12);
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.3);
  transform: translateX(2px);
  outline: none;
}

.focused-item {
  background-color: rgba(25, 118, 210, 0.12);
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.3);
  transform: translateX(2px);
  outline: none;
}

.focused-item:hover {
  background-color: rgba(25, 118, 210, 0.16);
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.4);
}

.active-item {
  background-color: rgba(25, 118, 210, 0.12);
  font-weight: 700 !important;
  border-left: 3px solid #1976D2;
}

.active-item:focus {
  background-color: rgba(25, 118, 210, 0.16);
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.4);
  border-left: 3px solid #1976D2;
}

.active-item:focus-visible {
  background-color: rgba(25, 118, 210, 0.16);
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.4);
  border-left: 3px solid #1976D2;
}

/* Item actif ET focusé */
.active-item.focused-item {
  background-color: rgba(25, 118, 210, 0.16);
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.4);
  border-left: 3px solid #1976D2;
  font-weight: 700 !important;
}

.sidebar-item .q-item-label {
  font-weight: 600 !important;
  font-size: 0.95rem;
  letter-spacing: 0.1px;
}

/* Zone de contenu */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.component-content {
  flex: 1;
  width: 100%;
  overflow-y: auto;
  padding: 0;
}

/* Contenu placeholder */
.placeholder-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
}

.placeholder-content .text-h6 {
  font-weight: 700 !important;
  letter-spacing: -0.25px;
  margin-bottom: 0.5rem;
}

.placeholder-content .text-body2 {
  font-weight: 500 !important;
  line-height: 1.5;
  max-width: 400px;
}

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Responsive */
@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    max-height: 200px;
    order: 2;
  }

  .content-area {
    order: 1;
    min-height: 400px;
  }

  .card-content .text-h4 {
    font-size: 1.5rem !important;
  }

  .header-title .text-h6 {
    font-size: 1.1rem !important;
  }
}

/* Améliorations typographiques spécifiques */
.font-weight-bold {
  font-weight: 700 !important;
}

.font-weight-medium {
  font-weight: 500 !important;
}

.font-weight-semibold {
  font-weight: 600 !important;
}

/* Couleurs CNPS */
.text-primary {
  color: #1976D2 !important;
}

.text-secondary {
  color: #26A69A !important;
}

/* Effets de survol améliorés */
.q-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
}

/* Amélioration de la lisibilité */
.text-grey-6 {
  color: #666 !important;
}

.text-grey-7 {
  color: #555 !important;
}
</style>
