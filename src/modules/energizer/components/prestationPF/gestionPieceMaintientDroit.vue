<template>
  <div class="q-pa-xs q-pa-sm gestion-pmd">

    <!-- Bannière d'erreur -->
    <q-banner v-if="errorMsg" class="bg-negative text-white q-mb-sm" rounded dense>
      <template v-slot:avatar><q-icon name="error" color="white" /></template>
      {{ errorMsg }}
      <template v-slot:action>
        <q-btn flat color="white" label="Fermer" dense @click="errorMsg = ''" />
      </template>
    </q-banner>

    <q-card class="dossiers-card">
      <div class="dossiers-hero">
        <div class="dossiers-hero__left">
          <div class="dossiers-hero__icon-wrap">
            <q-icon name="description" size="28px" color="white" />
          </div>
          <div>
            <div class="dossiers-hero__title">Pièces de Maintien de Droits</div>
            <div class="dossiers-hero__sub">Saisie et suivi des pièces PMD assuré / bénéficiaire</div>
          </div>
        </div>
        <q-badge class="dossiers-hero__badge" :label="`${pmdList.length} ligne${pmdList.length !== 1 ? 's' : ''}`" />
      </div>

      <div class="search-bar-wrap">
        <q-form class="search-bar" @submit.prevent="searchPmd" @reset.prevent="resetSearch">
          <q-select
            v-model="cbxcritere"
            name="cbxcritere"
            :options="searchOptions"
            label="Critère"
            outlined dense emit-value map-options hide-bottom-space
            color="primary" label-color="primary" class="search-bar__critere"
            @update:model-value="onCriteriaChange"
          />
          <q-input
            v-model="txtvaleurdeb"
            name="txtvaleurdeb"
            :label="cbxcritere === 'fdatepmd' ? 'Date début' : 'Valeur recherchée'"
            outlined dense clearable hide-bottom-space
            color="primary" label-color="primary" class="search-bar__value"
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
          <q-input
            v-if="cbxcritere === 'fdatepmd'"
            v-model="txtvaleurfin"
            name="txtvaleurfin"
            label="Date fin"
            outlined dense clearable hide-bottom-space
            color="primary" label-color="primary" class="search-bar__value"
          >
            <template v-slot:append>
              <q-icon name="edit_calendar" class="cursor-pointer" color="primary" size="xs">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="txtvaleurfin" mask="DD/MM/YYYY" today-btn color="primary">
                    <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
          <q-btn type="submit" color="primary" icon="search" label="Rechercher" unelevated :loading="loading" class="search-bar__btn" no-caps />
          <q-btn type="reset" flat round dense color="primary" icon="restart_alt" :disable="loading" />
        </q-form>
        <div class="search-hint">
          <q-icon name="touch_app" size="14px" class="q-mr-xs" color="primary" />
          <span>Cliquez sur un N° assuré pour ouvrir la saisie PMD</span>
        </div>
      </div>

      <div class="table-divider" v-if="!loading && pmdList.length > 0">
        <span class="table-divider__line" />
        <span class="table-divider__text">{{ pmdList.length }} résultat{{ pmdList.length !== 1 ? 's' : '' }}</span>
        <span class="table-divider__line" />
      </div>

      <div class="q-pa-none pf-table-responsive">
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
      </div>
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

            <div class="pf-form-section">
              <div class="pf-form-section__title">
                <q-icon name="person" size="16px" /> Informations personnelles de l'assuré
              </div>
              <div class="row pf-form-row q-col-gutter-sm">
                <div class="col-12 col-md-4">
                  <div class="pf-legacy-cell">
                    <q-input v-model="form.txtsaisienumassu" name="txtsaisienumassu" label="N° Assuré *" placeholder="N° Assuré"
                      stack-label dense outlined hide-bottom-space class="pf-legacy-input"
                      :rules="[v => !!v || 'Numéro Assuré SVP!!']"
                      @update:model-value="v => upper('txtsaisienumassu', v)" />
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="pf-legacy-cell">
                    <q-input v-model="form.txtsaisenomassu" name="txtsaisenomassu" label="Noms Assuré" placeholder="Noms Assuré"
                      stack-label dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="pf-legacy-cell">
                    <q-input v-model="form.txtsaisieprenomassu" name="txtsaisieprenomassu" label="Prénoms Assuré" placeholder="Prénoms Assuré"
                      stack-label dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                  </div>
                </div>
              </div>
            </div>

            <div class="pf-form-section">
              <div class="pf-form-section__title">
                <q-icon name="family_restroom" size="16px" /> Informations bénéficiaire
              </div>
              <div class="row pf-form-row q-col-gutter-sm">
                <div class="col-12 col-md-4">
                  <div class="pf-legacy-cell">
                    <q-input v-model="form.txtsaisienumbene" name="txtsaisienumbene" label="N° Bénéficiaire *" placeholder="N° Bénéficiaire"
                      stack-label dense outlined hide-bottom-space class="pf-legacy-input"
                      :rules="[v => !!v || 'Entrez le Numéro du bénéficiaire SVP']"
                      @update:model-value="v => upper('txtsaisienumbene', v)" />
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="pf-legacy-cell">
                    <q-input v-model="form.txtsaisienombene" name="txtsaisienombene" label="Noms Bénéficiaire" placeholder="Noms Bénéficiaire"
                      stack-label dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="pf-legacy-cell">
                    <q-input v-model="form.txtsaisieprenombene" name="txtsaisieprenombene" label="Prénoms Bénéficiaire" placeholder="Prénoms Bénéficiaire"
                      stack-label dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                  </div>
                </div>
              </div>
            </div>

            <div class="pf-form-section">
              <div class="pf-form-section__title">
                <q-icon name="info" size="16px" /> Situation du bénéficiaire
              </div>
              <div class="row pf-form-row q-col-gutter-sm">
                <div class="col-12 col-sm-6 col-md-3">
                  <div class="pf-legacy-cell">
                    <q-input v-model="form.txtsaisieposition" name="txtsaisieposition" label="Position" placeholder="Position"
                      stack-label dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                  <div class="pf-legacy-cell">
                    <q-input v-model="form.txtsaisiemotifposi" name="txtsaisiemotifposi" label="Motif" placeholder="Motif"
                      stack-label dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                  <div class="pf-legacy-cell">
                    <q-input v-model="form.txtsaisedatenaiss" name="txtsaisedatenaiss" label="Date Position" placeholder="JJ/MM/AAAA"
                      stack-label dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                  <div class="pf-legacy-cell">
                    <q-input v-model="form.txtdatenaissbene" name="txtdatenaissbene" label="Date Naissance" placeholder="JJ/MM/AAAA"
                      stack-label dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                  <div class="pf-legacy-cell">
                    <q-input v-model="form.txtsaisieenfantscolarise" name="txtsaisieenfantscolarise" label="Scolarisé ?" placeholder="Scolarisé ?"
                      stack-label dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-3 pf-apprentissage-col">
                  <div class="pf-legacy-cell">
                    <q-input v-model="form.txtsaisieenapprentissage" name="txtsaisieenapprentissage" label="En Apprentissage ?" placeholder="En Apprentissage ?"
                      stack-label dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                  </div>
                </div>
              </div>
            </div>

            <div class="pf-form-section">
              <div class="pf-form-section__title">
                <q-icon name="date_range" size="16px" /> Période de la pièce
              </div>
              <div class="row pf-form-row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <q-input v-model="form.txtsaisiedatedebut" name="txtsaisiedatedebut" label="Date Début *" placeholder="JJ/MM/AAAA"
                    stack-label dense outlined hide-bottom-space bg-color="yellow-1"
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
                  <q-input v-model="form.txtsaisiedatefin" name="txtsaisiedatefin" label="Date Fin *" placeholder="JJ/MM/AAAA"
                    stack-label dense outlined hide-bottom-space bg-color="yellow-1"
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
            </div>

            <div class="row q-col-gutter-sm pf-form-actions dialog-actions">
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
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { useLiquidationPfStore } from 'src/modules/energizer/stores/liquidationPfStore.js'
import { usePfModuleTable } from 'src/modules/shared/composables/usePfModuleTable.js'
import { usePfDossierCatalogTable } from 'src/modules/energizer/composables/usePfDossierCatalogTable.js'
import { setLegacyUppercaseText } from 'src/modules/energizer/utils/energizerFormInputUtils.js'

