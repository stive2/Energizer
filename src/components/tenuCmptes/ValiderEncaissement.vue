<template>
  <q-page class="q-pa-sm">
    <q-card class="main-card">
      <!-- Header du formulaire -->
      <q-card-section class="bg-primary text-white q-pa-sm">
        <div class="text-h6 font-weight-bold text-center">
          {{ $t('labels.formulaireModificationValidation') }}
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-sm">
        <q-form @submit="onSubmit" class="q-gutter-sm ve-form">

          <!-- Section 1: Choix de l'action -->
          <q-card flat bordered class="section-card">
            <q-card-section class="q-pa-sm">
              <div class="text-h6 text-primary q-mb-sm">
                <q-icon name="settings" class="q-mr-sm" />
                {{ $t('labels.choixAction') }}
              </div>
              <div class="row q-gutter-xs justify-start items-center">
                <div class="col-auto">
                  <q-radio v-model="formData.action" val="correction" :label="$t('labels.correctionSaisies')" color="primary" dense />
                </div>
                <div class="col-auto">
                  <q-radio v-model="formData.action" val="validation" :label="$t('labels.validationSaisies')" color="positive" dense />
                </div>
                <div class="col-auto">
                  <q-radio v-model="formData.action" val="devalidation" :label="$t('labels.devalidationSaisies')" color="warning" dense />
                </div>
                <div class="col-auto">
                  <q-radio v-model="formData.action" val="validationDefinitive" :label="$t('labels.validationDefinitive')" color="positive" dense />
                </div>
                <div class="col-auto">
                  <q-radio v-model="formData.action" val="generation" :label="$t('labels.generation')" color="info" dense />
                </div>
                <div class="col-auto">
                  <q-radio v-model="formData.action" val="edition" :label="$t('labels.edition')" color="accent" dense />
                </div>
                <div class="col-auto">
                  <q-radio v-model="formData.action" val="export" :label="$t('labels.exportTransmission')" color="secondary" dense />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Section 2: Critères de sélection par période de saisie -->
          <q-expansion-item
            icon="schedule"
            :label="$t('labels.criteresSelectionPeriodeSaisie')"
            header-class="text-primary"
            class="section-card"
            default-opened
          >
            <q-card flat>
              <q-card-section class="q-pa-sm">
                <div class="row q-gutter-xs justify-center">
                  <div class="col-auto ve-field">
                    <q-input
                      v-model="formData.debutPeriodeSaisie"
                      :label="$t('labels.debutPeriodeSaisie')"
                      outlined
                      dense
                      size="sm"
                      class="field-input ve-input"
                      :rules="[val => !!val || 'Date de début requise']"
                      readonly
                    >
                      <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer" color="primary">
                          <q-popup-proxy transition-show="scale" transition-hide="scale">
                            <q-date
                              v-model="formData.debutPeriodeSaisie"
                              :mask="'DD/MM/YYYY'"
                              color="primary"
                            />
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>
                  <div class="col-auto ve-field">
                    <q-input
                      v-model="formData.finPeriodeSaisie"
                      :label="$t('labels.finPeriodeSaisie')"
                      outlined
                      dense
                      size="sm"
                      class="field-input ve-input"
                      :rules="[val => !!val || 'Date de fin requise']"
                      readonly
                    >
                      <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer" color="primary">
                          <q-popup-proxy transition-show="scale" transition-hide="scale">
                            <q-date
                              v-model="formData.finPeriodeSaisie"
                              :mask="'DD/MM/YYYY'"
                              color="primary"
                            />
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- Section 3: Critères de sélection par période de paiement -->
          <q-expansion-item
            icon="payment"
            :label="$t('labels.criteresSelectionPeriodePaiement')"
            header-class="text-primary"
            class="section-card"
          >
            <q-card flat>
              <q-card-section class="q-pa-sm">
                <div class="row q-gutter-xs justify-center">
                  <div class="col-auto ve-field">
                    <q-input
                      v-model="formData.debutPeriodePaiement"
                      :label="$t('labels.debutPeriodePaiement')"
                      outlined
                      dense
                      size="sm"
                      class="field-input ve-input"
                      readonly
                    >
                      <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer" color="primary">
                          <q-popup-proxy transition-show="scale" transition-hide="scale">
                            <q-date
                              v-model="formData.debutPeriodePaiement"
                              :mask="'DD/MM/YYYY'"
                              color="primary"
                            />
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>
                  <div class="col-auto ve-field">
                    <q-input
                      v-model="formData.finPeriodePaiement"
                      :label="$t('labels.finPeriodePaiement')"
                      outlined
                      dense
                      size="sm"
                      class="field-input ve-input"
                      readonly
                    >
                      <template v-slot:append>
                        <q-icon name="event" class="cursor-pointer" color="primary">
                          <q-popup-proxy transition-show="scale" transition-hide="scale">
                            <q-date
                              v-model="formData.finPeriodePaiement"
                              :mask="'DD/MM/YYYY'"
                              color="primary"
                            />
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- Section 4: Critères de sélection employeur, utilisateur et/ou par banque -->
          <q-expansion-item
            icon="business"
            :label="$t('labels.criteresSelectionEmployeur')"
            header-class="text-primary"
            class="section-card"
            default-opened
          >
            <q-card flat>
              <q-card-section class="q-pa-sm">
                <div class="row q-gutter-xs justify-center">
                  <div class="col-auto ve-field">
                    <q-input
                      v-model="formData.matriculeEmployeur"
                      outlined
                      dense
                      size="sm"
                      :label="$t('labels.matriculeEmployeur')"
                      class="field-input ve-input"
                      clearable
                    />
                  </div>
                  <div class="col-auto ve-field">
                    <q-select
                      v-model="formData.utilisateur"
                      outlined
                      dense
                      size="sm"
                      :options="utilisateurOptions"
                      :label="$t('labels.utilisateur')"
                      class="field-input ve-input"
                      clearable
                      use-input
                      input-debounce="0"
                      new-value-mode="add-unique"
                    />
                  </div>
                  <div class="col-auto ve-field">
                    <q-select
                      v-model="formData.banque"
                      outlined
                      dense
                      size="sm"
                      :options="banqueOptions"
                      :label="$t('labels.banque')"
                      class="field-input ve-input"
                      clearable
                      use-input
                      input-debounce="0"
                      new-value-mode="add-unique"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- Section 5: Montant total -->
          <q-card flat bordered class="section-card">
            <q-card-section class="q-pa-sm">
              <div class="text-h6 text-primary q-mb-sm">
                <q-icon name="attach_money" class="q-mr-sm" />
                {{ $t('labels.montantTotal') }}
              </div>
              <div class="row q-gutter-xs justify-start">
                <div class="col-auto ve-field">
                  <q-input
                    v-model.number="formData.montantTotal"
                    outlined
                    dense
                    size="sm"
                    :label="$t('labels.montantTotal')"
                    type="number"
                    class="field-input ve-input"
                    prefix="FCFA"
                    readonly
                    :value="calculerMontantTotal"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Section 6: Encaissements concernés -->
          <div class="section-container">
            <div class="section-title q-mb-md">
              <q-icon name="table_chart" class="q-mr-sm" />
              Encaissements concernés
            </div>

            <!-- Filtres de recherche

            <div class="row q-gutter-sm q-mb-md justify-center">
              <div class="col-12 col-sm-6 col-md-3">
                <q-input
                  v-model="filtres.recherche"
                  outlined
                  dense
                  label="Rechercher..."
                  class="q-mb-md field-input"
                  clearable
                >
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-select
                  v-model="filtres.statut"
                  outlined
                  dense
                  :options="statutOptions"
                  label="Statut"
                  class="q-mb-md field-input"
                  clearable
                />
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-btn
                  color="primary"
                  icon="refresh"
                  label="Actualiser"
                  @click="actualiserGrille"
                  class="q-mb-md field-input"
                  dense
                />
              </div>
            </div>
          -->
            <!-- Tableau des encaissements -->
            <q-table
              :rows="encaissementsFiltres"
              :columns="columns"
              row-key="id"
              :pagination="{ rowsPerPage: 10, rowsPerPageOptions: [5, 10, 20, 50] }"
              :filter="filtres.recherche"
              class="encaissements-table"
              :loading="loading"
              :loading-label="$t('labels.chargementDonnees')"
              :no-data-label="$t('labels.aucunEncaissement')"
            >
              <!-- Colonne avec checkboxes -->
              <template v-slot:header-selection="scope">
                <q-checkbox
                  :model-value="scope.selected"
                  @update:model-value="scope.selected = $event"
                  color="primary"
                />
              </template>

              <!-- Colonne actions -->
              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="edit"
                    size="sm"
                    @click="editerEncaissement(props.row)"
                    title="Éditer"
                  />
                  <q-btn
                    flat
                    round
                    color="warning"
                    icon="delete"
                    size="sm"
                    @click="supprimerEncaissement(props.row)"
                    title="Supprimer"
                  />
                </q-td>
              </template>

              <!-- Colonne statut -->
              <template v-slot:body-cell-statut="props">
                <q-td :props="props">
                  <q-chip
                    :color="getStatutColor(props.row.statut)"
                    text-color="white"
                    size="sm"
                    :label="props.row.statut"
                  />
                </q-td>
              </template>

              <!-- Colonne montant -->
              <template v-slot:body-cell-montant="props">
                <q-td :props="props">
                  <span class="text-weight-bold">{{ formatMontant(props.row.montant) }}</span>
                </q-td>
              </template>
            </q-table>

            <!-- Bouton Show Preview -->
            <div class="q-mt-md text-center">
              <q-btn
                color="secondary"
                icon="preview"
                :label="$t('labels.showPreview')"
                @click="showPreview"
                size="md"
              />
            </div>
          </div>

          <!-- Section 7: Renseignements pour mise à jour en crédit -->
          <q-expansion-item
            icon="credit_card"
            :label="$t('labels.renseignementsMiseCredit')"
            header-class="text-primary"
            class="section-container"
            default-opened
          >
            <div class="row q-gutter-sm q-pa-md justify-center">
              <div class="col-12 col-sm-6 col-md-3">
                <q-input
                  v-model="formData.nBulletinEmission"
                  outlined
                  dense
                  :label="$t('labels.numeroBulletinEmission')"
                  class="q-mb-md field-input"
                  clearable
                />
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-input
                  v-model="formData.periodeConcernee"
                  outlined
                  dense
                  :label="$t('labels.periodeConcernee')"
                  class="q-mb-md field-input"
                  clearable
                />
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-input
                  v-model.number="formData.montantPaye"
                  outlined
                  dense
                  :label="$t('labels.montantPaye')"
                  type="number"
                  class="q-mb-md field-input"
                  prefix="FCFA"
                />
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-input
                  v-model="formData.referenceTitrePaiement"
                  outlined
                  dense
                  :label="$t('labels.referenceTitrePaiementLabel')"
                  class="q-mb-md field-input"
                  clearable
                />
              </div>
            </div>
            <div class="row q-gutter-sm q-pa-md justify-center">
              <div class="col-12 col-sm-6 col-md-3">
                <q-input
                  v-model="formData.dateEffectivePaiement"
                  :label="$t('labels.dateEffectivePaiementLabel')"
                  outlined
                  dense
                  class="q-mb-md field-input"
                  readonly
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="formData.dateEffectivePaiement"
                          :mask="'DD/MM/YYYY'"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-input
                  v-model="formData.dateComptable"
                  :label="$t('labels.dateComptable')"
                  outlined
                  dense
                  class="q-mb-md field-input"
                  readonly
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer" color="primary">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="formData.dateComptable"
                          :mask="'DD/MM/YYYY'"
                          color="primary"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>
            <div class="row q-gutter-sm q-pa-md justify-center">
              <div class="col-12 col-sm-6 col-md-3">
                <q-input
                  v-model="formData.numeroQuittance"
                  outlined
                  dense
                  :label="$t('labels.numeroQuittanceLabel')"
                  class="q-mb-md field-input"
                  clearable
                />
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-select
                  v-model="formData.modePaiement"
                  outlined
                  dense
                  :options="modePaiementOptions"
                  :label="$t('labels.modePaiementLabel')"
                  class="q-mb-md field-input"
                  clearable
                />
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-select
                  v-model="formData.imputationComptable"
                  outlined
                  dense
                  :options="imputationOptions"
                  :label="$t('labels.imputationComptableLabel')"
                  class="q-mb-md field-input"
                  clearable
                />
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <q-btn
                  color="warning"
                  icon="edit"
                  :label="$t('labels.corrigerLigne')"
                  @click="corrigerLigne"
                  class="q-mb-md field-input"
                  dense
                />
              </div>
            </div>
          </q-expansion-item>

          <!-- Section 8: Boutons d'actions -->
          <div class="section-container">
            <div class="section-title q-mb-md">
              <q-icon name="build" class="q-mr-sm" />
              Actions
            </div>
            <div class="row q-gutter-xs justify-center actions-row">
              <div class="col-auto">
                <q-btn
                  color="secondary"
                  icon="refresh"
                  :label="$t('labels.actualiserGrille')"
                  @click="actualiserGrille"
                  class="q-mx-xs"
                  dense
                />
              </div>
              <div class="col-auto">
                <q-btn
                  color="positive"
                  icon="check_circle"
                  :label="$t('labels.validerDevalider')"
                  @click="validerDevalider"
                  class="q-mx-xs"
                  dense
                />
              </div>
              <div class="col-auto">
                <q-btn
                  color="warning"
                  icon="clear"
                  :label="$t('labels.viderFormulaire')"
                  @click="viderFormulaire"
                  class="q-mx-xs"
                  dense
                />
              </div>
              <div class="col-auto">
                <q-btn
                  color="info"
                  icon="receipt"
                  :label="$t('labels.genererQuittances')"
                  @click="genererQuittances"
                  class="q-mx-xs"
                  dense
                />
              </div>
              <div class="col-auto">
                <q-btn
                  color="accent"
                  icon="print"
                  :label="$t('labels.editerQuittances')"
                  @click="editerQuittances"
                  class="q-mx-xs"
                  dense
                />
              </div>
              <div class="col-auto">
                <q-btn
                  color="primary"
                  icon="send"
                  :label="$t('labels.transmettreQuittance')"
                  @click="transmettreQuittance"
                  class="q-mx-xs"
                  dense
                />
              </div>
            </div>
          </div>

          <!-- Section 9: Statut -->
          <div class="section-container">
            <div class="row q-gutter-md">
              <div class="col-12">
                <q-banner class="bg-info text-white">
                  <template v-slot:avatar>
                    <q-icon name="info" />
                  </template>
                  Prêt pour un nouvel enregistrement...
                </q-banner>
              </div>
            </div>
          </div>

        </q-form>
      </q-card-section>
    </q-card>

    <!-- Dialog de confirmation -->
    <q-dialog v-model="showConfirmDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="warning" text-color="white" />
          <span class="q-ml-sm">{{ confirmMessage }}</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('labels.annuler')" color="primary" v-close-popup />
          <q-btn flat :label="$t('labels.confirmer')" color="negative" @click="confirmAction" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog de preview -->
    <q-dialog v-model="showPreviewDialog" maximized>
      <q-card>
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Prévisualisation des données</div>
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>
        <q-card-section>
          <div class="text-body1">
            <p><strong>Action sélectionnée:</strong> {{ formData.action }}</p>
            <p><strong>Période:</strong> {{ formData.debutPeriodeSaisie }} - {{ formData.finPeriodeSaisie }}</p>
            <p><strong>Nombre d'encaissements:</strong> {{ encaissementsFiltres.length }}</p>
            <p><strong>Montant total:</strong> {{ formatMontant(calculerMontantTotal) }}</p>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

