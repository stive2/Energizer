<template>
  <div class="q-pa-md" style="min-height: 100vh;">
    <!-- Search Section -->
    <q-card class="q-mb-md" style="border-radius: 15px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
      <q-card-section class="text-primary" style="border-radius: 15px 15px 0 0;">
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-3">
            <q-select
              v-model="searchCriteria"
              :options="searchOptions"
              :label="$t('LiquidationPF.periodeActive.searchForm.criteria')"
              dense
              outlined
              class="text-primary"
              style="border-radius: 10px;"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model="searchValueStart"
              :label="$t('LiquidationPF.periodeActive.searchForm.startValue')"
              prefix="000-"
              dense
              outlined
              class="text-primary"
              style="border-radius: 10px;"
              @update:model-value="searchValueStart = searchValueStart.toUpperCase()"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model="searchValueEnd"
              :label="$t('LiquidationPF.periodeActive.searchForm.endValue')"
              dense
              outlined
              class="text-primary"
              style="border-radius: 10px;"
              @update:model-value="searchValueEnd = searchValueEnd.toUpperCase()"
            />
          </div>
          <div class="col-12 col-md-3">
            <div class="row q-gutter-sm">
              <q-btn
                color="primary"
                :label="$t('LiquidationPF.periodeActive.searchForm.search')"
                icon="search"
                dense
                style="border-radius: 10px;"
                @click="searchRecords"
              />
              <q-btn
                color="grey"
                :label="$t('LiquidationPF.periodeActive.searchForm.cancel')"
                icon="cancel"
                dense
                style="border-radius: 10px;"
                @click="clearSearch"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Main Action Button -->
    <div class="text-center q-mb-lg">
      <q-btn
        color="primary"
        size="md"
        :label="$t('LiquidationPF.periodeActive.addButton')"
        icon="add_circle"
        @click="openDialog"
        style="border-radius: 25px; padding: 12px 30px; box-shadow: 0 6px 20px rgba(0,0,0,0.2); text-transform: none; font-weight: 600;"
        class="text-white"
      >
        <q-tooltip class="bg-grey text-body2">
          {{ $t('LiquidationPF.periodeActive.searchForm.tooltip') }}
        </q-tooltip>
      </q-btn>
    </div>

    <!-- Dialog Form -->
    <q-dialog v-model="dialog" persistent maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card>
        <q-bar class="bg-primary text-white">
          <q-space />
          <div class="text-h6">{{ $t('LiquidationPF.periodeActive.dialogTitle') }}</div>
          <q-space />
          <q-btn dense flat icon="close" @click="closeDialog">
            <q-tooltip class="bg-white text-primary">{{ $t('LiquidationPF.periodeActive.closeButton') }}</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section style="padding: 0;">
          <q-scroll-area style="height: calc(100vh - 60px);">
            <div class="q-pa-lg">
              <q-form @submit="validateForm" class="q-gutter-md">
                <!-- Basic Info Section -->
                <q-card class="q-mb-md" style="border-radius: 15px; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px);">
                  <q-card-section>
                    <div class="text-h6 text-primary q-mb-md">
                      <q-icon name="folder" class="q-mr-sm" />
                      {{ $t('LiquidationPF.periodeActive.sections.employerInsuredInfo') }}
                    </div>
                    <div class="row q-col-gutter-md">
                      <div class="col-12 col-md-4">
                        <q-input
                          v-model="form.txtsaisiematempl"
                          :label="$t('LiquidationPF.periodeActive.form.employerRegistration')"
                          dense
                          readonly
                          outlined
                          class="bg-grey-2"
                          style="border-radius: 10px;"
                        />
                      </div>
                      <div class="col-12 col-md-4">
                        <q-input
                          v-model="form.txtraisonsociale"
                          :label="$t('LiquidationPF.periodeActive.form.companyName')"
                          dense
                          readonly
                          outlined
                          class="bg-grey-2"
                          style="border-radius: 10px;"
                        />
                      </div>
                      <div class="col-12 col-md-4">
                        <q-input
                          v-model="form.txtsaisiedateembauche"
                          :label="$t('LiquidationPF.periodeActive.form.affiliationDate')"
                          dense
                          readonly
                          outlined
                          class="bg-grey-2"
                          style="border-radius: 10px;"
                        />
                      </div>
                      <div class="col-12 col-md-4">
                        <q-input
                          v-model="form.txtsaisienumassu"
                          :label="$t('LiquidationPF.periodeActive.form.insuredNumber')"
                          dense
                          readonly
                          outlined
                          class="bg-grey-2"
                          style="border-radius: 10px;"
                        />
                      </div>
                      <div class="col-12 col-md-4">
                        <q-input
                          v-model="form.txtsaisietextenomassu"
                          :label="$t('LiquidationPF.periodeActive.form.insuredNames')"
                          dense
                          readonly
                          outlined
                          class="bg-grey-2"
                          style="border-radius: 10px;"
                        />
                      </div>
                      <div class="col-12 col-md-4">
                        <q-input
                          v-model="form.txtsaisietexteprenomassu"
                          :label="$t('LiquidationPF.periodeActive.form.insuredFirstNames')"
                          dense
                          readonly
                          outlined
                          class="bg-grey-2"
                          style="border-radius: 10px;"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- Activity Period Section -->
                <q-card class="q-mb-md" style="border-radius: 15px; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px);">
                  <q-card-section>
                    <div class="text-h6 text-primary q-mb-md">
                      <q-icon name="assignment" class="q-mr-sm" />
                      {{ $t('LiquidationPF.periodeActive.sections.activityPeriodDetails') }}
                    </div>
                    <div class="row q-col-gutter-md">
                      <div class="col-12 col-md-2">
                        <q-select
                          v-model="form.cbxtype"
                          :options="typeOptions"
                          option-label="label"
                          option-value="value"
                          emit-value
                          map-options
                          :label="$t('LiquidationPF.periodeActive.form.type')"
                          dense
                          outlined
                          style="border-radius: 10px;"
                          :rules="[val => !!val || $t('LiquidationPF.periodeActive.messages.typeRequired')]"
                        />
                      </div>
                      <div class="col-12 col-md-2">
                        <q-input
                          v-model="form.txtsaisiematassu"
                          :label="$t('LiquidationPF.periodeActive.form.insuredRegistration')"
                          dense
                          outlined
                          style="border-radius: 10px;"
                          :rules="[val => !!val || $t('LiquidationPF.periodeActive.messages.insuredRegistrationRequired')]"
                        />
                      </div>
                      <div class="col-12 col-md-2">
                        <q-input
                          v-model="form.txtSaisiedatedebutreprise"
                          :label="$t('LiquidationPF.periodeActive.form.hiringDate')"
                          dense
                          outlined
                          color="primary"
                          bg-color="white"
                          style="border-radius: 10px;"
                          :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                          :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                          :rules="[val => val && val.length === 10 || $t('LiquidationPF.periodeActive.messages.hiringDateRequired')]"
                        >
                          <template #append>
                            <q-icon name="event" class="cursor-pointer" color="primary" size="sm">
                              <q-popup-proxy transition-show="scale" transition-hide="scale">
                                <q-date
                                  v-model="form.txtSaisiedatedebutreprise"
                                  :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                  :locale="locale"
                                  color="primary"
                                  @update:model-value="updateDateDebutReprise"
                                />
                              </q-popup-proxy>
                            </q-icon>
                          </template>
                        </q-input>
                      </div>
                      <div class="col-12 col-md-2">
                        <q-input
                          v-model="form.txtSaisiedatefinreprise"
                          :label="$t('LiquidationPF.periodeActive.form.cessationDate')"
                          dense
                          outlined
                          color="primary"
                          bg-color="white"
                          style="border-radius: 10px;"
                          :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                          :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                          :rules="[val => !val || val.length === 10 || $t('LiquidationPF.periodeActive.messages.invalidCessationDate')]"
                        >
                          <template #append>
                            <q-icon name="event" class="cursor-pointer" color="primary" size="sm">
                              <q-popup-proxy transition-show="scale" transition-hide="scale">
                                <q-date
                                  v-model="form.txtSaisiedatefinreprise"
                                  :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                  :locale="locale"
                                  color="primary"
                                  @update:model-value="updateDateFinReprise"
                                />
                              </q-popup-proxy>
                            </q-icon>
                          </template>
                        </q-input>
                      </div>
                      <div class="col-12 col-md-2">
                        <q-input
                          v-model="form.txtsaisienumempl"
                          :label="$t('LiquidationPF.periodeActive.form.employerNumber')"
                          dense
                          outlined
                          style="border-radius: 10px;"
                          :rules="[val => !!val || $t('LiquidationPF.periodeActive.messages.employerNumberRequired')]"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- Action Buttons -->
                <div class="row q-gutter-md justify-center q-mt-lg">
                  <q-btn
                    :label="$t('LiquidationPF.periodeActive.actions.validate')"
                    type="submit"
                    color="positive"
                    icon="check"
                    style="border-radius: 20px; padding: 10px 25px;"
                    size="md"
                  />
                  <q-btn
                    :label="$t('LiquidationPF.periodeActive.actions.reset')"
                    color="grey"
                    icon="refresh"
                    style="border-radius: 20px; padding: 10px 25px;"
                    size="md"
                    @click="resetForm"
                  />
                  <q-btn
                    :label="$t('LiquidationPF.periodeActive.actions.close')"
                    flat
                    color="secondary"
                    icon="cancel"
                    style="border-radius: 20px; padding: 10px 25px;"
                    size="md"
                    @click="closeDialog"
                  />
                </div>
              </q-form>
            </div>
          </q-scroll-area>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Navigation -->
    <div class="text-center q-mb-md">
      <q-btn-group rounded>
        <q-btn color="primary" :label="$t('LiquidationPF.periodeActive.navigation.previous')" icon="chevron_left" @click="previousPage" />
        <q-btn color="primary" :label="currentPage" />
        <q-btn color="primary" :label="$t('LiquidationPF.periodeActive.navigation.next')" icon-right="chevron_right" @click="nextPage" />
      </q-btn-group>
    </div>

    <!-- Data Table -->
    <q-card style="border-radius: 15px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); background: rgba(255,255,255,0.95); backdrop-filter: blur(10px);">
      <q-card-section class="bg-primary text-white" style="border-radius: 15px 15px 0 0;">
        <div class="text-h6">
          <q-icon name="table_view" class="q-mr-sm" />
          {{ $t('LiquidationPF.periodeActive.table.title') }}
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
        @row-click="onRowClick"
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
          <q-tr :props="props" class="hover-row" @click="loadForm(props.row)">
            <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              style="font-size: 0.85rem; cursor: pointer;"
            >
              {{ col.value }}
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

