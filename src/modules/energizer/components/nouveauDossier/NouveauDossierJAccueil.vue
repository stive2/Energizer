<template>
  <div class="nouveau-dossier-jaccueil">
    <p class="text-subtitle1 nouveau-dossier-jaccueil__title text-center q-mb-sm">
      {{ t('reception.nouveauDossier.jaccueilTitle') }}
    </p>
    <p class="text-body2 text-grey-8 text-center q-mb-md">
      {{ t('reception.nouveauDossier.jaccueilLead') }}
    </p>

    <div class="nouveau-dossier-jaccueil-table-wrap">
      <q-table
        flat
        bordered
        :rows="store.jaccueilRows"
        :columns="columns"
        row-key="num_dossier"
        :loading="false"
        class="nouveau-dossier-pieces-table q-mb-md"
        wrap-cells
        :pagination="{ rowsPerPage: 10 }"
        :rows-per-page-options="[5, 10, 25]"
      >
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
        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn
              dense
              color="primary"
              unelevated
              no-caps
              :label="t('reception.nouveauDossier.openPieces')"
              @click="store.openReceptionPieces(props.row)"
            />
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
        :label="t('reception.nouveauDossier.backRecap')"
        @click="goBack"
      />
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useNouveauDossierStore } from 'src/modules/energizer/stores/nouveauDossierStore.js'
import { withPrimaryTableColumns } from 'src/modules/energizer/utils/nouveauDossierPiecesTableStyle.js'

const { t } = useI18n()
const store = useNouveauDossierStore()

const columns = withPrimaryTableColumns([
  {
    name: 'num_dossier',
    label: 'N° Dossier',
    field: 'num_dossier',
    align: 'left',
    style: 'min-width: 160px',
    headerStyle: 'min-width: 160px',
  },
  {
    name: 'nom_requerant',
    label: 'Requérant',
    field: 'nom_requerant',
    align: 'left',
    style: 'min-width: 200px',
    headerStyle: 'min-width: 200px',
  },
  {
    name: 'etape',
    label: 'Étape',
    field: 'etape',
    align: 'left',
    style: 'min-width: 140px',
    headerStyle: 'min-width: 140px',
  },
  {
    name: 'date_position',
    label: 'Date',
    field: 'date_position',
    align: 'center',
    style: 'min-width: 120px',
    headerStyle: 'min-width: 120px',
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center',
    style: 'min-width: 130px',
    headerStyle: 'min-width: 130px',
  },
], { skipCellStyle: ['actions'] })

function goBack() {
  if (store.recapPieces.length) {
    store.step = 'piecesRecap'
  } else if (store.piecesMode === 'reception') {
    store.step = 'piecesReception'
  } else {
    store.step = 'pieces'
  }
}
</script>

<style scoped>
.nouveau-dossier-jaccueil-table-wrap {
  overflow-x: auto;
  width: 100%;
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
</style>
