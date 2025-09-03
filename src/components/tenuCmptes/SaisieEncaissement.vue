<template>
  <div class="">
    <!-- Header Section -->
    <div class="text-center">
      <h4 class="text-primary q-mb-sm">
        <q-icon name="account_balance" class="q-mr-sm" />
        Formulaire de saisie des encaissements de cotisation
      </h4>
      <q-separator class="q-mb-sm" />
    </div>

    <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-sm">
      <!-- Informations sur l'Employeur Section -->
      <q-card class="my-card">
        <q-card-section>
          <div class="text-h6 text-primary">
            <q-icon name="business" class="q-mr-sm" />
            Informations sur l'Employeur
          </div>
          <div class="row q-gutter-sm justify-center">
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.employeur.matriculeCNPS"
                label="Matricule CNPS Employeur"
                outlined
                dense
                :rules="[
                  val => !!val || 'Ce champ est obligatoire',
                  val => validateMatriculeCNPS(val) || 'Format invalide. Utilisez: 123-1234567-123-A ou 123-1234567-A'
                ]"
                hint="Format: 123-1234567-123-A ou 123-1234567-A"
                @blur="loadEmployeurInfo"
                @input="resetEmployeurState"
                :loading="loadingEmployeurInfo"
              >
                <template v-slot:append>
                  <q-icon
                    v-if="loadingEmployeurInfo"
                    name="refresh"
                    class="rotating"
                  />
                  <q-icon
                    v-else-if="formData.employeur.matriculeCNPS && validateMatriculeCNPS(formData.employeur.matriculeCNPS) && employeurFound"
                    name="check_circle"
                    color="positive"
                  />
                  <q-icon
                    v-else-if="formData.employeur.matriculeCNPS && validateMatriculeCNPS(formData.employeur.matriculeCNPS) && !employeurFound && !loadingEmployeurInfo"
                    name="sentiment_dissatisfied"
                    color="negative"
                  />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.employeur.raisonSociale"
                label="Raison sociale"
                outlined
                readonly
                dense
                :rules="[val => !!val || 'Ce champ est obligatoire']"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.employeur.groupeRisque"
                label="Groupe de risque"
                outlined
                readonly
                dense
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.employeur.codeRegime"
                label="Code régime"
                outlined
                readonly
                dense
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.employeur.codeCentreGestion"
                label="Code Centre de Gestion"
                outlined
                readonly
                dense
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.employeur.adresse"
                label="Adresse"
                outlined
                dense
                readonly
                type="textarea"
                rows="2"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Listing des BEs non Exécutés Section -->
      <q-card class="my-card">
        <q-card-section>
          <div class="text-h6 text-primary q-mb-md">
            <q-icon name="list_alt" class="q-mr-sm" />
            Listing des BEs non Exécutés
          </div>
          <q-table
            :rows="beNonExecutes"
            :columns="beColumns"
            row-key="id"
            :loading="loading"
            :pagination="pagination"
            @request="onRequest"
            binary-state-sort
            class="my-table"
            header-class="text-primary text-weight-bold"
          >
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  flat
                  round
                  color="primary"
                  icon="visibility"
                  @click="showPreview(props.row)"
                >
                  <q-tooltip>Voir le détail</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>

      <!-- Informations générales sur le mouvement Section -->
      <q-card class="my-card">
        <q-card-section>
          <div class="text-h6 text-primary q-mb-md">
            <q-icon name="info" class="q-mr-sm" />
            Informations générales sur le mouvement
          </div>
          <div class="row q-gutter-sm justify-center">
            <div class="col-12 col-md-4">
              <q-select
                v-model="formData.mouvement.rubriqueCotisation"
                :options="rubriqueOptions"
                label="Rubrique de cotisation"
                outlined
                dense
                emit-value
                map-options
                :rules="[val => !!val || 'Ce champ est obligatoire']"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="formData.mouvement.natureRecouvrement"
                :options="natureRecouvrementOptions"
                label="Nature du recouvrement"
                outlined
                dense
                emit-value
                map-options
                :rules="[val => !!val || 'Ce champ est obligatoire']"
              />
            </div>
            <div class="col-12 col-md-4 flex flex-center">
              <q-checkbox
                v-model="formData.mouvement.creditSuiteControle"
                label="Cas du crédit suite à un contrôle"
                color="primary"
                dense
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Renseignements optionnels Relatifs à un moratoire Section -->
      <q-card class="my-card">
        <q-expansion-item
          v-model="expanded.moratoire"
          icon="schedule"
          label="Renseignements optionnels Relatifs à un moratoire"
          header-class="text-primary"
        >
          <q-card-section>
            <div class="row q-gutter-sm justify-center">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.moratoire.numeroMoratoire"
                  label="Numéro de moratoire"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.moratoire.dateMoratoire"
                  label="Date du moratoire"
                  outlined
                  dense
                  type="date"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.moratoire.montantMoratoire"
                  label="Montant du moratoire"
                  outlined
                  dense
                  type="number"
                  prefix="FCFA"
                />
              </div>
            </div>
          </q-card-section>
        </q-expansion-item>
      </q-card>

      <!-- Renseignements optionnels Relatifs à une remise gracieuse Section -->
      <q-card class="my-card">
        <q-expansion-item
          v-model="expanded.remiseGracieuse"
          icon="favorite"
          label="Renseignements optionnels Relatifs à une remise gracieuse"
          header-class="text-primary"
        >
          <q-card-section>
            <div class="row q-gutter-sm justify-center">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.remiseGracieuse.numeroRemise"
                  label="Numéro de remise gracieuse"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.remiseGracieuse.dateRemise"
                  label="Date de la remise"
                  outlined
                  dense
                  type="date"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="formData.remiseGracieuse.montantRemise"
                  label="Montant de la remise"
                  outlined
                  dense
                  type="number"
                  prefix="FCFA"
                />
              </div>
            </div>
          </q-card-section>
        </q-expansion-item>
      </q-card>

      <!-- Listing des paiements non exploités de l'employeur Section -->
      <q-card class="my-card">
        <q-card-section>
          <div class="text-h6 text-primary q-mb-md">
            <q-icon name="payment" class="q-mr-sm" />
            Listing des paiements non exploités de l'employeur
          </div>
          <q-table
            :rows="paiementsNonExploites"
            :columns="paiementsColumns"
            row-key="id"
            :loading="loadingPaiements"
            class="my-table"
            header-class="text-primary text-weight-bold"
          >
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  flat
                  round
                  color="primary"
                  icon="edit"
                  @click="editPaiement(props.row)"
                >
                  <q-tooltip>Modifier</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>

      <!-- Renseignements pour mise à jour en crédit Section -->
      <q-card class="my-card">
        <q-card-section>
          <div class="text-h6 text-primary q-mb-md">
            <q-icon name="update" class="q-mr-sm" />
            Renseignements pour mise à jour en crédit
          </div>
          <div class="row q-gutter-sm justify-center">
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.credit.numeroBulletinEmission"
                label="Numéro bulletin d'émission"
                outlined
                dense
                :rules="[val => !!val || 'Ce champ est obligatoire']"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.credit.periodeConcernee"
                label="Période concernée"
                outlined
                dense
                :rules="[val => !!val || 'Ce champ est obligatoire']"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.credit.totalMontantAttendu"
                label="Total Montant Attendu"
                outlined
                dense
                type="number"
                prefix="FCFA"
                :rules="[val => !!val || 'Ce champ est obligatoire']"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.credit.montantPaye"
                label="Montant payé"
                outlined
                dense
                type="number"
                prefix="FCFA"
                :rules="[val => !!val || 'Ce champ est obligatoire']"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.credit.referenceTitrePaiement"
                label="Référence Titre de paiement/Annulation"
                outlined
                dense
                :rules="[val => !!val || 'Ce champ est obligatoire']"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-input
                v-model="formData.credit.dateEffectivePaiement"
                label="Date effective de paiement/Annulation"
                outlined
                dense
                type="date"
                :rules="[val => !!val || 'Ce champ est obligatoire']"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="formData.credit.dateEffectivePaiement">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="formData.credit.modePaiement"
                :options="modePaiementOptions"
                label="Mode de paiement"
                outlined
                dense
                emit-value
                map-options
                :rules="[val => !!val || 'Ce champ est obligatoire']"
              />
            </div>
            <div class="col-12 col-md-4">
              <q-select
                v-model="formData.credit.imputationComptable"
                :options="imputationComptableOptions"
                label="Imputation comptable (banque/tier collecteur)"
                outlined
                dense
                emit-value
                map-options
                :rules="[val => !!val || 'Ce champ est obligatoire']"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Action Buttons -->
      <div class="row justify-center q-gutter-sm q-mt-md">
        <q-btn
          type="submit"
          color="primary"
          size="lg"
          icon="save"
          label="Enregistrer"
          :loading="saving"
          class="q-px-xl"
        />
        <q-btn
          type="reset"
          color="grey"
          size="lg"
          icon="cancel"
          label="Annuler"
          class="q-px-xl"
          @click="onReset"
        />
      </div>
    </q-form>

    <!-- Preview Dialog -->
    <q-dialog v-model="showPreviewDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Aperçu du BE</div>
        </q-card-section>
        <q-card-section>
          <div v-if="selectedBE">
            <p><strong>Numéro Employeur:</strong> {{ selectedBE.numeroEmployeur }}</p>
            <p><strong>Raison Sociale:</strong> {{ selectedBE.raisonSociale }}</p>
            <p><strong>Type du BE:</strong> {{ selectedBE.typeBE }}</p>
            <p><strong>Période:</strong> {{ selectedBE.periode }}</p>
            <p><strong>Total:</strong> {{ selectedBE.total }} FCFA</p>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Fermer" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Reactive form data
