<template>
  <div class="saisie-resultats">
    <q-card class="q-pa-sm">
      <q-form @submit.prevent="onSubmit" class="q-gutter-md">
        <!-- Recherche des demandes -->
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle1 q-mb-sm text-bold">
            {{ t('labels.rechercheEmployeur') }}
          </div>
          <q-form @submit.prevent="searchDemande" ref="searchForm">
            <div class="row q-col-gutter-md">
              <div class="col-4">
                <q-input
                  v-model="formSearch.numEmployeur"
                  :label="t('labels.numEmployeur')"
                  outlined
                  dense
                  :rules="[required, validateMatriculeCNPS]"
                />
              </div>

              <div class="col-4 flex flex-center">
                <q-btn :label="t('labels.recherche')" color="primary" type="submit" />
              </div>
            </div>
          </q-form>
          <div class="q-pa-md">
            <q-table
              class="my-sticky-header-table"
              flat
              bordered
              :rows="rows"
              :columns="columns"
              row-key="matricule"
              selection="single"
              v-model:selected="selectedRow"
            />
          </div>
        </q-card>

        <!-- Informations Employeur -->
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle1 q-mb-sm text-bold">{{ t('labels.infosEmployeur') }}</div>

          <!-- Ligne 1 -->
          <div class="row q-col-gutter-md">
            <div class="col-3">
              <q-input
                v-model="formData.txtnumemployeur"
                :label="t('labels.numEmployeur')"
                outlined
                dense
                readonly
              />
            </div>
            <div class="col-9">
              <q-input
                v-model="formData.raisonsociale"
                :label="t('labels.raisonsociale')"
                outlined
                dense
                readonly
              />
            </div>
          </div>

          <!-- Ligne 3 -->
          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-6">
              <q-input
                v-model="formData.txtmotif"
                :label="t('labels.motif')"
                outlined
                dense
                readonly
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="formData.txtreference"
                :label="t('labels.reference')"
                outlined
                dense
                readonly
              />
            </div>
          </div>

          <!-- Ligne 5 -->
          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-4">
              <q-input
                v-model="formData.date_saisie"
                :label="t('labels.dateMED')"
                outlined
                dense
                readonly
                :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="formData.dateMED" mask="DD/MM/YYYY">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup :label="t('labels.fermer')" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-4">
              <q-input
                v-model="formData.txtnumMED"
                :label="t('labels.numMED')"
                outlined
                dense
                readonly
              />
            </div>
            <div class="col-4">
              <q-input
                v-model="formData.txtmontant"
                :label="t('labels.montantTotal')"
                outlined
                dense
                readonly
              />
            </div>
          </div>

          <!-- Ligne 3 -->
          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-6">
              <q-input
                v-model="formData.txtdestinataire"
                :label="t('labels.destinataire')"
                outlined
                dense
                readonly
              />
            </div>
            <div class="col-6">
              <q-select
                v-model="formData.reportType"
                :options="reportOptions"
                label="Edition"
                outlined
                dense
                :rules="[required]"
              />
            </div>
          </div>
        </q-card>

        <!-- Bloc Détail MD -->
        <q-card flat bordered class="q-pa-md q-mt-md">
          <div class="text-subtitle1 q-mb-sm text-bold">{{ t('labels.detailsMED') }}</div>
          <q-table
            :rows="formData.lignes"
            :columns="columnsDetailMD"
            row-key="id"
            flat
            bordered
            dense
          >
            <template v-slot:body-cell-libelle="props">
              <q-td :props="props">
                <q-input v-model="props.row.libelle" dense outlined readonly />
              </q-td>
            </template>
            <template v-slot:body-cell-montant="props">
              <q-td :props="props">
                <q-input v-model="props.row.montant" dense outlined readonly />
              </q-td>
            </template>
          </q-table>
        </q-card>

        <!-- Boutons -->
        <div class="row justify-center q-mt-lg">
          <q-btn label="Editer" color="primary" type="submit" :loading="loading" />
          <q-btn
            :label="t('labels.reinitialiser')"
            color="warning"
            flat
            class="q-ml-md"
            @click="resetForm"
          />
        </div>

        <!-- Table dynamique -->
        <q-card flat bordered class="q-pa-md">
          <div class="q-pa-md">
            <q-table
              class="my-sticky-header-table"
              flat
              bordered
              :rows="rows2"
              :columns="columns2"
              row-key="reference"
            />
          </div>
        </q-card>
      </q-form>
    </q-card>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
// import axios from 'axios'
import { useI18n } from 'vue-i18n'

const $q = useQuasar()
const loading = ref(false)
const { t, locale } = useI18n()

