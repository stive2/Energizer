<template>
  <div class="nouveau-dossier-pieces-recap">
    <p class="text-subtitle1 nouveau-dossier-pieces-recap-title">
      {{ t('reception.nouveauDossier.recapTitle', { num: ctx.numdossier }) }}
    </p>

    <q-table
      flat
      bordered
      :rows="store.recapPieces"
      :columns="columns"
      row-key="index"
      hide-pagination
      :pagination="{ rowsPerPage: 0 }"
      class="nouveau-dossier-pieces-table q-mb-xl"
      wrap-cells
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
          {{ props.row.displayPerson || props.row.person }}
        </q-td>
      </template>
    </q-table>

    <div class="row justify-center q-gutter-md">
      <q-btn
        outline
        color="grey-8"
        no-caps
        :label="t('reception.nouveauDossier.pause')"
        @click="store.pauseDossier()"
      />
      <q-btn
        color="primary"
        unelevated
        no-caps
        icon="flag"
        :label="t('reception.nouveauDossier.terminer')"
        :loading="store.loadingFinalize"
        @click="store.terminerDossier()"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNouveauDossierStore } from 'src/modules/energizer/stores/nouveauDossierStore.js'
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
    style: 'min-width: 180px',
    headerStyle: 'min-width: 180px',
  },
  {
    name: 'titulaire',
    label: 'Titulaire',
    field: 'titulaire',
    align: 'left',
    style: 'min-width: 140px',
    headerStyle: 'min-width: 140px',
  },
  {
    name: 'dateDep',
    label: 'Date Dépôt',
    field: 'dateDep',
    align: 'center',
    style: 'min-width: 110px',
    headerStyle: 'min-width: 110px',
  },
  {
    name: 'dateVal',
    label: 'Date Signature',
    field: 'dateVal',
    align: 'center',
    style: 'min-width: 120px',
    headerStyle: 'min-width: 120px',
  },
  {
    name: 'observ',
    label: 'Observation',
    field: 'observ',
    align: 'left',
    style: 'min-width: 200px',
    headerStyle: 'min-width: 200px',
  },
  {
    name: 'nbre',
    label: 'Nbre de Pièce',
    field: 'nbre',
    align: 'center',
    style: 'min-width: 100px',
    headerStyle: 'min-width: 100px',
  },
])
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
