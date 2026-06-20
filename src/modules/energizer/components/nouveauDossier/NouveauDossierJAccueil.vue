<template>
  <div class="nouveau-dossier-jaccueil">
    <p class="text-subtitle1 nouveau-dossier-jaccueil__title text-center q-mb-md">
      {{ t('reception.nouveauDossier.jaccueilTitle') }}
    </p>

    <div class="nouveau-dossier-jaccueil__toolbar q-mb-md">
      <div class="nouveau-dossier-jaccueil__filters row q-col-gutter-sm items-end">
        <div class="col-12 col-sm-6 col-md-4 col-lg-auto">
          <q-input
            v-model="store.jaccueilFilters.num_dossier"
            dense
            outlined
            class="input-uppercase"
            :label="t('reception.nouveauDossier.jaccueilFilterNumDossier')"
            @update:model-value="(val) => upperFilter('num_dossier', val)"
            @keyup.enter="search"
          />
        </div>
        <div class="col-12 col-sm-6 col-md-4 col-lg-auto">
          <q-input
            v-model="store.jaccueilFilters.num_assu"
            dense
            outlined
            class="input-uppercase"
            :label="t('reception.nouveauDossier.jaccueilFilterNumAssu')"
            @update:model-value="(val) => upperFilter('num_assu', val)"
            @keyup.enter="search"
          />
        </div>
        <div class="col-12 col-sm-6 col-md-4 col-lg">
          <q-input
            v-model="store.jaccueilFilters.nom_requerant"
            dense
            outlined
            class="input-uppercase"
            :label="t('reception.nouveauDossier.jaccueilFilterNomRequerant')"
            @update:model-value="(val) => upperFilter('nom_requerant', val)"
            @keyup.enter="search"
          />
        </div>
        <div class="col-12 col-sm-6 col-md-4 col-lg-auto">
          <q-input
            v-model="store.jaccueilFilters.localisation"
            dense
            outlined
            class="input-uppercase"
            :label="t('reception.nouveauDossier.jaccueilFilterEtape')"
            @update:model-value="(val) => upperFilter('localisation', val)"
            @keyup.enter="search"
          />
        </div>
        <div class="col-12 col-sm-6 col-md-4 col-lg-auto">
          <q-input
            v-model="store.jaccueilFilters.initiateur"
            dense
            outlined
            class="input-uppercase"
            :label="t('reception.nouveauDossier.jaccueilFilterInitiateur')"
            @update:model-value="(val) => upperFilter('initiateur', val)"
            @keyup.enter="search"
          />
        </div>
        <div class="col-12 col-sm-auto">
          <q-btn
            color="primary"
            unelevated
            no-caps
            icon="search"
            :label="t('reception.nouveauDossier.jaccueilSearch')"
            :loading="store.isJaccueilLoading"
            @click="search"
          />
        </div>
      </div>
    </div>

    <div class="nouveau-dossier-jaccueil-table-wrap">
      <q-table
        flat
        bordered
        :rows="store.jaccueilRows"
        :columns="columns"
        row-key="num_dossier"
        :loading="store.isJaccueilLoading || store.isOpeningPieces"
        :loading-label="t('reception.nouveauDossier.jaccueilLoading')"
        class="nouveau-dossier-pieces-table q-mb-md nouveau-dossier-jaccueil-table"
        wrap-cells
        :pagination="{ rowsPerPage: 10 }"
        :rows-per-page-options="[10, 25, 50]"
        :no-data-label="t('reception.nouveauDossier.jaccueilNoData')"
        @row-click="onRowClick"
      >
        <template #loading>
          <q-inner-loading showing color="primary" :label="t('reception.nouveauDossier.jaccueilLoading')">
            <q-spinner-dots size="40px" color="primary" />
          </q-inner-loading>
        </template>

        <template #header="hdr">
          <q-tr :props="hdr" class="nouveau-dossier-table__head-row">
            <q-th
              v-for="col in hdr.cols"
              :key="col.name"
              :props="hdr"
              class="nouveau-dossier-table__head-cell"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>
        <template #body-cell-num_dossier="props">
          <q-td :props="props" class="nouveau-dossier-jaccueil__link-cell">
            <button
              type="button"
              class="nouveau-dossier-jaccueil__dossier-link"
              @click.stop="openDossier(props.row)"
            >
              {{ props.row.num_dossier }}
            </button>
          </q-td>
        </template>
        <template #body-cell-code_situ="props">
          <q-td :props="props">
            {{ props.row.code_situ || '—' }}
          </q-td>
        </template>
      </q-table>
    </div>

    <div class="row justify-start">
      <q-btn
        flat
        no-caps
        color="primary"
        icon="arrow_back"
        :label="backLabel"
        @click="goBack"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNouveauDossierStore } from 'src/modules/energizer/stores/nouveauDossierStore.js'