const formData = reactive({
  employeur: {
    matriculeCNPS: '',
    raisonSociale: '',
    groupeRisque: '',
    codeRegime: '',
    codeCentreGestion: '',
    adresse: ''
  },
  mouvement: {
    rubriqueCotisation: '',
    natureRecouvrement: '',
    creditSuiteControle: false
  },
  moratoire: {
    numeroMoratoire: '',
    dateMoratoire: '',
    montantMoratoire: ''
  },
  remiseGracieuse: {
    numeroRemise: '',
    dateRemise: '',
    montantRemise: ''
  },
  credit: {
    numeroBulletinEmission: '',
    periodeConcernee: '',
    totalMontantAttendu: '',
    montantPaye: '',
    referenceTitrePaiement: '',
    dateEffectivePaiement: '',
    modePaiement: '',
    imputationComptable: ''
  }
})

// Expanded sections state
const expanded = reactive({
  moratoire: false,
  remiseGracieuse: false
})

// Loading states
const loading = ref(false)
const loadingPaiements = ref(false)
const saving = ref(false)
const loadingEmployeurInfo = ref(false)
const employeurFound = ref(false)

// Dialog state
const showPreviewDialog = ref(false)
const selectedBE = ref(null)

// Table data
const beNonExecutes = ref([])
const paiementsNonExploites = ref([])