// Instance Quasar
const $q = useQuasar()
const { t: $t } = useI18n()

// État du composant
const loading = ref(false)
const showConfirmDialog = ref(false)
const showPreviewDialog = ref(false)
const confirmMessage = ref('')
const actionToConfirm = ref(null)

// Données du formulaire
const formData = ref({
  action: 'correction',
  debutPeriodeSaisie: '',
  finPeriodeSaisie: '',
  debutPeriodePaiement: '',
  finPeriodePaiement: '',
  matriculeEmployeur: '',
  utilisateur: null,
  banque: null,
  montantTotal: 0,
  nBulletinEmission: '',
  periodeConcernee: '',
  montantPaye: 0,
  referenceTitrePaiement: '',
  dateEffectivePaiement: '',
  dateComptable: '',
  numeroQuittance: '',
  modePaiement: null,
  imputationComptable: null
})

// Filtres
const filtres = ref({
  recherche: '',
  statut: null
})

// Options pour les selects
const utilisateurOptions = ref([
  'ADJOMO PAULINE',
  'KAMGA JEAN',
  'FOTSO MARIE',
  'TCHOKOUANI PIERRE',
  'NDJENG ALICE'
])

const banqueOptions = ref([
  'BICEC',
  'SGBC',
  'AFC',
  'ECOBANK',
  'UBA',
  'BGF',
  'Commercial Bank'
])