import { setLegacyUppercaseText } from 'src/modules/energizer/utils/energizerFormInputUtils.js'
import { withPrimaryTableColumns } from 'src/modules/energizer/utils/nouveauDossierPiecesTableStyle.js'

const { t } = useI18n()
const store = useNouveauDossierStore()

const columns = withPrimaryTableColumns([
  {
    name: 'num_dossier',
    label: 'Num',
    field: 'num_dossier',
    align: 'left',
    style: 'min-width: 120px',
    headerStyle: 'min-width: 120px',
  },
  {
    name: 'num_assu',
    label: 'Num assure',
    field: 'num_assu',
    align: 'left',
    style: 'min-width: 110px',
    headerStyle: 'min-width: 110px',
  },
  {
    name: 'nom_requerant',
    label: 'Nom requerant',
    field: 'nom_requerant',
    align: 'left',
    style: 'min-width: 160px',
    headerStyle: 'min-width: 160px',
  },
  {
    name: 'code_situ',
    label: 'Etat',
    field: 'code_situ',
    align: 'left',
    style: 'min-width: 130px',
    headerStyle: 'min-width: 130px',
  },
  {
    name: 'date_situ',
    label: 'Situation du',
    field: 'date_situ',
    align: 'center',
    style: 'min-width: 110px',
    headerStyle: 'min-width: 110px',
  },
  {
    name: 'date_enreg',
    label: 'Cree le',
    field: 'date_enreg',
    align: 'center',
    style: 'min-width: 110px',
    headerStyle: 'min-width: 110px',
  },
  {
    name: 'initiateur',
    label: 'Initiateur',
    field: 'initiateur',
    align: 'left',
    style: 'min-width: 100px',
    headerStyle: 'min-width: 100px',
  },
  {
    name: 'etape',
    label: 'Etape',
    field: 'etape',
    align: 'left',
    style: 'min-width: 120px',
    headerStyle: 'min-width: 120px',
  },
  {
    name: 'observations',
    label: 'Observations',
    field: 'observations',
    align: 'left',
    style: 'min-width: 140px',
    headerStyle: 'min-width: 140px',
  },
])

const backLabel = computed(() => {
  if (store.recapPieces.length) {
    return t('reception.nouveauDossier.backRecap')
  }
  if (store.step === 'jaccueil' && store.piecesMode === 'reception') {
    return t('reception.nouveauDossier.backPiecesReception')
  }
  return t('reception.nouveauDossier.backPieces')
})

function upperFilter(field, val) {
  setLegacyUppercaseText(store.jaccueilFilters, field, val)
}

function search() {
  store.searchJaccueilDossiers()
}

function openDossier(row) {
  store.openDossierFromCorbeille(row)
}

function onRowClick(_evt, row) {
  openDossier(row)
}

function goBack() {
  if (store.recapPieces.length) {
    store.step = 'piecesRecap'
  } else if (store.piecesMode === 'reception') {
    store.step = 'piecesReception'
    store.ensurePieceTypeOptions()
  } else {
    store.step = 'pieces'
    store.ensurePieceTypeOptions()
  }
}
</script>

<style scoped>
.nouveau-dossier-jaccueil__title {
  color: var(--q-primary);
  font-weight: 600;
}

.nouveau-dossier-jaccueil__toolbar {
  background: #f5f8fc;
  border: 1px solid rgba(25, 118, 210, 0.2);
  border-radius: 6px;
  padding: 12px 14px;
}

.nouveau-dossier-jaccueil-table-wrap {
  overflow-x: auto;
  width: 100%;
  position: relative;
  min-height: 120px;
}

.nouveau-dossier-jaccueil-table :deep(tbody tr) {
  cursor: pointer;
}

.nouveau-dossier-jaccueil-table :deep(tbody tr:hover) {
  background: rgba(25, 118, 210, 0.06);
}

.nouveau-dossier-jaccueil__dossier-link {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  color: var(--q-primary);
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}

.nouveau-dossier-pieces-table :deep(.nouveau-dossier-table__head-row) {
  background: var(--q-primary);
}

.nouveau-dossier-pieces-table :deep(.nouveau-dossier-table__head-cell) {
  background: var(--q-primary) !important;
  color: #fff !important;
  font-weight: 600;
  font-size: 13px;
}

.input-uppercase :deep(.q-field__native),
.input-uppercase :deep(textarea) {
  text-transform: uppercase;
}
</style>