// Table columns
const beColumns = [
  {
    name: 'numeroEmployeur',
    required: true,
    label: 'Numéro Employeur',
    align: 'left',
    field: 'numeroEmployeur',
    sortable: true,
    headerStyle: 'color: #1976d2; font-size: 16px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'raisonSociale',
    label: 'Raison Sociale',
    align: 'left',
    field: 'raisonSociale',
    sortable: true,
    headerStyle: 'color: #1976d2; font-size: 16px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'typeBE',
    label: 'Type du BE',
    align: 'left',
    field: 'typeBE',
    headerStyle: 'color: #1976d2; font-size: 16px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'origineBE',
    label: 'Origine du BE',
    align: 'left',
    field: 'origineBE',
    headerStyle: 'color: #1976d2; font-size: 16px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'rubriqueCotisation',
    label: 'Rubrique cotisation',
    align: 'left',
    field: 'rubriqueCotisation',
    headerStyle: 'color: #1976d2; font-size: 16px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'periode',
    label: 'Période',
    align: 'left',
    field: 'periode',
    headerStyle: 'color: #1976d2; font-size: 16px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'total',
    label: 'Total',
    align: 'right',
    field: 'total',
    format: val => `${val} FCFA`,
    headerStyle: 'color: #1976d2; font-size: 16px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'utilisateur',
    label: 'Utilisateur',
    align: 'left',
    field: 'utilisateur',
    headerStyle: 'color: #1976d2; font-size: 16px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'actions',
    label: 'Actions',
    align: 'center',
    field: 'actions',
    headerStyle: 'color: #1976d2; font-size: 16px; font-weight: 700; text-transform: uppercase;'
  }
]

const paiementsColumns = [
  {
    name: 'numeroEmployeur',
    required: true,
    label: 'Numéro Employeur',
    align: 'left',
    field: 'numeroEmployeur',
    sortable: true,
    headerStyle: 'color: #1976d2; font-size: 16px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'referencePaiement',
    label: 'Référence paiement',
    align: 'left',
    field: 'referencePaiement',
    headerStyle: 'color: #1976d2; font-size: 16px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'montant',
    label: 'Montant',
    align: 'right',
    field: 'montant',
    format: val => `${val} FCFA`,
    headerStyle: 'color: #1976d2; font-size: 16px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'banque',
    label: 'Banque',
    align: 'left',
    field: 'banque',
    headerStyle: 'color: #1976d2; font-size: 16px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'referenceTransaction',
    label: 'Référence Transaction',
    align: 'left',
    field: 'referenceTransaction',
    headerStyle: 'color: #1976d2; font-size: 16px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'datePaiement',
    label: 'Date paiement',
    align: 'left',
    field: 'datePaiement',
    headerStyle: 'color: #1976d2; font-size: 16px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'origine',
    label: 'Origine',
    align: 'left',
    field: 'origine',
    headerStyle: 'color: #1976d2; font-size: 16px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'contact',
    label: 'Contact',
    align: 'left',
    field: 'contact',
    headerStyle: 'color: #1976d2; font-size: 16px; font-weight: 700; text-transform: uppercase;'
  },
  {
    name: 'actions',
    label: 'Mod...',
    align: 'center',
    field: 'actions',
    headerStyle: 'color: #1976d2; font-size: 16px; font-weight: 700; text-transform: uppercase;'
  }
]