const $q = useQuasar();
const { t, locale } = useI18n();

// Search Data
const searchCriteria = ref('Num Assuré');
const searchValueStart = ref('');
const searchValueEnd = ref('');

// Search options
const searchOptions = [
  t('LiquidationPF.periodeActive.searchOptions.insuredNumber'),
  t('LiquidationPF.periodeActive.searchOptions.insuredNames')
];

// Type options
const typeOptions = [
  { label: t('LiquidationPF.periodeActive.form.choosePlease'), value: '' },
  { label: t('LiquidationPF.periodeActive.form.active'), value: 'ACT' },
  { label: t('LiquidationPF.periodeActive.form.interruption'), value: 'INT' }
];

// Form Data
const dialog = ref(false);
const form = ref({
  txtsaisiematempl: '',
  txtraisonsociale: '',
  txtsaisiedateembauche: '',
  txtsaisienumassu: '',
  txtsaisietextenomassu: '',
  txtsaisietexteprenomassu: '',
  cbxtype: '',
  txtsaisiematassu: '',
  txtSaisiedatedebutreprise: '',
  txtSaisiedatefinreprise: '',
  txtsaisienumempl: ''
});

// Table Data
const columns = [
  { name: 'id', label: '', field: 'id', align: 'left', sortable: true },
  { name: 'numAssure', label: t('LiquidationPF.periodeActive.table.columns.insuredNumber'), field: 'numAssure', align: 'left', sortable: true },
  { name: 'nomAssure', label: t('LiquidationPF.periodeActive.table.columns.insuredNames'), field: 'nomAssure', align: 'left', sortable: true },
  { name: 'matEmployeur', label: t('LiquidationPF.periodeActive.table.columns.employerRegistration'), field: 'matEmployeur', align: 'left', sortable: true },
  { name: 'type', label: t('LiquidationPF.periodeActive.table.columns.type'), field: 'type', align: 'left', sortable: true },
  { name: 'dateEmbauche', label: t('LiquidationPF.periodeActive.table.columns.hiringDate'), field: 'dateEmbauche', align: 'left', sortable: true },
  { name: 'dateCessation', label: t('LiquidationPF.periodeActive.table.columns.cessationDate'), field: 'dateCessation', align: 'left', sortable: true }
];

