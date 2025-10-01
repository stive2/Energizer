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

              <div class="col-4">
                <q-input
                  v-model="formSearch.exercice"
                  :label="t('labels.exercice')"
                  outlined
                  mask="####"
                  dense
                  :rules="[required]"
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
                v-model="formData.numEmployeur"
                :label="t('labels.numEmployeur')"
                outlined
                dense
                readonly
              />
            </div>
            <div class="col-9">
              <q-input
                v-model="formData.raisonSociale"
                :label="t('labels.raisonsociale')"
                outlined
                dense
                readonly
              />
            </div>
          </div>

          <!-- Ligne 2 -->
          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-3">
              <q-input
                v-model="formData.dateDebut"
                :label="t('labels.dateDebut')"
                outlined
                dense
                :rules="[required]"
                :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="formData.dateDebut" mask="DD/MM/YYYY">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup :label="t('labels.fermer')" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <div class="col-3">
              <q-input
                v-model="formData.dateFin"
                :label="t('labels.dateFin')"
                outlined
                dense
                :rules="[required]"
                :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="formData.dateFin" mask="DD/MM/YYYY">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup :label="t('labels.fermer')" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <div class="col-6 flex flex-center text-grey">
              NB: {{ t('labels.infoControleDate') }}
            </div>
          </div>

          <!-- Ligne 3 -->
          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-4">
              <q-select
                v-model="formData.codeMotif"
                :options="motifs"
                :label="t('labels.motif')"
                outlined
                :rules="[required]"
                dense
              />
            </div>
            <div class="col-8">
              <q-input
                v-model="formData.observations"
                :label="t('labels.observations')"
                outlined
                dense
                :rules="[required]"
              />
            </div>
          </div>

          <!-- Ligne 4 -->
          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-8">
              <q-input
                v-model="formData.destinataire"
                :label="t('labels.destinataire')"
                outlined
                dense
                :rules="[required]"
              />
            </div>
            <div class="col-4">
              <q-input
                v-model="formData.dateMED"
                :label="t('labels.dateMED')"
                outlined
                dense
                :rules="[required]"
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
          </div>

          <!-- Ligne 5 -->
          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-6">
              <q-input
                v-model="formData.numMED"
                :label="t('labels.numMED')"
                outlined
                dense
                :rules="[required]"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="formData.montantTotal"
                :label="t('labels.montantTotal')"
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
            <template v-slot:top-right>
              <q-btn
                color="primary"
                icon="add"
                :label="t('labels.ajouterLigne')"
                @click="ajouterLigneDetail"
                dense
              />
              <q-btn
                :label="$t('monthly_summary.remove_last')"
                color="negative"
                class="q-ml-md"
                @click="removeRow"
              />
            </template>
            <template v-slot:body-cell-libelle="props">
              <q-td :props="props">
                <q-input v-model="props.row.libelle" dense outlined />
              </q-td>
            </template>
            <template v-slot:body-cell-montant="props">
              <q-td :props="props">
                <q-input v-model="props.row.montant" dense outlined />
              </q-td>
            </template>
          </q-table>
        </q-card>

        <!-- Boutons -->
        <div class="row justify-center q-mt-lg">
          <q-btn
            :label="t('labels.enregistrer')"
            color="primary"
            type="submit"
            :loading="loading"
          />
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
  numEmployeur: '',
  raisonSociale: '',
  dateDebut: '',
  dateFin: '',
  codeMotif: '',
  observations: '',
  destinataire: '',
  dateMED: '',
  numMED: '',
  montantTotal: 0,
  lignes: [],
})

const formSearch = ref({
  numEmployeur: '',
  exercice: '',
})

// Options
const motifs = [
  { label: 'Insuffisance de versement', value: 'MD01' },
  { label: 'Suite à contrôle', value: 'MD02' },
  { label: 'Remise gracieuse', value: 'MD03' },
  { label: 'Autres', value: 'MD04' },
  { label: 'Non paiement cotisations', value: 'MD05' },
]

const columnsDetailMD = [
  { name: 'libelle', label: 'Libellé', field: 'libelle', align: 'left' },
  { name: 'montant', label: 'Montant', field: 'montant', align: 'right' },
]