// Pagination
const pagination = ref({
  sortBy: 'numeroEmployeur',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// Select options
const rubriqueOptions = [
  { label: 'Cotisations patronales', value: 'patronales' },
  { label: 'Cotisations salariales', value: 'salariales' },
  { label: 'Cotisations totales', value: 'totales' }
]

const natureRecouvrementOptions = [
  { label: 'Paiement normal', value: 'normal' },
  { label: 'Paiement avec majoration', value: 'majoration' },
  { label: 'Paiement avec remise', value: 'remise' }
]

const modePaiementOptions = [
  { label: 'Virement bancaire', value: 'virement' },
  { label: 'Chèque', value: 'cheque' },
  { label: 'Espèces', value: 'especes' },
  { label: 'Carte bancaire', value: 'carte' }
]

const imputationComptableOptions = [
  { label: 'Banque principale', value: 'banque_principale' },
  { label: 'Tier collecteur 1', value: 'tier_1' },
  { label: 'Tier collecteur 2', value: 'tier_2' }
]

// Methods

const validateMatriculeCNPS = (val) => {
  const regex = /^(?:\d{3}-\d{7}-\d{3}-[A-Z]|\d{3}-\d{7}-[A-Z])$/.test(val);
  return regex || 'Formsat invalide. Utilisez: 123-1234567-123-A ou 123-1234567-A';
};

const resetEmployeurState = () => {
  employeurFound.value = false
  // Vider les champs quand l'utilisateur modifie le matricule
  formData.employeur.raisonSociale = ''
  formData.employeur.groupeRisque = ''
  formData.employeur.codeRegime = ''
  formData.employeur.codeCentreGestion = ''
  formData.employeur.adresse = ''
};

const loadEmployeurInfo = async () => {
  if (!formData.employeur.matriculeCNPS || !validateMatriculeCNPS(formData.employeur.matriculeCNPS)) {
    employeurFound.value = false
    return
  }

  loadingEmployeurInfo.value = true
  employeurFound.value = false

  try {
    // Simulation d'un appel API avec des données factices
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Données factices basées sur l'exemple fourni
    const fakeEmployeurData = {
      '010-1138701-H': {
        raisonSociale: 'CAMEROON TELECOMMUNICATIONS',
        groupeRisque: 'B',
        codeRegime: '324',
        codeCentreGestion: '1',
        adresse: 'BP 1571 YAOUNDE'
      },
      '123-1234567-A': {
        raisonSociale: 'ENTREPRISE GENERALE DU BATIMENT',
        groupeRisque: 'A',
        codeRegime: '321',
        codeCentreGestion: '2',
        adresse: 'BP 1234 DOUALA'
      },
      '456-7654321-B': {
        raisonSociale: 'SOCIETE COMMERCIALE MODERNE',
        groupeRisque: 'C',
        codeRegime: '325',
        codeCentreGestion: '3',
        adresse: 'BP 5678 GAROUA'
      }
    }

    const employeurData = fakeEmployeurData[formData.employeur.matriculeCNPS]

    if (employeurData) {
      // Employeur trouvé
      employeurFound.value = true

      // Mise à jour des champs avec les données récupérées
      formData.employeur.raisonSociale = employeurData.raisonSociale
      formData.employeur.groupeRisque = employeurData.groupeRisque
      formData.employeur.codeRegime = employeurData.codeRegime
      formData.employeur.codeCentreGestion = employeurData.codeCentreGestion
      formData.employeur.adresse = employeurData.adresse

      $q.notify({
        type: 'positive',
        message: 'Informations employeur chargées avec succès',
        position: 'top',
        timeout: 2000
      })
    } else {
      // Employeur non trouvé
      employeurFound.value = false

      // Vider les champs
      formData.employeur.raisonSociale = ''
      formData.employeur.groupeRisque = ''
      formData.employeur.codeRegime = ''
      formData.employeur.codeCentreGestion = ''
      formData.employeur.adresse = ''

      $q.notify({
        type: 'negative',
        message: `Employeur avec le matricule ${formData.employeur.matriculeCNPS} non trouvé`,
        position: 'top',
        timeout: 3000,
        icon: 'sentiment_dissatisfied'
      })
    }

  } catch {
    employeurFound.value = false
    $q.notify({
      type: 'negative',
      message: 'Erreur lors du chargement des informations employeur',
      position: 'top'
    })
  } finally {
    loadingEmployeurInfo.value = false
  }
}

const onRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  loading.value = true

  // Simulate API call
  setTimeout(() => {
    // Mock data
    beNonExecutes.value = [
      {
        id: 1,
        numeroEmployeur: 'EMP001',
        raisonSociale: 'Entreprise ABC',
        typeBE: 'Mensuel',
        origineBE: 'Télédéclaration',
        rubriqueCotisation: 'Cotisations patronales',
        periode: '2024-01',
        total: 150000,
        utilisateur: 'Admin'
      }
    ]

    pagination.value.rowsNumber = beNonExecutes.value.length
    pagination.value.page = page
    pagination.value.rowsPerPage = rowsPerPage
    pagination.value.sortBy = sortBy
    pagination.value.descending = descending

    loading.value = false
  }, 1000)
}

const showPreview = (row) => {
  selectedBE.value = row
  showPreviewDialog.value = true
}

const editPaiement = (row) => {
  $q.notify({
    type: 'info',
    message: `Modification du paiement ${row.referencePaiement}`,
    position: 'top'
  })
}

const onSubmit = () => {
  saving.value = true

  // Simulate save operation
  setTimeout(() => {
    $q.notify({
      type: 'positive',
      message: 'Encaissement enregistré avec succès',
      position: 'top'
    })
    saving.value = false
  }, 2000)
}

const onReset = () => {
  // Reset all form data
  Object.keys(formData).forEach(section => {
    Object.keys(formData[section]).forEach(field => {
      if (typeof formData[section][field] === 'boolean') {
        formData[section][field] = false
      } else {
        formData[section][field] = ''
      }
    })
  })

  // Reset expanded sections
  expanded.moratoire = false
  expanded.remiseGracieuse = false

  $q.notify({
    type: 'info',
    message: 'Formulaire réinitialisé',
    position: 'top'
  })
}

// Load initial data
onMounted(() => {
  onRequest({ pagination: pagination.value })

  // Load payments data
  loadingPaiements.value = true
  setTimeout(() => {
    paiementsNonExploites.value = [
      {
        id: 1,
        numeroEmployeur: 'EMP001',
        referencePaiement: 'PAY001',
        montant: 150000,
        banque: 'BICEC',
        referenceTransaction: 'TXN001',
        datePaiement: '2024-01-15',
        origine: 'Bancaire',
        contact: 'contact@entreprise.com'
      }
    ]
    loadingPaiements.value = false
  }, 1000)
})
</script>

<style scoped>
.my-card {
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.my-table {
  border-radius: 8px;
  overflow: hidden;
}

.text-primary {
  color: #1976d2;
}

.q-expansion-item {
  border-radius: 8px;
  overflow: hidden;
}

.q-expansion-item .q-item {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.q-expansion-item .q-item__section--main {
  font-weight: 600;
}

.q-btn {
  border-radius: 8px;
  text-transform: none;
  font-weight: 500;
}

.q-input, .q-select {
  border-radius: 8px;
}

.q-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.q-card-section {
  padding: 16px;
}

.text-h6 {
  font-weight: 600;
  margin-bottom: 8px;
}

.q-separator {
  margin: 8px 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .q-pa-md {
    padding: 16px;
  }

  .q-card-section {
    padding: 16px;
  }

  .row.q-gutter-md > div {
    margin-bottom: 16px;
  }
}

/* Animation for form sections */
.my-card {
  transition: all 0.3s ease;
}

.my-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* Custom scrollbar for tables */
.my-table ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.my-table ::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.my-table ::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.my-table ::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Animation pour l'icône de chargement */
.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Styles pour les en-têtes de table */
.my-table .q-table__top,
.my-table .q-table__bottom,
.my-table thead th {
  background-color: #f5f5f5;
  font-size: 16px;
  font-weight: 600;
  padding: 8px 12px;
}

.my-table thead th {
  color: #1976d2 !important;
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background-color: #e3f2fd !important;
}

.my-table tbody td {
  font-size: 14px;
  padding: 8px 12px;
}

.my-table .q-table__control {
  padding: 8px;
}
</style>
