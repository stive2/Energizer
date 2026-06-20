<template>
  <div class="q-pa-xs q-pa-sm gestion-reprises">

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
            <q-icon name="restart_alt" size="28px" color="white" />
          </div>
          <div>
            <div class="dossiers-hero__title">Reprises / Non Reprises en IJ</div>
            <div class="dossiers-hero__sub">Certificats de reprise — prestations PF / IJ</div>
          </div>
        </div>
        <q-badge
          class="dossiers-hero__badge"
          :label="`${dossiers.length} dossier${dossiers.length !== 1 ? 's' : ''}`"
        />
      </div>

      <div class="search-bar-wrap">
        <q-form class="search-bar" @submit.prevent="searchDossiers" @reset.prevent="resetSearch">
          <q-select
            v-model="cbxcritere"
            name="cbxcritere"
            :options="searchOptions"
            label="Critère"
            outlined
            dense
            emit-value
            map-options
            hide-bottom-space
            color="primary"
            label-color="primary"
            class="search-bar__critere"
          >
            <template v-slot:prepend>
              <q-icon name="tune" color="primary" size="18px" />
            </template>
          </q-select>
          <q-input
            v-model="txtvaleurdeb"
            name="txtvaleurdeb"
            label="Valeur de début"
            outlined
            dense
            clearable
            hide-bottom-space
            color="primary"
            label-color="primary"
            class="search-bar__value"
            input-class="search-input-text"
            @update:model-value="val => (txtvaleurdeb = (val || '').toUpperCase())"
            @keyup.enter="searchDossiers"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="primary" size="18px" />
            </template>
          </q-input>
          <q-input
            v-model="txtvaleurfin"
            name="txtvaleurfin"
            label="Valeur de fin"
            outlined
            dense
            clearable
            hide-bottom-space
            color="primary"
            label-color="primary"
            class="search-bar__value"
            input-class="search-input-text"
            @update:model-value="val => (txtvaleurfin = (val || '').toUpperCase())"
            @keyup.enter="searchDossiers"
          >
            <template v-slot:prepend>
              <q-icon name="last_page" color="primary" size="18px" />
            </template>
          </q-input>
          <q-btn
            type="submit"
            color="primary"
            icon="search"
            label="Rechercher"
            unelevated
            :loading="loading"
            class="search-bar__btn"
            no-caps
          />
          <q-btn
            type="reset"
            flat
            round
            dense
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
          <span>Cliquez sur un N° dossier pour ouvrir le certificat de reprise</span>
        </div>
      </div>

      <div class="table-divider" v-if="!loading && dossiers.length > 0">
        <span class="table-divider__line" />
        <span class="table-divider__text">
          <q-icon name="check_circle" size="14px" color="positive" class="q-mr-xs" />
          {{ dossiers.length }} résultat{{ dossiers.length !== 1 ? 's' : '' }}
        </span>
        <span class="table-divider__line" />
      </div>

      <div class="q-pa-none pf-table-responsive">
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
            <q-th :props="props" class="pf-col-header bg-primary text-white">
              <span class="pf-col-header__label text-weight-bold">{{ props.col.label }}</span>
            </q-th>
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
          <template v-slot:item="props">
            <div class="pf-grid-card" @click="loadDossier(props.row)">
              <div class="pf-grid-card__header">
                <a class="dossier-link text-body2" href="#" @click.prevent.stop="loadDossier(props.row)">
                  <q-icon name="folder_open" size="14px" class="q-mr-xs link-icon" />
                  {{ props.row.numdoss }}
                </a>
                <q-badge
                  :color="repriseType(props.row) === 'OUI' ? 'positive' : 'orange-7'"
                  :label="repriseType(props.row) === 'OUI' ? 'Reprise' : 'Non Reprise'"
                  dense
                  style="border-radius:20px"
                />
              </div>
              <div class="pf-grid-card__name">{{ props.row.requerant }}</div>
            </div>
          </template>
          <template v-slot:body-cell-flagreprise="props">
            <q-td :props="props">
              <q-badge
                :color="repriseType(props.row) === 'OUI' ? 'positive' : 'orange-7'"
                :label="repriseType(props.row) === 'OUI' ? 'Reprise' : 'Non Reprise'"
                style="font-size:0.7rem"
              />
            </q-td>
          </template>
          <template v-slot:body-cell-position="props">
            <q-td :props="props">
              <q-badge :color="getStatusColor(props.row.position)"
                :label="props.row.position || '—'" style="font-size:0.7rem" />
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
         DIALOG – FORMULAIRE DE SAISIE REPRISE
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
        class="dialog-form-card gestion-reprises-dialog"
        :class="{ 'dialog-form-card--desktop': $q.screen.gt.sm }"
      >
        <q-bar class="bg-primary text-white q-py-sm dialog-bar">
          <q-icon name="restart_alt" class="flex-shrink-0" />
          <span class="q-ml-sm text-body2 text-weight-bold dialog-bar__title ellipsis">
            Certificat de Reprise / Non Reprise en IJ
          </span>
          <q-space />
          <q-btn flat dense round color="white" icon="restart_alt" size="sm" @click="resetForm">
            <q-tooltip>Réinitialiser</q-tooltip>
          </q-btn>
          <q-btn flat dense round color="white" icon="close" size="sm" v-close-popup @click="resetForm" />
        </q-bar>

        <q-card-section class="q-pa-md overflow-auto dialog-body">
          <q-form ref="saisieFormRef" class="pf-legacy-form" @submit.prevent="submitForm" @reset="resetForm">

            <div class="pf-form-section">
              <div class="pf-form-section__title">
                <q-icon name="folder_open" size="16px" /> Informations dossier
              </div>
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
            </div>

            <div class="pf-form-section">
              <div class="pf-form-section__title">
                <q-icon name="person" size="16px" /> Informations personnelles de l'assuré
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
            </div>

            <div class="pf-form-section">
              <div class="pf-form-section__title">
                <q-icon name="restart_alt" size="16px" /> Certificat de reprise
              </div>
            <div class="row pf-form-row q-col-gutter-sm pf-certificat-row">
              <div class="col-12 col-sm-6 col-md-2">
                <div class="pf-legacy-cell pf-legacy-cell--stacked">
                  <span class="pf-legacy-label">Type</span>
                  <q-select v-model="form.cbxtype" name="cbxtype" :options="typeOptions" dense outlined
                    emit-value map-options hide-bottom-space class="pf-legacy-input pf-legacy-input--select" />
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-2 pf-rang-col">
                <div class="pf-legacy-cell pf-legacy-cell--stacked">
                  <span class="pf-legacy-label">Rang</span>
                  <q-select v-model="form.cbxrang" name="cbxrang" :options="rangOptions" dense outlined
                    emit-value map-options hide-bottom-space class="pf-legacy-input pf-legacy-input--narrow" />
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-4">
                <div class="pf-legacy-cell pf-legacy-cell--stacked">
                  <span class="pf-legacy-label text-negative">Date Début</span>
                  <q-input v-model="form.txtSaisiedatedebutreprise" name="txtSaisiedatedebutreprise" dense outlined hide-bottom-space
                    bg-color="yellow-1" class="pf-legacy-input pf-reprise-date-main"
                    :rules="[v => !!v || 'Veuillez Saisir la date debut SVP']">
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" size="xs" color="primary">
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
              <div class="col-12 col-sm-6 col-md-4">
                <div class="pf-legacy-cell pf-legacy-cell--stacked">
                  <span class="pf-legacy-label text-negative">Date Fin</span>
                  <q-input v-model="form.txtSaisiedatefinreprise" name="txtSaisiedatefinreprise" dense outlined hide-bottom-space
                    bg-color="yellow-1" class="pf-legacy-input pf-reprise-date-main">
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" size="xs" color="primary">
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

            <div class="row pf-form-row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Matricule Assuré</span>
                  <q-input v-model="form.txtsaisiematassu" name="txtsaisiematassu" dense outlined readonly hide-bottom-space class="pf-legacy-input" />
                </div>
              </div>
              <div class="col-12 col-md-4 pf-jours-payes-col">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Jours Payés</span>
                  <q-input v-model.number="form.txtsaisienbrejours" name="txtsaisienbrejours" type="number" min="0"
                    dense outlined hide-bottom-space class="pf-legacy-input pf-legacy-input--narrow"
                    @blur="validateNombrejrIj(form.txtsaisienbrejours)" />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Reliquat</span>
                  <q-input v-model.number="form.txtsaisiereliquat" name="txtsaisiereliquat" type="number" min="0"
                    dense outlined hide-bottom-space class="pf-legacy-input pf-legacy-input--narrow" />
                </div>
              </div>
            </div>
            </div>

            <div class="pf-form-section">
              <div class="pf-form-section__title">
                <q-icon name="payments" size="16px" /> Remboursement employeur
              </div>
            <div class="row pf-form-row q-col-gutter-sm pf-remb-row">
              <div class="col-12 col-sm-6 col-md-3">
                <div class="pf-legacy-cell pf-legacy-cell--stacked">
                  <span class="pf-legacy-label">Remboursement Employeur ?</span>
                  <q-select v-model="form.cbxrembempl" name="cbxrembempl" :options="rembEmplOptions" dense outlined
                    emit-value map-options hide-bottom-space class="pf-legacy-input" />
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="pf-legacy-cell pf-legacy-cell--stacked">
                  <span class="pf-legacy-label">N° Employeur</span>
                  <q-input v-model="form.txtsaisienumempl" name="txtsaisienumempl" dense outlined hide-bottom-space
                    bg-color="yellow-1" class="pf-legacy-input" :disable="form.cbxrembempl === 'NON'"
                    @update:model-value="v => upper('txtsaisienumempl', v)" />
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="pf-legacy-cell pf-legacy-cell--stacked">
                  <span class="pf-legacy-label">Date Début Remboursement</span>
                  <q-input v-model="form.txtSaisieDateDebutRembEmpl" name="txtSaisieDateDebutRembEmpl" dense outlined hide-bottom-space
                    bg-color="yellow-1" class="pf-legacy-input pf-legacy-input--date"
                    :disable="form.cbxrembempl === 'NON'">
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" size="xs" color="primary">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="form.txtSaisieDateDebutRembEmpl" mask="DD/MM/YYYY" today-btn color="primary">
                            <div class="row items-center justify-end"><q-btn v-close-popup label="OK" color="primary" flat dense /></div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="pf-legacy-cell pf-legacy-cell--stacked">
                  <span class="pf-legacy-label">Date Fin Remboursement</span>
                  <q-input v-model="form.txtSaisieDateFinRembEmpl" name="txtSaisieDateFinRembEmpl" dense outlined hide-bottom-space
                    bg-color="yellow-1" class="pf-legacy-input pf-legacy-input--date"
                    :disable="form.cbxrembempl === 'NON'">
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" size="xs" color="primary">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="form.txtSaisieDateFinRembEmpl" mask="DD/MM/YYYY" today-btn color="primary">
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
                <q-btn type="submit" color="primary" label="Valider" unelevated class="full-width pf-legacy-btn" :loading="submitting" />
              </div>
              <div class="col-12 col-sm-auto">
                <q-btn color="negative" label="Supprimer" unelevated class="full-width pf-legacy-btn"
                  :loading="deleting" :disable="!form.txtsaisienumdoss" @click="deleteReprise" />
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
import { normalizePfRepriseRow } from 'src/modules/energizer/utils/pfDossierSearchUtils.js'
import { setLegacyUppercaseText } from 'src/modules/energizer/utils/energizerFormInputUtils.js'

