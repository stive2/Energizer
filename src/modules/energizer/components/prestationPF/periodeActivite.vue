<template>
  <div class="q-pa-sm periode-activite">

    <!-- Bannière d'erreur -->
    <q-banner v-if="errorMsg" class="bg-negative text-white q-mb-sm" rounded dense>
      <template v-slot:avatar><q-icon name="error" color="white" /></template>
      {{ errorMsg }}
      <template v-slot:action>
        <q-btn flat color="white" label="Fermer" dense @click="errorMsg = ''" />
      </template>
    </q-banner>

    <q-card class="card-elevated">
      <q-card-section class="table-toolbar q-py-sm q-px-sm q-px-md">
        <div class="row items-center q-col-gutter-sm q-mb-xs">
          <div class="col-12 col-lg-auto row items-center no-wrap q-gutter-xs toolbar-title-row">
            <q-icon name="calendar_month" size="sm" color="primary" />
            <span class="text-body2 text-weight-bold text-primary">Interruptions &amp; Périodes d'Activité</span>
            <q-badge outline color="primary" :label="`${periodes.length}`" />
          </div>
          <q-form class="col-12 col-lg toolbar-search-form" @submit.prevent="searchPeriodes" @reset.prevent="resetSearch">
            <div class="row q-col-gutter-sm items-center">
              <div class="col-12 col-sm-6 col-md-3 col-lg-auto">
                <q-select v-model="cbxcritere" name="cbxcritere" :options="searchOptions" label="Critères" label-color="primary"
                  outlined dense emit-value map-options color="primary" class="toolbar-field toolbar-field--critere full-width" hide-bottom-space />
              </div>
              <div class="col-12 col-sm-6 col-md-4 col-lg-auto">
                <q-input v-model="txtvaleurdeb" name="txtvaleurdeb" label="Valeur de Début" label-color="primary" outlined dense color="primary"
                  class="toolbar-field toolbar-field--valeur full-width" hide-bottom-space
                  @update:model-value="val => (txtvaleurdeb = (val || '').toUpperCase())"
                  @keyup.enter="searchPeriodes" />
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
          <span>Cliquez sur un N° assuré pour ouvrir la saisie période d'activité</span>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-none pf-table-responsive">
        <q-table
          :rows="periodes"
          :columns="visibleTableColumns"
          row-key="rowKey"
          :grid="tableGrid"
          :loading="loading"
          dense flat
          :rows-per-page-options="tableRowsPerPageOptions"
          :pagination="{ rowsPerPage: tableDefaultRowsPerPage }"
          no-data-label="Aucun enregistrement trouvé — modifiez les critères de recherche"
          class="pf-module-table"
        >
          <template v-slot:header-cell="props">
            <q-th :props="props" class="pf-col-header bg-primary text-white">
              <span class="pf-col-header__label text-weight-bold">{{ props.col.label }}</span>
            </q-th>
          </template>
          <template v-slot:body-cell-index="props">
            <q-td :props="props" class="text-center text-grey-6">{{ props.rowIndex + 1 }}</q-td>
          </template>
          <template v-slot:body-cell-numassu="props">
            <q-td :props="props">
              <a class="dossier-link" href="#" @click.prevent="loadPeriode(props.row)">
                <q-icon name="person" size="xs" class="q-mr-xs" />{{ props.row.numassu }}
              </a>
            </q-td>
          </template>
          <template v-slot:item="props">
            <div class="pf-grid-card q-pa-sm q-mb-sm" @click="loadPeriode(props.row)">
              <div class="row items-center justify-between q-mb-xs">
                <a class="dossier-link text-body2" href="#" @click.prevent.stop="loadPeriode(props.row)">{{ props.row.numassu }}</a>
                <q-badge :color="props.row.typeact === 'ACT' ? 'positive' : 'orange-7'"
                  :label="props.row.libelleType || props.row.typeact" dense />
              </div>
              <div class="text-caption text-grey-8">{{ props.row.nomassu }}</div>
            </div>
          </template>
          <template v-slot:body-cell-typeact="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.typeact === 'ACT' ? 'positive' : 'orange-7'"
                :label="props.row.libelleType || props.row.typeact"
                style="font-size:0.7rem"
              />
            </q-td>
          </template>
          <template v-slot:no-data="{ message }">
            <div class="full-width row flex-center text-grey-6 q-pa-lg">
              <q-icon name="inbox" size="2rem" class="q-mr-sm" />{{ message }}
            </div>
          </template>
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- ═══════════════════════════════════════════════════════
         DIALOG – FORMULAIRE PÉRIODE D'ACTIVITÉ
    ═══════════════════════════════════════════════════════ -->
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
          <q-icon name="calendar_month" class="flex-shrink-0" />
          <span class="q-ml-sm text-body2 text-weight-bold dialog-bar__title ellipsis">Période d'Activité — Saisie</span>
          <q-space />
          <q-btn flat dense round color="white" icon="restart_alt" size="sm" @click="resetForm"><q-tooltip>Réinitialiser</q-tooltip></q-btn>
          <q-btn flat dense round color="white" icon="close" size="sm" v-close-popup @click="resetForm" />
        </q-bar>
        <q-card-section class="q-pa-md overflow-auto dialog-body">
          <q-form ref="saisieFormRef" class="pf-legacy-form" @submit.prevent="submitForm" @reset="resetForm">

            <div class="row pf-form-row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Matricule Employeur</span>
                  <q-input v-model="form.txtsaisiematempl" name="txtsaisiematempl" dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Raison Sociale</span>
                  <q-input v-model="form.txtraisonsociale" name="txtraisonsociale" dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Date Affiliation</span>
                  <q-input v-model="form.txtsaisiedateembauche" name="txtsaisiedateembauche" dense outlined readonly hide-bottom-space class="pf-legacy-input" />
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

            <div class="row pf-form-row q-col-gutter-sm">
              <div class="col-12 col-sm-6 col-md-3">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Type</span>
                  <q-select v-model="form.cbxtype" name="cbxtype" :options="typeOptions" dense outlined emit-value map-options hide-bottom-space
                    class="pf-legacy-input pf-legacy-input--select"
                    :rules="[v => !!v || 'Veuillez sélectionner le type de chaque opération']" />
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Matricule Assuré</span>
                  <q-input v-model="form.txtsaisiematassu" name="txtsaisiematassu" dense outlined hide-bottom-space bg-color="yellow-1" class="pf-legacy-input"
                    :rules="[v => !!v || 'Veuillez saisir le Numéro Assuré SVP!!!']" />
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Date Embauche</span>
                  <q-input v-model="form.txtSaisiedatedebutreprise" name="txtSaisiedatedebutreprise" dense outlined hide-bottom-space
                    bg-color="yellow-1" class="pf-legacy-input pf-legacy-input--date"
                    :rules="[v => !!v || 'Veuillez saisir une Date embauche SVP!!!']">
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" size="xs">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="form.txtSaisiedatedebutreprise" mask="DD/MM/YYYY" today-btn color="primary">
                            <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Date Cessation</span>
                  <q-input v-model="form.txtSaisiedatefinreprise" name="txtSaisiedatefinreprise" dense outlined hide-bottom-space
                    bg-color="yellow-1" class="pf-legacy-input pf-legacy-input--date">
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" size="xs">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="form.txtSaisiedatefinreprise" mask="DD/MM/YYYY" today-btn color="primary">
                            <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <div class="row pf-form-row pf-form-row--alt q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Numéro Employeur</span>
                  <q-input v-model="form.txtsaisienumempl" name="txtsaisienumempl" dense outlined hide-bottom-space bg-color="yellow-1" class="pf-legacy-input"
                    :rules="[v => !!v || 'Veuillez saisir le Numéro Employeur SVP!!!']" />
                </div>
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
import { useQuasar } from 'quasar'
import { useLiquidationPfStore } from 'src/modules/energizer/stores/liquidationPfStore.js'
import { usePfModuleTable } from 'src/modules/shared/composables/usePfModuleTable.js'

