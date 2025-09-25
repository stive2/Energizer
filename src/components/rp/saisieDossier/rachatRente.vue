<template>
  <div class="nouveau-dossier">
    <q-card class="q-pa-sm">
      <q-form @submit.prevent="onSubmit" class="q-gutter-md">
        <!-- Recherche des dossiers -->
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle1 q-mb-sm text-bold">Rechercher Dossier RP</div>
          <q-form @submit.prevent="searchDemande" ref="searchForm">
            <div class="row q-col-gutter-md">
              <div class="col-3">
                <q-select
                  v-model="formSearch.cbxcritere"
                  :options="typeCr"
                  :label="$t('revisions.critereRecherche')"
                  outlined
                  dense
                  @update:model-value="rows = []"
                  :rules="[required]"
                />
              </div>

              <div class="col-3">
                <q-input
                  v-model="formSearch.txtvaleurdeb"
                  :label="$t('revisions.valeurDebut')"
                  outlined
                  dense
                  :rules="[required]"
                />
              </div>

              <div class="col-3">
                <q-input
                  v-model="formSearch.txtvaleurfin"
                  :label="$t('revisions.valeurFin')"
                  outlined
                  dense
                  :rules="[required]"
                />
              </div>

              <div class="col-3 flex flex-center">
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
              row-key="numDossier"
              selection="single"
              v-model:selected="selectedRow"
            />
          </div>
        </q-card>

        <!-- Informations Employeur -->
        <q-card flat bordered class="q-pa-md">
          <!-- Ligne 1 -->
          <div class="row q-col-gutter-md">
            <div class="col-4">
              <q-input
                :label="$t('revisions.numDossier')"
                v-model="formData.numdossier"
                outlined
                dense
                readonly
              />
            </div>
            <div class="col-8">
              <q-input label="Objet" v-model="formData.objet" outlined dense :rules="[required]" />
            </div>
          </div>

          <!-- Ligne 2 -->
          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-4">
              <q-input
                :label="$t('revisions.numAssure')"
                v-model="formData.numassu"
                outlined
                dense
                readonly
              />
            </div>
            <div class="col-4">
              <q-input
                :label="$t('revisions.nomAssure')"
                v-model="formData.nom"
                outlined
                dense
                readonly
              />
            </div>
            <div class="col-4">
              <q-input
                :label="$t('revisions.prenomAssure')"
                v-model="formData.prenom"
                outlined
                dense
                readonly
              />
            </div>
          </div>

          <!-- Ligne 3 -->
          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-4">
              <q-input
                :label="$t('revisions.dateAccident')"
                v-model="formData.dateaccident"
                outlined
                dense
                :rules="[required]"
                :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="formData.dateaccident" mask="DD/MM/YYYY">
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
                :label="$t('revisions.dateConsolidation')"
                v-model="formData.dateconsolidation"
                outlined
                dense
                :rules="[required]"
                :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="formData.dateconsolidation" mask="DD/MM/YYYY">
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
                :label="$t('revisions.datedepot')"
                v-model="formData.datedepot"
                outlined
                dense
                :rules="[required]"
                :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="formData.datedepot" mask="DD/MM/YYYY">
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

          <!-- Ligne 4 -->
          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-3">
              <q-select
                outlined
                dense
                :options="['OUI', 'NON']"
                :label="$t('revisions.validiterachat')"
                v-model="formData.validiterachat"
                :rules="[
                  (val) => (val && val.length != null && val.length != '') || $t('Required'),
                ]"
              />
            </div>
            <div class="col-3">
              <q-input
                :label="$t('revisions.montantannuelrachat')"
                v-model="formData.montantannuelrachat"
                outlined
                dense
                :rules="[required]"
              />
            </div>
            <div class="col-3">
              <q-input
                :label="$t('revisions.montantrachat')"
                v-model="formData.montantrachat"
                outlined
                dense
                :rules="[required]"
              />
            </div>
            <div class="col-3">
              <q-input
                :label="$t('revisions.nouvellerente')"
                v-model="formData.nouvellerente"
                outlined
                dense
                :rules="[required]"
              />
            </div>
          </div>

          <!-- Ligne 5 -->
          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-4">
              <q-input
                :label="$t('revisions.age')"
                v-model="formData.age"
                outlined
                dense
                :rules="[required]"
              />
            </div>
            <div class="col-4">
              <q-input
                :label="$t('revisions.franc')"
                v-model="formData.franc"
                outlined
                dense
                :rules="[required]"
              />
            </div>
            <div class="col-4">
              <q-select
                outlined
                dense
                :options="['OUI', 'NON']"
                :label="$t('revisions.validationcc')"
                v-model="formData.validationcc"
                :rules="[
                  (val) => (val && val.length != null && val.length != '') || $t('Required'),
                ]"
              />
            </div>
          </div>

          <!-- Ligne 5 -->
          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-4">
              <q-input
                :label="$t('revisions.reserve')"
                v-model="formData.reserve"
                outlined
                dense
                :rules="[required]"
              />
            </div>
            <div class="col-4">
              <q-input
                :label="$t('revisions.numdecision')"
                v-model="formData.reserve"
                outlined
                dense
                :rules="[required]"
              />
            </div>
            <div class="col-4">
              <q-input
                :label="$t('revisions.datedecision')"
                v-model="formData.datedecision"
                outlined
                dense
                :rules="[required]"
                :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="formData.datedecision" mask="DD/MM/YYYY">
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
        </q-card>

        <!-- Boutons -->
        <div class="row justify-center q-mt-lg">
          <q-btn label="Liquider" color="primary" type="submit" :loading="loading" />
          <q-btn
            label="Faire Valider par le CC"
            class="q-ml-md"
            color="primary"
            type="submit"
            :loading="loading"
          />
          <q-btn
            :label="$t('revisions.reinitialiser')"
            color="warning"
            flat
            class="q-ml-md"
            @click="resetForm"
          />
        </div>
      </q-form>
    </q-card>

    <q-dialog v-model="loading" persistent>
      <div class="row items-center justify-center q-pa-md">
        <CustomSpinner :show="loading" />
      </div>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
