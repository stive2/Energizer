<template>
  <div class="q-pa-xs q-pa-sm periode-activite">

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
            <q-icon name="calendar_month" size="28px" color="white" />
          </div>
          <div>
            <div class="dossiers-hero__title">Interruptions &amp; Périodes d'Activité</div>
            <div class="dossiers-hero__sub">Gestion des périodes salariales assuré / employeur</div>
          </div>
        </div>
        <q-badge class="dossiers-hero__badge" :label="`${periodes.length} ligne${periodes.length !== 1 ? 's' : ''}`" />
      </div>

      <div class="search-bar-wrap">
        <q-form class="search-bar" @submit.prevent="searchPeriodes" @reset.prevent="resetSearch">
          <q-select
            v-model="cbxcritere"
            name="cbxcritere"
            :options="searchOptions"
            label="Critère"
            outlined dense emit-value map-options hide-bottom-space
            color="primary" label-color="primary" class="search-bar__critere"
          />
          <q-input
            v-model="txtvaleurdeb"
            name="txtvaleurdeb"
            label="Valeur recherchée"
            outlined dense clearable hide-bottom-space
            color="primary" label-color="primary" class="search-bar__value"
            @update:model-value="val => (txtvaleurdeb = (val || '').toUpperCase())"
            @keyup.enter="searchPeriodes"
          />
          <q-input
            v-model="txtvaleurfin"
            name="txtvaleurfin"
            label="Valeur de fin"
            outlined dense clearable hide-bottom-space
            color="primary" label-color="primary" class="search-bar__value"
            @update:model-value="val => (txtvaleurfin = (val || '').toUpperCase())"
          />
          <q-btn type="submit" color="primary" icon="search" label="Rechercher" unelevated :loading="loading" class="search-bar__btn" no-caps />
          <q-btn type="reset" flat round dense color="primary" icon="restart_alt" :disable="loading" />
        </q-form>
        <div class="search-hint">
          <q-icon name="touch_app" size="14px" class="q-mr-xs" color="primary" />
          <span>Cliquez sur un N° assuré pour ouvrir la saisie période d'activité</span>
        </div>
      </div>

      <div class="table-divider" v-if="!loading && periodes.length > 0">
        <span class="table-divider__line" />
        <span class="table-divider__text">{{ periodes.length }} résultat{{ periodes.length !== 1 ? 's' : '' }}</span>
        <span class="table-divider__line" />
      </div>

      <div class="q-pa-none pf-table-responsive">
        <q-table
          :rows="periodes"
          :columns="visibleTableColumns"
          row-key="rowKey"
          :grid="tableGrid"
          :loading="loading"
          dense flat
          :rows-per-page-options="tableRowsPerPageOptions"
          :pagination="{ rowsPerPage: tableDefaultRowsPerPage }"
          no-data-label="Aucun enregistrement — modifiez les filtres ou cliquez sur Rechercher"
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
      </div>
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

            <div class="pf-form-section">
              <div class="pf-form-section__title">
                <q-icon name="business" size="16px" /> Informations employeur
              </div>
              <div class="row pf-form-row q-col-gutter-sm">
                <div class="col-12 col-md-4">
                  <div class="pf-legacy-cell">
                    <q-input v-model="form.txtsaisiematempl" name="txtsaisiematempl" label="Matricule Employeur" placeholder="Matricule Employeur"
                      stack-label dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="pf-legacy-cell">
                    <q-input v-model="form.txtraisonsociale" name="txtraisonsociale" label="Raison Sociale" placeholder="Raison Sociale"
                      stack-label dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="pf-legacy-cell">
                    <q-input v-model="form.txtsaisiedateembauche" name="txtsaisiedateembauche" label="Date Affiliation" placeholder="JJ/MM/AAAA"
                      stack-label dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                  </div>
                </div>
              </div>
            </div>

            <div class="pf-form-section">
              <div class="pf-form-section__title">
                <q-icon name="person" size="16px" /> Informations personnelles de l'assuré
              </div>
              <div class="row pf-form-row q-col-gutter-sm">
                <div class="col-12 col-md-4">
                  <div class="pf-legacy-cell">
                    <q-input v-model="form.txtsaisienumassu" name="txtsaisienumassu" label="N° Assuré" placeholder="N° Assuré"
                      stack-label dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="pf-legacy-cell">
                    <q-input v-model="form.txtsaisietextenomassu" name="txtsaisietextenomassu" label="Noms Assuré" placeholder="Noms Assuré"
                      stack-label dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                  </div>
                </div>
                <div class="col-12 col-md-4">
                  <div class="pf-legacy-cell">
                    <q-input v-model="form.txtsaisietexteprenomassu" name="txtsaisietexteprenomassu" label="Prénoms Assuré" placeholder="Prénoms Assuré"
                      stack-label dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                  </div>
                </div>
              </div>
            </div>

            <div class="pf-form-section">
              <div class="pf-form-section__title">
                <q-icon name="edit_calendar" size="16px" /> Période d'activité
              </div>
              <div class="row pf-form-row q-col-gutter-sm">
                <div class="col-12 col-sm-6 col-md-3">
                  <div class="pf-legacy-cell">
                    <q-select v-model="form.cbxtype" name="cbxtype" label="Type" stack-label :options="typeOptions" dense outlined emit-value map-options hide-bottom-space
                      class="pf-legacy-input pf-legacy-input--select"
                      :rules="[v => !!v || 'Veuillez sélectionner le type de chaque opération']" />
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                  <div class="pf-legacy-cell">
                    <q-input v-model="form.txtsaisiematassu" name="txtsaisiematassu" label="Matricule Assuré" placeholder="Matricule Assuré"
                      stack-label dense outlined hide-bottom-space bg-color="yellow-1" class="pf-legacy-input"
                      :rules="[v => !!v || 'Veuillez saisir le Numéro Assuré SVP!!!']" />
                  </div>
                </div>
                <div class="col-12 col-sm-6 col-md-3">
                  <div class="pf-legacy-cell">
                    <q-input v-model="form.txtSaisiedatedebutreprise" name="txtSaisiedatedebutreprise" label="Date Embauche" placeholder="JJ/MM/AAAA"
                      stack-label dense outlined hide-bottom-space bg-color="yellow-1" class="pf-legacy-input pf-legacy-input--date"
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
                    <q-input v-model="form.txtSaisiedatefinreprise" name="txtSaisiedatefinreprise" label="Date Cessation" placeholder="JJ/MM/AAAA"
                      stack-label dense outlined hide-bottom-space bg-color="yellow-1" class="pf-legacy-input pf-legacy-input--date">
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
              <div class="row pf-form-row q-col-gutter-sm q-mt-xs">
                <div class="col-12 col-md-4">
                  <div class="pf-legacy-cell">
                    <q-input v-model="form.txtsaisienumempl" name="txtsaisienumempl" label="Numéro Employeur" placeholder="Numéro Employeur"
                      stack-label dense outlined hide-bottom-space bg-color="yellow-1" class="pf-legacy-input"
                      :rules="[v => !!v || 'Veuillez saisir le Numéro Employeur SVP!!!']" />
                  </div>
                </div>
              </div>
            </div>

            <div class="row q-col-gutter-sm pf-form-actions dialog-actions">
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
import { ref, reactive } from 'vue'
import { useQuasar } from 'quasar'
import { useLiquidationPfStore } from 'src/modules/energizer/stores/liquidationPfStore.js'
import { usePfModuleTable } from 'src/modules/shared/composables/usePfModuleTable.js'
import { usePfDossierCatalogTable } from 'src/modules/energizer/composables/usePfDossierCatalogTable.js'
import { formatLegacyServerMessage } from 'src/modules/energizer/api/adapters/parseNouveauDossierLegacyHtml.js'

