<template>
  <div class="q-pa-sm gestion-pmd">

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
            <q-icon name="description" size="sm" color="primary" />
            <span class="text-body2 text-weight-bold text-primary">Pièces de Maintien de Droits</span>
            <q-badge outline color="primary" :label="`${pmdList.length}`" />
          </div>
          <q-form class="col-12 col-lg toolbar-search-form" @submit.prevent="searchPmd" @reset.prevent="resetSearch">
            <div class="row q-col-gutter-sm items-center">
              <div class="col-12 col-sm-6 col-md-3 col-lg-auto">
                <q-select v-model="cbxcritere" name="cbxcritere" :options="searchOptions" label="Critères" label-color="primary"
                  outlined dense emit-value map-options color="primary" class="toolbar-field toolbar-field--critere full-width" hide-bottom-space
                  @update:model-value="onCriteriaChange" />
              </div>
              <div class="col-12 col-sm-6 col-md-4 col-lg-auto">
                <q-input
                  v-model="txtvaleurdeb"
                  name="txtvaleurdeb"
                  :label="cbxcritere === 'fdatepmd' ? 'Date' : 'Valeur de Début'"
                  label-color="primary" outlined dense color="primary" class="toolbar-field toolbar-field--valeur full-width" hide-bottom-space
                  @update:model-value="val => { if (cbxcritere !== 'fdatepmd') txtvaleurdeb = (val || '').toUpperCase() }"
                  @keyup.enter="searchPmd"
                >
                  <template v-if="cbxcritere === 'fdatepmd'" v-slot:append>
                    <q-icon name="edit_calendar" class="cursor-pointer" color="primary" size="xs">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="txtvaleurdeb" mask="DD/MM/YYYY" today-btn color="primary">
                          <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
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
          <span>Cliquez sur un N° assuré pour ouvrir la saisie PMD</span>
        </div>
      </q-card-section>

      <q-card-section class="q-pa-none pf-table-responsive">
        <q-table
          :rows="pmdList"
          :columns="visibleTableColumns"
          row-key="rowKey"
          :grid="tableGrid"
          :loading="loading"
          dense flat
          :rows-per-page-options="tableRowsPerPageOptions"
          :pagination="{ rowsPerPage: tableDefaultRowsPerPage }"
          no-data-label="Aucune pièce trouvée — modifiez les critères de recherche"
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
              <a class="dossier-link" href="#" @click.prevent="loadPmd(props.row)">
                <q-icon name="person" size="xs" class="q-mr-xs" />{{ props.row.numassu }}
              </a>
            </q-td>
          </template>
          <template v-slot:item="props">
            <div class="pf-grid-card q-pa-sm q-mb-sm" @click="loadPmd(props.row)">
              <a class="dossier-link text-body2" href="#" @click.prevent.stop="loadPmd(props.row)">
                {{ props.row.numassu }}
              </a>
              <div class="text-caption text-grey-8 q-mt-xs">{{ props.row.nomassu }}</div>
              <div class="text-caption text-grey-6">{{ props.row.datedebut }} — {{ props.row.datefin }}</div>
            </div>
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
         DIALOG – FORMULAIRE PMD
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
          <q-icon name="description" class="flex-shrink-0" />
          <span class="q-ml-sm text-body2 text-weight-bold dialog-bar__title ellipsis">Pièce de Maintien de Droit — Saisie</span>
          <q-space />
          <q-btn flat dense round color="white" icon="restart_alt" size="sm" @click="resetForm"><q-tooltip>Réinitialiser</q-tooltip></q-btn>
          <q-btn flat dense round color="white" icon="close" size="sm" v-close-popup @click="resetForm" />
        </q-bar>
        <q-card-section class="q-pa-md overflow-auto dialog-body">
          <q-form ref="saisieFormRef" class="pf-legacy-form" @submit.prevent="submitForm" @reset="resetForm">
            <input type="hidden" name="btnSubmit" :value="form.btnSubmit" />

            <div class="row pf-form-row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label text-negative">* N° Assuré</span>
                  <q-input v-model="form.txtsaisienumassu" name="txtsaisienumassu" dense outlined hide-bottom-space class="pf-legacy-input"
                    :rules="[v => !!v || 'Numéro Assuré SVP!!']" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Noms Assuré</span>
                  <q-input v-model="form.txtsaisenomassu" name="txtsaisenomassu" dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Prénoms Assuré</span>
                  <q-input v-model="form.txtsaisieprenomassu" name="txtsaisieprenomassu" dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                </div>
              </div>
            </div>

            <div class="row pf-form-row pf-form-row--alt q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label text-negative">* N° Bénéficiaire</span>
                  <q-input v-model="form.txtsaisienumbene" name="txtsaisienumbene" dense outlined hide-bottom-space class="pf-legacy-input pf-legacy-input--narrow"
                    :rules="[v => !!v || 'Entrez le Numéro du bénéficiaire SVP']" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Noms Bénéficiaire</span>
                  <q-input v-model="form.txtsaisienombene" name="txtsaisienombene" dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Prénoms Bénéficiaire</span>
                  <q-input v-model="form.txtsaisieprenombene" name="txtsaisieprenombene" dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                </div>
              </div>
            </div>

            <div class="row pf-form-row q-col-gutter-sm">
              <div class="col-12 col-sm-6 col-md-3">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Position</span>
                  <q-input v-model="form.txtsaisieposition" name="txtsaisieposition" dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Motif</span>
                  <q-input v-model="form.txtsaisiemotifposi" name="txtsaisiemotifposi" dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Date Position</span>
                  <q-input v-model="form.txtsaisedatenaiss" name="txtsaisedatenaiss" dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Date Naissance</span>
                  <q-input v-model="form.txtdatenaissbene" name="txtdatenaissbene" dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                </div>
              </div>
            </div>

            <div class="row pf-form-row pf-form-row--alt q-col-gutter-sm">
              <div class="col-12 col-sm-6 col-md-3">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Scolarisé ?</span>
                  <q-input v-model="form.txtsaisieenfantscolarise" name="txtsaisieenfantscolarise" dense outlined readonly hide-bottom-space class="pf-legacy-input pf-legacy-input--narrow" />
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3 pf-apprentissage-col">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label pf-legacy-label--nowrap">En Apprentissage ?</span>
                  <q-input v-model="form.txtsaisieenapprentissage" name="txtsaisieenapprentissage" dense outlined readonly hide-bottom-space class="pf-legacy-input pf-legacy-input--narrow" />
                </div>
              </div>
            </div>

            <div class="row pf-form-row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label text-negative">* Date Début</span>
                  <q-input v-model="form.txtsaisiedatedebut" name="txtsaisiedatedebut" dense outlined hide-bottom-space bg-color="yellow-1"
                    class="pf-legacy-input pf-legacy-input--date" :rules="[v => !!v || 'Entrez la Date de début SVP !!!']">
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" size="xs">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="form.txtsaisiedatedebut" mask="DD/MM/YYYY" today-btn color="primary">
                            <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label text-negative">* Date Fin</span>
                  <q-input v-model="form.txtsaisiedatefin" name="txtsaisiedatefin" dense outlined hide-bottom-space bg-color="yellow-1"
                    class="pf-legacy-input pf-legacy-input--date" :rules="[v => !!v || 'Entrez la date de fin SVP']">
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" size="xs">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="form.txtsaisiedatefin" mask="DD/MM/YYYY" today-btn color="primary">
                            <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <div class="row q-col-gutter-sm q-mt-md dialog-actions">
              <div class="col-12 col-sm-auto">
                <q-btn type="submit" color="primary" label="Enregistrer" unelevated class="full-width pf-legacy-btn" :loading="submitting" />
              </div>
              <div class="col-12 col-sm-auto">
                <q-btn color="negative" label="Supprimer" unelevated class="full-width pf-legacy-btn" :loading="deleting"
                  :disable="!form.txtsaisienumassu || !form.txtsaisienumbene" @click="deletePmd" />
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
import { useLiquidationPfStore } from 'src/stores/energizer/liquidationPfStore.js'
import { usePfModuleTable } from 'src/composables/usePfModuleTable.js'

