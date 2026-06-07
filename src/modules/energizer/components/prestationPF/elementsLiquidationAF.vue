<template>
  <div class="q-pa-sm elements-liquidation-af">
    <q-banner v-if="errorMsg" class="bg-negative text-white q-mb-sm" rounded dense>
      <template v-slot:avatar><q-icon name="error" color="white" /></template>
      {{ errorMsg }}
      <template v-slot:action><q-btn flat color="white" label="Fermer" dense @click="errorMsg = ''" /></template>
    </q-banner>

    <!-- ═══════════════════════════════════════════════════════
         CARD PRINCIPALE
    ═══════════════════════════════════════════════════════ -->
    <q-card class="dossiers-card">

      <!-- ── HERO ── -->
      <div class="dossiers-hero">
        <div class="dossiers-hero__left">
          <div class="dossiers-hero__icon-wrap">
            <q-icon name="family_restroom" size="28px" color="white" />
          </div>
          <div>
            <div class="dossiers-hero__title">Éléments de Liquidation AF</div>
            <div class="dossiers-hero__sub">Allocations familiales</div>
          </div>
        </div>
        <q-badge
          class="dossiers-hero__badge"
          :label="`${dossiers.length} dossier${dossiers.length !== 1 ? 's' : ''}`"
        />
      </div>

      <!-- ── BARRE DE RECHERCHE ── -->
      <div class="search-bar-wrap">
        <q-form
          class="search-bar"
          @submit.prevent="searchDossiers"
          @reset.prevent="resetSearch"
        >
          <!-- Critère -->
          <q-select
            v-model="cbxcritere"
            :options="searchOptions"
            label="Critère"
            outlined dense emit-value map-options
            hide-bottom-space
            color="primary"
            label-color="primary"
            class="search-bar__critere"
          >
            <template v-slot:prepend>
              <q-icon name="tune" color="primary" size="18px" />
            </template>
          </q-select>

          <!-- Valeur début -->
          <q-input
            v-model="txtvaleurdeb"
            label="Valeur de début"
            outlined dense clearable
            hide-bottom-space
            color="primary"
            label-color="primary"
            class="search-bar__value"
            @update:model-value="val => (txtvaleurdeb = (val || '').toUpperCase())"
            @keyup.enter="searchDossiers"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="primary" size="18px" />
            </template>
          </q-input>

          <!-- Valeur fin -->
          <q-input
            v-model="txtvaleurfin"
            label="Valeur de fin"
            outlined dense clearable
            hide-bottom-space
            color="primary"
            label-color="primary"
            class="search-bar__value"
            @update:model-value="val => (txtvaleurfin = (val || '').toUpperCase())"
            @keyup.enter="searchDossiers"
          >
            <template v-slot:prepend>
              <q-icon name="last_page" color="primary" size="18px" />
            </template>
          </q-input>

          <!-- Bouton Rechercher -->
          <q-btn
            type="submit"
            color="primary"
            icon="search"
            label="Rechercher"
            unelevated
            :loading="loading"
            no-caps
            class="search-bar__btn"
          />

          <!-- Reset -->
          <q-btn
            type="reset"
            flat round dense
            color="primary"
            icon="restart_alt"
            :disable="loading"
            class="search-bar__reset"
          >
            <q-tooltip anchor="bottom middle" self="top middle">Réinitialiser</q-tooltip>
          </q-btn>
        </q-form>

        <div class="search-hint">
          <q-icon name="touch_app" size="14px" class="q-mr-xs" color="primary" />
          <span>Cliquez sur un numéro de dossier pour ouvrir la saisie AF</span>
        </div>
      </div>

      <!-- ── DIVIDER résultats ── -->
      <div class="table-divider" v-if="!loading && dossiers.length > 0">
        <span class="table-divider__line" />
        <span class="table-divider__text">
          <q-icon name="check_circle" size="14px" color="positive" class="q-mr-xs" />
          {{ dossiers.length }} résultat{{ dossiers.length !== 1 ? 's' : '' }} trouvé{{ dossiers.length !== 1 ? 's' : '' }}
        </span>
        <span class="table-divider__line" />
      </div>

      <!-- ── TABLE ── -->
      <q-table
        :rows="dossiers"
        :columns="visibleTableColumns"
        row-key="numdoss"
        :grid="tableGrid"
        :loading="loading"
        dense flat
        :rows-per-page-options="tableRowsPerPageOptions"
        :pagination="{ rowsPerPage: tableDefaultRowsPerPage }"
        no-data-label="Aucun dossier — modifiez les filtres ou cliquez sur Rechercher"
        class="pf-module-table"
      >
        <template v-slot:header-cell="props">
          <q-th :props="props" class="pf-col-header">{{ props.col.label }}</q-th>
        </template>

        <template v-slot:body-cell-index="props">
          <q-td :props="props" class="text-center">
            <span class="row-index">{{ props.rowIndex + 1 }}</span>
          </q-td>
        </template>

        <template v-slot:body-cell-numdoss="props">
          <q-td :props="props">
            <a class="dossier-link" href="#" @click.prevent="loadDossier(props.row)">
              <q-icon name="folder_open" size="14px" class="q-mr-xs link-icon" />
              <span>{{ props.row.numdoss }}</span>
            </a>
          </q-td>
        </template>

        <template v-slot:body-cell-position="props">
          <q-td :props="props">
            <q-badge
              :color="getStatusColor(props.row.position)"
              :label="props.row.position || '—'"
              style="font-size:0.7rem; padding:3px 8px; border-radius:20px"
            />
          </q-td>
        </template>

        <template v-slot:item="props">
          <div class="pf-grid-card" @click="loadDossier(props.row)">
            <div class="pf-grid-card__header">
              <a class="dossier-link" href="#" @click.prevent.stop="loadDossier(props.row)">
                <q-icon name="folder_open" size="14px" class="q-mr-xs link-icon" />
                {{ props.row.numdoss }}
              </a>
              <q-badge :color="getStatusColor(props.row.position)" :label="props.row.position || '—'" dense style="border-radius:20px" />
            </div>
            <div class="pf-grid-card__name">{{ props.row.requerant }}</div>
            <div class="pf-grid-card__meta">
              <q-icon name="badge" size="12px" class="q-mr-xs" />{{ props.row.numassu }}
            </div>
          </div>
        </template>

        <template v-slot:no-data="{ message }">
          <div class="no-data-block">
            <q-icon name="inbox" size="3rem" color="primary" style="opacity:.25" />
            <div class="no-data-block__text">{{ message }}</div>
            <div class="no-data-block__sub">Lancez une recherche pour afficher les dossiers</div>
          </div>
        </template>

        <template v-slot:loading>
          <q-inner-loading showing color="primary" />
        </template>
      </q-table>
    </q-card>

    <!-- ═══════════════════════════════════════════════════════
         DIALOG SAISIE AF
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
      <q-card
        class="dialog-form-card elements-liquidation-af-dialog"
        :class="{ 'dialog-form-card--desktop': $q.screen.gt.sm }"
      >

        <!-- Barre titre -->
        <q-bar class="bg-primary text-white dialog-bar">
          <q-icon name="family_restroom" />
          <span class="q-ml-sm text-body2 text-weight-bold dialog-bar__title ellipsis">
            Saisie des Éléments de Liquidation AF
          </span>
          <q-space />
          <q-btn flat dense round color="white" icon="restart_alt" size="sm" @click="resetForm">
            <q-tooltip>Réinitialiser</q-tooltip>
          </q-btn>
          <q-btn flat dense round color="white" icon="close" size="sm" v-close-popup @click="resetForm" />
        </q-bar>

        <q-card-section class="dialog-body q-pa-lg">
          <q-form ref="saisieFormRef" class="pf-legacy-form" @submit.prevent="submitForm" @reset="resetForm">

            <div class="row pf-form-row q-col-gutter-sm pf-dossier-info-row">
              <div class="col-12 col-md-3">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">N° Dossier</span>
                  <q-input v-model="form.txtsaisienumdoss" name="txtsaisienumdoss" dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                </div>
              </div>
              <div class="col-12 col-md-5 pf-natupres-col">
                <div class="pf-legacy-cell pf-legacy-cell--natupres-end">
                  <span class="pf-legacy-label">Nature Prestation</span>
                  <q-input v-model="form.txtsaisienatupres" name="txtsaisienatupres" dense outlined readonly hide-bottom-space class="pf-legacy-input pf-legacy-input--natupres" />
                </div>
              </div>
              <div class="col-12 col-md-4 pf-date-demande-col">
                <div class="pf-legacy-cell pf-legacy-cell--date-demande-end">
                  <span class="pf-legacy-label">Date Demande</span>
                  <q-input v-model="form.txtsaisiedatedemande" name="txtsaisiedatedemande" dense outlined readonly hide-bottom-space class="pf-legacy-input pf-legacy-input--date-demande" />
                </div>
              </div>
            </div>

            <div class="row pf-form-row q-col-gutter-sm">
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
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label text-negative">Date d'Embauche *</span>
                <q-input
                  v-model="form.txtSaisieDateEmbauche"
                  name="txtSaisieDateEmbauche"
                  dense outlined hide-bottom-space
                  bg-color="yellow-1"
                  class="pf-legacy-input pf-legacy-input--date"
                  :rules="[v => (!!v && v.length === 10) || 'Date d\'embauche obligatoire']"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer" size="xs" color="primary">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="form.txtSaisieDateEmbauche" mask="DD/MM/YYYY" today-btn color="primary">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="OK" color="primary" flat dense />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                </div>
              </div>

              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label text-negative">Date Signature Employeur *</span>
                <q-input
                  v-model="form.txtSaisieDateSignatureEmpl"
                  name="txtSaisieDateSignatureEmpl"
                  dense outlined hide-bottom-space
                  bg-color="yellow-1"
                  class="pf-legacy-input pf-legacy-input--date"
                  :rules="[v => (!!v && v.length === 10) || 'Date signature obligatoire']"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer" size="xs" color="primary">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="form.txtSaisieDateSignatureEmpl" mask="DD/MM/YYYY" today-btn color="primary">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="OK" color="primary" flat dense />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                </div>
              </div>

              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Heures travaillées (mois embauche)</span>
                <q-input
                  v-model.number="form.txtSaisieNbreHeures"
                  name="txtSaisieNbreHeures"
                  type="number"
                  min="0"
                  max="744"
                  dense outlined hide-bottom-space
                  bg-color="yellow-1"
                  class="pf-legacy-input pf-legacy-input--narrow"
                >
                  <template v-slot:append>
                    <span class="af-unit">h</span>
                  </template>
                </q-input>
                </div>
              </div>
            </div>

            <div class="af-actions pf-form-actions">
              <q-btn
                type="submit"
                color="primary"
                label="Valider"
                unelevated
                icon="check_circle"
                no-caps
                :loading="submitting"
                class="af-btn af-btn--primary"
              />
              <q-btn
                type="reset"
                color="grey-6"
                label="Annuler"
                flat
                no-caps
                icon="close"
                class="af-btn"
                @click="resetForm"
              />
            </div>

          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { usePfModuleTable } from 'src/modules/shared/composables/usePfModuleTable.js'
