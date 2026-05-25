<template>
  <div class="q-pa-sm gestion-reprises">

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
            <q-icon name="restart_alt" size="sm" color="primary" />
            <span class="text-body2 text-weight-bold text-primary">Reprises / Non Reprises en IJ</span>
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
          <span>Cliquez sur un N° dossier pour ouvrir le certificat de reprise</span>
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
          <template v-slot:body-cell-index="props">
            <q-td :props="props" class="text-center text-grey-6">{{ props.rowIndex + 1 }}</q-td>
          </template>
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
                <q-badge :color="repriseType(props.row) === 'OUI' ? 'positive' : 'orange-7'"
                  :label="repriseType(props.row) === 'OUI' ? 'Reprise' : 'Non Reprise'" dense />
              </div>
              <div class="text-caption text-grey-8">{{ props.row.requerant }}</div>
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
      </q-card-section>
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
      <q-card class="dialog-form-card" :class="{ 'dialog-form-card--desktop': $q.screen.gt.sm }">
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

            <!-- Ligne 1 : N° Dossier | Nature Prestation | Date Demande -->
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

            <!-- Ligne 2 : N° Assuré | Noms Assuré | Prénoms Assuré -->
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

            <!-- Ligne 3 : Type | Rang | Date Début | Date Fin -->
            <div class="row pf-form-row q-col-gutter-sm">
              <div class="col-12 col-sm-6 col-md-3">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Type</span>
                  <q-select v-model="form.cbxtype" name="cbxtype" :options="typeOptions" dense outlined
                    emit-value map-options hide-bottom-space class="pf-legacy-input pf-legacy-input--select" />
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3 pf-rang-col">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Rang</span>
                  <q-select v-model="form.cbxrang" name="cbxrang" :options="rangOptions" dense outlined
                    emit-value map-options hide-bottom-space class="pf-legacy-input pf-legacy-input--narrow" />
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="pf-legacy-cell">
                  <span class="pf-legacy-label">Date Début</span>
                  <q-input v-model="form.txtSaisiedatedebutreprise" name="txtSaisiedatedebutreprise" dense outlined hide-bottom-space
                    bg-color="yellow-1" class="pf-legacy-input pf-legacy-input--date"
                    :rules="[v => !!v || 'Veuillez Saisir la date debut SVP']">
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
                  <span class="pf-legacy-label">Date Fin</span>
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

            <!-- Ligne 4 : Matricule Assuré | Jours Payés | Reliquat -->
            <div class="row pf-form-row pf-form-row--alt q-col-gutter-sm">
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

            <!-- Ligne 5 : Remboursement Employeur ? | N° Employeur | Date Début / Fin Remboursement -->
            <div class="row pf-form-row pf-form-row--alt pf-form-row--compact q-col-gutter-sm">
              <div class="col-12 col-sm-6 col-md-3">
                <div class="pf-legacy-cell pf-legacy-cell--compact">
                  <span class="pf-legacy-label pf-legacy-label--compact">Remboursement Employeur ?</span>
                  <q-select v-model="form.cbxrembempl" name="cbxrembempl" :options="rembEmplOptions" dense outlined
                    emit-value map-options hide-bottom-space class="pf-legacy-input pf-legacy-input--compact" />
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="pf-legacy-cell pf-legacy-cell--compact">
                  <span class="pf-legacy-label pf-legacy-label--compact">N° Employeur</span>
                  <q-input v-model="form.txtsaisienumempl" name="txtsaisienumempl" dense outlined hide-bottom-space
                    bg-color="yellow-1" class="pf-legacy-input pf-legacy-input--compact" :disable="form.cbxrembempl === 'NON'" />
                </div>
              </div>
              <div class="col-12 col-sm-6 col-md-3">
                <div class="pf-legacy-cell pf-legacy-cell--compact">
                  <span class="pf-legacy-label pf-legacy-label--compact">Date Début Remboursement</span>
                  <q-input v-model="form.txtSaisieDateDebutRembEmpl" name="txtSaisieDateDebutRembEmpl" dense outlined hide-bottom-space
                    bg-color="yellow-1" class="pf-legacy-input pf-legacy-input--compact" :disable="form.cbxrembempl === 'NON'">
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" size="xs">
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
                <div class="pf-legacy-cell pf-legacy-cell--compact">
                  <span class="pf-legacy-label pf-legacy-label--compact">Date Fin Remboursement</span>
                  <q-input v-model="form.txtSaisieDateFinRembEmpl" name="txtSaisieDateFinRembEmpl" dense outlined hide-bottom-space
                    bg-color="yellow-1" class="pf-legacy-input pf-legacy-input--compact" :disable="form.cbxrembempl === 'NON'">
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer" size="xs">
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

            <div class="row q-col-gutter-sm q-mt-md dialog-actions">
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
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useLiquidationPfStore } from 'src/stores/energizer/liquidationPfStore.js'
import { usePfModuleTable } from 'src/composables/usePfModuleTable.js'