defineOptions({ name: 'GestionDesReprises' })

const $q = useQuasar()
const pfStore = useLiquidationPfStore()

const submitting = ref(false)
const deleting   = ref(false)
const showDialog = ref(false)
const saisieFormRef = ref(null)

const searchOptions = [
  { label: 'Num Dossier', value: 'fnumdoss' },
  { label: 'Num Assuré',  value: 'fnumassu' },
  { label: 'Noms Assuré', value: 'fnomassu' },
]

// ─── Options des selects ─────────────────────────────────────────
const typeOptions = [
  { label: 'Non Reprise', value: 'NON' },
  { label: 'Reprise',     value: 'OUI' },
]

const rangOptions = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
]

const rembEmplOptions = [
  { label: 'NON', value: 'NON' },
  { label: 'OUI', value: 'OUI' },
]

// ─── Formulaire ─────────────────────────────────────────────────
const FORM_INITIAL = {
  txtsaisienumdoss: '',
  txtsaisienumassu: '',
  txtsaisienatupres: '',
  txtsaisiedatedemande: '',
  txtsaisietextenomassu: '',
  txtsaisietexteprenomassu: '',
  cbxtype: 'NON',
  cbxrang: '1',
  txtSaisiedatedebutreprise: '',
  txtSaisiedatefinreprise: '',
  txtsaisiematassu: '',
  txtsaisienbrejours: 0,
  txtsaisiereliquat: 0,
  cbxrembempl: 'NON',
  txtsaisienumempl: '',
  txtSaisieDateDebutRembEmpl: '',
  txtSaisieDateFinRembEmpl: '',
}