import { useQuasar } from 'quasar'
import { useLiquidationPfStore } from 'src/modules/energizer/stores/liquidationPfStore.js'
import { usePfDossierCatalogTable } from 'src/modules/energizer/composables/usePfDossierCatalogTable.js'
import { normalizePfDossierRow } from 'src/modules/energizer/utils/pfDossierSearchUtils.js'
import { formatLegacyServerMessage } from 'src/modules/energizer/api/adapters/parseNouveauDossierLegacyHtml.js'

defineOptions({ name: 'ElementsLiquidationAF' })

const $q = useQuasar()
const pfStore = useLiquidationPfStore()
const submitting = ref(false)
const showDialog = ref(false)
const saisieFormRef = ref(null)

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

const {
  loading, errorMsg, cbxcritere, txtvaleurdeb, txtvaleurfin,
  dossiers, searchDossiers, resetSearch,
} = usePfDossierCatalogTable({ pfStore, scope: 'af', $q, withEndFilter: true })

const tableColumns = [
  { name: 'index',      label: 'N°',               field: 'index',       align: 'center', style: 'width:50px' },
  { name: 'numdoss',    label: 'N° Dossier',        field: 'numdoss',     align: 'left', sortable: true },
  { name: 'numassu',    label: 'N° Assuré',         field: 'numassu',     align: 'left', sortable: true },
  { name: 'requerant',  label: 'Noms Requérant',    field: 'requerant',   align: 'left', sortable: true },
  { name: 'datedemande',label: 'Date Demande',       field: 'datedemande', align: 'left', sortable: true },
  { name: 'natupres',   label: 'Nature Prestation',  field: 'natupres',    align: 'left', sortable: true },
  { name: 'position',   label: 'Position Dossier',  field: 'position',    align: 'left', sortable: true },
  { name: 'dateposi',   label: 'Date Position',     field: 'dateposi',    align: 'left', sortable: true },
]
const { visibleTableColumns, tableGrid, tableRowsPerPageOptions, tableDefaultRowsPerPage } =
  usePfModuleTable(tableColumns, {
    mobileCols: ['index', 'numdoss', 'requerant', 'position'],
    tabletHidden: ['dateposi', 'natupres'],
  })