defineOptions({ name: 'PeriodeActivite' })

const $q = useQuasar()
const pfStore = useLiquidationPfStore()

// ─── Interface ──────────────────────────────────────────────────
const loading    = ref(false)
const submitting = ref(false)
const errorMsg   = ref('')
const showDialog = ref(false)
const saisieFormRef = ref(null)

// ─── Recherche ──────────────────────────────────────────────────
const cbxcritere   = ref('fnumassu')
const txtvaleurdeb = ref('')

const searchOptions = [
  { label: 'Num Assuré',  value: 'fnumassu' },
  { label: 'Noms Assuré', value: 'fnomassu' },
]

// ─── Options selects ────────────────────────────────────────────
const typeOptions = [
  { label: 'En Activité',  value: 'ACT' },
  { label: 'Interruption', value: 'INT' },
]

// ─── Formulaire ─────────────────────────────────────────────────
const FORM_INITIAL = {
  txtsaisiematempl: '',
  txtraisonsociale: '',
  txtsaisiedateembauche: '',
  txtsaisienumassu: '',
  txtsaisietextenomassu: '',
  txtsaisietexteprenomassu: '',
  cbxtype: '',
  txtsaisiematassu: '',
  txtsaisienumempl: '',
  txtSaisiedatedebutreprise: '',
  txtSaisiedatefinreprise: '',
}