defineOptions({ name: 'GestionPieceMaintientDroit' })

const $q = useQuasar()
const pfStore = useLiquidationPfStore()

// ─── Interface ──────────────────────────────────────────────────
const loading    = ref(false)
const submitting = ref(false)
const deleting   = ref(false)
const errorMsg   = ref('')
const showDialog = ref(false)
const saisieFormRef = ref(null)

// ─── Recherche ──────────────────────────────────────────────────
const cbxcritere   = ref('fnumassu')
const txtvaleurdeb = ref('')
const searchOptions = [
  { label: 'Num Assuré',          value: 'fnumassu'  },
  { label: 'Noms Assuré',         value: 'fnomassu'  },
  { label: 'Noms Bénéficiaire',   value: 'fnombene'  },
  { label: 'Date',                value: 'fdatepmd'  },
]

function onCriteriaChange() {
  txtvaleurdeb.value = ''
}

// ─── Formulaire ─────────────────────────────────────────────────
const FORM_INITIAL = {
  txtsaisienumassu: '',
  txtsaisenomassu: '',
  txtsaisieprenomassu: '',
  txtsaisienumbene: '',
  txtsaisienombene: '',
  txtsaisieprenombene: '',
  txtsaisieposition: '',
  txtsaisiemotifposi: '',
  txtsaisedatenaiss: '',
  txtsaisieenfantscolarise: '',
  txtsaisieenapprentissage: '',
  txtdatenaissbene: '',
  txtsaisiedatedebut: '',
  txtsaisiedatefin: '',
  btnSubmit: '',
}