function fmtDate(v) { return String(v ?? '').replace(/\//g, '-') }

function loadDossier(row) {
  const dossier = normalizePfDossierRow(row)
  form.txtsaisienumdoss           = dossier.numdoss
  form.txtsaisienumassu           = dossier.numassu
  form.txtsaisiedatedemande       = fmtDate(dossier.datedemande)
  form.txtsaisienatupres          = dossier.libellenatupres || dossier.natupres
  form.txtsaisietextenomassu      = dossier.nomassu
  form.txtsaisietexteprenomassu   = dossier.prenomassu
  form.txtSaisieDateEmbauche      = fmtDate(dossier.dateembauche)
  form.txtSaisieDateSignatureEmpl = fmtDate(dossier.datesignempl)
  form.txtSaisieNbreHeures        =
    dossier.nbreheure !== null && dossier.nbreheure !== 'null'
      ? Number(dossier.nbreheure) || 0 : 0
  showDialog.value = true
  $q.notify({ type: 'positive', message: `Dossier ${dossier.numdoss} chargé`, position: 'top', timeout: 1500 })
}

function validateForm() {
  if (!form.txtsaisienumdoss) {
    $q.notify({ type: 'negative', message: 'Veuillez sélectionner un dossier dans la liste SVP', position: 'top' })
    return false
  }
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
    const result = await pfStore.submitAllocationFamiliale(form)
    $q.notify({ type: 'positive', message: result?.message || 'Éléments AF enregistrés avec succès !', position: 'top', icon: 'check_circle' })
    showDialog.value = false
    resetForm()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: formatLegacyServerMessage(error?.message) || "Erreur lors de l'enregistrement des éléments AF",
      position: 'top',
    })
  } finally { submitting.value = false }
}