const modePaiementOptions = ref([
  'Espèces',
  'Chèque',
  'Virement bancaire',
  'Carte bancaire',
  'Prélèvement automatique'
])

const imputationOptions = ref([
  'Banque Centrale',
  'Collecteur Principal',
  'Collecteur Secondaire',
  'Agence Régionale'
])

/* const statutOptions = ref([
  'En attente',
  'Validé',
  'Dévalidé',
  'En cours de traitement',
  'Terminé'
]) */

// Colonnes du tableau (réactives à i18n)
const columns = computed(() => ([
  {
    name: 'selection',
    label: '',
    field: 'selection',
    align: 'left',
    sortable: false,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'nEmployeur',
    label: $t('labels.numeroEmployeurShortCol'),
    field: 'nEmployeur',
    align: 'left',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'raisonSociale',
    label: $t('labels.raisonSocialeCol'),
    field: 'raisonSociale',
    align: 'left',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'periode',
    label: $t('labels.periode'),
    field: 'periode',
    align: 'center',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'rubrique',
    label: $t('labels.rubrique'),
    field: 'rubrique',
    align: 'left',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'quittance',
    label: $t('labels.quittance'),
    field: 'quittance',
    align: 'left',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'nPiece',
    label: $t('labels.nPiece'),
    field: 'nPiece',
    align: 'left',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'dateDeclaration',
    label: $t('labels.dateDeclaration'),
    field: 'dateDeclaration',
    align: 'center',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'mode',
    label: $t('labels.mode'),
    field: 'mode',
    align: 'center',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'nature',
    label: $t('labels.nature'),
    field: 'nature',
    align: 'left',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'montant',
    label: $t('labels.montant'),
    field: 'montant',
    align: 'right',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'banque',
    label: $t('labels.banque'),
    field: 'banque',
    align: 'left',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'utilisateur',
    label: $t('labels.utilisateur'),
    field: 'utilisateur',
    align: 'left',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'dateSaisie',
    label: $t('labels.dateSaisie'),
    field: 'dateSaisie',
    align: 'center',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'val1',
    label: $t('labels.val1'),
    field: 'val1',
    align: 'center',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'val2',
    label: $t('labels.val2'),
    field: 'val2',
    align: 'center',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'dateQuittance',
    label: $t('labels.dateQuittance'),
    field: 'dateQuittance',
    align: 'center',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'origine',
    label: $t('labels.origine'),
    field: 'origine',
    align: 'left',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'email',
    label: $t('labels.email'),
    field: 'email',
    align: 'left',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'quittanceStatus',
    label: $t('labels.quittanceStatus'),
    field: 'quittanceStatus',
    align: 'center',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'statut',
    label: $t('labels.statut'),
    field: 'statut',
    align: 'center',
    sortable: true,
    headerClasses: 'text-primary text-weight-bold'
  },
  {
    name: 'actions',
    label: $t('labels.actions'),
    field: 'actions',
    align: 'center',
    sortable: false,
    headerClasses: 'text-primary text-weight-bold'
  }
]))