const form = reactive({ ...FORM_INITIAL })

function upper(field, val) {
  setLegacyUppercaseText(form, field, val)
}

const {
  loading,
  errorMsg,
  cbxcritere,
  txtvaleurdeb,
  txtvaleurfin,
  dossiers,
  searchDossiers,
  resetSearch,
  loadCatalog,
} = usePfDossierCatalogTable({ pfStore, mode: 'reprises', $q, withEndFilter: true })

const tableColumns = [
  { name: 'index',       label: 'N°',               field: 'index',       align: 'center', style: 'width:50px' },
  { name: 'numdoss',     label: 'N° Dossier',        field: 'numdoss',     align: 'left', sortable: true },
  { name: 'numassu',     label: 'N° Assuré',         field: 'numassu',     align: 'left', sortable: true },
  { name: 'requerant',   label: 'Noms Requérant',    field: 'requerant',   align: 'left', sortable: true },
  { name: 'datedemande', label: 'Date Demande',       field: 'datedemande', align: 'left', sortable: true },
  { name: 'natupres',    label: 'Nature Prestation',  field: 'natupres',    align: 'left', sortable: true },
  { name: 'flagreprise', label: 'Type',               field: (row) => repriseType(row), align: 'left', sortable: true },
  { name: 'rang',        label: 'Rang',               field: 'rang',        align: 'center', sortable: true },
  { name: 'position',    label: 'Position Dossier',   field: 'position',    align: 'left', sortable: true },
  { name: 'dateposi',    label: 'Date Position',      field: 'dateposi',    align: 'left', sortable: true },
]
const { visibleTableColumns, tableGrid, tableRowsPerPageOptions, tableDefaultRowsPerPage } = usePfModuleTable(tableColumns, {
  mobileCols: ['index', 'numdoss', 'requerant', 'flagreprise'],
  tabletHidden: ['dateposi', 'natupres', 'rang'],
})