function resetForm() {
  Object.assign(form, { ...FORM_INITIAL })
  saisieFormRef.value?.resetValidation()
}

function getStatusColor(s) {
  if (!s) return 'grey-5'
  const t = s.toLowerCase()
  if (t.includes('cours'))   return 'orange-7'
  if (t.includes('attente')) return 'blue-6'
  if (t.includes('transmi')) return 'teal-6'
  if (t.includes('annul'))   return 'negative'
  return 'grey-6'
}
</script>

<style scoped>
/* ═══════════════════════════════════════
   CONTENEUR
═══════════════════════════════════════ */
@import 'src/css/pf-legacy-form.scss';

.elements-liquidation-af {
  max-width: 1400px;
  margin: 0 auto;
}

/* ═══════════════════════════════════════
   CARD PRINCIPALE
═══════════════════════════════════════ */
.dossiers-card {
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(25, 118, 210, 0.10), 0 1px 4px rgba(0,0,0,0.06);
  border: 1px solid rgba(25, 118, 210, 0.10);
}

/* ═══════════════════════════════════════
   HERO
═══════════════════════════════════════ */
.dossiers-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px 16px;
  background: linear-gradient(135deg, #1565c0 0%, #1976d2 60%, #42a5f5 100%);
  position: relative;
  overflow: hidden;
}
.dossiers-hero::before,
.dossiers-hero::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
}
.dossiers-hero::before { width: 180px; height: 180px; top: -60px; right: 60px; }
.dossiers-hero::after  { width: 90px;  height: 90px;  bottom: -30px; right: 20px; }

.dossiers-hero__left {
  display: flex;
  align-items: center;
  gap: 14px;
  z-index: 1;
}
.dossiers-hero__icon-wrap {
  width: 46px; height: 46px;
  border-radius: 12px;
  background: rgba(255,255,255,0.18);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  backdrop-filter: blur(4px);
}
.dossiers-hero__title {
  font-size: 1.05rem; font-weight: 700;
  color: #fff; line-height: 1.2; letter-spacing: 0.01em;
}
.dossiers-hero__sub {
  font-size: 0.78rem; color: rgba(255,255,255,0.75); margin-top: 2px;
}
.dossiers-hero__badge {
  z-index: 1;
  background: rgba(255,255,255,0.22) !important;
  color: #fff !important;
  font-size: 0.82rem; font-weight: 700;
  padding: 5px 14px; border-radius: 20px;
  border: 1.5px solid rgba(255,255,255,0.35);
  backdrop-filter: blur(4px);
  letter-spacing: 0.02em;
}

