<template>
  <div class="q-pa-sm elements-liquidation-af">
    <q-banner v-if="errorMsg" class="bg-negative text-white q-mb-sm" rounded dense>
      <template v-slot:avatar><q-icon name="error" color="white" /></template>
      {{ errorMsg }}
      <template v-slot:action><q-btn flat color="white" label="Fermer" dense @click="errorMsg = ''" /></template>
    </q-banner>

    <q-card class="card-elevated">
      <q-card-section class="table-toolbar q-py-sm q-px-sm q-px-md">
        <div class="row items-center q-col-gutter-sm q-mb-xs">
          <div class="col-12 col-lg-auto row items-center no-wrap q-gutter-xs toolbar-title-row">
            <q-icon name="family_restroom" size="sm" color="primary" />
            <span class="text-body2 text-weight-bold text-primary">Éléments de Liquidation AF</span>
            <q-badge outline color="primary" :label="`${dossiers.length}`" />
          </div>
          <q-form class="col-12 col-lg toolbar-search-form" @submit.prevent="searchDossiers" @reset.prevent="resetSearch">
            <div class="row q-col-gutter-sm items-center">
              <div class="col-12 col-sm-6 col-md-3 col-lg-auto">
                <q-select v-model="cbxcritere" name="cbxcritere" :options="searchOptions" label="Critères" label-color="primary"
                  outlined dense emit-value map-options color="primary" class="toolbar-field toolbar-field--critere full-width" hide-bottom-space />
              </div>
              <div class="col-12 col-sm-6 col-md-4 col-lg-auto">
                <q-input v-model="txtvaleurdeb" name="txtvaleurdeb" label="Valeur de Début" label-color="primary" outlined dense color="primary"
                  class="toolbar-field toolbar-field--valeur full-width" hide-bottom-space
                  @update:model-value="val => (txtvaleurdeb = (val || '').toUpperCase())"
                  @keyup.enter="searchDossiers" />
              </div>
              <div class="col-12 col-sm-12 col-md-4 col-lg-auto row q-gutter-sm items-center toolbar-actions">
                <q-btn type="submit" color="primary" icon="search" label="Rechercher" dense unelevated :loading="loading" class="toolbar-btn col-grow col-sm-auto" />
                <q-btn type="reset" flat dense round color="primary" icon="restart_alt" :disable="loading"><q-tooltip>Réinitialiser</q-tooltip></q-btn>
              </div>
            </div>
          </q-form>
        </div>
        <div class="text-caption text-primary toolbar-hint row items-center">
          <q-icon name="touch_app" size="xs" class="q-mr-xs flex-shrink-0" />
          <span>Cliquez sur un N° dossier pour ouvrir la saisie AF</span>
        </div>
      </q-card-section>
      <q-card-section class="q-pa-none pf-table-responsive">
        <q-table
          :rows="dossiers"
          :columns="visibleTableColumns"
          row-key="numdoss"
          :grid="tableGrid"
          :loading="loading"
          dense flat
          :rows-per-page-options="tableRowsPerPageOptions"
          :pagination="{ rowsPerPage: tableDefaultRowsPerPage }"
          no-data-label="Aucun dossier trouvé — modifiez les critères de recherche"
          class="pf-module-table"
        >
          <template v-slot:header-cell="props">
            <q-th :props="props" class="pf-col-header bg-primary text-white">
              <span class="pf-col-header__label text-weight-bold">{{ props.col.label }}</span>
            </q-th>
          </template>
          <template v-slot:body-cell-index="props"><q-td :props="props" class="text-center text-grey-6">{{ props.rowIndex + 1 }}</q-td></template>
          <template v-slot:body-cell-numdoss="props">
            <q-td :props="props">
              <a class="dossier-link" href="#" @click.prevent="loadDossier(props.row)">
                <q-icon name="folder_open" size="xs" class="q-mr-xs" />{{ props.row.numdoss }}
              </a>
            </q-td>
          </template>
          <template v-slot:item="props">
            <div class="pf-grid-card q-pa-sm q-mb-sm" @click="loadDossier(props.row)">
              <div class="row items-center justify-between q-mb-xs">
                <a class="dossier-link text-body2" href="#" @click.prevent.stop="loadDossier(props.row)">{{ props.row.numdoss }}</a>
                <q-badge :color="getStatusColor(props.row.position)" :label="props.row.position || '—'" dense />
              </div>
              <div class="text-caption text-grey-8">{{ props.row.requerant }}</div>
            </div>
          </template>
          <template v-slot:body-cell-position="props">
            <q-td :props="props"><q-badge :color="getStatusColor(props.row.position)" :label="props.row.position || '—'" style="font-size:0.7rem" /></q-td>
          </template>
          <template v-slot:no-data="{ message }"><div class="full-width row flex-center text-grey-6 q-pa-lg"><q-icon name="inbox" size="2rem" class="q-mr-sm" />{{ message }}</div></template>
          <template v-slot:loading><q-inner-loading showing color="primary" /></template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog
      v-model="showDialog"
      persistent
      :maximized="$q.screen.lt.sm"
      transition-show="slide-up"
      transition-hide="slide-down"
      :full-width="$q.screen.lt.md"
      :full-height="$q.screen.lt.sm"
    >
      <q-card class="dialog-form-card" :class="{ 'dialog-form-card--desktop': $q.screen.gt.sm }">
        <q-bar class="bg-primary text-white q-py-sm dialog-bar">
          <q-icon name="family_restroom" class="flex-shrink-0" />
          <span class="q-ml-sm text-body2 text-weight-bold dialog-bar__title ellipsis">Saisie des Éléments de Liquidation AF</span>
          <q-space />
          <q-btn flat dense round color="white" icon="restart_alt" size="sm" @click="resetForm"><q-tooltip>Réinitialiser</q-tooltip></q-btn>
          <q-btn flat dense round color="white" icon="close" size="sm" v-close-popup @click="resetForm" />
        </q-bar>
        <q-card-section class="q-pa-md overflow-auto dialog-body">
          <q-form ref="saisieFormRef" class="pf-legacy-form" @submit.prevent="submitForm" @reset="resetForm">

            <div class="row pf-form-row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">N° Dossier</span>
                  <q-input v-model="form.txtsaisienumdoss" name="txtsaisienumdoss" dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Nature Prestation</span>
                  <q-input v-model="form.txtsaisienatupres" name="txtsaisienatupres" dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Date Demande</span>
                  <q-input v-model="form.txtsaisiedatedemande" name="txtsaisiedatedemande" dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                </div>
              </div>
            </div>

            <div class="row pf-form-row pf-form-row--alt q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">N° Assuré</span>
                  <q-input v-model="form.txtsaisienumassu" name="txtsaisienumassu" dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Noms Assuré</span>
                  <q-input v-model="form.txtsaisietextenomassu" name="txtsaisietextenomassu" dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Prénoms Assuré</span>
                  <q-input v-model="form.txtsaisietexteprenomassu" name="txtsaisietexteprenomassu" dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                </div>
              </div>
            </div>

            <!-- Ligne : Date Embauche | Date Signature Employeur | Nb heures mois embauche -->
            <div class="row pf-form-row q-col-gutter-sm pf-form-row--inline-fields">
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="form.txtSaisieDateEmbauche"
                  name="txtSaisieDateEmbauche"
                  stack-label
                  label="Date Embauche"
                  label-color="grey-8"
                  dense outlined hide-bottom-space
                  bg-color="yellow-1"
                  class="full-width af-field-labeled"
                  :rules="[v => (!!v && v.length === 10) || 'Veuillez saisir la date d\'embauche SVP']"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="form.txtSaisieDateEmbauche" mask="DD/MM/YYYY" today-btn color="primary">
                          <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="form.txtSaisieDateSignatureEmpl"
                  name="txtSaisieDateSignatureEmpl"
                  stack-label
                  label="Date Signature Demande par Employeur"
                  label-color="grey-8"
                  dense outlined hide-bottom-space
                  bg-color="yellow-1"
                  class="full-width af-field-labeled"
                  :rules="[v => (!!v && v.length === 10) || 'Veuillez saisir la date de signature employeur SVP']"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="form.txtSaisieDateSignatureEmpl" mask="DD/MM/YYYY" today-btn color="primary">
                          <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-sm-4">
                <q-input
                  v-model.number="form.txtSaisieNbreHeures"
                  name="txtSaisieNbreHeures"
                  type="number"
                  min="0"
                  max="744"
                  stack-label
                  label="Nombre Heures Travaillées Mois Embauche"
                  label-color="grey-8"
                  dense outlined hide-bottom-space
                  bg-color="yellow-1"
                  class="full-width af-field-labeled"
                />
              </div>
            </div>

            <div class="row q-col-gutter-sm q-mt-md dialog-actions">
              <div class="col-12 col-sm-auto">
                <q-btn type="submit" color="primary" label="Valider" unelevated class="full-width pf-legacy-btn" :loading="submitting" />
              </div>
              <div class="col-12 col-sm-auto">
                <q-btn type="reset" color="grey-7" label="Annuler" unelevated class="full-width pf-legacy-btn" @click="resetForm" />
              </div>
            </div>

          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { usePfModuleTable } from 'src/modules/shared/composables/usePfModuleTable.js'