defineOptions({ name: 'GestionPieceMaintientDroit' })

const $q = useQuasar()
const pfStore = useLiquidationPfStore()

const submitting = ref(false)
const deleting   = ref(false)
const showDialog = ref(false)
const saisieFormRef = ref(null)

const searchOptions = [
  { label: 'Num Assuré',          value: 'fnumassu'  },
  { label: 'Noms Assuré',         value: 'fnomassu'  },
  { label: 'Noms Bénéficiaire',   value: 'fnombene'  },
  { label: 'Date',                value: 'fdatepmd'  },
]

const {
  loading,
  errorMsg,
  cbxcritere,
  txtvaleurdeb,
  txtvaleurfin,
  dossiers: pmdList,
  searchDossiers: searchPmd,
  resetSearch,
  loadCatalog,
} = usePfDossierCatalogTable({
  pfStore,
  mode: 'pmd',
  $q,
  withEndFilter: true,
  defaultCritere: 'fnumassu',
  defaultStart: '',
})

function onCriteriaChange() {
  txtvaleurdeb.value = ''
  txtvaleurfin.value = ''
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

function upper(field, val) {
  setLegacyUppercaseText(form, field, val)
}

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
    const result = await pfStore.submitPmd(form)
    $q.notify({
      type: 'positive',
      message: result?.message || 'Pièce de maintien de droit enregistrée avec succès !',
      position: 'top',
      icon: 'check_circle',
    })
    showDialog.value = false
    resetForm()
    await loadCatalog()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error?.message || "Erreur lors de l'enregistrement",
      position: 'top',
    })
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
      const result = await pfStore.removePmd(form)
      $q.notify({
        type: 'positive',
        message: result?.message || 'Pièce supprimée avec succès !',
        position: 'top',
      })
      showDialog.value = false
      resetForm()
      await loadCatalog()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: error?.message || 'Erreur lors de la suppression',
        position: 'top',
      })
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