// Données du formulaire
const formData = ref({
  txtnumemployeur: '',
  raisonsociale: '',
  dateDebut: '',
  dateFin: '',
  txtmotif: '',
  txtreference: '',
  destinataire: '',
  date_saisie: '',
  txtnumMED: '',
  txtmontant: 0,
  datenotify: '',
  txtuserdecharge: '',
  lignes: [],
})

const formSearch = ref({
  numEmployeur: '',
  exercice: '',
})

// Options

const columnsDetailMD = [
  { name: 'libelle', label: 'Libellé', field: 'libelle', align: 'left' },
  { name: 'montant', label: 'Montant', field: 'montant', align: 'right' },
]

// Colonnes de la table
const columns = [
  { name: 'matricule', label: 'Matricule', field: 'matricule', align: 'left' },
  { name: 'raison', label: 'Raison sociale', field: 'raison', align: 'left' },
  { name: 'numContrib', label: 'N° Contribuable', field: 'numContrib', align: 'left' },
  { name: 'sigle', label: 'Sigle', field: 'sigle', align: 'left' },
]

// Colonnes Recherche
const columns2 = [
  { name: 'num', label: 'N°', field: 'num', align: 'left' },
  { name: 'reference', label: 'Référence', field: 'reference', align: 'left' },
  { name: 'date', label: 'Date', field: 'date', align: 'left' },
  { name: 'montant', label: 'Montant', field: 'montant', align: 'left' },
  { name: 'centre', label: 'Centre', field: 'centre', align: 'left' },
  { name: 'motif', label: 'Motif', field: 'motif', align: 'left' },
  { name: 'statut', label: 'Statut', field: 'statut', align: 'left' },
  { name: 'observations', label: 'Observations', field: 'observations', align: 'left' },
]
const rows = ref([])
const rows2 = ref([])

const reportOptions = [
  { label: 'Rapport', value: 'rap' },
  { label: 'Annexe', value: 'anexe' },
]

const rowsSanctions = [
  {
    num: 1,
    reference: 'REF-2025-001',
    date: '07/09/2025',
    montant: '150 000',
    centre: 'Centre Yaoundé',
    motif: 'Retard de déclaration',
    statut: 'En cours',
    observations: 'Dossier en traitement',
  },
  {
    num: 2,
    reference: 'REF-2025-002',
    date: '05/09/2025',
    montant: '250 000',
    centre: 'Centre Douala',
    motif: 'Erreur sur cotisation',
    statut: 'Validé',
    observations: 'Correction effectuée',
  },
]

const validateMatriculeCNPS = (val) => {
  const regex = /^(?:\d{3}-\d{7}-\d{3}-[A-Z]|\d{3}-\d{7}-[A-Z])$/.test(val)
  return regex || t('errors.invalid_cnps_format')
}

const required = (val) => !!val || 'Ce champ est requis / This field is required'

// Ligne sélectionnée
const selectedRow = ref([])

const rowsData = [
  {
    matricule: '010-1291201-F',
    raison: 'CAISSE NATIONALE DE PREVOYANCE SOCIALE',
    numContrib: 'M016500000481R',
    sigle: 'CNPS',
    link: 'SaisieMisEnDemeure.jsp?matemployer=010-1291201-F&raisonsocial=CAISSE NATIONALE DE PREVOYANCE SOCIALE&numcontrib=M016500000481R&sigle=CNPS',
    reference: 'REF-2025-002',
    date: '05/09/2025',
    montant: '250 000',
    num: 1,
    motif: 'Erreur sur cotisation',
    observations: 'Correction effectuée',
  },
  {
    matricule: '020-4578912-G',
    raison: 'BANQUE CENTRALE DU CAMEROUN',
    numContrib: 'M018900000251K',
    sigle: 'BCC',
    reference: 'REF-2025-012',
    date: '05/09/2025',
    montant: '250 000',
    num: 2,
    motif: 'Erreur sur cotisation',
    observations: 'Correction effectuée',
    link: 'SaisieMisEnDemeure.jsp?matemployer=020-4578912-G&raisonsocial=BANQUE CENTRALE DU CAMEROUN&numcontrib=M018900000251K&sigle=BCC',
  },
  {
    matricule: '030-7845621-H',
    raison: 'ORANGE CAMEROUN SA',
    numContrib: 'M016700000981Q',
    sigle: 'ORANGE',
    reference: 'REF-2025-412',
    date: '05/09/2025',
    montant: '250 000',
    num: 3,
    motif: 'Retard de déclaration',
    observations: 'Dossier en traitement',
    link: 'SaisieMisEnDemeure.jsp?matemployer=030-7845621-H&raisonsocial=ORANGE CAMEROUN SA&numcontrib=M016700000981Q&sigle=ORANGE',
  },
  {
    matricule: '040-9854712-K',
    raison: 'MTN CAMEROUN SA',
    numContrib: 'M017800000551T',
    sigle: 'MTN',
    reference: 'REF-2025-172',
    date: '05/09/2025',
    montant: '250 000',
    num: 4,
    motif: 'Erreur sur cotisation',
    observations: 'Correction effectuée',
    link: 'SaisieMisEnDemeure.jsp?matemployer=040-9854712-K&raisonsocial=MTN CAMEROUN SA&numcontrib=M017800000551T&sigle=MTN',
  },
  {
    matricule: '060-3214789-M',
    raison: 'GUINNESS CAMEROUN SA',
    numContrib: 'M019200000111B',
    sigle: 'GUINNESS',
    reference: 'REF-2025-002',
    date: '07/09/2025',
    montant: '150 000',
    num: 5,
    motif: 'Retard de déclaration',
    observations: 'Dossier en traitement',
    link: 'SaisieMisEnDemeure.jsp?matemployer=060-3214789-M&raisonsocial=GUINNESS CAMEROUN SA&numcontrib=M019200000111B&sigle=GUINNESS',
  },
]