function legacyField(val, fallback = '') {
  if (val == null || val === 'null') return fallback
  return String(val)
}

function repriseType(row) {
  return row?.cbxtype ?? row?.flagreprise ?? 'NON'
}

function loadDossier(row) {
  const dossier = normalizePfRepriseRow(row)
  form.txtsaisienumdoss = legacyField(dossier.numdoss)
  form.txtsaisienumassu = legacyField(dossier.numassu)
  form.txtsaisienatupres = legacyField(dossier.libellenatupres || dossier.natupres)
  form.txtsaisiedatedemande = legacyField(dossier.datedemande)
  form.txtsaisietextenomassu = legacyField(dossier.nomassu)
  form.txtsaisietexteprenomassu = legacyField(dossier.prenomassu)

  form.txtSaisiedatedebutreprise = legacyField(dossier.datedebut)
  form.txtSaisiedatefinreprise = legacyField(dossier.datefin)
  form.cbxtype = legacyField(repriseType(dossier), 'NON')
  form.txtsaisienbrejours = Number(dossier.jourspayes ?? 0) || 0
  form.txtsaisiereliquat = Number(dossier.joursreliquat ?? 0) || 0
  form.cbxrang = legacyField(dossier.cbxrang ?? dossier.rang, '1')
  form.txtsaisiematassu = legacyField(dossier.numassu)

  form.cbxrembempl = legacyField(dossier.cbxrembempl ?? dossier.flagrembempl, 'NON')
  form.txtsaisienumempl = legacyField(dossier.numempl)
  form.txtSaisieDateDebutRembEmpl = legacyField(dossier.datedebrempl)
  form.txtSaisieDateFinRembEmpl = legacyField(dossier.datefinrempl)

  showDialog.value = true
  $q.notify({ type: 'positive', message: `Dossier ${form.txtsaisienumdoss} chargé`, position: 'top', timeout: 1500 })
}