import { useQuasar } from 'quasar'
import { useLiquidationPfStore } from 'src/modules/energizer/stores/liquidationPfStore.js'

defineOptions({ name: 'ElementsLiquidationAF' })

const $q = useQuasar()
const pfStore = useLiquidationPfStore()
const loading    = ref(false)
const submitting = ref(false)
const errorMsg   = ref('')
const showDialog = ref(false)
const saisieFormRef = ref(null)
const cbxcritere   = ref('fnumdoss')
const txtvaleurdeb = ref('000-')
const searchOptions = [
  { label: 'Num Dossier', value: 'fnumdoss' },
  { label: 'Num Assuré',  value: 'fnumassu' },
  { label: 'Noms Assuré', value: 'fnomassu' },
]

const FORM_INITIAL = {
  txtsaisienumdoss: '',
  txtsaisienatupres: '',
  txtsaisiedatedemande: '',
  txtsaisienumassu: '',
  txtsaisietextenomassu: '',
  txtsaisietexteprenomassu: '',
  txtSaisieDateEmbauche: '',
  txtSaisieDateSignatureEmpl: '',
  txtSaisieNbreHeures: 0,
}
const form = reactive({ ...FORM_INITIAL })
const dossiers = ref([])
const tableColumns = [
  { name: 'index',      label: 'N°',              field: 'index',       align: 'center', style: 'width:50px' },
  { name: 'numdoss',    label: 'N° Dossier',       field: 'numdoss',     align: 'left', sortable: true },
  { name: 'numassu',    label: 'N° Assuré',        field: 'numassu',     align: 'left', sortable: true },
  { name: 'requerant',  label: 'Noms Requérant',   field: 'requerant',   align: 'left', sortable: true },
  { name: 'datedemande',label: 'Date Demande',      field: 'datedemande', align: 'left', sortable: true },
  { name: 'natupres',   label: 'Nature Prestation', field: 'natupres',    align: 'left', sortable: true },
  { name: 'position',   label: 'Position Dossier', field: 'position',    align: 'left', sortable: true },
  { name: 'dateposi',   label: 'Date Position',    field: 'dateposi',    align: 'left', sortable: true },
]
const { visibleTableColumns, tableGrid, tableRowsPerPageOptions, tableDefaultRowsPerPage } = usePfModuleTable(tableColumns, {
  mobileCols: ['index', 'numdoss', 'requerant', 'position'],
  tabletHidden: ['dateposi', 'natupres'],
})
const MOCK_AF = [
  { numdoss: 'F2026-005', numassu: '5-20-97-333444-11', requerant: 'BIYONG Albertine', datedemande: '10-01-2026', natupres: 'AF', libellenatupres: 'Allocations Familiales', position: 'En Cours de Traitement', dateposi: '10-01-2026', nomassu: 'BIYONG', prenomassu: 'Albertine', sexe: 'F', dateembauche: '01-06-2015', datesignempl: '05-01-2026', nbreheure: 173 },
  { numdoss: 'F2026-006', numassu: '5-20-97-555666-22', requerant: 'OTTOU Jeanne', datedemande: '15-02-2026', natupres: 'PF', libellenatupres: 'Prestations Familiales', position: 'En attente de pièces', dateposi: '18-02-2026', nomassu: 'OTTOU', prenomassu: 'Jeanne', sexe: 'F', dateembauche: '15-03-2010', datesignempl: '10-02-2026', nbreheure: 140 },
  { numdoss: 'F2026-007', numassu: '5-20-97-777888-44', requerant: 'EKOA Martine', datedemande: '05-03-2026', natupres: 'AF', libellenatupres: 'Allocations Familiales', position: 'Transmis au superviseur', dateposi: '07-03-2026', nomassu: 'EKOA', prenomassu: 'Martine', sexe: 'F', dateembauche: '01-01-2018', datesignempl: '01-03-2026', nbreheure: 0 },
  { numdoss: 'F2026-008', numassu: '5-20-97-999000-66', requerant: 'MBIA Carine', datedemande: '20-04-2026', natupres: 'AF', libellenatupres: 'Allocations Familiales', position: 'Annuler Liquidation', dateposi: '22-04-2026', nomassu: 'MBIA', prenomassu: 'Carine', sexe: 'F', dateembauche: '10-09-2012', datesignempl: '15-04-2026', nbreheure: 80 },
]
onMounted(() => { dossiers.value = MOCK_AF })