defineOptions({ name: 'PeriodeActivite' })

const $q = useQuasar()
const pfStore = useLiquidationPfStore()

const submitting = ref(false)
const showDialog = ref(false)
const saisieFormRef = ref(null)

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

const {
  loading,
  errorMsg,
  cbxcritere,
  txtvaleurdeb,
  txtvaleurfin,
  dossiers: periodes,
  searchDossiers: searchPeriodes,
  resetSearch,
  loadCatalog,
} = usePfDossierCatalogTable({
  pfStore,
  mode: 'periodes',
  $q,
  withEndFilter: true,
  defaultCritere: 'fnumassu',
  defaultStart: '',
})

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
    const result = await pfStore.submitPeriode(form)
    $q.notify({
      type: 'positive',
      message: result?.message || "Période d'activité enregistrée avec succès !",
      position: 'top',
      icon: 'check_circle',
    })
    showDialog.value = false
    resetForm()
    await loadCatalog()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: formatLegacyServerMessage(error?.message) || "Erreur lors de l'enregistrement",
      position: 'top',
    })
  } finally {
    submitting.value = false
  }
}

// ─── Réinitialisation ────────────────────────────────────────────
function resetForm() {
  Object.assign(form, { ...FORM_INITIAL })
  saisieFormRef.value?.resetValidation()
}

</script>

<style scoped>
.periode-activite {
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
.row-index {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 50%;
  background: rgba(25, 118, 210, 0.1); color: #1976d2;
  font-size: 0.75rem; font-weight: 700;
}
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
.pf-form-row--alt { background: transparent; }
.pf-legacy-input { width: 100%; }
.pf-legacy-btn { min-width: 120px; min-height: 36px; }
.dialog-form-card { display: flex; flex-direction: column; min-height: 0; }
.dialog-bar { min-height: 52px; }
.dialog-body { flex: 1; overflow-y: auto; }

@media (max-width: 767px) {
  .search-bar__critere,
  .search-bar__value,
  .search-bar__btn { flex: 1 1 100%; }
}
</style>