defineOptions({ name: 'GestionDesReprises' })

const $q = useQuasar()
const pfStore = useLiquidationPfStore()

// ─── Interface ──────────────────────────────────────────────────
const loading    = ref(false)
const submitting = ref(false)
const deleting   = ref(false)
const errorMsg   = ref('')
const showDialog = ref(false)
const saisieFormRef = ref(null)

// ─── Recherche (noms JSP : cbxcritere, txtvaleurdeb) ─────────────
const cbxcritere   = ref('fnumdoss')
const txtvaleurdeb = ref('000-')

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

// ─── Table ──────────────────────────────────────────────────────
const dossiers = ref([])

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

// ─── Données de test (à retirer en production) ──────────────────
const MOCK_REPRISES = [
  {
    numdoss: 'F2026-001', numassu: '5-20-97-123456-78',
    requerant: 'KAMGA Marie-Claire', datedemande: '15/03/2026',
    natupres: 'Prestations Familiales', position: 'En Cours de Traitement', dateposi: '15/03/2026',
    nomassu: 'KAMGA', prenomassu: 'Marie-Claire',
    datedebut: '20/03/2026', datefin: '28/05/2026',
    flagreprise: 'NON', jourspayes: 98, joursreliquat: 0,
    rang: '1', flagrembempl: 'NON', numempl: '1-20-97-001234',
    datedebrempl: '', datefinrempl: '',
  },
  {
    numdoss: 'F2026-002', numassu: '5-20-97-654321-12',
    requerant: 'NKOA Sylvie', datedemande: '02/04/2026',
    natupres: 'Indemnités Journalières', position: 'En attente de pièces', dateposi: '05/04/2026',
    nomassu: 'NKOA', prenomassu: 'Sylvie',
    datedebut: '01/04/2026', datefin: '30/06/2026',
    flagreprise: 'OUI', jourspayes: 45, joursreliquat: 53,
    rang: '2', flagrembempl: 'OUI', numempl: '1-20-97-005678',
    datedebrempl: '01/04/2026', datefinrempl: '30/06/2026',
  },
  {
    numdoss: 'F2026-003', numassu: '5-20-97-987654-55',
    requerant: 'MBELLA Claire', datedemande: '20/04/2026',
    natupres: 'Alloc. Accouchement Prématuré', position: 'Transmis au superviseur', dateposi: '22/04/2026',
    nomassu: 'MBELLA', prenomassu: 'Claire',
    datedebut: '', datefin: '',
    flagreprise: 'NON', jourspayes: 0, joursreliquat: 0,
    rang: '1', flagrembempl: 'NON', numempl: '',
    datedebrempl: '', datefinrempl: '',
  },
  {
    numdoss: 'F2026-004', numassu: '5-20-97-111222-33',
    requerant: 'ATANGANA Patience', datedemande: '01/05/2026',
    natupres: 'Prestations Familiales', position: 'Annuler Liquidation', dateposi: '03/05/2026',
    nomassu: 'ATANGANA', prenomassu: 'Patience',
    datedebut: '06/04/2026', datefin: '12/07/2026',
    flagreprise: 'OUI', jourspayes: 60, joursreliquat: 38,
    rang: '3', flagrembempl: 'OUI', numempl: '1-20-97-003344',
    datedebrempl: '06/04/2026', datefinrempl: '12/07/2026',
  },
]