const searchDemande = async () => {
  // Vérification des champs obligatoires
  if (!formSearch.value.numEmployeur) {
    $q.notify({
      type: 'warning',
      message: 'Veuillez renseigner le N° Employeur.',
    })
    return // on sort de la fonction si les champs sont vides
  }

  try {
    // Exemple appel API (à adapter à ton backend Laravel)
    /* const response = await axios.get('/api/demandes-controle', {
      params: {
        numEmployeur: formSearch.value.numEmployeur,
        exercice: formSearch.value.exercice,
      },
    }) */

    // rows.value = response.data // tableau venant de l’API
    resetForm()
    rows.value = rowsData
    rows2.value = rowsSanctions

    if (rows.value.length === 0) {
      $q.notify({
        type: 'info',
        message: 'Aucun résultat trouvé pour ces critères.',
      })
    }
  } catch (error) {
    console.error('Erreur recherche :', error)
    rows.value = rowsData
    rows2.value = rowsSanctions
    $q.notify({
      type: 'negative',
      message: 'Erreur lors de la recherche',
    })
  }
}

// Quand une ligne est sélectionnée

watch(selectedRow, (newVal) => {
  if (newVal.length === 0) return
  const row = newVal[0]

  formData.value.txtnumemployeur = row.matricule
  formData.value.raisonsociale = row.raison
  formData.value.txtmotif = row.motif
  formData.value.txtreference = row.reference
  formData.value.date_saisie = row.date
  formData.value.txtnumMED = row.num
  formData.value.txtmontant = row.montant
})

// Méthodes
/* const onSubmit = () => {
  console.log('Formulaire soumis :', formData.value)
  $q.notify({
    type: 'positive',
    message: 'Résultat de contrôle enregistré avec succès !',
  })
  resetForm()
} */

// Méthodes
const onSubmit = async () => {
  if (!formData.value.txtnumemployeur) {
    $q.notify({
      type: 'warning',
      message: 'Sélectionner une ligne',
    })
    return
  }
  loading.value = true
  try {
    /* const payload = { ...formData.value }
    delete payload.lignes.id // on enlève les id techniques
    const response = await axios.post('/api/controle-resultats', payload) */

    $q.notify({
      type: 'positive',
      message: 'Mise en demeure validé avec succès !',
    })
    /* console.log('Réponse API :', response.data) */
    resetForm()
  } catch (error) {
    console.error('Erreur API :', error)
    $q.notify({
      type: 'negative',
      message: 'Erreur lors de l’enregistrement',
    })
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  formData.value = {
    txtnumemployeur: '',
    raisonsociale: '',
    txtmotif: '',
    txtreference: '',
    date_saisie: '',
    txtnumMED: '',
    txtmontant: '',
    datenotify: '',
    txtuserdecharge: '',
    lignes: [],
  }
}

/* const searchDemande = () => {
  $q.notify({
    type: 'info',
    message: 'Recherche en cours... (à implémenter)',
  })
} */
</script>

<style scoped>
.saisie-resultats {
  max-width: 1200px;
  margin: 0 auto;
}
</style>

<style lang="sass">
.my-sticky-header-table
  /* height or max-height is important */
  height: 310px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: #00b4ff

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px

  /* prevent scrolling behind sticky top row on focus */
  tbody
    /* height of all previous header rows */
    scroll-margin-top: 48px
</style>