function fmtDate(v) {
  return (v ?? '').replace(/\//g, '-')
}

function loadDossier(row) {
  form.txtsaisienumdoss = row.numdoss ?? ''
  form.txtsaisienumassu = row.numassu ?? ''
  form.txtsaisiedatedemande = fmtDate(row.datedemande)
  form.txtsaisienatupres = row.libellenatupres ?? row.natupres ?? ''
  form.txtsaisietextenomassu = row.nomassu ?? ''
  form.txtsaisietexteprenomassu = row.prenomassu ?? ''
  form.txtSaisieDateEmbauche = fmtDate(row.dateembauche)
  form.txtSaisieDateSignatureEmpl = fmtDate(row.datesignempl)
  form.txtSaisieNbreHeures = (row.nbreheure !== null && row.nbreheure !== 'null') ? (Number(row.nbreheure) || 0) : 0
  showDialog.value = true
  $q.notify({ type: 'positive', message: `Dossier ${row.numdoss} chargé`, position: 'top', timeout: 1500 })
}

function validateForm() {
  if (!form.txtSaisieDateEmbauche || form.txtSaisieDateEmbauche.length !== 10) {
    $q.notify({ type: 'negative', message: "Veuillez saisir la date d'embauche SVP", position: 'top' })
    return false
  }
  if (!form.txtSaisieDateSignatureEmpl || form.txtSaisieDateSignatureEmpl.length !== 10) {
    $q.notify({ type: 'negative', message: 'Veuillez saisir la date de signature employeur SVP', position: 'top' })
    return false
  }
  return true
}

async function submitForm() {
  const ok = await saisieFormRef.value?.validate()
  if (!ok) return
  if (!validateForm()) return
  submitting.value = true
  try {
    await pfStore.submitAllocationFamiliale(form)
    $q.notify({ type: 'positive', message: 'Éléments AF enregistrés avec succès !', position: 'top', icon: 'check_circle' })
    showDialog.value = false
    resetForm()
  } catch {
    $q.notify({ type: 'negative', message: "Erreur lors de l'enregistrement", position: 'top' })
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  Object.assign(form, { ...FORM_INITIAL })
  saisieFormRef.value?.resetValidation()
}

function searchDossiers() {
  loading.value = true
  errorMsg.value = ''
  pfStore.searchDossiers({ criteria: cbxcritere.value, start: txtvaleurdeb.value })
    .then((list) => {
      dossiers.value = list?.length ? list : MOCK_AF
      $q.notify({ type: 'info', message: 'Recherche effectuée', position: 'top' })
    })
    .catch(() => { dossiers.value = MOCK_AF })
    .finally(() => { loading.value = false })
}

function resetSearch() {
  cbxcritere.value = 'fnumdoss'
  txtvaleurdeb.value = '000-'
  dossiers.value = MOCK_AF
  errorMsg.value = ''
}

function getStatusColor(s) {
  if (!s) return 'grey-5'
  const t = s.toLowerCase()
  if (t.includes('cours')) return 'orange-7'
  if (t.includes('attente')) return 'blue-6'
  if (t.includes('transmi')) return 'teal-6'
  if (t.includes('annul')) return 'negative'
  return 'grey-6'
}
</script>

<style scoped>
.elements-liquidation-af { max-width: 1400px; margin: 0 auto; }
.card-elevated { border-radius: 15px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); }
.pf-form-row--inline-fields {
  align-items: flex-start;
}
.pf-form-row--inline-fields .af-field-labeled :deep(.q-field__label) {
  font-size: 0.72rem;
  line-height: 1.2;
  white-space: normal;
}
.pf-form-row--inline-fields .af-field-labeled :deep(.q-field__control) {
  min-height: 52px;
}
</style>