// Données fictives des encaissements
const encaissements = ref([
  {
    id: 1,
    nEmployeur: 'EMP001',
    raisonSociale: 'ENTREPRISE GENERALE DU CAMEROUN',
    periode: '01/2025',
    rubrique: 'Cotisations Patronales',
    quittance: 'QUIT001',
    nPiece: 'NPE001',
    dateDeclaration: '2025-01-15',
    mode: 'Virement',
    nature: 'Cotisations',
    montant: 2500000,
    banque: 'BICEC',
    utilisateur: 'ADJOMO PAULINE',
    dateSaisie: '2025-01-16',
    val1: 'OUI',
    val2: 'OUI',
    dateQuittance: '2025-01-17',
    origine: 'Déclaration',
    email: 'contact@egc.cm',
    quittanceStatus: 'Générée',
    statut: 'Validé'
  },
  {
    id: 2,
    nEmployeur: 'EMP002',
    raisonSociale: 'SOCIETE COMMERCIALE YAOUNDE',
    periode: '01/2025',
    rubrique: 'Cotisations Salariales',
    quittance: 'QUIT002',
    nPiece: 'NPE002',
    dateDeclaration: '2025-01-18',
    mode: 'Chèque',
    nature: 'Cotisations',
    montant: 1800000,
    banque: 'SGBC',
    utilisateur: 'KAMGA JEAN',
    dateSaisie: '2025-01-19',
    val1: 'OUI',
    val2: 'NON',
    dateQuittance: '2025-01-20',
    origine: 'Déclaration',
    email: 'info@scy.cm',
    quittanceStatus: 'En attente',
    statut: 'En attente'
  },
  {
    id: 3,
    nEmployeur: 'EMP003',
    raisonSociale: 'BANQUE ATLANTIQUE CAMEROUN',
    periode: '01/2025',
    rubrique: 'Cotisations Patronales',
    quittance: 'QUIT003',
    nPiece: 'NPE003',
    dateDeclaration: '2025-01-20',
    mode: 'Virement',
    nature: 'Cotisations',
    montant: 4500000,
    banque: 'AFC',
    utilisateur: 'FOTSO MARIE',
    dateSaisie: '2025-01-21',
    val1: 'OUI',
    val2: 'OUI',
    dateQuittance: '2025-01-22',
    origine: 'Déclaration',
    email: 'rh@bac.cm',
    quittanceStatus: 'Générée',
    statut: 'Validé'
  },
  {
    id: 4,
    nEmployeur: 'EMP004',
    raisonSociale: 'TELECOM CAMEROUN',
    periode: '01/2025',
    rubrique: 'Cotisations Salariales',
    quittance: 'QUIT004',
    nPiece: 'NPE004',
    dateDeclaration: '2025-01-22',
    mode: 'Prélèvement',
    nature: 'Cotisations',
    montant: 3200000,
    banque: 'ECOBANK',
    utilisateur: 'TCHOKOUANI PIERRE',
    dateSaisie: '2025-01-23',
    val1: 'NON',
    val2: 'NON',
    dateQuittance: '2025-01-24',
    origine: 'Déclaration',
    email: 'paie@telecom.cm',
    quittanceStatus: 'En attente',
    statut: 'Dévalidé'
  },
  {
    id: 5,
    nEmployeur: 'EMP005',
    raisonSociale: 'MINISTERE DES FINANCES',
    periode: '01/2025',
    rubrique: 'Cotisations Patronales',
    quittance: 'QUIT005',
    nPiece: 'NPE005',
    dateDeclaration: '2025-01-25',
    mode: 'Virement',
    nature: 'Cotisations',
    montant: 6800000,
    banque: 'BGF',
    utilisateur: 'NDJENG ALICE',
    dateSaisie: '2025-01-26',
    val1: 'OUI',
    val2: 'OUI',
    dateQuittance: '2025-01-27',
    origine: 'Déclaration',
    email: 'dg@minfi.cm',
    quittanceStatus: 'Générée',
    statut: 'Validé'
  }
])