function ajouterLigneDetail() {
  formData.value.lignes.push({
    id: formData.value.lignes.length + 1,
    libelle: '',
    montant: 0,
  })
}

const removeRow = () => {
  if (formData.value.lignes.length > 1) {
    formData.value.lignes.pop()
  } else {
    $q.notify({
      type: 'warning',
      message: 'Impossible de supprimer la dernière ligne',
    })
  }
}

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
  },
  {
    matricule: '020-4578912-G',
    raison: 'BANQUE CENTRALE DU CAMEROUN',
    numContrib: 'M018900000251K',
    sigle: 'BCC',
    link: 'SaisieMisEnDemeure.jsp?matemployer=020-4578912-G&raisonsocial=BANQUE CENTRALE DU CAMEROUN&numcontrib=M018900000251K&sigle=BCC',
  },
  {
    matricule: '030-7845621-H',
    raison: 'ORANGE CAMEROUN SA',
    numContrib: 'M016700000981Q',
    sigle: 'ORANGE',
    link: 'SaisieMisEnDemeure.jsp?matemployer=030-7845621-H&raisonsocial=ORANGE CAMEROUN SA&numcontrib=M016700000981Q&sigle=ORANGE',
  },
  {
    matricule: '040-9854712-K',
    raison: 'MTN CAMEROUN SA',
    numContrib: 'M017800000551T',
    sigle: 'MTN',
    link: 'SaisieMisEnDemeure.jsp?matemployer=040-9854712-K&raisonsocial=MTN CAMEROUN SA&numcontrib=M017800000551T&sigle=MTN',
  },
  {
    matricule: '050-6547891-L',
    raison: 'SOCIETE GENERALE CAMEROUN',
    numContrib: 'M018000000721Z',
    sigle: 'SGC',
    link: 'SaisieMisEnDemeure.jsp?matemployer=050-6547891-L&raisonsocial=SOCIETE GENERALE CAMEROUN&numcontrib=M018000000721Z&sigle=SGC',
  },
  {
    matricule: '060-3214789-M',
    raison: 'GUINNESS CAMEROUN SA',
    numContrib: 'M019200000111B',
    sigle: 'GUINNESS',
    link: 'SaisieMisEnDemeure.jsp?matemployer=060-3214789-M&raisonsocial=GUINNESS CAMEROUN SA&numcontrib=M019200000111B&sigle=GUINNESS',
  },
  {
    matricule: '070-8521479-N',
    raison: 'CAMRAIL',
    numContrib: 'M015800000991C',
    sigle: 'CAMRAIL',
    link: 'SaisieMisEnDemeure.jsp?matemployer=070-8521479-N&raisonsocial=CAMRAIL&numcontrib=M015800000991C&sigle=CAMRAIL',
  },
  {
    matricule: '080-9632147-P',
    raison: 'CIMENCAM',
    numContrib: 'M017100000411D',
    sigle: 'CIMENCAM',
    link: 'SaisieMisEnDemeure.jsp?matemployer=080-9632147-P&raisonsocial=CIMENCAM&numcontrib=M017100000411D&sigle=CIMENCAM',
  },
]

const searchDemande = async () => {
  // Vérification des champs obligatoires
  if (!formSearch.value.numEmployeur || !formSearch.value.exercice) {
    $q.notify({
      type: 'warning',
      message: 'Veuillez renseigner le N° Employeur et l’Exercice avant la recherche.',
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

  formData.value.numEmployeur = row.matricule
  formData.value.raisonSociale = row.raison
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
  loading.value = true
  try {
    /* const payload = { ...formData.value }
    delete payload.lignes.id // on enlève les id techniques
    const response = await axios.post('/api/controle-resultats', payload) */

    $q.notify({
      type: 'positive',
      message: 'Mise en demeure enregistré avec succès !',
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
    numEmployeur: '',
    raisonSociale: '',
    dateDebut: '',
    dateFin: '',
    codeMotif: '',
    observations: '',
    destinataire: '',
    dateMED: '',
    numMED: '',
    montantTotal: 0,
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