/* ═══════════════════════════════════════
   BARRE DE RECHERCHE
═══════════════════════════════════════ */
.search-bar-wrap {
  padding: 16px 20px 10px;
  background: #fafbff;
  border-bottom: 1px solid rgba(25, 118, 210, 0.08);
}
.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.search-bar__critere {
  flex: 0 0 190px;
  min-width: 150px;
}
.search-bar__value {
  flex: 1 1 180px;
  min-width: 150px;
}
.search-bar__btn {
  height: 40px;
  min-width: 130px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 0.02em;
  flex-shrink: 0;
  transition: box-shadow 0.2s, transform 0.1s;
}
.search-bar__btn:hover {
  box-shadow: 0 4px 14px rgba(25, 118, 210, 0.35);
  transform: translateY(-1px);
}
.search-bar__btn:active { transform: translateY(0); }
.search-bar__reset {
  flex-shrink: 0;
  transition: transform 0.25s;
}
.search-bar__reset:hover { transform: rotate(180deg); }

/* Champs internes */
.search-bar :deep(.q-field__control) {
  border-radius: 8px;
  height: 40px; min-height: 40px;
  background: #fff;
}
.search-bar :deep(.q-field--outlined .q-field__control:before) {
  border-color: rgba(25, 118, 210, 0.28);
  transition: border-color 0.2s;
}
.search-bar :deep(.q-field--outlined.q-field--focused .q-field__control:before) {
  border-color: #1976d2;
  border-width: 2px;
}
.search-bar :deep(.q-field__native),
.search-bar :deep(.q-field__input) {
  font-size: 0.92rem; color: #1a1a2e; font-weight: 500;
}

.search-hint {
  display: flex; align-items: center;
  margin-top: 8px;
  font-size: 0.78rem; color: #1976d2; opacity: 0.75;
}

/* ═══════════════════════════════════════
   SÉPARATEUR RÉSULTATS
═══════════════════════════════════════ */
.table-divider {
  display: flex; align-items: center; gap: 10px;
  padding: 6px 20px;
  background: #fafbff;
}
.table-divider__line {
  flex: 1; height: 1px;
  background: rgba(25, 118, 210, 0.12);
}
.table-divider__text {
  display: flex; align-items: center;
  font-size: 0.78rem; color: #555; white-space: nowrap;
}

/* ═══════════════════════════════════════
   TABLE
═══════════════════════════════════════ */
.pf-module-table { background: transparent; }

.pf-col-header {
  background: #1976d2;
  color: #fff !important;
  font-weight: 700;
  font-size: 0.82rem;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  padding: 10px 12px;
  white-space: nowrap;
}
.pf-module-table :deep(tbody tr:nth-child(even)) {
  background: rgba(25, 118, 210, 0.03);
}
.pf-module-table :deep(tbody tr) { transition: background 0.15s; }
.pf-module-table :deep(tbody tr:hover) {
  background: rgba(25, 118, 210, 0.07) !important;
}
.pf-module-table :deep(td) { font-size: 0.87rem; padding: 8px 12px; }

