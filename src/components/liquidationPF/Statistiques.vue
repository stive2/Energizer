<template>
  <div class="q-pa-md" style="min-height: 100vh;">
    <!-- Title Section -->
    <div class="text-center q-mb-lg">
      <div class="text-h6 text-primary q-mb-sm">
        {{ $t('LiquidationPF.statistiques.title') }}
      </div>
      <div class="text-subtitle1 text-primary">
        {{ $t('LiquidationPF.statistiques.subtitle', { startDate: periodeDebut || 'N/A', endDate: periodeFin || 'N/A' }) }}
      </div>
    </div>

    <!-- Search Section -->
    <q-card class="q-mb-md" style="border-radius: 15px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
      <q-card-section class="bg-primary text-white" style="border-radius: 15px 15px 0 0;">
        <div class="text-h6">
          <q-icon name="search" class="q-mr-sm" />
          {{ $t('LiquidationPF.statistiques.searchSection.title') }}
        </div>
      </q-card-section>
      <q-card-section>
        <q-form @submit="searchRecords" class="q-gutter-md">
          <!-- Première ligne - Champs de saisie -->
          <div class="row q-col-gutter-md items-center">
            <div class="col-12 col-md-3">
              <q-select
                v-model="searchCentre"
                :options="[{ label: $t('LiquidationPF.statistiques.form.centrePlaceholder'), value: '' }]"
                option-label="label"
                option-value="value"
                emit-value
                map-options
                :label="$t('LiquidationPF.statistiques.form.centre')"
                dense
                outlined
                class="text-primary"
                style="border-radius: 10px;"
                :rules="[val => !!val || $t('LiquidationPF.statistiques.form.centreRequired')]"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-select
                v-model="searchBranche"
                :options="[
                  { label: $t('LiquidationPF.statistiques.brancheOptions.prestationsFamiliales'), value: 'F' },
                  { label: $t('LiquidationPF.statistiques.brancheOptions.risqueProfessionnels'), value: 'R' },
                  { label: $t('LiquidationPF.statistiques.brancheOptions.pensions'), value: 'P' },
                  { label: $t('LiquidationPF.statistiques.brancheOptions.imas'), value: 'A' },
                  { label: $t('LiquidationPF.statistiques.brancheOptions.imem'), value: 'E' }
                ]"
                option-label="label"
                option-value="value"
                emit-value
                map-options
                :label="$t('LiquidationPF.statistiques.form.branche')"
                dense
                outlined
                class="text-primary"
                style="border-radius: 10px;"
                :rules="[val => !!val || $t('LiquidationPF.statistiques.form.brancheRequired')]"
              />
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model="periodeDebut"
                :label="$t('LiquidationPF.statistiques.form.periodeDebut')"
                dense
                outlined
                color="primary"
                bg-color="white"
                style="border-radius: 10px;"
                :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                :rules="[val => !!val && val.length === 10 || $t('LiquidationPF.statistiques.form.periodeDebutRequired')]"
              >
                <template #append>
                  <q-icon name="event" class="cursor-pointer" color="primary" size="sm">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-date
                        v-model="periodeDebut"
                        :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                        :locale="locale"
                        color="primary"
                        @update:model-value="updatePeriodeDebut"
                      />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-3">
              <q-input
                v-model="periodeFin"
                :label="$t('LiquidationPF.statistiques.form.periodeFin')"
                dense
                outlined
                color="primary"
                bg-color="white"
                style="border-radius: 10px;"
                :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                :rules="[val => !!val && val.length === 10 || $t('LiquidationPF.statistiques.form.periodeFinRequired')]"
              >
                <template #append>
                  <q-icon name="event" class="cursor-pointer" color="primary" size="sm">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-date
                        v-model="periodeFin"
                        :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                        :locale="locale"
                        color="primary"
                        @update:model-value="updatePeriodeFin"
                      />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>

          <!-- Deuxième ligne - Boutons d'action -->
          <div class="row justify-center q-mt-md">
            <div class="col-12 col-md-6">
              <div class="row q-gutter-md justify-center">
                <q-btn
                  color="primary"
                  :label="$t('LiquidationPF.statistiques.form.search')"
                  icon="search"
                  type="submit"
                  size="md"
                  style="border-radius: 15px; padding: 8px 20px;"
                />
                <q-btn
                  color="grey"
                  :label="$t('LiquidationPF.statistiques.form.cancel')"
                  icon="cancel"
                  size="md"
                  style="border-radius: 15px; padding: 8px 20px;"
                  @click="clearSearch"
                />
              </div>
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>



    <!-- Data Table -->
    <q-card style="border-radius: 15px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); background: rgba(255,255,255,0.95); backdrop-filter: blur(10px);">
      <q-card-section class="bg-primary text-white" style="border-radius: 15px 15px 0 0;">
        <div class="text-h6">
          <q-icon name="table_view" class="q-mr-sm" />
          {{ $t('LiquidationPF.statistiques.table.title') }}
        </div>
      </q-card-section>
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        :pagination="{ rowsPerPage: 10 }"
        dense
        flat
        style="border-radius: 0 0 15px 15px;"
        class="fairy-table"
        :rows-per-page-options="[10]"
      >
        <template v-slot:header="props">
          <q-tr :props="props" class="bg-grey-2">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="text-primary text-weight-bold"
              style="font-size: 0.9rem;"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props" :class="{ 'bg-blue-4': props.row.id % 2 === 0 }" class="hover-row">
            <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              style="font-size: 0.85rem; border: 1px solid black;"
            >
              {{ col.value || 'null' }}
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>
  </div>
</template>

<script>
export default {
  name: 'LiquidationStatistiques'
}
</script>
<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