// Computed properties
const encaissementsFiltres = computed(() => {
  let result = encaissements.value

  if (filtres.value.statut) {
    result = result.filter(enc => enc.statut === filtres.value.statut)
  }

  return result
})

const calculerMontantTotal = computed(() => {
  return encaissementsFiltres.value.reduce((total, enc) => total + enc.montant, 0)
})

// Méthodes utilitaires
const formatMontant = (montant) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0
  }).format(montant)
}

const getStatutColor = (statut) => {
  const colors = {
    'Validé': 'positive',
    'En attente': 'warning',
    'Dévalidé': 'negative',
    'En cours de traitement': 'info',
    'Terminé': 'secondary'
  }
  return colors[statut] || 'grey'
}

// Actions des boutons
const onSubmit = () => {
  $q.notify({
    message: `Formulaire soumis avec l'action: ${formData.value.action}`,
    color: 'positive',
    icon: 'check_circle'
  })
}

const actualiserGrille = () => {
  loading.value = true

  // Simulation d'un appel API
  setTimeout(() => {
    // Ajouter un nouvel encaissement fictif
    const newId = Math.max(...encaissements.value.map(e => e.id)) + 1
    const newEncaissement = {
      id: newId,
      nEmployeur: `EMP${String(newId).padStart(3, '0')}`,
      raisonSociale: `ENTREPRISE NOUVELLE ${newId}`,
      periode: '01/2025',
      rubrique: 'Cotisations Patronales',
      quittance: `QUIT${String(newId).padStart(3, '0')}`,
      nPiece: `NPE${String(newId).padStart(3, '0')}`,
      dateDeclaration: '2025-01-28',
      mode: 'Virement',
      nature: 'Cotisations',
      montant: Math.floor(Math.random() * 5000000) + 1000000,
      banque: banqueOptions.value[Math.floor(Math.random() * banqueOptions.value.length)],
      utilisateur: utilisateurOptions.value[Math.floor(Math.random() * utilisateurOptions.value.length)],
      dateSaisie: '2025-01-29',
      val1: 'OUI',
      val2: 'OUI',
      dateQuittance: '2025-01-30',
      origine: 'Déclaration',
      email: `contact@entreprise${newId}.cm`,
      quittanceStatus: 'En attente',
      statut: 'En attente'
    }

    encaissements.value.unshift(newEncaissement)
    loading.value = false

    $q.notify({
      message: 'Grille actualisée avec succès',
      color: 'info',
      icon: 'refresh'
    })
  }, 1000)
}