function validateNombrejrIj(nbjrij) {
  if (Number(nbjrij) > 98) {
    $q.notify({
      type: 'warning',
      message: 'Le nombre de Jours de congés de maternité doit être inférieur ou égal à 98',
      position: 'top',
    })
  }
}

// ─── Validation (alignée gestionDesReprises.jsp validate()) ───────
function validateForm() {
  if (!form.txtsaisiematassu || form.txtsaisiematassu === 'null') {
    $q.notify({ type: 'negative', message: 'Veuillez Saisir le Numero Assure SVP!!!', position: 'top' })
    return false
  }
  if (!form.txtSaisiedatedebutreprise || form.txtSaisiedatedebutreprise === 'null') {
    $q.notify({ type: 'negative', message: 'Veuillez Saisir la date debut SVP!!!', position: 'top' })
    return false
  }
  if (Number(form.txtsaisienbrejours) > 98) {
    validateNombrejrIj(form.txtsaisienbrejours)
    return false
  }
  return true
}

// ─── Soumission (Valider → action = gestiondesreprises) ──────────
async function submitForm() {
  const ok = await saisieFormRef.value?.validate()
  if (!ok) return
  if (!validateForm()) return

  submitting.value = true
  try {
    const result = await pfStore.submitReprise(form)
    $q.notify({
      type: 'positive',
      message: result?.message || 'Reprise enregistrée avec succès !',
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

// ─── Suppression (Supprimer → action = delnonreprise) ───────────
async function deleteReprise() {
  $q.dialog({
    title: 'Confirmer la suppression',
    message: `Supprimer la reprise du dossier <b>${form.txtsaisienumdoss}</b> ?`,
    html: true,
    cancel: { label: 'Annuler', flat: true, color: 'grey-7' },
    ok: { label: 'Supprimer', color: 'negative', unelevated: true },
  }).onOk(async () => {
    deleting.value = true
    try {
      const result = await pfStore.removeReprise(form)
      $q.notify({
        type: 'positive',
        message: result?.message || 'Reprise supprimée avec succès !',
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

// ─── Helpers UI ──────────────────────────────────────────────────
function getStatusColor(status) {
  if (!status) return 'grey-5'
  const s = status.toLowerCase()
  if (s.includes('cours'))   return 'orange-7'
  if (s.includes('attente')) return 'blue-6'
  if (s.includes('transmi')) return 'teal-6'
  if (s.includes('annul'))   return 'negative'
  return 'grey-6'
}
</script>

<style scoped>
.gestion-reprises {
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
.dossiers-hero::before,
.dossiers-hero::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
}
.dossiers-hero::before { width: 180px; height: 180px; top: -60px; right: 60px; }
.dossiers-hero::after { width: 90px; height: 90px; bottom: -30px; right: 20px; }
.dossiers-hero__left { display: flex; align-items: center; gap: 14px; z-index: 1; }
.dossiers-hero__icon-wrap {
  width: 46px; height: 46px; border-radius: 12px;
  background: rgba(255, 255, 255, 0.18);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; backdrop-filter: blur(4px);
}
.dossiers-hero__title { font-size: 1.05rem; font-weight: 700; color: #fff; line-height: 1.2; }
.dossiers-hero__sub { font-size: 0.78rem; color: rgba(255, 255, 255, 0.75); margin-top: 2px; }
.dossiers-hero__badge {
  z-index: 1;
  background: rgba(255, 255, 255, 0.22) !important;
  color: #fff !important;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 5px 14px;
  border-radius: 20px;
  border: 1.5px solid rgba(255, 255, 255, 0.35);
}

.search-bar-wrap {
  padding: 16px 20px 10px;
  background: #fafbff;
  border-bottom: 1px solid rgba(25, 118, 210, 0.08);
}
.search-bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.search-bar__critere { flex: 0 0 200px; min-width: 160px; }
.search-bar__value { flex: 1 1 220px; min-width: 180px; }
.search-bar__btn {
  height: 40px; min-width: 130px; border-radius: 8px;
  font-weight: 600; font-size: 0.9rem; flex-shrink: 0;
}
.search-bar__reset { flex-shrink: 0; }
.search-bar :deep(.q-field__control) {
  border-radius: 8px; height: 40px; min-height: 40px; background: #fff;
}
.search-hint {
  display: flex; align-items: center; margin-top: 8px;
  font-size: 0.78rem; color: #1976d2; opacity: 0.75;
}

.table-divider {
  display: flex; align-items: center; gap: 10px;
  padding: 6px 20px; background: #fafbff;
}
.table-divider__line { flex: 1; height: 1px; background: rgba(25, 118, 210, 0.12); }
.table-divider__text {
  display: flex; align-items: center; font-size: 0.78rem; color: #555; white-space: nowrap;
}

.pf-module-table :deep(tbody tr:nth-child(even)) { background: rgba(25, 118, 210, 0.03); }
.pf-module-table :deep(tbody tr:hover) { background: rgba(25, 118, 210, 0.07) !important; }
.row-index {
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 50%;
  background: rgba(25, 118, 210, 0.1); color: #1976d2;
  font-size: 0.75rem; font-weight: 700;
}
.dossier-link {
  display: inline-flex; align-items: center;
  color: #1565c0; font-weight: 700; font-size: 0.9rem; text-decoration: none;
}
.dossier-link:hover { color: #0d47a1; }
.pf-grid-card {
  background: #fff;
  border: 1px solid rgba(25, 118, 210, 0.12);
  border-radius: 10px;
  padding: 12px 14px;
  margin: 6px;
  cursor: pointer;
}
.pf-grid-card__header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;
}
.pf-grid-card__name { font-size: 0.9rem; font-weight: 600; color: #222; }

@media (max-width: 767px) {
  .search-bar__critere,
  .search-bar__value,
  .search-bar__btn { flex: 1 1 100%; }
}

@import 'src/css/pf-dialog-form.scss';

.pf-legacy-form { background: #f0f0f0; padding: 12px 14px; border-radius: 6px; }
.pf-legacy-input { width: 100%; }
.pf-form-row { margin-bottom: 0; padding: 8px 6px; align-items: stretch; }
.pf-form-row--alt { background: #f5f5f5; }
.pf-legacy-cell {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  min-height: 42px;
}
.pf-legacy-label {
  flex: 0 0 auto;
  font-size: 0.875rem;
  font-weight: 600;
  color: #333;
  line-height: 1.3;
  max-width: 44%;
}
.pf-legacy-input { flex: 1 1 140px; min-width: 0; }
.pf-legacy-input--narrow { flex: 0 1 88px; max-width: 104px; }
.pf-legacy-input--date { flex: 0 1 auto; max-width: 300px; }
.pf-legacy-input--select { flex: 1 1 160px; min-width: 120px; }
@media (min-width: 768px) {
  .pf-jours-payes-col { padding-left: 0; }
}
.pf-form-row--compact { padding: 6px 4px; }
.pf-legacy-cell--compact {
  flex-direction: column;
  align-items: stretch;
  gap: 2px 0;
  min-height: 52px;
}
.pf-legacy-label--compact {
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.15;
  max-width: 100%;
}
.pf-legacy-input--compact { flex: 1 1 auto; width: 100%; max-width: 100%; }
.pf-form-row--compact :deep(.q-field__control) {
  min-height: 28px;
  height: 28px;
}
.pf-form-row--compact :deep(.q-field__native),
.pf-form-row--compact :deep(.q-field__input) {
  font-size: 0.8rem;
  padding: 0 6px;
}
.pf-form-row--compact :deep(.q-field__append) {
  padding-right: 2px;
}
.pf-legacy-btn { min-width: 120px; min-height: 36px; font-size: 0.9rem; border-radius: 4px; }
.pf-legacy-form :deep(.q-field__control) { min-height: 34px; height: 34px; background: #fff; }
.pf-legacy-form :deep(.q-field--outlined .q-field__control:before) { border-color: #bdbdbd; }
.pf-legacy-form :deep(.q-field__native),
.pf-legacy-form :deep(.q-field__input) { font-size: 0.9rem; padding: 0 8px; }
@media (max-width: 1023px) {
  .pf-legacy-label { max-width: 100%; flex: 1 1 100%; }
  .pf-legacy-input,
  .pf-legacy-input--date,
  .pf-legacy-input--narrow,
  .pf-legacy-input--select { flex: 1 1 100%; max-width: 100%; }
}
.dialog-form-card { display: flex; flex-direction: column; min-height: 0; }
.dialog-form-card:not(.dialog-form-card--desktop) { height: 100vh; }
.dialog-form-card--desktop {
  width: min(94vw, 1280px);
  max-width: 1280px;
  min-width: min(94vw, 1000px);
  max-height: 94vh;
  height: auto;
  border-radius: 12px;
}
@media (min-width: 1280px) {
  .dialog-form-card--desktop {
    width: 1280px;
    min-width: 1100px;
  }
}
.dialog-bar { min-height: 52px; }
.dialog-bar__title { flex: 1; min-width: 0; font-size: 1rem; }
.dialog-actions { justify-content: center; }
.dialog-body { flex: 1; overflow-y: auto; }

</style>

<style>
/* Reprises — dialog Quasar portal (styles globaux) */
.gestion-reprises-dialog.dialog-form-card--desktop {
  width: min(96vw, 1400px) !important;
  max-width: 1400px !important;
  min-width: min(96vw, 1120px) !important;
}
@media (min-width: 1400px) {
  .gestion-reprises-dialog.dialog-form-card--desktop {
    width: 1400px !important;
    min-width: 1200px !important;
  }
}

.gestion-reprises-dialog .pf-legacy-cell {
  flex-wrap: nowrap;
  align-items: center;
}
.gestion-reprises-dialog .pf-legacy-cell:not(.pf-legacy-cell--stacked) .pf-legacy-label {
  flex: 0 1 auto;
  max-width: 42%;
  min-width: 0;
  word-break: break-word;
}
.gestion-reprises-dialog .pf-legacy-cell:not(.pf-legacy-cell--stacked) .pf-legacy-input {
  flex: 1 1 auto;
  min-width: 120px;
}
.gestion-reprises-dialog .pf-legacy-input--date-demande,
.gestion-reprises-dialog .pf-legacy-input--date-demande .q-field {
  flex: 0 0 auto !important;
  width: 100% !important;
  min-width: 7.25rem !important;
  max-width: 9.5rem !important;
}

.gestion-reprises-dialog .pf-legacy-cell--stacked {
  flex-direction: column;
  align-items: stretch;
  gap: 4px;
  min-height: auto;
}
.gestion-reprises-dialog .pf-legacy-cell--stacked .pf-legacy-label {
  max-width: 100%;
}

.gestion-reprises-dialog .pf-reprise-date-main,
.gestion-reprises-dialog .pf-reprise-date-main .q-field {
  width: 100% !important;
  min-width: 0 !important;
  max-width: 300px !important;
  flex: 0 1 auto !important;
}
.gestion-reprises-dialog .pf-reprise-date-main .q-field__control {
  min-height: 38px;
  height: 38px;
}
.gestion-reprises-dialog .pf-reprise-date-main .q-field__native,
.gestion-reprises-dialog .pf-reprise-date-main .q-field__input {
  font-size: 0.92rem;
}

.gestion-reprises-dialog .pf-legacy-input--date,
.gestion-reprises-dialog .pf-legacy-input--date .q-field {
  width: 100% !important;
  min-width: 0 !important;
  max-width: 300px !important;
}
.gestion-reprises-dialog .pf-remb-row .pf-legacy-input--date .q-field__control {
  min-height: 36px;
  height: 36px;
}

@media (min-width: 768px) {
  .gestion-reprises-dialog .pf-certificat-row .pf-rang-col {
    padding-left: 16px !important;
  }
}
@media (max-width: 767px) {
  .gestion-reprises-dialog.dialog-form-card--desktop {
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
  }
}
</style>