const rows = ref([
  {
    id: 1,
    numAssure: '000-0200897-7',
    nomAssure: 'MIMBE EFOUA',
    matEmployeur: '040-0990000-H',
    type: 'En Activité',
    dateEmbauche: '01/07/1974',
    dateCessation: '28/10/2011'
  },
  {
    id: 2,
    numAssure: '000-0510469-0',
    nomAssure: 'KWECHEU JEAN CLAUDE',
    matEmployeur: '040-0990000-H',
    type: 'En Activité',
    dateEmbauche: '28/05/1977',
    dateCessation: '31/12/2013'
  },
  {
    id: 3,
    numAssure: '000-0107720-5',
    nomAssure: 'NGO-MAKON CRESENCE',
    matEmployeur: '010-2723601-G',
    type: 'En Activité',
    dateEmbauche: '01/07/1981',
    dateCessation: '13/03/2006'
  },
  {
    id: 4,
    numAssure: '000-0777404-5',
    nomAssure: 'RIMOH SUZANNE',
    matEmployeur: '010-5880301-A',
    type: 'En Activité',
    dateEmbauche: '01/09/1989',
    dateCessation: 'null'
  },
  {
    id: 5,
    numAssure: '000-0063795-9',
    nomAssure: 'NGWADJA NATHANAEL',
    matEmployeur: '040-0990000-H',
    type: 'En Activité',
    dateEmbauche: '01/07/1974',
    dateCessation: '31/12/2000'
  },
  {
    id: 6,
    numAssure: '000-0199459-9',
    nomAssure: 'NARMAI SAMUEL',
    matEmployeur: '010-1202901-F',
    type: 'En Activité',
    dateEmbauche: '03/05/1976',
    dateCessation: '31/12/2005'
  },
  {
    id: 7,
    numAssure: '000-0397705-5',
    nomAssure: 'AYISSI NGA',
    matEmployeur: '010-1138901-K',
    type: 'En Activité',
    dateEmbauche: '14/01/1981',
    dateCessation: '14/07/1990'
  },
  {
    id: 8,
    numAssure: '000-0857263-8',
    nomAssure: 'KINA SAMUEL',
    matEmployeur: '010-0143501-Q',
    type: 'En Activité',
    dateEmbauche: '03/08/2000',
    dateCessation: '03/08/2000'
  },
  {
    id: 9,
    numAssure: '000-0441134-4',
    nomAssure: 'AHANDA TOBIE',
    matEmployeur: '010-0013801-B',
    type: 'En Activité',
    dateEmbauche: '03/11/1983',
    dateCessation: 'null'
  },
  {
    id: 10,
    numAssure: '000-0278824-8',
    nomAssure: 'YAYA ALIOUM',
    matEmployeur: '010-1097701-S',
    type: 'En Activité',
    dateEmbauche: '12/05/1979',
    dateCessation: '31/12/2015'
  }
]);

