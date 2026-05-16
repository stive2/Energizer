<template>
  <div class="q-pa-sm elements-liquidation-af">
    <q-banner v-if="errorMsg" class="bg-negative text-white q-mb-sm" rounded dense>
      <template v-slot:avatar><q-icon name="error" color="white" /></template>
      {{ errorMsg }}
      <template v-slot:action><q-btn flat color="white" label="Fermer" dense @click="errorMsg = ''" /></template>
    </q-banner>

    <q-card class="q-mb-sm card-elevated">
      <q-card-section class="bg-primary text-white card-header-rounded q-py-sm">
        <div class="row items-center">
          <q-icon name="search" size="xs" class="q-mr-xs" />
          <span class="text-body2 text-weight-bold">Recherche de Dossiers</span>
        </div>
      </q-card-section>
      <q-card-section class="q-py-sm">
        <q-form @submit.prevent="searchDossiers" @reset="resetSearch">
          <div class="row q-col-gutter-sm items-end">
            <div class="col-12 col-sm-3">
              <q-select v-model="searchCriteria" :options="searchOptions" label="Critères" outlined dense emit-value map-options color="primary" />
            </div>
            <div class="col-12 col-sm-3">
              <q-input v-model="searchStartValue" label="Valeur de Début" outlined dense @update:model-value="val => (searchStartValue = (val || '').toUpperCase())" />
            </div>
            <div class="col-12 col-sm-3">
              <q-input v-model="searchEndValue" label="Valeur de Fin" outlined dense @update:model-value="val => (searchEndValue = (val || '').toUpperCase())" />
            </div>
            <div class="col-12 col-sm-3">
              <div class="row q-gutter-xs">
                <q-btn type="submit" color="primary" label="Rechercher" icon="search" dense unelevated style="border-radius:8px" :loading="loading" />
                <q-btn type="reset" color="grey-6" label="Annuler" icon="close" dense unelevated style="border-radius:8px" />
              </div>
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <q-card class="card-elevated">
      <q-card-section class="bg-primary text-white card-header-rounded q-py-sm">
        <div class="row items-center justify-between">
          <div class="row items-center">
            <q-icon name="family_restroom" size="xs" class="q-mr-xs" />
            <span class="text-body2 text-weight-bold">Éléments de Liquidation des Dossiers AF</span>
          </div>
          <div class="row items-center q-gutter-sm">
            <q-badge color="white" text-color="primary" :label="`${dossiers.length} dossier(s)`" />
            <q-btn color="white" text-color="primary" icon="add" label="Nouvelle saisie" dense unelevated size="sm" style="border-radius:8px; font-weight:600;" @click="openDialog()" />
          </div>
        </div>
      </q-card-section>
      <q-card-section class="q-pa-none">
        <q-table :rows="dossiers" :columns="tableColumns" row-key="numdoss" :loading="loading" dense flat :rows-per-page-options="[10, 20, 50]" no-data-label="Aucun dossier trouvé — utilisez la recherche ci-dessus" class="af-table">
          <template v-slot:body-cell-index="props"><q-td :props="props" class="text-center text-grey-6">{{ props.rowIndex + 1 }}</q-td></template>
          <template v-slot:body-cell-numdoss="props">
            <q-td :props="props">
              <a class="dossier-link" href="#" @click.prevent="loadDossier(props.row)">
                <q-icon name="folder_open" size="xs" class="q-mr-xs" />{{ props.row.numdoss }}
              </a>
            </q-td>
          </template>
          <template v-slot:body-cell-position="props">
            <q-td :props="props"><q-badge :color="getStatusColor(props.row.position)" :label="props.row.position || '—'" style="font-size:0.7rem" /></q-td>
          </template>
          <template v-slot:no-data="{ message }"><div class="full-width row flex-center text-grey-6 q-pa-lg"><q-icon name="inbox" size="2rem" class="q-mr-sm" />{{ message }}</div></template>
          <template v-slot:loading><q-inner-loading showing color="primary" /></template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showDialog" persistent maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="dialog-form-card">
        <q-bar class="bg-primary text-white q-py-sm">
          <q-icon name="family_restroom" />
          <span class="q-ml-sm text-body1 text-weight-bold">Saisie des Éléments de Liquidation AF</span>
          <q-space />
          <q-btn flat dense round color="white" icon="restart_alt" size="sm" @click="resetForm"><q-tooltip>Réinitialiser</q-tooltip></q-btn>
          <q-btn flat dense round color="white" icon="close" size="sm" v-close-popup @click="resetForm" />
        </q-bar>
        <q-card-section class="q-pa-sm overflow-auto dialog-body">
          <q-form ref="saisieFormRef" @submit.prevent="submitForm" @reset="resetForm">

            <div class="sep q-mb-xs"><q-icon name="folder_open" size="xs" class="q-mr-xs" />Identification du Dossier</div>
            <div class="row q-col-gutter-xs q-mb-sm">
              <div class="col-6 col-md-2"><q-input v-model="form.numdoss" label="N° Dossier" outlined dense readonly bg-color="blue-grey-1" label-color="primary" /></div>
              <div class="col-6 col-md-3"><q-input v-model="form.natupres" label="Nature Prestation" outlined dense readonly bg-color="blue-grey-1" label-color="primary" /></div>
              <div class="col-6 col-md-2"><q-input v-model="form.datedemande" label="Date Demande" outlined dense readonly bg-color="blue-grey-1" label-color="primary" /></div>
              <div class="col-6 col-md-2"><q-input v-model="form.numassu" label="N° Assuré" outlined dense readonly bg-color="blue-grey-1" label-color="primary" /></div>
              <div class="col-6 col-md-2"><q-input v-model="form.nomassu" label="Noms Assuré" outlined dense readonly bg-color="blue-grey-1" label-color="primary" /></div>
              <div class="col-6 col-md-1"><q-input v-model="form.prenomassu" label="Prénoms" outlined dense readonly bg-color="blue-grey-1" label-color="primary" /></div>
            </div>

            <div class="sep q-mb-xs"><q-icon name="work" size="xs" class="q-mr-xs" />Données d'Embauche</div>
            <div class="row q-col-gutter-xs q-mb-sm items-start">
              <div class="col-12 col-md-4">
                <q-input v-model="form.dateembauche" label="Date Embauche" outlined dense bg-color="yellow-1"
                  :rules="[v => (!!v && v.length === 10) || 'Veuillez saisir la date d\'embauche SVP']">
                  <template v-slot:prepend><q-icon name="event" color="amber-8" size="xs" /></template>
                  <template v-slot:append>
                    <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="form.dateembauche" mask="DD/MM/YYYY" today-btn color="primary">
                          <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model="form.datesignempl" label="Date Signature Demande par Employeur" outlined dense bg-color="yellow-1"
                  :rules="[v => (!!v && v.length === 10) || 'Veuillez saisir la date de signature employeur SVP']">
                  <template v-slot:prepend><q-icon name="draw" color="amber-8" size="xs" /></template>
                  <template v-slot:append>
                    <q-icon name="edit_calendar" class="cursor-pointer" color="amber-8" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="form.datesignempl" mask="DD/MM/YYYY" today-btn color="primary">
                          <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-12 col-md-4">
                <q-input v-model.number="form.nbreheure" label="Nombre Heures Travaillées Mois Embauche" type="number" min="0" max="744" outlined dense>
                  <template v-slot:prepend><q-icon name="schedule" color="primary" size="xs" /></template>
                  <template v-slot:append><span class="text-caption text-grey-6">h</span></template>
                </q-input>
              </div>
            </div>

            <div class="row justify-center q-gutter-sm q-mt-sm">
              <q-btn type="submit" color="primary" label="Valider" icon="save" unelevated style="border-radius:10px; min-width:140px" :loading="submitting" />
              <q-btn type="reset" color="grey-6" label="Annuler" icon="refresh" unelevated style="border-radius:10px; min-width:140px" @click="resetForm" />
            </div>

          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useLiquidationPfStore } from 'src/stores/energizer/liquidationPfStore.js'