.row-index {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 50%;
  background: rgba(25, 118, 210, 0.1);
  color: #1976d2; font-size: 0.75rem; font-weight: 700;
}
.dossier-link {
  display: inline-flex; align-items: center;
  color: #1565c0; font-weight: 700; font-size: 0.9rem;
  text-decoration: none; letter-spacing: 0.01em;
  transition: color 0.15s;
}
.dossier-link .link-icon { opacity: 0.6; transition: opacity 0.15s, transform 0.15s; }
.dossier-link:hover { color: #0d47a1; }
.dossier-link:hover .link-icon { opacity: 1; transform: translateX(2px); }

.pf-grid-card {
  background: #fff;
  border: 1px solid rgba(25, 118, 210, 0.12);
  border-radius: 10px; padding: 12px 14px; margin: 6px;
  cursor: pointer; transition: box-shadow 0.18s, transform 0.15s;
}
.pf-grid-card:hover { box-shadow: 0 4px 16px rgba(25,118,210,0.15); transform: translateY(-2px); }
.pf-grid-card__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.pf-grid-card__name   { font-size: 0.9rem; font-weight: 600; color: #222; }
.pf-grid-card__meta   { display: flex; align-items: center; font-size: 0.78rem; color: #888; margin-top: 4px; }

.no-data-block {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 48px 24px; gap: 8px;
}
.no-data-block__text { font-size: 0.95rem; color: #666; font-weight: 500; text-align: center; }
.no-data-block__sub  { font-size: 0.8rem; color: #aaa; text-align: center; }

/* ═══════════════════════════════════════
   DIALOG
═══════════════════════════════════════ */
.dialog-form-card {
  display: flex; flex-direction: column; min-height: 0;
}
.dialog-form-card:not(.dialog-form-card--desktop) { height: 100vh; }
.dialog-form-card--desktop {
  width: min(92vw, 760px);
  max-width: 760px;
  max-height: 92vh;
  height: auto;
  border-radius: 14px;
}
.dialog-bar {
  min-height: 52px;
  flex-shrink: 0;
}
.dialog-bar__title { flex: 1; min-width: 0; }
.dialog-body { flex: 1; overflow-y: auto; }

/* ═══════════════════════════════════════
   SECTIONS DANS LE DIALOG
═══════════════════════════════════════ */
.af-section-label {
  display: flex;
  align-items: center;
  font-size: 0.78rem;
  font-weight: 700;
  color: #1976d2;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0 0 6px 4px;
  border-bottom: 2px solid rgba(25, 118, 210, 0.15);
  margin-bottom: 10px;
}

/* ── Grille readonly ── */
.af-readonly-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px 16px;
  margin-bottom: 4px;
}
.af-readonly-cell {
  background: #f4f6fb;
  border: 1px solid rgba(25,118,210,0.10);
  border-radius: 8px;
  padding: 8px 12px;
}
.af-readonly-cell__label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 3px;
}
.af-readonly-cell__value {
  font-size: 0.92rem;
  font-weight: 600;
  color: #1a1a2e;
  word-break: break-word;
}

/* ── Grille saisie ── */
.af-input-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px 16px;
  margin-bottom: 4px;
}
.af-input-cell__label {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: #444;
  margin-bottom: 5px;
  line-height: 1.3;
}
.af-required {
  color: #e53935;
  margin-left: 3px;
  font-size: 1rem;
  line-height: 1;
}
.af-input :deep(.q-field__control) {
  border-radius: 8px;
}
.af-input :deep(.q-field--readonly .q-field__control) {
  background: #fafafa;
}
.af-input :deep(.q-field:not(.q-field--readonly) .q-field__control) {
  background: #fffde7;
}
.af-input :deep(.q-field--outlined .q-field__control:before) {
  border-color: rgba(25, 118, 210, 0.25);
  transition: border-color 0.2s;
}
.af-input :deep(.q-field--outlined.q-field--focused .q-field__control:before) {
  border-color: #1976d2;
  border-width: 2px;
}
.af-input--narrow { max-width: 160px; }
.af-unit {
  font-size: 0.82rem;
  font-weight: 700;
  color: #1976d2;
  padding: 0 4px;
}

/* ── Boutons ── */
.af-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 28px;
  padding-top: 16px;
  border-top: 1px solid rgba(25,118,210,0.10);
}
.af-btn {
  min-width: 130px;
  min-height: 40px;
  border-radius: 8px;
  font-size: 0.92rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.af-btn--primary {
  box-shadow: 0 3px 10px rgba(25,118,210,0.25);
  transition: box-shadow 0.2s, transform 0.1s;
}
.af-btn--primary:hover {
  box-shadow: 0 5px 18px rgba(25,118,210,0.38);
  transform: translateY(-1px);
}

/* ═══════════════════════════════════════
   RESPONSIVE
═══════════════════════════════════════ */
@media (max-width: 767px) {
  .dossiers-hero { padding: 14px 16px 12px; }
  .dossiers-hero__title { font-size: 0.95rem; }
  .search-bar-wrap { padding: 12px 14px 8px; }
  .search-bar__critere,
  .search-bar__value  { flex: 1 1 100%; }
  .search-bar__btn    { flex: 1 1 100%; }
  .af-readonly-grid { grid-template-columns: 1fr 1fr; }
  .af-input-grid    { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 479px) {
  .elements-liquidation-af { max-width: 100%; }
  .af-readonly-grid { grid-template-columns: 1fr; }
  .af-input-grid    { grid-template-columns: 1fr; }
  .af-input--narrow { max-width: 100%; }
  .af-actions       { flex-direction: column; }
  .af-btn           { width: 100%; }
}
</style>