const currentPage = ref(1);

// Functions
const openDialog = () => {
  dialog.value = true;
  $q.notify({
    type: 'info',
    message: t('LiquidationPF.periodeActive.messages.formOpened'),
    position: 'top',
    timeout: 2000
  });
};

const closeDialog = () => {
  dialog.value = false;
  $q.notify({
    type: 'info',
    message: t('LiquidationPF.periodeActive.messages.formClosed'),
    position: 'top',
    timeout: 2000
  });
};

const validateForm = () => {
  if (!form.value.txtsaisiematassu) {
    $q.notify({
      type: 'negative',
      message: t('LiquidationPF.periodeActive.messages.enterInsuredRegistration'),
      position: 'top',
      timeout: 3000
    });
    return;
  }
  if (!form.value.txtsaisienumempl) {
    $q.notify({
      type: 'negative',
      message: t('LiquidationPF.periodeActive.messages.enterEmployerNumber'),
      position: 'top',
      timeout: 3000
    });
    return;
  }
  if (!form.value.txtSaisiedatedebutreprise) {
    $q.notify({
      type: 'negative',
      message: t('LiquidationPF.periodeActive.messages.enterHiringDate'),
      position: 'top',
      timeout: 3000
    });
    return;
  }
  if (!form.value.cbxtype) {
    $q.notify({
      type: 'negative',
      message: t('LiquidationPF.periodeActive.messages.selectType'),
      position: 'top',
      timeout: 3000
    });
    return;
  }
  dialog.value = false;
  $q.notify({
    type: 'positive',
    message: t('LiquidationPF.periodeActive.messages.formValidated'),
    position: 'top',
    timeout: 3000
  });
};

