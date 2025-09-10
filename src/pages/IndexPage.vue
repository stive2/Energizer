<template>
  <q-page class="column flex-center q-pa-md">
    <div v-if="login">
      <LoginAssu />
    </div>

    <div v-else class="column flex-center q-pa-md">
      <div
        class="text-primary q-mb-sm text-center text-bold"
        :class="$q.screen.lt.sm ? 'text-h6' : 'text-h4'"
      >
        {{ t('home.title') }}
      </div>
      <br />
      <div
        class="text-grey-8 q-mb-md text-center text-bold"
        :class="$q.screen.lt.sm ? 'text-subtitle2' : 'text-subtitle1'"
      >
        {{ t('home.description') }}
      </div>
      <div class="q-pa-md row">
        <q-select
          rounded
          outlined
          v-model="typeService"
          use-input
          input-debounce="0"
          :label="$t('home.selectService')"
          :options="options"
          option-label="name"
          @filter="filterFn"
          @update:typeService-value="onTypeServiceSelect"
          style="min-width: 300px; max-width: 500px"
          dense
          behavior="menu"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> {{ $t('home.noResults') }} </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <template v-if="filteredServices.length">
        <!-- Barre de recherche -->
        <q-input
          outlined
          dense
          v-model="search"
          :placeholder="$t('home.searchPlaceholder')"
          class="q-mb-md"
          style="min-width: 400px; max-width: 500px"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <div class="text-subtitle2 text-grey-7 q-mb-md">
          {{ filteredServices.length }} {{ $t('home.foundServices') }}
        </div>

        <!-- Grille de cards -->
        <div class="row q-col-gutter-md q-gutter-y-md q-gutter-x-lg flex-center">
          <!-- Cards pour chaque service "-->
          <q-card
            v-for="service in filteredServices"
            :key="service.id"
            class="col-xs-12 col-sm-6 col-md-4 col-lg-3 shadow-3 hoverable"
            style="transition: transform 0.3s"
            @click="openForm(service)"
            :style="
              $q.screen.gt.sm
                ? {
                    width: '350px',
                    height: '250px',
                    transform: hoverId === service.id ? 'scale(1.03)' : 'scale(1)',
                  }
                : {
                    width: '90%',
                    height: 'auto',
                    transform: hoverId === service.id ? 'scale(1.03)' : 'scale(1)',
                  }
            "
            @mouseover="hoverId = service.id"
            @mouseleave="hoverId = null"
          >
            <q-card-section>
              <q-icon :name="getIcon(service.code)" size="40px" color="primary" class="q-mb-sm" />
              <div class="text-h6 text-primary text-uppercase">{{ $t(service.name) }}</div>
              <div class="text-caption text-grey-7 text-uppercase">
                {{ $t(service.description) }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>
      <template v-else>
        <div class="text-subtitle2 text-center q-my-md">
          {{ $t('home.noServicesFound') }}
        </div>
      </template>

      <!-- Modale de détails -->
      <q-dialog v-model="detailsDialog">
        <q-card class="q-pa-md" style="max-width: 500px">
          <q-card-section>
            <div class="text-h6">Oops</div>
            <div class="text-body1 q-mt-sm">{{ $t('home.sorry') }}</div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Fermer" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Stepper Dialog for Immatriculation Form -->
      <q-dialog v-model="showStepperDialog" persistent>
        <!-- Composant affiché sous condition -->
        <ImmatAssuVol
          v-if="showImmatAssuVol"
          :service="selectedService"
          @close="((showStepperDialog = false), (showImmatAssuVol = false))"
        />
        <ImmatEmpPro
          v-if="showImmatEmpPro"
          :service="selectedService"
          @close="((showStepperDialog = false), (showImmatEmpPro = false))"
        />
        <ImmatEmpDom
          v-if="showImmatEmpDom"
          :service="selectedService"
          @close="((showStepperDialog = false), (showImmatEmpDom = false))"
        />
        <ImmatAssuTrv
          v-if="showImmatAssuTrv"
          :service="selectedService"
          @close="((showStepperDialog = false), (showImmatAssuTrv = false))"
        />
        <ReceptionDossier
          v-if="showReceptionDossier"
          :service="selectedService"
          @close="((showStepperDialog = false), (showReceptionDossier = false))"
        />
        <ReceptionDossierManuel
          v-if="showReceptionDossierManuel"
          :service="selectedService"
          @close="((showStepperDialog = false), (showReceptionDossierManuel = false))"
        />
        <LiquidationRP
          v-if="showLiquidationRP"
          :service="selectedService"
          @close="((showStepperDialog = false), (showLiquidationRP = false))"
        />
        <LiquidationPF
          v-if="formDialogMap.LIQPF.value"
          :service="selectedService"
          @close="
            (() => {
              showStepperDialog = false
              formDialogMap.LIQPF.value = false
            })()
          "
        />
        <Encaissement
          v-if="formDialogMap.CPTCO.value"
          :service="selectedService"
          @close="
            (() => {
              showStepperDialog = false
              formDialogMap.CPTCO.value = false
            })()
          "
        />
      </q-dialog>

      <!-- Dialogue hiérarchique pour Tenue des comptes -->
      <q-dialog v-model="showTenuComptesDialog" persistent>
        <q-card
          class="q-pa-md"
          :style="$q.screen.lt.sm ? 'width: 95vw;' : 'width: 90vw; max-width: 1200px;'"
        >
          <q-card-section class="row items-center q-pb-none">
            <q-btn
              v-if="currentTenuComptesLevel > 0"
              icon="arrow_back"
              flat
              round
              dense
              @click="goBackTenuComptes"
              class="q-mr-sm"
            />
            <div class="text-h6 text-primary">
              <q-icon name="account_balance" class="q-mr-sm" />
              <span v-if="currentTenuComptesLevel === 0"
                >Gestion des encaissements de cotisations</span
              >
              <span v-else>{{ currentTenuComptesComponent?.name }}</span>
            </div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section>
            <!-- Barre outils: compteur + recherche -->
            <div v-if="currentTenuComptesLevel === 0" class="q-mb-md">
              <div class="row items-center q-gutter-md justify-center">
                <q-input
                  outlined
                  dense
                  v-model="tenuComptesSearch"
                  placeholder="Rechercher un composant de gestion des encaissements..."
                  style="max-width: 400px; width: 100%"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                  <template v-slot:append>
                    <q-btn
                      v-if="tenuComptesSearch"
                      flat
                      dense
                      round
                      icon="close"
                      @click="tenuComptesSearch = ''"
                    />
                  </template>
                </q-input>
              </div>
              <div class="text-caption text-grey-7 text-center">
                {{ visibleTenuComptesCount }} composant(s) trouvé(s)
              </div>
            </div>

            <!-- Niveau 0: Composants de tenue des comptes -->
            <div v-if="currentTenuComptesLevel === 0" class="q-gutter-md">
              <div
                class="row q-col-gutter-md justify-center"
                :style="{ maxHeight: dialogContentHeight, overflowY: 'auto' }"
              >
                <q-card
                  v-for="composant in filteredTenuComptesComponents"
                  :key="composant.id"
                  class="q-ma-xs col-12 col-sm-6 col-md-4 col-lg-3 cursor-pointer hoverable q-mb-md"
                  :style="{ borderRadius: '16px' }"
                  @click="selectTenuComptesComponent(composant)"
                >
                  <q-card-section class="text-center">
                    <q-icon :name="composant.icon" size="48px" color="primary" class="q-mb-md" />
                    <div class="text-h6 text-primary">{{ composant.name }}</div>
                    <div class="text-caption text-grey-7">{{ composant.description }}</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Niveau 1: Redirection vers la page appropriée -->
            <div v-if="currentTenuComptesLevel === 1" class="q-gutter-md">
              <div class="text-body2 text-center q-pa-lg">
                <div class="text-h5 text-primary q-mb-md">
                  {{ currentTenuComptesComponent?.description }}
                </div>
                <q-btn
                  color="primary"
                  label="Continuer"
                  @click="navigateToTenuComptesPage"
                  icon="arrow_forward"
                  size="lg"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" v-if="currentTenuComptesLevel > 0">
            <q-btn label="Retour" color="secondary" @click="goBackTenuComptes" icon="arrow_back" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Dialogue hiérarchique pour Liquidation RP -->
      <q-dialog v-model="showLiquidationRPDialog" persistent>
        <q-card
          class="q-pa-md"
          :style="$q.screen.lt.sm ? 'width: 95vw;' : 'width: 90vw; max-width: 1200px;'"
        >
          <q-card-section class="row items-center q-pb-none">
            <q-btn
              v-if="currentLiquidationLevel > 0"
              icon="arrow_back"
              flat
              round
              dense
              @click="goBackLiquidation"
              class="q-mr-sm"
            />
            <div class="text-h6 text-primary">
              <q-icon name="account_balance" class="q-mr-sm" />
              <span v-if="currentLiquidationLevel === 0">Liquidation des dossiers RP</span>
              <span v-else>{{ currentLiquidationComponent?.name }}</span>
            </div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section>
            <!-- Barre outils: compteur + recherche -->
            <div v-if="currentLiquidationLevel === 0" class="q-mb-md">
              <div class="row items-center q-gutter-md justify-center">
                <q-input
                  outlined
                  dense
                  v-model="liquidationSearch"
                  placeholder="Rechercher un composant de liquidation..."
                  style="max-width: 400px; width: 100%"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                  <template v-slot:append>
                    <q-btn
                      v-if="liquidationSearch"
                      flat
                      dense
                      round
                      icon="close"
                      @click="liquidationSearch = ''"
                    />
                  </template>
                </q-input>
              </div>
              <div class="text-caption text-grey-7 text-center">
                {{ visibleLiquidationCount }} composant(s) trouvé(s)
              </div>
            </div>

            <!-- Niveau 0: Composants de liquidation RP -->
            <div v-if="currentLiquidationLevel === 0" class="q-gutter-md">
              <div
                class="row q-col-gutter-md justify-center"
                :style="{ maxHeight: dialogContentHeight, overflowY: 'auto' }"
              >
                <q-card
                  v-for="composant in filteredLiquidationComponents"
                  :key="composant.id"
                  class="q-ma-xs col-12 col-sm-6 col-md-4 col-lg-3 cursor-pointer hoverable q-mb-md"
                  :style="{ borderRadius: '16px' }"
                  @click="selectLiquidationComponent(composant)"
                >
                  <q-card-section class="text-center">
                    <q-icon :name="composant.icon" size="48px" color="primary" class="q-mb-md" />
                    <div class="text-h6 text-primary">{{ composant.name }}</div>
                    <div class="text-caption text-grey-7">{{ composant.description }}</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Niveau 1: Redirection vers la page appropriée -->
            <div v-if="currentLiquidationLevel === 1" class="q-gutter-md">
              <div class="text-body2 text-center q-pa-lg">
                <div class="text-h5 text-primary q-mb-md">
                  {{ currentLiquidationComponent?.description }}
                </div>
                <q-btn
                  color="primary"
                  label="Continuer"
                  @click="navigateToLiquidationPage"
                  icon="arrow_forward"
                  size="lg"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" v-if="currentLiquidationLevel > 0">
            <q-btn label="Retour" color="secondary" @click="goBackLiquidation" icon="arrow_back" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Dialogue hiérarchique pour Gestion des contrôleurs -->
      <q-dialog v-model="showGestionControleursDialog" persistent>
        <q-card
          class="q-pa-md"
          :style="$q.screen.lt.sm ? 'width: 95vw;' : 'width: 90vw; max-width: 1200px;'"
        >
          <q-card-section class="row items-center q-pb-none">
            <q-btn
              v-if="currentLevel > 0"
              icon="arrow_back"
              flat
              round
              dense
              @click="goBack"
              class="q-mr-sm"
            />
            <div class="text-h6 text-primary">
              <q-icon name="security" class="q-mr-sm" />
              <span v-if="currentLevel === 0">Gestion des contrôleurs</span>
              <span v-else-if="currentLevel === 1">{{ currentGroup?.name }}</span>
              <span v-else>{{ currentComponent?.name }}</span>
            </div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section>
            <!-- Barre outils: compteur + recherche (niveaux 0 et 1 sur une même ligne) -->
            <div v-if="currentLevel === 0 || currentLevel === 1" class="q-mb-md">
              <div class="row items-center q-gutter-md justify-center">
                <q-input
                  outlined
                  dense
                  v-model="gcSearch"
                  :placeholder="
                    currentLevel === 0 ? 'Rechercher un groupe…' : 'Rechercher un composant…'
                  "
                  style="max-width: 400px; width: 100%"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                  <template v-slot:append>
                    <q-btn v-if="gcSearch" flat dense round icon="close" @click="gcSearch = ''" />
                  </template>
                </q-input>
              </div>
              <div class="text-caption text-grey-7 text-center">
                {{ visibleCount }} élément(s) trouvé(s)
              </div>
            </div>

            <!-- Niveau 0: Groupes principaux -->
            <div v-if="currentLevel === 0" class="q-gutter-md">
              <div
                class="row q-col-gutter-md justify-center"
                :style="{ maxHeight: dialogContentHeight, overflowY: 'auto' }"
              >
                <q-card
                  v-for="groupe in filteredGroupesControleurs"
                  :key="groupe.id"
                  class="q-ma-xs col-12 col-sm-6 col-md-4 col-lg-3 cursor-pointer hoverable q-mb-md"
                  :style="{ borderRadius: '16px' }"
                  @click="selectGroupe(groupe)"
                >
                  <q-card-section class="text-center">
                    <q-icon :name="groupe.icon" size="48px" color="primary" class="q-mb-md" />
                    <div class="text-h6 text-primary">{{ groupe.name }}</div>
                    <div class="text-caption text-grey-7">{{ groupe.description }}</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Niveau 1: Composants du groupe -->
            <div v-if="currentLevel === 1" class="q-gutter-md">
              <div class="text-h6 q-mb-md text-center text-primary">
                {{ currentGroup?.name }}
              </div>
              <div
                class="row q-col-gutter-md justify-center"
                :style="{ maxHeight: dialogContentHeight, overflowY: 'auto' }"
              >
                <q-card
                  v-for="composant in filteredComposants"
                  :key="composant.id"
                  class="q-ma-xs col-12 col-sm-6 col-md-4 col-lg-3 cursor-pointer hoverable q-mb-md"
                  :style="{ borderRadius: '16px' }"
                  @click="selectComposant(composant)"
                >
                  <q-card-section class="text-center">
                    <q-icon :name="composant.icon" size="48px" color="primary" class="q-mb-md" />
                    <div class="text-h6 text-primary">{{ composant.name }}</div>
                    <div class="text-caption text-grey-7">{{ composant.description }}</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Niveau 2: Redirection vers la page appropriée -->
            <div v-if="currentLevel === 2" class="q-gutter-md">
              <div class="text-body2 text-center q-pa-lg">
                <div class="text-h5 text-primary q-mb-md">
                  {{ currentComponent?.description }}
                </div>
                <q-btn
                  color="primary"
                  label="Continuer"
                  @click="navigateToComponentPage"
                  icon="arrow_forward"
                  size="lg"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" v-if="currentLevel > 0">
            <q-btn label="Retour" color="secondary" @click="goBack" icon="arrow_back" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ImmatEmpPro from 'components/ImmatEmpPro.vue'
import ImmatEmpDom from 'components/ImmatEmpDom.vue'
import ImmatAssuTrv from 'components/ImmatAssuTrv.vue'
import ImmatAssuVol from 'components/ImmatAssuVol.vue'
import ReceptionDossier from 'components/ReceptionDossier.vue'
import ReceptionDossierManuel from 'components/ReceptionDossierManuel.vue'
import LiquidationRP from 'components/LiquidationRP.vue'
import LiquidationPF from 'components/liquidationPF/LiquidationPF.vue'
import Encaissement from 'components/tenuCmptes/Encaissement.vue'
import { useNotify } from 'components/useNotify.js'
import LoginAssu from 'components/logins/LoginAssu.vue'
import { useRouter } from 'vue-router'
// import axios from 'axios' onMounted notifySuccess, notifyError, notifyWarning, notifyInfo

const { t } = useI18n()

const { notifyWarning } = useNotify()
const router = useRouter()

const hoverId = ref(null)
const search = ref('')
const detailsDialog = ref(false)
const selectedService = ref(null)
const showImmatEmpPro = ref(false)
const showImmatEmpDom = ref(false)
const showImmatAssuTrv = ref(false)
const showImmatAssuVol = ref(false)
const showReceptionDossier = ref(false)
const showReceptionDossierManuel = ref(false)
const showLiquidationRP = ref(false)

const login = ref(false)

// Variables pour le dialogue hiérarchique des contrôleurs
const showGestionControleursDialog = ref(false)
const currentLevel = ref(0)
const currentGroup = ref(null)
const currentComponent = ref(null)
const gcSearch = ref('')

// Variables pour le dialogue hiérarchique de liquidation RP
const showLiquidationRPDialog = ref(false)
const currentLiquidationLevel = ref(0)
const currentLiquidationComponent = ref(null)
const liquidationSearch = ref('')

// Variables pour le dialogue hiérarchique de tenue des comptes
const showTenuComptesDialog = ref(false)
const currentTenuComptesLevel = ref(0)
const currentTenuComptesComponent = ref(null)
const tenuComptesSearch = ref('')

// Structure des composants de tenue des comptes
const tenuComptesComponents = [
  {
    id: 1,
    name: 'Enregistrement encaissement',
    description: 'Enregistrer un nouvel encaissement',
    code: 'ENREGISTREMENT_ENCAISSEMENT',
    icon: 'add_circle',
  },
  {
    id: 2,
    name: 'Saisie encaissement',
    description: "Saisir les détails d'un encaissement",
    code: 'SAISIE_ENCAISSEMENT',
    icon: 'edit',
  },
  {
    id: 3,
    name: 'Suppression encaissement',
    description: 'Supprimer un encaissement existant',
    code: 'SUPPRESSION_ENCAISSEMENT',
    icon: 'delete',
  },
  {
    id: 4,
    name: 'Validation encaissement',
    description: 'Valider un encaissement',
    code: 'VALIDATION_ENCAISSEMENT',
    icon: 'verified',
  },
]

// Structure des composants de liquidation RP
const liquidationComponents = [
  {
    id: 1,
    name: 'Saisie du dossier',
    description: 'Saisir les informations du dossier de retraite',
    code: 'SAISIE_DOSSIER_RP',
    icon: 'edit',
  },
  {
    id: 2,
    name: 'Calcul de pension',
    description: 'Calculer la pension de retraite',
    code: 'CALCUL_PENSION',
    icon: 'calculate',
  },
  {
    id: 3,
    name: 'Validation du dossier',
    description: 'Valider le dossier de liquidation',
    code: 'VALIDATION_DOSSIER',
    icon: 'verified',
  },
  {
    id: 4,
    name: 'Génération arrêté',
    description: "Générer l'arrêté de liquidation",
    code: 'GENERATION_ARRETE',
    icon: 'description',
  },
  {
    id: 5,
    name: 'Notification bénéficiaire',
    description: 'Notifier le bénéficiaire',
    code: 'NOTIFICATION_BENEFICIAIRE',
    icon: 'notifications',
  },
  {
    id: 6,
    name: 'Archivage du dossier',
    description: 'Archiver le dossier traité',
    code: 'ARCHIVAGE_DOSSIER',
    icon: 'archive',
  },
]

// Structure des groupes de contrôleurs
const groupesControleurs = [
  {
    id: 2,
    name: 'Gestion des résultats de contrôle',
    description: 'Gérer les résultats des contrôles effectués',
    icon: 'assessment',
    composants: [
      {
        id: 4,
        name: 'Saisie des résultats',
        description: 'Saisir les résultats des contrôles',
        code: 'SAISIE_RESULTATS',
        icon: 'edit_note',
      },
      {
        id: 5,
        name: 'Modification des rapports',
        description: 'Modifier les rapports de contrôle existants',
        code: 'MOD_RAPPORT_CTRLE',
        icon: 'edit_document',
      },
      {
        id: 6,
        name: 'Validation des rapports',
        description: 'Valider les rapports de contrôle',
        code: 'VALID_RAPPORT_CTRLE',
        icon: 'verified',
      },
    ],
  },
  {
    id: 1,
    name: 'Gestion des mises en demeure',
    description: 'Gérer les mises en demeure des entreprises',
    icon: 'warning',
    composants: [
      {
        id: 1,
        name: 'Saisie des mises en demeure',
        description: 'Créer et saisir de nouvelles mises en demeure',
        code: 'SAISIE_MISE_DEMEURE',
        icon: 'edit',
      },
      {
        id: 2,
        name: 'Validation des mises en demeure',
        description: 'Valider les mises en demeure saisies',
        code: 'VALID_MISE_DEMEURE',
        icon: 'check_circle',
      },
      {
        id: 3,
        name: 'Annulation des mises en demeure',
        description: 'Annuler des mises en demeure existantes',
        code: 'ANNULE_MISE_DEMEURE',
        icon: 'cancel',
      },
    ],
  },
]

// List of CNPS services
const typesServices = [
  {
    id: 1,
    name: 'Immatriculation / Registration',
    code: 'IMMAT',
    services: [
      {
        id: 1,
        name: 'services.immep.name',
        description: 'services.immep.description',
        code: 'IMMEP',
      },
      {
        id: 2,
        name: 'services.immed.name',
        description: 'services.immed.description',
        code: 'IMMED',
      },
      {
        id: 3,
        name: 'services.immat.name',
        description: 'services.immat.description',
        code: 'IMMAT',
      },
      {
        id: 4,
        name: 'services.immav.name',
        description: 'services.immav.description',
        code: 'IMMAV',
      },
    ],
  },
  {
    id: 2,
    name: 'Formulaire Energizer / Energizer Form',
    code: 'ENERG',
    services: [
      {
        id: 1,
        name: 'services.form1.name',
        description: 'services.form1.description',
        code: 'FORM1',
      },
      {
        id: 2,
        name: 'services.form3.name',
        description: 'services.form3.description',
        code: 'FORM3',
      },
      {
        id: 3,
        name: 'services.form2.name',
        description: 'services.form2.description',
        code: 'FORM2',
      },
      {
        id: 3,
        name: 'services.liqpf.name',
        description: 'services.liqpf.description',
        code: 'LIQPF',
      },
      {
        id: 4,
        name: 'Tenue des comptes Cotisants',
        description: 'services.cptco.description',
        code: 'CPTCO',
      },
      {
        id: 5,
        name: 'Gestion des controleurs',
        description: 'services.cptco.description',
        code: 'GECTR',
      },
    ],
  },
  {
    id: 3,
    name: 'Dépôt des dossiers de prestations',
    code: 'PRESTASSU',
    services: [
      {
        id: 1,
        name: 'services.prestassu.name',
        description: 'services.prestassu.description',
        code: 'PRESTASSU',
      },
    ],
  },
]

// Reactive variables
const options = ref(typesServices)

const showStepperDialog = ref(false)

const typeService = ref({
  name: '',
  code: '',
  services: ref([]),
})

// Function to filter services based on user input
const filterFn = (val, update) => {
  if (val === '') {
    update(() => {
      options.value = typesServices
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    options.value = typesServices.filter((v) => v.toLowerCase().indexOf(needle) > -1)
  })
}

// Function called when a service is selected
const onTypeServiceSelect = (value) => {
  console.log('Service sélectionné :', value)
}

const filteredServices = computed(() => {
  const servicesList = typeService.value?.services || []
  return servicesList.filter(
    (service) =>
      service.name.toLowerCase().includes(search.value.toLowerCase()) ||
      service.description.toLowerCase().includes(search.value.toLowerCase()),
  )
})

/* const openDetails = (service) => {
  selectedService.value = service
  detailsDialog.value = true
} */

const formDialogMap = {
  IMMEP: showImmatEmpPro,
  IMMED: showImmatEmpDom,
  IMMAV: showImmatAssuVol,
  IMMAT: showImmatAssuTrv,
  FORM1: showReceptionDossier,
  FORM3: showReceptionDossierManuel,
  FORM2: showLiquidationRP,
  LIQPF: ref(false),
  CPTCO: ref(false), // Ajout pour la gestion du nouveau service
}

const openForm = (service) => {
  selectedService.value = service

  if (selectedService.value.code === 'PRESTASSU') {
    router.push('/user/depot-dossier')
  } else if (selectedService.value.code === 'LIQPF') {
    formDialogMap.LIQPF.value = true
    showStepperDialog.value = true
  } else if (selectedService.value.code === 'GECTR') {
    // Ouvrir le dialogue hiérarchique pour la gestion des contrôleurs
    showGestionControleursDialog.value = true
    resetNavigation()
    gcSearch.value = ''
  } else if (selectedService.value.code === 'FORM2') {
    // Ouvrir le dialogue hiérarchique pour la liquidation RP
    showLiquidationRPDialog.value = true
    resetLiquidationNavigation()
    liquidationSearch.value = ''
  } else if (selectedService.value.code === 'CPTCO') {
    // Ouvrir le dialogue hiérarchique pour la tenue des comptes
    showTenuComptesDialog.value = true
    resetTenuComptesNavigation()
    tenuComptesSearch.value = ''
  } else {
    const dialogRef = formDialogMap[service.code]

    if (dialogRef) {
      dialogRef.value = true
      showStepperDialog.value = true
    } else {
      notifyWarning('Formulaire non disponible pour le moment.')
    }
  }
}

// Fonctions de navigation pour le dialogue hiérarchique des contrôleurs
const resetNavigation = () => {
  currentLevel.value = 0
  currentGroup.value = null
  currentComponent.value = null
  gcSearch.value = ''
}

// Fonctions de navigation pour le dialogue hiérarchique de liquidation RP
const resetLiquidationNavigation = () => {
  currentLiquidationLevel.value = 0
  currentLiquidationComponent.value = null
  liquidationSearch.value = ''
}

// Fonctions de navigation pour le dialogue hiérarchique de tenue des comptes
const resetTenuComptesNavigation = () => {
  currentTenuComptesLevel.value = 0
  currentTenuComptesComponent.value = null
  tenuComptesSearch.value = ''
}

const selectGroupe = (groupe) => {
  currentGroup.value = groupe
  currentLevel.value = 1
  gcSearch.value = ''
}

const selectComposant = (composant) => {
  currentComponent.value = composant
  currentLevel.value = 2
}

const selectLiquidationComponent = (composant) => {
  currentLiquidationComponent.value = composant
  currentLiquidationLevel.value = 1
}

const selectTenuComptesComponent = (composant) => {
  currentTenuComptesComponent.value = composant
  currentTenuComptesLevel.value = 1
}

// removed goToLevel after breadcrumb navigation was simplified

const goBack = () => {
  if (currentLevel.value > 0) {
    currentLevel.value--
    if (currentLevel.value === 0) {
      currentGroup.value = null
      currentComponent.value = null
    } else if (currentLevel.value === 1) {
      currentComponent.value = null
    }
  }
}

const goBackLiquidation = () => {
  if (currentLiquidationLevel.value > 0) {
    currentLiquidationLevel.value--
    if (currentLiquidationLevel.value === 0) {
      currentLiquidationComponent.value = null
    }
  }
}

const goBackTenuComptes = () => {
  if (currentTenuComptesLevel.value > 0) {
    currentTenuComptesLevel.value--
    if (currentTenuComptesLevel.value === 0) {
      currentTenuComptesComponent.value = null
    }
  }
}

const navigateToComponentPage = () => {
  if (currentComponent.value) {
    // Fermer le dialogue
    showGestionControleursDialog.value = false

    // Rediriger vers la page appropriée selon le groupe
    if (currentGroup.value?.id === 1) {
      // Gestion des mises en demeure
      router.push({
        path: '/gestion-controleurs/mise-demeure',
        query: {
          component: currentComponent.value.code,
          componentName: currentComponent.value.name,
        },
      })
    } else if (currentGroup.value?.id === 2) {
      // Gestion des résultats de contrôle
      router.push({
        path: '/gestion-controleurs/resultat-controle',
        query: {
          component: currentComponent.value.code,
          componentName: currentComponent.value.name,
        },
      })
    }
  }
}

const navigateToLiquidationPage = () => {
  if (currentLiquidationComponent.value) {
    // Fermer le dialogue
    showLiquidationRPDialog.value = false

    // Rediriger vers la page de gestion de liquidation RP
    router.push({
      path: '/liquidations/liquidationRP/gestionLiquidationRP',
      query: {
        component: currentLiquidationComponent.value.code,
        componentName: currentLiquidationComponent.value.name,
      },
    })
  }
}

const navigateToTenuComptesPage = () => {
  if (currentTenuComptesComponent.value) {
    // Fermer le dialogue
    showTenuComptesDialog.value = false

    // Rediriger vers la page de gestion de tenue des comptes
    router.push({
      path: '/tenu-comptes/gestionTenuCmpt',
      query: {
        component: currentTenuComptesComponent.value.code,
        componentName: currentTenuComptesComponent.value.name,
      },
    })
  }
}

const getIcon = (code) => {
  switch (code) {
    case 'IMMEP':
      return 'work_outline'
    case 'IMMED':
      return 'home_repair_service'
    case 'IMMAV':
      return 'person_add_alt_1'
    case 'IMMAT':
      return 'engineering'
    case 'FORM1':
      return 'folder'
    case 'FORM3':
      return 'folder'
    case 'FORM2':
      return 'warning_amber'
    case 'PRESTASSU':
      return 'note_add'
    case 'LIQPF':
      return 'calculate'
    case 'CPTCO':
      return 'account_balance'
    case 'GECTR':
      return 'security'
    default:
      return 'info'
  }
}

// Filtres et hauteur dynamique pour le dialogue Gestion des contrôleurs
const filteredGroupesControleurs = computed(() => {
  const term = (gcSearch.value || '').toLowerCase().trim()
  if (!term) return groupesControleurs
  return groupesControleurs.filter((g) =>
    [g.name, g.description].some((v) => (v || '').toLowerCase().includes(term)),
  )
})

const filteredComposants = computed(() => {
  const term = (gcSearch.value || '').toLowerCase().trim()
  const list = currentGroup.value?.composants || []
  if (!term) return list
  return list.filter((c) =>
    [c.name, c.description].some((v) => (v || '').toLowerCase().includes(term)),
  )
})

const visibleCount = computed(() => {
  if (currentLevel.value === 0) return filteredGroupesControleurs.value.length
  if (currentLevel.value === 1) return filteredComposants.value.length
  return 0
})

const dialogContentHeight = computed(() => {
  const perItem = 200 // hauteur approximative d'une card + marges (augmentée)
  const viewport = typeof window !== 'undefined' ? window.innerHeight : 800
  const maxAvail = Math.max(400, viewport - 200) // laisser de la place pour l'entête et actions (hauteur augmentée)
  const desired = Math.min(visibleCount.value * perItem, maxAvail)
  return `${desired}px`
})

// Filtres pour le dialogue de liquidation RP
const filteredLiquidationComponents = computed(() => {
  const term = (liquidationSearch.value || '').toLowerCase().trim()
  if (!term) return liquidationComponents
  return liquidationComponents.filter((c) =>
    [c.name, c.description].some((v) => (v || '').toLowerCase().includes(term)),
  )
})

const visibleLiquidationCount = computed(() => {
  return filteredLiquidationComponents.value.length
})

// Filtres pour le dialogue de tenue des comptes
const filteredTenuComptesComponents = computed(() => {
  const term = (tenuComptesSearch.value || '').toLowerCase().trim()
  if (!term) return tenuComptesComponents
  return tenuComptesComponents.filter((c) =>
    [c.name, c.description].some((v) => (v || '').toLowerCase().includes(term)),
  )
})

const visibleTenuComptesCount = computed(() => {
  return filteredTenuComptesComponents.value.length
})
</script>

<style scoped>
.q-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  background-color: ghostwhite;
}
</style>