defineOptions({ name: 'ElementsLiquidationAF' })

const $q = useQuasar()
const pfStore = useLiquidationPfStore()
const loading    = ref(false)
const submitting = ref(false)
const errorMsg   = ref('')
const showDialog = ref(false)
const saisieFormRef = ref(null)
const searchCriteria   = ref('fnumdoss')
const searchStartValue = ref('000-')
const searchEndValue   = ref('')
const searchOptions = [
  { label: 'Num Dossier', value: 'fnumdoss' },
  { label: 'Num Assuré',  value: 'fnumassu' },
  { label: 'Noms Assuré', value: 'fnomassu' },
]
const FORM_INITIAL = { numdoss: '', numassu: '', natupres: '', datedemande: '', nomassu: '', prenomassu: '', dateembauche: '', datesignempl: '', nbreheure: 0 }
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
const MOCK_AF = [
  { numdoss: 'F2026-005', numassu: '5-20-97-333444-11', requerant: 'BIYONG Albertine', datedemande: '10-01-2026', natupres: 'AF', libellenatupres: 'Allocations Familiales', position: 'En Cours de Traitement', dateposi: '10-01-2026', nomassu: 'BIYONG', prenomassu: 'Albertine', sexe: 'F', dateembauche: '01-06-2015', datesignempl: '05-01-2026', nbreheure: 173 },
  { numdoss: 'F2026-006', numassu: '5-20-97-555666-22', requerant: 'OTTOU Jeanne', datedemande: '15-02-2026', natupres: 'PF', libellenatupres: 'Prestations Familiales', position: 'En attente de pièces', dateposi: '18-02-2026', nomassu: 'OTTOU', prenomassu: 'Jeanne', sexe: 'F', dateembauche: '15-03-2010', datesignempl: '10-02-2026', nbreheure: 140 },
  { numdoss: 'F2026-007', numassu: '5-20-97-777888-44', requerant: 'EKOA Martine', datedemande: '05-03-2026', natupres: 'AF', libellenatupres: 'Allocations Familiales', position: 'Transmis au superviseur', dateposi: '07-03-2026', nomassu: 'EKOA', prenomassu: 'Martine', sexe: 'F', dateembauche: '01-01-2018', datesignempl: '01-03-2026', nbreheure: 0 },
  { numdoss: 'F2026-008', numassu: '5-20-97-999000-66', requerant: 'MBIA Carine', datedemande: '20-04-2026', natupres: 'AF', libellenatupres: 'Allocations Familiales', position: 'Annuler Liquidation', dateposi: '22-04-2026', nomassu: 'MBIA', prenomassu: 'Carine', sexe: 'F', dateembauche: '10-09-2012', datesignempl: '15-04-2026', nbreheure: 80 },
]
onMounted(() => { dossiers.value = MOCK_AF })
function openDialog() { showDialog.value = true }
function loadDossier(row) {
  form.numdoss = row.numdoss ?? ''; form.numassu = row.numassu ?? ''
  form.datedemande = (row.datedemande ?? '').replace(/\//g, '-')
  form.natupres = row.libellenatupres ?? row.natupres ?? ''
  form.nomassu = row.nomassu ?? ''; form.prenomassu = row.prenomassu ?? ''
  form.dateembauche = (row.dateembauche ?? '').replace(/\//g, '-')
  form.datesignempl = (row.datesignempl ?? '').replace(/\//g, '-')
  form.nbreheure = (row.nbreheure !== null && row.nbreheure !== 'null') ? (Number(row.nbreheure) || 0) : 0
  showDialog.value = true
  $q.notify({ type: 'positive', message: `Dossier ${row.numdoss} chargé`, position: 'top', timeout: 1500 })
}
function validateForm() {
  if (!form.dateembauche || form.dateembauche.length !== 10) { $q.notify({ type: 'negative', message: "Veuillez saisir la date d'embauche SVP", position: 'top' }); return false }
  if (!form.datesignempl || form.datesignempl.length !== 10) { $q.notify({ type: 'negative', message: 'Veuillez saisir la date de signature employeur SVP', position: 'top' }); return false }
  return true
}
async function submitForm() {
  const ok = await saisieFormRef.value?.validate()
  if (!ok) return
  if (!validateForm()) return
  submitting.value = true
  try {
    await pfStore.submitAllocationFamiliale({ ...form })
    $q.notify({ type: 'positive', message: 'Éléments AF enregistrés avec succès !', position: 'top', icon: 'check_circle' })
    showDialog.value = false; resetForm()
  } catch { $q.notify({ type: 'negative', message: "Erreur lors de l'enregistrement", position: 'top' }) }
  finally { submitting.value = false }
}
function resetForm() { Object.assign(form, { ...FORM_INITIAL }); saisieFormRef.value?.resetValidation() }
function searchDossiers() {
  loading.value = true; errorMsg.value = ''
  pfStore.searchDossiers({
    criteria: searchCriteria.value,
    start: searchStartValue.value,
    end: searchEndValue.value,
  }).then((list) => {
    dossiers.value = list?.length ? list : MOCK_AF
    $q.notify({ type: 'info', message: 'Recherche effectuée', position: 'top' })
  }).catch(() => {
    dossiers.value = MOCK_AF
  }).finally(() => { loading.value = false })
}
function resetSearch() { searchCriteria.value = 'fnumdoss'; searchStartValue.value = '000-'; searchEndValue.value = ''; dossiers.value = MOCK_AF; errorMsg.value = '' }
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
.card-elevated { border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
.card-header-rounded { border-radius: 15px 15px 0 0; }
.dialog-form-card { display: flex; flex-direction: column; height: 100vh; }
.dialog-body { flex: 1; overflow-y: auto; }
.sep { font-size: 0.72rem; font-weight: 700; color: #1976d2; text-transform: uppercase; letter-spacing: 0.5px; border-left: 3px solid #1976d2; padding: 2px 0 2px 8px; background: linear-gradient(to right, rgba(25,118,210,0.06), transparent); border-radius: 0 4px 4px 0; }
.dossier-link { color: #1976d2; text-decoration: none; font-weight: 600; font-size: 0.85rem; transition: color 0.2s; }
.dossier-link:hover { color: #0d47a1; text-decoration: underline; }
.af-table { border-radius: 0 0 15px 15px; }
.af-table :deep(.q-table__bottom) { background: #fafafa; border-radius: 0 0 15px 15px; }
</style>