const form = reactive({ ...FORM_INITIAL })

// ─── Table ──────────────────────────────────────────────────────
const periodes = ref([])

const tableColumns = [
  { name: 'index',      label: 'N°',                 field: 'index',      align: 'center', style: 'width:50px' },
  { name: 'numassu',    label: 'N° Assuré',           field: 'numassu',    align: 'left', sortable: true },
  { name: 'nomassu',    label: 'Noms Assuré',         field: 'nomassu',    align: 'left', sortable: true },
  { name: 'numempl',    label: 'Matricule Employeur', field: 'numempl',    align: 'left', sortable: true },
  { name: 'typeact',    label: 'Type',                field: 'typeact',    align: 'left', sortable: true },
  { name: 'dateembauche',  label: 'Date Embauche',   field: 'dateembauche',  align: 'left', sortable: true },
  { name: 'datecessation', label: 'Date Cessation',  field: 'datecessation', align: 'left', sortable: true },
]
const { visibleTableColumns, tableGrid, tableRowsPerPageOptions, tableDefaultRowsPerPage } = usePfModuleTable(tableColumns, {
  mobileCols: ['index', 'numassu', 'nomassu', 'typeact'],
  tabletHidden: ['dateembauche', 'datecessation', 'numempl'],
})

// ─── Données de test (à retirer en production) ──────────────────
const MOCK_PERIODES = [
  {
    rowKey: '1', numassu: '5-20-97-123456-78',
    nomassu: 'KAMGA Marie-Claire', numempl: '1-20-97-001234',
    typeact: 'ACT', libelleType: 'En Activité',
    dateembauche: '01-03-2020', datecessation: '',
    dateaffiliation: '01-03-2020', matempl: '1-20-97-001234',
    raisonsociale: 'SOCIÉTÉ DEMO SARL', prenomassu: 'Marie-Claire',
  },
  {
    rowKey: '2', numassu: '5-20-97-654321-12',
    nomassu: 'NKOA Sylvie', numempl: '1-20-97-005678',
    typeact: 'INT', libelleType: 'INTERRUPTION',
    dateembauche: '15-06-2018', datecessation: '28-02-2026',
    dateaffiliation: '15-06-2018', matempl: '1-20-97-005678',
    raisonsociale: 'ENTREPRISE NORD SARL', prenomassu: 'Sylvie',
  },
  {
    rowKey: '3', numassu: '5-20-97-987654-55',
    nomassu: 'MBELLA Claire', numempl: '1-20-97-009012',
    typeact: 'ACT', libelleType: 'En Activité',
    dateembauche: '10-01-2022', datecessation: '',
    dateaffiliation: '10-01-2022', matempl: '1-20-97-009012',
    raisonsociale: 'CABINET CONSEIL SUD', prenomassu: 'Claire',
  },
  {
    rowKey: '4', numassu: '5-20-97-111222-33',
    nomassu: 'ATANGANA Patience', numempl: '1-20-97-003344',
    typeact: 'INT', libelleType: 'INTERRUPTION',
    dateembauche: '05-09-2015', datecessation: '31-12-2025',
    dateaffiliation: '05-09-2015', matempl: '1-20-97-003344',
    raisonsociale: 'IMPORT EXPORT CENTRE', prenomassu: 'Patience',
  },
]