const resetForm = () => {
  form.value = {
    txtsaisiematempl: '',
    txtraisonsociale: '',
    txtsaisiedateembauche: '',
    txtsaisienumassu: '',
    txtsaisietextenomassu: '',
    txtsaisietexteprenomassu: '',
    cbxtype: '',
    txtsaisiematassu: '',
    txtSaisiedatedebutreprise: '',
    txtSaisiedatefinreprise: '',
    txtsaisienumempl: ''
  };
  $q.notify({
    type: 'info',
    message: t('LiquidationPF.periodeActive.messages.formReset'),
    position: 'top',
    timeout: 2000
  });
};

const searchRecords = () => {
  $q.notify({
    type: 'info',
    message: t('LiquidationPF.periodeActive.messages.searchInProgress'),
    position: 'top',
    timeout: 2000
  });
};

const clearSearch = () => {
  searchValueStart.value = '';
  searchValueEnd.value = '';
  $q.notify({
    type: 'info',
    message: t('LiquidationPF.periodeActive.messages.searchCancelled'),
    position: 'top',
    timeout: 2000
  });
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
  $q.notify({
    type: 'info',
    message: t('LiquidationPF.periodeActive.messages.previousPage'),
    position: 'bottom',
    timeout: 1000
  });
};

const nextPage = () => {
  currentPage.value++;
  $q.notify({
    type: 'info',
    message: t('LiquidationPF.periodeActive.messages.nextPage'),
    position: 'bottom',
    timeout: 1000
  });
};

const onRowClick = (evt, row) => {
  loading(
    row.numAssure,
    row.nomAssure.split(' ')[0],
    row.nomAssure.split(' ').slice(1).join(' '),
    row.dateEmbauche,
    row.dateCessation,
    row.matEmployeur,
    row.dateEmbauche,
    row.type === 'En Activité' ? 'ACT' : 'INT'
  );
  openDialog();
};

const loading = (numassu, nomassu, prenomassu, dateembauche, datecessation, matempl, dateaffiliation, type) => {
  form.value.txtsaisiematassu = numassu;
  form.value.txtsaisienumassu = numassu;
  form.value.txtsaisietextenomassu = nomassu;
  form.value.txtsaisietexteprenomassu = prenomassu;
  form.value.txtsaisienumempl = matempl;
  form.value.txtsaisiematempl = matempl;
  form.value.txtSaisiedatedebutreprise = dateembauche;
  form.value.txtSaisiedatefinreprise = datecessation === 'null' ? '' : datecessation;
  form.value.txtsaisiedateembauche = dateaffiliation;
  form.value.cbxtype = type;
};

const updateDateDebutReprise = (value) => {
  form.value.txtSaisiedatedebutreprise = value;
};

const updateDateFinReprise = (value) => {
  form.value.txtSaisiedatefinreprise = value;
};

const loadForm = (row) => {
  // Charger les données de base
  form.value.txtsaisiematempl = row.matEmployeur || '';
  form.value.txtraisonsociale = 'Société Example'; // Valeur par défaut
  form.value.txtsaisiedateembauche = row.dateEmbauche || '';
  form.value.txtsaisienumassu = row.numAssure || '';
  form.value.txtsaisietextenomassu = row.nomAssure || '';
  form.value.txtsaisietexteprenomassu = '';

  // Charger les données de période active
  form.value.cbxtype = row.type === 'En Activité' ? 'ACT' : 'INT';
  form.value.txtsaisiematassu = row.numAssure || '';
  form.value.txtSaisiedatedebutreprise = row.dateEmbauche || '';
  form.value.txtSaisiedatefinreprise = row.dateCessation === 'null' ? '' : row.dateCessation || '';
  form.value.txtsaisienumempl = row.matEmployeur || '';

  // Ouvrir le dialogue
  dialog.value = true;

  // Notification pour informer l'utilisateur
  $q.notify({
    type: 'info',
    message: `${t('LiquidationPF.periodeActive.messages.dossierLoaded')} ${row.numAssure}`,
    position: 'top',
    timeout: 2000
  });
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

.q-dialog .q-card {
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.q-dialog__inner {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .text-h4 {
    font-size: 1.5rem !important;
  }

  .text-h6 {
    font-size: 1.1rem !important;
  }
}
</style>