const form = reactive({ ...FORM_INITIAL })

// ─── Table ──────────────────────────────────────────────────────
const pmdList = ref([])

const tableColumns = [
  { name: 'index',     label: 'N°',                 field: 'index',     align: 'center', style: 'width:50px' },
  { name: 'numassu',   label: 'N° Assuré',           field: 'numassu',   align: 'left', sortable: true },
  { name: 'nomassu',   label: 'Noms Assuré',         field: 'nomassu',   align: 'left', sortable: true },
  { name: 'numbene',   label: 'N° Bénéficiaire',     field: 'numbene',   align: 'left', sortable: true },
  { name: 'nombene',   label: 'Noms Bénéficiaire',   field: 'nombene',   align: 'left', sortable: true },
  { name: 'datenaiss', label: 'Date Naissance',      field: 'datenaiss', align: 'left', sortable: true },
  { name: 'datedebut', label: 'Date Début',          field: 'datedebut', align: 'left', sortable: true },
  { name: 'datefin',   label: 'Date Fin',            field: 'datefin',   align: 'left', sortable: true },
]
const { visibleTableColumns, tableGrid, tableRowsPerPageOptions, tableDefaultRowsPerPage } = usePfModuleTable(tableColumns, {
  mobileCols: ['index', 'numassu', 'nomassu', 'datedebut'],
  tabletHidden: ['datenaiss', 'datefin', 'nombene'],
})

// ─── Données de test (à retirer en production) ──────────────────
const MOCK_PMD = [
  {
    rowKey: '1',
    numassu: '5-20-97-123456-78', nomassu: 'KAMGA Marie-Claire', prenomassu: 'Marie-Claire',
    numbene: '01', nombene: 'KAMGA', prenombene: 'Paul Junior',
    datenaiss: '12/05/2012', position: 'A', motif: 'ENF', dateposi: '12/05/2012',
    scolarise: 'OUI', apprentissage: 'NON',
    datedebut: '01/01/2026', datefin: '31/12/2026',
  },
  {
    rowKey: '2',
    numassu: '5-20-97-654321-12', nomassu: 'NKOA Sylvie', prenomassu: 'Sylvie',
    numbene: '02', nombene: 'NKOA', prenombene: 'Grace Esther',
    datenaiss: '03/08/2009', position: 'A', motif: 'ENF', dateposi: '03/08/2009',
    scolarise: 'OUI', apprentissage: 'NON',
    datedebut: '01/01/2026', datefin: '31/12/2026',
  },
  {
    rowKey: '3',
    numassu: '5-20-97-987654-55', nomassu: 'MBELLA Claire', prenomassu: 'Claire',
    numbene: '01', nombene: 'MBELLA', prenombene: 'Cyrille',
    datenaiss: '20/11/2014', position: 'A', motif: 'ENF', dateposi: '20/11/2014',
    scolarise: 'NON', apprentissage: 'OUI',
    datedebut: '01/03/2026', datefin: '28/02/2027',
  },
  {
    rowKey: '4',
    numassu: '5-20-97-111222-33', nomassu: 'ATANGANA Patience', prenomassu: 'Patience',
    numbene: '03', nombene: 'ATANGANA', prenombene: 'Lionel',
    datenaiss: '07/02/2018', position: 'A', motif: 'ENF', dateposi: '07/02/2018',
    scolarise: 'NON', apprentissage: 'NON',
    datedebut: '01/06/2026', datefin: '31/05/2027',
  },
]

onMounted(async () => {
  try {
    const list = await pfStore.loadPmd()
    pmdList.value = list?.length ? list : MOCK_PMD
  } catch {
    pmdList.value = MOCK_PMD
  }
})