onMounted(async () => {
  try {
    const list = await pfStore.loadPeriodes()
    periodes.value = list?.length ? list : MOCK_PERIODES
  } catch {
    periodes.value = MOCK_PERIODES
  }
})

// ─── Chargement depuis table (équivalent loading()) ──────────────
// loading(numassu, nomassu, prenomassu, dateembauche, datecessation,
//         matempl, dateaffiliation, type)
function loadPeriode(row) {
  form.txtsaisienumassu = row.numassu ?? ''
  form.txtsaisiematassu = row.numassu ?? ''
  form.txtsaisietextenomassu = row.nomassu ?? ''
  form.txtsaisietexteprenomassu = row.prenomassu ?? ''
  form.txtsaisiematempl = row.matempl ?? ''
  form.txtsaisienumempl = row.numempl ?? row.matempl ?? ''
  form.txtraisonsociale = row.raisonsociale ?? ''
  form.txtSaisiedatedebutreprise = row.dateembauche ?? ''
  form.txtSaisiedatefinreprise = row.datecessation ?? ''
  form.txtsaisiedateembauche = row.dateaffiliation ?? ''
  form.cbxtype = row.typeact ?? ''

  showDialog.value = true
  $q.notify({ type: 'positive', message: `Assuré ${row.numassu} chargé`, position: 'top', timeout: 1500 })
}

// ─── Validation ──────────────────────────────────────────────────
function validateForm() {
  if (!form.txtsaisiematassu) {
    $q.notify({ type: 'negative', message: 'Veuillez saisir le Numéro Assuré SVP!!!', position: 'top' })
    return false
  }
  if (!form.txtsaisienumempl) {
    $q.notify({ type: 'negative', message: 'Veuillez saisir le Numéro Employeur SVP!!!', position: 'top' })
    return false
  }
  if (!form.txtSaisiedatedebutreprise) {
    $q.notify({ type: 'negative', message: 'Veuillez saisir une Date embauche SVP!!!', position: 'top' })
    return false
  }
  if (!form.cbxtype) {
    $q.notify({ type: 'negative', message: 'Veuillez sélectionner le type de chaque opération!!!', position: 'top' })
    return false
  }
  return true
}

// ─── Soumission (action = gestionperiodeactivite) ────────────────
async function submitForm() {
  const ok = await saisieFormRef.value?.validate()
  if (!ok) return
  if (!validateForm()) return

  submitting.value = true
  try {
    await pfStore.submitPeriode(form)
    $q.notify({ type: 'positive', message: 'Période d\'activité enregistrée avec succès !', position: 'top', icon: 'check_circle' })
    showDialog.value = false
    resetForm()
  } catch {
    $q.notify({ type: 'negative', message: "Erreur lors de l'enregistrement", position: 'top' })
  } finally {
    submitting.value = false
  }
}

// ─── Réinitialisation ────────────────────────────────────────────
function resetForm() {
  Object.assign(form, { ...FORM_INITIAL })
  saisieFormRef.value?.resetValidation()
}

// ─── Recherche ───────────────────────────────────────────────────
async function searchPeriodes() {
  loading.value = true
  errorMsg.value = ''
  try {
    periodes.value = await pfStore.loadPeriodes({
      criteria: cbxcritere.value,
      start: txtvaleurdeb.value,
    })
    $q.notify({ type: 'info', message: 'Recherche effectuée', position: 'top' })
  } catch {
    periodes.value = MOCK_PERIODES
  } finally {
    loading.value = false
  }
}

function resetSearch() {
  cbxcritere.value = 'fnumassu'
  txtvaleurdeb.value = ''
  periodes.value = MOCK_PERIODES
  errorMsg.value = ''
}
</script>

<style scoped>
.periode-activite {
  max-width: 1400px;
  margin: 0 auto;
}

.card-elevated {
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.card-header-rounded {
  border-radius: 15px 15px 0 0;
}

</style>