</script>

<style scoped>
.gestion-pmd {
  max-width: 1400px;
  margin: 0 auto;
}

.dossiers-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(25, 118, 210, 0.10), 0 1px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(25, 118, 210, 0.10);
}

.dossiers-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px 16px;
  background: linear-gradient(135deg, #1565c0 0%, #1976d2 60%, #42a5f5 100%);
  position: relative;
  overflow: hidden;
}
.dossiers-hero__left { display: flex; align-items: center; gap: 14px; z-index: 1; }
.dossiers-hero__icon-wrap {
  width: 46px; height: 46px; border-radius: 12px;
  background: rgba(255, 255, 255, 0.18);
  display: flex; align-items: center; justify-content: center;
}
.dossiers-hero__title { font-size: 1.05rem; font-weight: 700; color: #fff; }
.dossiers-hero__sub { font-size: 0.78rem; color: rgba(255, 255, 255, 0.75); margin-top: 2px; }
.dossiers-hero__badge {
  z-index: 1;
  background: rgba(255, 255, 255, 0.22) !important;
  color: #fff !important;
  font-weight: 700;
  padding: 5px 14px;
  border-radius: 20px;
}

.search-bar-wrap {
  padding: 16px 20px 10px;
  background: #fafbff;
  border-bottom: 1px solid rgba(25, 118, 210, 0.08);
}
.search-bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.search-bar__critere { flex: 0 0 200px; min-width: 160px; }
.search-bar__value { flex: 1 1 180px; min-width: 140px; }
.search-bar__btn { height: 40px; min-width: 130px; font-weight: 600; }
.search-hint { display: flex; align-items: center; margin-top: 8px; font-size: 0.78rem; color: #1976d2; opacity: 0.75; }
.table-divider {
  display: flex; align-items: center; gap: 10px;
  padding: 6px 20px; background: #fafbff;
}
.table-divider__line { flex: 1; height: 1px; background: rgba(25, 118, 210, 0.12); }
.table-divider__text { font-size: 0.78rem; color: #555; white-space: nowrap; }
.dossier-link {
  display: inline-flex; align-items: center;
  color: #1565c0; font-weight: 700; text-decoration: none;
}
.pf-grid-card {
  background: #fff;
  border: 1px solid rgba(25, 118, 210, 0.12);
  border-radius: 10px;
  padding: 12px 14px;
  margin: 6px;
  cursor: pointer;
}

@import 'src/css/pf-dialog-form.scss';

.pf-legacy-form { background: #f0f0f0; padding: 12px 14px; border-radius: 6px; }
.pf-legacy-input { width: 100%; }
.pf-legacy-btn { min-width: 120px; min-height: 36px; }
.dialog-form-card { display: flex; flex-direction: column; min-height: 0; }
.dialog-bar { min-height: 52px; }
.dialog-body { flex: 1; overflow-y: auto; }

@media (min-width: 1024px) {
  .pf-apprentissage-col { padding-left: 56px; }
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

@media (max-width: 767px) {
  .search-bar__critere,
  .search-bar__value,
  .search-bar__btn { flex: 1 1 100%; }
}
</style>