const validerDevalider = () => {
  confirmMessage.value = `Êtes-vous sûr de vouloir ${formData.value.action === 'validation' ? 'valider' : 'dévalider'} les encaissements sélectionnés ?`
  actionToConfirm.value = 'validerDevalider'
  showConfirmDialog.value = true
}

const viderFormulaire = () => {
  confirmMessage.value = 'Êtes-vous sûr de vouloir vider le formulaire ? Toutes les données seront perdues.'
  actionToConfirm.value = 'viderFormulaire'
  showConfirmDialog.value = true
}

const genererQuittances = () => {
  $q.notify({
    message: 'Génération des quittances en cours...',
    color: 'info',
    icon: 'receipt',
    timeout: 3000
  })

  // Simulation de génération
  setTimeout(() => {
    $q.notify({
      message: 'Quittances générées avec succès',
      color: 'positive',
      icon: 'check_circle'
    })
  }, 3000)
}

const editerQuittances = () => {
  $q.notify({
    message: 'Édition des quittances lancée',
    color: 'accent',
    icon: 'print'
  })
}

const transmettreQuittance = () => {
  $q.notify({
    message: 'Transmission de la quittance en cours...',
    color: 'primary',
    icon: 'send',
    timeout: 2000
  })

  // Simulation de transmission
  setTimeout(() => {
    $q.notify({
      message: 'Quittance transmise avec succès',
      color: 'positive',
      icon: 'check_circle'
    })
  }, 2000)
}

