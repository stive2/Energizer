<template>
  <div class="nouveau-dossier">
    <q-card class="q-pa-sm">
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
            style="height: 600px"
            :columns="columns"
            row-key="numDossier"
            selection="single"
            v-model:selected="selectedRow"
          />
        </div>
      </q-card>
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
const { t } = useI18n()

// exemple d’utilisation

const formStruct = {
  numassu: '',
  nom: '',
  prenom: '',
  numdossier: '',
  objet: '',
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
  { name: 'numDossier', label: 'N° Dossier', align: 'left', field: (row) => row.numDossier },
  { name: 'numAssure', label: 'N° Assuré', align: 'left', field: (row) => row.numAssure },
  { name: 'objet', label: 'Objet', align: 'left', field: (row) => row.objet },
  { name: 'nature', label: 'Nature', align: 'left', field: (row) => row.nature },
  {
    name: 'dateDeclaration',
    label: 'Date Declaration',
    align: 'left',
    field: (row) => row.dateDeclaration,
  },
  { name: 'dateDemande', label: 'Date Demande', align: 'left', field: (row) => row.dateDemande },
  { name: 'requérant', label: 'Requérant', align: 'left', field: (row) => row.requerant },
  { name: 'position', label: 'Position', align: 'left', field: (row) => row.position },
  { name: 'flagCI', label: 'FLAG C.I', align: 'left', field: (row) => row.flagCI },
  { name: 'flagCF', label: 'FLAG C.F', align: 'left', field: (row) => row.flagCF },
  { name: 'lienGED', label: 'Lien GED', align: 'left', field: (row) => row.lienGED },
  { name: 'consulter', label: 'Consulter', align: 'left', field: (row) => row.consulter },
]

const rows = ref([])

const required = (val) => !!val || 'Ce champ est requis / This field is required'

// Ligne sélectionnée
const selectedRow = ref([])

const searchDemande = async () => {
  // Vérification des champs obligatoires
  resetForm()

  rows.value = rowsData
  $q.notify({
    type: 'positive',
    message: 'Ok',
  })
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