// ─── Chargement depuis table (équivalent loading()) ──────────────
// loading(numassu, nomassu, prenomassu, numbene, nombene, prenombene,
//         position, motif, scolarise, apprentissage, datenaiss, datedeb, datefin)
function loadPmd(row) {
  const v = (x) => (x !== 'null' && x != null ? x : '')
  form.txtsaisienumassu = v(row.numassu)
  form.txtsaisenomassu = v(row.nomassu)
  form.txtsaisieprenomassu = v(row.prenomassu)
  form.txtsaisienumbene = row.numbene !== 'null' ? String(row.numbene ?? '') : ''
  form.txtsaisienombene = v(row.nombene)
  form.txtsaisieprenombene = v(row.prenombene)
  form.txtsaisieposition = v(row.position)
  form.txtsaisiemotifposi = v(row.motif)
  form.txtsaisieenfantscolarise = v(row.scolarise)
  form.txtsaisieenapprentissage = v(row.apprentissage)
  form.txtdatenaissbene = v(row.datenaiss)
  form.txtsaisedatenaiss = ''
  form.txtsaisiedatedebut = v(row.datedebut)
  form.txtsaisiedatefin = v(row.datefin)

  showDialog.value = true
  $q.notify({ type: 'positive', message: `Assuré ${row.numassu} / Bénéficiaire ${row.numbene} chargé`, position: 'top', timeout: 1500 })
}

// ─── Validation ──────────────────────────────────────────────────
function validateForm() {
  if (!form.txtsaisienumbene) {
    $q.notify({ type: 'negative', message: 'Entrez le Numéro du bénéficiaire SVP', position: 'top' })
    return false
  }
  if (!form.txtsaisienumassu) {
    $q.notify({ type: 'negative', message: 'Numéro Assuré SVP!!', position: 'top' })
    return false
  }
  if (!form.txtsaisiedatedebut) {
    $q.notify({ type: 'negative', message: 'Entrez la Date de début SVP !!!', position: 'top' })
    return false
  }
  if (!form.txtsaisiedatefin) {
    $q.notify({ type: 'negative', message: 'Entrez la date de fin SVP', position: 'top' })
    return false
  }
  return true
}

// ─── Enregistrer (submitFunction(1) → action="gestpmd") ──────────
async function submitForm() {
  const ok = await saisieFormRef.value?.validate()
  if (!ok) return
  if (!validateForm()) return

  submitting.value = true
  try {
    await pfStore.submitPmd(form)
    $q.notify({ type: 'positive', message: 'Pièce de maintien de droit enregistrée avec succès !', position: 'top', icon: 'check_circle' })
    showDialog.value = false
    resetForm()
  } catch {
    $q.notify({ type: 'negative', message: "Erreur lors de l'enregistrement", position: 'top' })
  } finally {
    submitting.value = false
  }
}

// ─── Supprimer (submitFunction(2)) ───────────────────────────────
async function deletePmd() {
  $q.dialog({
    title: 'Confirmer la suppression',
    message: `Supprimer la pièce pour l'assuré <b>${form.txtsaisienumassu}</b> / bénéficiaire <b>${form.txtsaisienumbene}</b> ?`,
    html: true,
    cancel: { label: 'Annuler', flat: true, color: 'grey-7' },
    ok: { label: 'Supprimer', color: 'negative', unelevated: true },
  }).onOk(async () => {
    deleting.value = true
    try {
      await pfStore.removePmd(form)
      $q.notify({ type: 'positive', message: 'Pièce supprimée avec succès !', position: 'top' })
      showDialog.value = false
      resetForm()
    } catch {
      $q.notify({ type: 'negative', message: 'Erreur lors de la suppression', position: 'top' })
    } finally {
      deleting.value = false
    }
  })
}

// ─── Réinitialisation ────────────────────────────────────────────
function resetForm() {
  Object.assign(form, { ...FORM_INITIAL })
  saisieFormRef.value?.resetValidation()
}

// ─── Recherche ───────────────────────────────────────────────────
async function searchPmd() {
  loading.value = true
  errorMsg.value = ''
  try {
    pmdList.value = await pfStore.loadPmd({
      criteria: cbxcritere.value,
      start: txtvaleurdeb.value,
    })
    $q.notify({ type: 'info', message: 'Recherche effectuée', position: 'top' })
  } catch {
    pmdList.value = MOCK_PMD
  } finally {
    loading.value = false
  }
}

function resetSearch() {
  cbxcritere.value = 'fnumassu'
  txtvaleurdeb.value = ''
  pmdList.value = MOCK_PMD
  errorMsg.value = ''
}
</script>

<style scoped>
.gestion-pmd {
  max-width: 1400px;
  margin: 0 auto;
}

@media (min-width: 1024px) {
  .pf-apprentissage-col {
    padding-left: 56px;
  }
  .pf-apprentissage-col .pf-legacy-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  .pf-apprentissage-col .pf-legacy-label--nowrap {
    max-width: 100%;
    white-space: nowrap;
  }
}

.card-elevated {
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.card-header-rounded {
  border-radius: 15px 15px 0 0;
}

</style>