const showPreview = () => {
  showPreviewDialog.value = true
}

const corrigerLigne = () => {
  $q.notify({
    message: 'Correction de la ligne en cours...',
    color: 'warning',
    icon: 'edit'
  })
}

const editerEncaissement = (encaissement) => {
  $q.notify({
    message: `Édition de l'encaissement ${encaissement.nEmployeur}`,
    color: 'primary',
    icon: 'edit'
  })
}

const supprimerEncaissement = (encaissement) => {
  confirmMessage.value = `Êtes-vous sûr de vouloir supprimer l'encaissement ${encaissement.nEmployeur} ?`
  actionToConfirm.value = 'supprimerEncaissement'
  showConfirmDialog.value = true
}

const confirmAction = () => {
  switch (actionToConfirm.value) {
    case 'validerDevalider':
      $q.notify({
        message: `Action ${formData.value.action} effectuée avec succès`,
        color: 'positive',
        icon: 'check_circle'
      })
      break
    case 'viderFormulaire':
      // Réinitialiser le formulaire
      formData.value = {
        action: 'correction',
        debutPeriodeSaisie: '',
        finPeriodeSaisie: '',
        debutPeriodePaiement: '',
        finPeriodePaiement: '',
        matriculeEmployeur: '',
        utilisateur: null,
        banque: null,
        montantTotal: 0,
        nBulletinEmission: '',
        periodeConcernee: '',
        montantPaye: 0,
        referenceTitrePaiement: '',
        dateEffectivePaiement: '',
        dateComptable: '',
        numeroQuittance: '',
        modePaiement: null,
        imputationComptable: null
      }
      $q.notify({
        message: 'Formulaire vidé avec succès',
        color: 'warning',
        icon: 'clear'
      })
      break
    case 'supprimerEncaissement':
      // Supprimer l'encaissement (logique à implémenter)
      $q.notify({
        message: 'Encaissement supprimé avec succès',
        color: 'negative',
        icon: 'delete'
      })
      break
  }
}

// Initialisation
onMounted(() => {
  // Définir les dates par défaut
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  formData.value.debutPeriodeSaisie = firstDay.toISOString().split('T')[0]
  formData.value.finPeriodeSaisie = lastDay.toISOString().split('T')[0]

  // Calculer le montant total initial
  formData.value.montantTotal = calculerMontantTotal.value
})
</script>

<style scoped>
.main-card {
  max-width: 80%;
  width: 80%;
  margin: 0 auto;
}

.section-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #e9ecef;
}

.field-input {
  max-width: 400px;
  width: 100%;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1976d2;
  border-bottom: 2px solid #1976d2;
  padding-bottom: 0.5rem;
}

.encaissements-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 100%;
}

.encaissements-table .q-table {
  width: 100%;
  table-layout: fixed;
}

.encaissements-table .q-table__container {
  overflow-x: auto;
  max-width: 100%;
}