onMounted(async () => {
  try {
    const list = await pfStore.loadReprises()
    dossiers.value = list?.length ? list : MOCK_REPRISES
  } catch {
    dossiers.value = MOCK_REPRISES
  }
})

function legacyField(val, fallback = '') {
  if (val == null || val === 'null') return fallback
  return String(val)
}

function repriseType(row) {
  return row?.cbxtype ?? row?.flagreprise ?? 'NON'
}

// ─── Chargement dossier depuis la table (équivalent loading()) ──
function loadDossier(row) {
  form.txtsaisienumdoss = legacyField(row.txtsaisienumdoss ?? row.numdoss)
  form.txtsaisienumassu = legacyField(row.txtsaisienumassu ?? row.numassu)
  form.txtsaisienatupres = legacyField(row.txtsaisienatupres ?? row.natupres)
  form.txtsaisiedatedemande = legacyField(row.txtsaisiedatedemande ?? row.datedemande)
  form.txtsaisietextenomassu = legacyField(row.txtsaisietextenomassu ?? row.nomassu)
  form.txtsaisietexteprenomassu = legacyField(row.txtsaisietexteprenomassu ?? row.prenomassu)

  form.txtSaisiedatedebutreprise = legacyField(row.txtSaisiedatedebutreprise ?? row.datedebut)
  form.txtSaisiedatefinreprise = legacyField(row.txtSaisiedatefinreprise ?? row.datefin)
  form.cbxtype = legacyField(repriseType(row), 'NON')
  form.txtsaisienbrejours = Number(row.txtsaisienbrejours ?? row.jourspayes ?? 0) || 0
  form.txtsaisiereliquat = Number(row.txtsaisiereliquat ?? row.joursreliquat ?? 0) || 0
  form.cbxrang = legacyField(row.cbxrang ?? row.rang, '1')
  form.txtsaisiematassu = legacyField(row.txtsaisiematassu ?? row.numassu)

  form.cbxrembempl = legacyField(row.cbxrembempl ?? row.flagrembempl, 'NON')
  form.txtsaisienumempl = legacyField(row.txtsaisienumempl ?? row.numempl)
  form.txtSaisieDateDebutRembEmpl = legacyField(row.txtSaisieDateDebutRembEmpl ?? row.datedebrempl)
  form.txtSaisieDateFinRembEmpl = legacyField(row.txtSaisieDateFinRembEmpl ?? row.datefinrempl)

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
    await pfStore.submitReprise(form)
    $q.notify({ type: 'positive', message: 'Reprise enregistrée avec succès !', position: 'top', icon: 'check_circle' })
    showDialog.value = false
    resetForm()
  } catch {
    $q.notify({ type: 'negative', message: "Erreur lors de l'enregistrement", position: 'top' })
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
      await pfStore.removeReprise(form)
      $q.notify({ type: 'positive', message: 'Reprise supprimée avec succès !', position: 'top' })
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
async function searchDossiers() {
  loading.value = true
  errorMsg.value = ''
  try {
    dossiers.value = await pfStore.loadReprises({
      criteria: cbxcritere.value,
      start: txtvaleurdeb.value,
    })
    $q.notify({ type: 'info', message: 'Recherche effectuée', position: 'top' })
  } catch {
    dossiers.value = MOCK_REPRISES
  } finally {
    loading.value = false
  }
}

function resetSearch() {
  cbxcritere.value   = 'fnumdoss'
  txtvaleurdeb.value = '000-'
  dossiers.value = MOCK_REPRISES
  errorMsg.value = ''
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

.card-elevated {
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.card-header-rounded {
  border-radius: 15px 15px 0 0;
}

.pf-legacy-form { background: #f0f0f0; padding: 12px 14px; border-radius: 6px; }
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
.pf-legacy-input--date { flex: 1 1 200px; }
.pf-legacy-input--select { flex: 1 1 160px; min-width: 120px; }
@media (min-width: 1024px) {
  .pf-jours-payes-col,
  .pf-rang-col { padding-left: 88px; }
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