// import axios from 'axios'
import { useI18n } from 'vue-i18n'
import { dossiersRp as rowsData } from '../../../data/DossiersRp.js'
import CustomSpinner from 'src/components/CustomSpinner.vue'

const $q = useQuasar()
const loading = ref(false)
const eltSelect = ref(false)
const { t, locale } = useI18n()

// exemple d’utilisation

const formStruct = {
  numassu: '',
  nom: '',
  prenom: '',
  numdossier: '',
  objet: '',
  dateaccident: '',
  dateconsolidation: '',
  datedepot: '',
  validiterachat: '',
  montantannuelrachat: '',
  montantrachat: '',
  nouvellerente: '',
  age: '',
  franc: '',
  datedecision: '',
  validationcc: '',
  reserve: '',
  numdecision: '',
}

// Données du formulaire
const formData = ref({})

const formSearch = ref({
  cbxcritere: '',
  txtvaleurdeb: '',
  txtvaleurfin: '',
})

// Colonnes Recherche
const columns = [
  {
    name: 'numDossier',
    label: 'Num dossier',
    align: 'left',
    field: (row) => row.numDossier || '',
  },
  {
    name: 'numAssure',
    label: 'Num assuré',
    align: 'left',
    field: (row) => row.numAssure || '',
  },
  {
    name: 'dateAccident',
    label: 'Date accident',
    align: 'left',
    field: (row) => row.dateAccident || '',
  },
  {
    name: 'dateConsolidation',
    label: 'Date Consolidation',
    align: 'left',
    field: (row) => row.dateConsolidation || '',
  },
  {
    name: 'rmm',
    label: 'RMM',
    align: 'right',
    field: (row) => row.rmm || 0,
  },
  {
    name: 'tauxIPP',
    label: 'Taux IPP',
    align: 'right',
    field: (row) => row.tauxIPP || 0,
  },
  {
    name: 'montantRente',
    label: 'Montant rente',
    align: 'right',
    field: (row) => row.montantRente || 0,
  },
]

const rows = ref([])

const required = (val) => !!val || 'Ce champ est requis / This field is required'

// Ligne sélectionnée
const selectedRow = ref([])

const searchDemande = async () => {
  // Vérification des champs obligatoires
  resetForm()

  rows.value = rowsData
  return // on sort de la fonction si les champs sont vides

  /* try {
    // Exemple appel API (à adapter à ton backend Laravel)
    const response = await axios.get('/api/demandes-controle', {
      params: {
        numEmployeur: formSearch.value.numEmployeur,
        exercice: formSearch.value.exercice,
      },
    })

    // rows.value = response.data // tableau venant de l’API
    resetForm()
    rows.value = rowsData

    if (rows.value.length === 0) {
      $q.notify({
        type: 'info',
        message: 'Aucun résultat trouvé pour ces critères.',
      })
    }
  } catch (error) {
    console.error('Erreur recherche :', error)
    $q.notify({
      type: 'negative',
      message: 'Erreur lors de la recherche',
    })
  } */
}

watch(selectedRow, (newVal) => {
  if (newVal.length === 0) return
  const row = newVal[0]

  eltSelect.value = true
  formData.value.numdossier = row.numDossier
  formData.value.dateaccident = row.dateAccident
  formData.value.dateconsolidation = row.dateConsolidation
  formData.value.nom = row.nomAssure
  formData.value.prenom = row.prenomAssure
  formData.value.numassu = row.numAssure
  formData.value.objet = row.objet
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

const typeCr = [
  { label: 'Num Assuré', value: 'numassu' },
  { label: 'Nom Assuré', value: 'nomassu' },
  { label: 'Nom Bénéficiaire', value: 'nombene' },
]

// Méthodes
const onSubmit = async () => {
  loading.value = true
  try {
    /* const payload = { ...formData.value }
    delete payload.lignes.id // on enlève les id techniques
    const response = await axios.post('/api/controle-resultats', payload) */

    $q.notify({
      type: 'positive',
      message: 'Révison enregistrée avec succès !',
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
  formData.value = formStruct
  selectedRow.value = []
  rows.value = []
  eltSelect.value = false
}

/* const searchDemande = () => {
  $q.notify({
    type: 'info',
    message: 'Recherche en cours... (à implémenter)',
  })
} */
</script>

<style scoped>
.nouveau-dossier {
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
