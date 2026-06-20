<template>
  <div class="nouveau-dossier-pieces-recep relative-position">
    <q-inner-loading :showing="store.isPiecesBusy" color="primary" />
    <p class="text-subtitle1 nouveau-dossier-pieces-list-title">
      {{ t('reception.nouveauDossier.existingPiecesTitle', { num: ctx.numdossier }) }}
    </p>

    <q-table
      flat
      bordered
      :rows="store.existingPieces"
      :columns="columns"
      row-key="id"
      hide-pagination
      :pagination="{ rowsPerPage: 0 }"
      class="nouveau-dossier-pieces-table q-mb-lg"
      wrap-cells
      :no-data-label="t('reception.nouveauDossier.noExistingPieces')"
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
      <template #body-cell-person="props">
        <q-td :props="props" class="text-weight-medium">
          {{ props.row.person }}
        </q-td>
      </template>
      <template #body-cell-verifiee="props">
        <q-td :props="props" class="text-weight-bold">
          {{ props.row.verifiee }}
        </q-td>
      </template>
      <template #body-cell-action="props">
        <q-td :props="props">
          <q-btn
            dense
            flat
            color="negative"
            no-caps
            :label="t('reception.nouveauDossier.enlever')"
            @click="store.removeExistingPiece(props.row.id)"
          />
        </q-td>
      </template>
    </q-table>

    <NouveauDossierPiecesForm mode="reception" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNouveauDossierStore } from 'src/modules/energizer/stores/nouveauDossierStore.js'
import NouveauDossierPiecesForm from './NouveauDossierPiecesForm.vue'
import { withPrimaryTableColumns } from 'src/modules/energizer/utils/nouveauDossierPiecesTableStyle.js'
const { t } = useI18n()
const store = useNouveauDossierStore()
const ctx = computed(() => store.piecesContext ?? {})

const columns = withPrimaryTableColumns([
  {
    name: 'person',
    label: 'Nature de la Pièce',
    field: 'person',
    align: 'left',
    style: 'min-width: 160px',
    headerStyle: 'min-width: 160px',
  },
  {
    name: 'titulaire',
    label: 'Titulaire',
    field: 'titulaire',
    align: 'left',
    style: 'min-width: 120px',
    headerStyle: 'min-width: 120px',
  },
  {
    name: 'dateDep',
    label: 'Date Dépôt',
    field: 'dateDep',
    align: 'center',
    style: 'min-width: 100px',
    headerStyle: 'min-width: 100px',
  },
  {
    name: 'dateVal',
    label: 'Date Signature',
    field: 'dateVal',
    align: 'center',
    style: 'min-width: 110px',
    headerStyle: 'min-width: 110px',
  },
  {
    name: 'observ',
    label: 'Observation',
    field: 'observ',
    align: 'left',
    style: 'min-width: 160px',
    headerStyle: 'min-width: 160px',
  },
  {
    name: 'nbre',
    label: 'Nbre de Pièce',
    field: 'nbre',
    align: 'center',
    style: 'min-width: 90px',
    headerStyle: 'min-width: 90px',
  },
  {
    name: 'verifiee',
    label: 'Vérifiée?',
    field: 'verifiee',
    align: 'center',
    style: 'min-width: 90px',
    headerStyle: 'min-width: 90px',
  },
  {
    name: 'action',
    label: '',
    field: 'action',
    align: 'center',
    style: 'min-width: 100px',
    headerStyle: 'min-width: 100px',
  },
], { skipCellStyle: ['action'] })
</script>

<style scoped>
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