.encaissements-table .q-table tbody td {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

/* Styles généraux pour toutes les tables */
.q-table {
  width: 100%;
  max-width: 100%;
  table-layout: fixed;
}

.q-table__container {
  overflow-x: auto;
  max-width: 100%;
}

.q-table tbody td {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 8px 12px;
}

.q-table thead th {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 8px 12px;
}

/* Amélioration du rendu des sections */
.section-container .row {
  width: 100%;
  max-width: 100%;
}

.section-container .q-gutter-sm > div {
  margin-bottom: 8px;
}

/* Amélioration de l'apparence des champs */
.q-input, .q-select {
  border-radius: 8px;
}

.q-btn {
  border-radius: 8px;
  font-weight: 500;
}

/* Centrage des champs dans leurs colonnes */
.col-12, .col-sm-6, .col-md-3 {
  display: flex;
  justify-content: center;
}

/* Amélioration de l'espacement */
.q-gutter-sm > div {
  margin-bottom: 8px;
}

/* Styles pour les tables avec virtual scroll comme dans les autres composants */
.encaissements-table .q-table__top {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 2px solid #dee2e6;
  padding: 0.5rem;
}

.encaissements-table .q-table thead th {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  color: white;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  padding: 12px 8px;
}

.encaissements-table .q-table tbody tr:hover {
  background-color: #f0f8ff;
  cursor: pointer;
}

.encaissements-table .q-table tbody tr:nth-child(even) {
  background-color: #f8f9fa;
}

.encaissements-table .q-table tbody tr:nth-child(even):hover {
  background-color: #e3f2fd;
}

.encaissements-table .q-table__bottom {
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

/* Responsive design */
@media (max-width: 768px) {
  .section-container {
    padding: 1rem;
  }

  .row.q-gutter-md > div {
    margin-bottom: 1rem;
  }
}

/* Amélioration des boutons */
.q-btn {
  font-weight: 500;
  text-transform: none;
  border-radius: 6px;
}

.q-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Réduction globale de la taille de tous les boutons du composant */
.q-btn {
  font-size: 0.8rem;
  padding: 4px 10px;
  min-height: 28px;
  min-width: 72px;
  max-width: 140px;
  white-space: nowrap;
}

.q-btn--round {
  width: 28px;
  height: 28px;
}

/* Amélioration des inputs */
.q-input {
  border-radius: 6px;
}

.q-input:hover .q-field__control {
  border-color: #1976d2;
}

/* Amélioration des selects */
.q-select {
  border-radius: 6px;
}

/* Amélioration des expansion items */
.q-expansion-item {
  border-radius: 8px;
  overflow: hidden;
}

.q-expansion-item__content {
  background: white;
}

/* Amélioration des chips */
.q-chip {
  font-weight: 500;
  border-radius: 16px;
}

/* Amélioration des notifications */
.q-notification {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Animation pour les sections */
.section-container {
  transition: all 0.3s ease;
}

/* Centrage des éléments du formulaire */
.form-centered {
  max-width: 1200px;
  margin: 0 auto;
}

.form-centered .row {
  justify-content: center;
}

.form-centered .col-12,
.form-centered .col-sm-6,
.form-centered .col-md-3 {
  display: flex;
  justify-content: center;
}

.form-centered .field-input {
  width: 100%;
  max-width: 300px;
}

/* Réduction des tailles des éléments */
.q-field--outlined .q-field__control {
  min-height: 40px;
}

.q-field--dense .q-field__control {
  min-height: 36px;
}

.q-field--dense .q-field__native {
  font-size: 0.9rem;
}

.q-field--dense .q-field__label {
  font-size: 0.85rem;
}

/* Réduction des tailles des cartes */
.section-card {
  margin-bottom: 8px;
}

.section-card .q-card-section {
  padding: 8px;
}

.section-card .text-h6 {
  font-size: 1.1rem;
  margin-bottom: 6px;
  margin-top: 0;
}

/* Réduction des tailles des boutons */
.q-btn {
  font-size: 0.85rem;
  padding: 6px 12px;
}

/* Champs étroits pour correspondre à la maquette legacy */
.ve-form .ve-input .q-field__control {
  min-width: 180px;
  max-width: 180px;
}

.ve-field {
  display: flex;
  align-items: center;
}

/* Réduction des espacements */
.q-gutter-xs > * {
  margin: 2px;
}

.q-gutter-sm > * {
  margin: 4px;
}

.q-mb-sm {
  margin-bottom: 4px !important;
}

.q-mb-md {
  margin-bottom: 8px !important;
}

/* Réduction des tailles des tableaux */
.q-table thead th {
  font-size: 0.75rem;
  padding: 4px 6px;
}

.q-table tbody td {
  font-size: 0.75rem;
  padding: 4px 6px;
}

.section-container:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* Style pour les colonnes du tableau */
.encaissements-table .q-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.encaissements-table .q-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #e9ecef;
}

.encaissements-table .q-table tbody tr:hover {
  background: #f8f9fa;
}

/* Style pour les filtres */
.q-input .q-field__control {
  border-radius: 6px;
}

.q-select .q-field__control {
  border-radius: 6px;
}

/* Style pour les boutons d'action */
.q-btn[color="primary"] {
  background: linear-gradient(135deg, #1976d2, #1565c0);
}

.q-btn[color="positive"] {
  background: linear-gradient(135deg, #4caf50, #388e3c);
}

.q-btn[color="warning"] {
  background: linear-gradient(135deg, #ff9800, #f57c00);
}

.q-btn[color="negative"] {
  background: linear-gradient(135deg, #f44336, #d32f2f);
}

.q-btn[color="info"] {
  background: linear-gradient(135deg, #00bcd4, #0097a7);
}

.q-btn[color="accent"] {
  background: linear-gradient(135deg, #ff4081, #c2185b);
}

.q-btn[color="secondary"] {
  background: linear-gradient(135deg, #757575, #616161);
}

/* Espacement réduit entre les boutons d'action */
.actions-row .q-btn {
  margin-left: 4px;
  margin-right: 4px;
}

/* Overrides compacts: reduce overall component heights */
/* Buttons */
.q-btn {
  min-height: 24px;
  padding: 2px 8px;
  font-size: 0.75rem;
}
.q-btn--round {
  width: 24px;
  height: 24px;
}

/* Inputs */
.q-field--outlined .q-field__control { min-height: 32px; }
.q-field--dense .q-field__control { min-height: 28px; }
.q-field__native { line-height: 1.1; }
.q-field__label { font-size: 0.8rem; }
</style>