const $q = useQuasar();
const { t, locale } = useI18n();

// Search Data
const searchCentre = ref('');
const searchBranche = ref('F');
const periodeDebut = ref('');
const periodeFin = ref('');

// Table Data
const columns = [
  { name: 'id', label: t('LiquidationPF.statistiques.table.columns.id'), field: 'id', align: 'center', sortable: true },
  { name: 'numDossier', label: t('LiquidationPF.statistiques.table.columns.numDossier'), field: 'numDossier', align: 'left', sortable: true },
  { name: 'objet', label: t('LiquidationPF.statistiques.table.columns.objet'), field: 'objet', align: 'left', sortable: true },
  { name: 'numAssure', label: t('LiquidationPF.statistiques.table.columns.numAssure'), field: 'numAssure', align: 'left', sortable: true },
  { name: 'requerant', label: t('LiquidationPF.statistiques.table.columns.requerant'), field: 'requerant', align: 'left', sortable: true },
  { name: 'situation', label: t('LiquidationPF.statistiques.table.columns.situation'), field: 'situation', align: 'left', sortable: true },
  { name: 'dateSituation', label: t('LiquidationPF.statistiques.table.columns.dateSituation'), field: 'dateSituation', align: 'left', sortable: true },
  { name: 'localisation', label: t('LiquidationPF.statistiques.table.columns.localisation'), field: 'localisation', align: 'left', sortable: true },
  { name: 'dateDemande', label: t('LiquidationPF.statistiques.table.columns.dateDemande'), field: 'dateDemande', align: 'left', sortable: true },
  { name: 'initiateur', label: t('LiquidationPF.statistiques.table.columns.initiateur'), field: 'initiateur', align: 'left', sortable: true },
  { name: 'dateEnreg', label: t('LiquidationPF.statistiques.table.columns.dateEnreg'), field: 'dateEnreg', align: 'left', sortable: true },
  { name: 'numEmpl', label: t('LiquidationPF.statistiques.table.columns.numEmpl'), field: 'numEmpl', align: 'left', sortable: true },
  { name: 'raisonSociale', label: t('LiquidationPF.statistiques.table.columns.raisonSociale'), field: 'raisonSociale', align: 'left', sortable: true },
  { name: 'dateCessation', label: t('LiquidationPF.statistiques.table.columns.dateCessation'), field: 'dateCessation', align: 'left', sortable: true }
];

const rows = ref([
  {
    id: 1,
    numDossier: 'F3210000000000000011',
    objet: 'Prestations Familiales',
    numAssure: '321-1029630-9',
    requerant: 'MBIANDA TCHOUA MATHURIN',
    situation: 'Liquide',
    dateSituation: '02/12/2015 01:10:02',
    localisation: 'Comptable',
    dateDemande: '01/07/2010',
    initiateur: 'aolama',
    dateEnreg: '05/07/2010 13:55:06',
    numEmpl: '321-0105418-D',
    raisonSociale: 'NYA JEAN PAUL',
    dateCessation: null
  },
  {
    id: 2,
    numDossier: 'F3210000000000000014',
    objet: 'Prestations Familiales',
    numAssure: '321-1021508-5',
    requerant: 'ATSOMAUTSY MANDOKI VINCENT DE PAUL',
    situation: 'Liquide',
    dateSituation: '10/03/2016 11:15:16',
    localisation: 'Archive',
    dateDemande: '06/07/2010',
    initiateur: 'haoua.bello',
    dateEnreg: '06/07/2010 16:54:37',
    numEmpl: '321-0101226-X',
    raisonSociale: 'SOCIETE EQUINOXE SARL',
    dateCessation: null
  }
]);

// Functions
const searchRecords = () => {
  if (!searchCentre.value) {
    $q.notify({
      type: 'negative',
      message: t('LiquidationPF.statistiques.messages.selectCentre'),
      position: 'top',
      timeout: 3000
    });
    return;
  }
  if (!periodeDebut.value || periodeDebut.value.length !== 10) {
    $q.notify({
      type: 'negative',
      message: t('LiquidationPF.statistiques.messages.enterValidStartPeriod'),
      position: 'top',
      timeout: 3000
    });
    return;
  }
  if (!periodeFin.value || periodeFin.value.length !== 10) {
    $q.notify({
      type: 'negative',
      message: t('LiquidationPF.statistiques.messages.enterValidEndPeriod'),
      position: 'top',
      timeout: 3000
    });
    return;
  }
  $q.notify({
    type: 'info',
    message: t('LiquidationPF.statistiques.messages.searchInProgress'),
    position: 'top',
    timeout: 2000
  });
};

const clearSearch = () => {
  searchCentre.value = '';
  searchBranche.value = 'F';
  periodeDebut.value = '';
  periodeFin.value = '';
  $q.notify({
    type: 'info',
    message: t('LiquidationPF.statistiques.messages.searchCancelled'),
    position: 'top',
    timeout: 2000
  });
};




const updatePeriodeDebut = (value) => {
  periodeDebut.value = value;
};

const updatePeriodeFin = (value) => {
  periodeFin.value = value;
};
</script>

<style scoped>
.fairy-table {
  border-radius: 0 0 15px 15px;
}

.hover-row:hover {
  background: rgba(103, 126, 234, 0.1);
  transition: all 0.3s ease;
}

.q-btn {
  transition: all 0.3s ease;
}

.q-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.q-card {
  transition: all 0.3s ease;
}

.q-input, .q-select {
  transition: all 0.3s ease;
}

.q-input:hover, .q-select:hover {
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .text-h6 {
    font-size: 1.1rem !important;
  }

  .text-subtitle1 {
    font-size: 0.9rem !important;
  }
}
</style>
