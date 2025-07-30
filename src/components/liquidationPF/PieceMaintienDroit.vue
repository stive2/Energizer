<template>
  <div class="q-pa-md" style="min-height: 100vh;">
    <!-- Search Section -->
    <q-card class="q-mb-md" style="border-radius: 15px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
      <q-card-section class="text-primary" style="border-radius: 15px 15px 0 0;">
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-3">
            <q-select
              v-model="searchCriteria"
              :options="[$t('LiquidationPF.pieceMaintienDroit.searchOptions.insuredNumber'), $t('LiquidationPF.pieceMaintienDroit.searchOptions.insuredNames'), $t('LiquidationPF.pieceMaintienDroit.searchOptions.beneficiaryNames'), $t('LiquidationPF.pieceMaintienDroit.searchOptions.date')]"
              :label="$t('LiquidationPF.pieceMaintienDroit.searchForm.criteria')"
              dense
              outlined
              class="text-primary"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model="searchValueStart"
              :label="$t('LiquidationPF.pieceMaintienDroit.searchForm.startValue')"
              dense
              outlined
              class="text-primary"
              @update:model-value="toUpperCase('searchValueStart')"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-input
              v-model="searchValueEnd"
              :label="$t('LiquidationPF.pieceMaintienDroit.searchForm.endValue')"
              dense
              outlined
              class="text-primary"
              @update:model-value="toUpperCase('searchValueEnd')"
            />
          </div>
          <div class="col-12 col-md-3">
            <div class="row q-gutter-sm">
              <q-btn
                color="primary"
                :label="$t('LiquidationPF.pieceMaintienDroit.searchForm.search')"
                icon="search"
                dense
                style="border-radius: 10px;"
                @click="searchRecords"
              />
              <q-btn
                color="grey"
                :label="$t('LiquidationPF.pieceMaintienDroit.searchForm.cancel')"
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
        :label="$t('LiquidationPF.pieceMaintienDroit.addButton')"
        icon="add_circle"
        @click="openDialog"
        style="border-radius: 25px; padding: 12px 30px; box-shadow: 0 6px 20px rgba(0,0,0,0.2); text-transform: none; font-weight: 600;"
        class="text-white"
      >
        <q-tooltip class="bg-grey text-body2">
          {{ $t('LiquidationPF.pieceMaintienDroit.searchForm.tooltip') }}
        </q-tooltip>
      </q-btn>
    </div>

    <!-- Dialog Form -->
    <q-dialog v-model="dialog" persistent maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card>
        <q-bar class="bg-primary text-white">
          <q-space />
          <div class="text-h6">{{ $t('LiquidationPF.pieceMaintienDroit.dialogTitle') }}</div>
          <q-space />
          <q-btn dense flat icon="close" @click="closeDialog">
            <q-tooltip class="bg-white text-primary">{{ $t('LiquidationPF.pieceMaintienDroit.closeButton') }}</q-tooltip>
          </q-btn>
        </q-bar>

        <q-card-section style="padding: 0;">
          <q-scroll-area style="height: calc(100vh - 60px);">
            <div class="q-pa-lg">
              <q-form @submit="validateForm" class="q-gutter-md">
                <!-- Assuré Info Section -->
                <q-card class="q-mb-md" style="border-radius: 15px; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px);">
                  <q-card-section>
                    <div class="text-h6 text-primary q-mb-md">
                      <q-icon name="person" class="q-mr-sm" />
                      {{ $t('LiquidationPF.pieceMaintienDroit.sections.insuredInfo') }}
                    </div>
                    <div class="row q-col-gutter-md">
                      <div class="col-12 col-md-4">
                        <q-input
                          v-model="form.numAssure"
                          :label="$t('LiquidationPF.pieceMaintienDroit.form.insuredNumber')"
                          dense
                          outlined
                          :rules="[val => !!val || $t('LiquidationPF.pieceMaintienDroit.messages.insuredNumberRequired')]"
                          style="border-radius: 10px;"
                        />
                      </div>
                      <div class="col-12 col-md-4">
                        <q-input
                          v-model="form.nomAssure"
                          :label="$t('LiquidationPF.pieceMaintienDroit.form.insuredNames')"
                          dense
                          outlined
                          readonly
                          class="bg-grey-2"
                          style="border-radius: 10px;"
                        />
                      </div>
                      <div class="col-12 col-md-4">
                        <q-input
                          v-model="form.prenomAssure"
                          :label="$t('LiquidationPF.pieceMaintienDroit.form.insuredFirstNames')"
                          dense
                          outlined
                          readonly
                          class="bg-grey-2"
                          style="border-radius: 10px;"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- Bénéficiaire Info Section -->
                <q-card class="q-mb-md" style="border-radius: 15px; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px);">
                  <q-card-section>
                    <div class="text-h6 text-primary q-mb-md">
                      <q-icon name="group" class="q-mr-sm" />
                      {{ $t('LiquidationPF.pieceMaintienDroit.sections.beneficiaryInfo') }}
                    </div>
                    <div class="row q-col-gutter-md">
                      <div class="col-12 col-md-4">
                        <q-input
                          v-model="form.numBeneficiaire"
                          :label="$t('LiquidationPF.pieceMaintienDroit.form.beneficiaryNumber')"
                          dense
                          outlined
                          :rules="[val => !!val || $t('LiquidationPF.pieceMaintienDroit.messages.beneficiaryNumberRequired')]"
                          style="border-radius: 10px;"
                        />
                      </div>
                      <div class="col-12 col-md-4">
                        <q-input
                          v-model="form.nomBeneficiaire"
                          :label="$t('LiquidationPF.pieceMaintienDroit.form.beneficiaryNames')"
                          dense
                          outlined
                          readonly
                          class="bg-grey-2"
                          style="border-radius: 10px;"
                        />
                      </div>
                      <div class="col-12 col-md-4">
                        <q-input
                          v-model="form.prenomBeneficiaire"
                          :label="$t('LiquidationPF.pieceMaintienDroit.form.beneficiaryFirstNames')"
                          dense
                          outlined
                          readonly
                          class="bg-grey-2"
                          style="border-radius: 10px;"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- Details Section -->
                <q-card class="q-mb-md" style="border-radius: 15px; background: rgba(255,255,255,0.95); backdrop-filter: blur(10px);">
                  <q-card-section>
                    <div class="text-h6 text-primary q-mb-md">
                      <q-icon name="info" class="q-mr-sm" />
                      {{ $t('LiquidationPF.pieceMaintienDroit.sections.details') }}
                    </div>
                    <div class="row q-col-gutter-md">
                      <div class="col-12 col-md-4">
                        <q-input
                          v-model="form.position"
                          :label="$t('LiquidationPF.pieceMaintienDroit.form.position')"
                          dense
                          outlined
                          readonly
                          class="bg-grey-2"
                          style="border-radius: 10px;"
                        />
                      </div>
                      <div class="col-12 col-md-4">
                        <q-input
                          v-model="form.motif"
                          :label="$t('LiquidationPF.pieceMaintienDroit.form.motif')"
                          dense
                          outlined
                          readonly
                          class="bg-grey-2"
                          style="border-radius: 10px;"
                        />
                      </div>
                      <div class="col-12 col-md-4">
                        <q-input
                          v-model="form.dateNaissance"
                          :label="$t('LiquidationPF.pieceMaintienDroit.form.birthDate')"
                          dense
                          outlined
                          readonly
                          class="bg-grey-2"
                          style="border-radius: 10px;"
                        />
                      </div>
                      <div class="col-12 col-md-4">
                        <q-input
                          v-model="form.scolarise"
                          :label="$t('LiquidationPF.pieceMaintienDroit.form.scolarized')"
                          dense
                          outlined
                          readonly
                          class="bg-grey-2"
                          style="border-radius: 10px;"
                        />
                      </div>
                      <div class="col-12 col-md-4">
                        <q-input
                          v-model="form.enApprentissage"
                          :label="$t('LiquidationPF.pieceMaintienDroit.form.inApprenticeship')"
                          dense
                          outlined
                          readonly
                          class="bg-grey-2"
                          style="border-radius: 10px;"
                        />
                      </div>
                      <div class="col-12 col-md-4">
                        <q-input
                          v-model="form.dateDebut"
                          :label="$t('LiquidationPF.pieceMaintienDroit.form.startDate')"
                          dense
                          outlined
                          style="border-radius: 10px;"
                          :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                          :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                          :rules="[val => val && val.length === 10 || $t('LiquidationPF.pieceMaintienDroit.messages.startDateRequired')]"
                        >
                          <template #append>
                            <q-icon name="event" class="cursor-pointer" color="primary" size="sm">
                              <q-popup-proxy transition-show="scale" transition-hide="scale">
                                <q-date
                                  v-model="form.dateDebut"
                                  :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                  :locale="locale"
                                  color="primary"
                                />
                              </q-popup-proxy>
                            </q-icon>
                          </template>
                        </q-input>
                      </div>
                      <div class="col-12 col-md-4">
                        <q-input
                          v-model="form.dateFin"
                          :label="$t('LiquidationPF.pieceMaintienDroit.form.endDate')"
                          dense
                          outlined
                          style="border-radius: 10px;"
                          :mask="locale === 'fr' ? '##/##/####' : '####-##-##'"
                          :hint="locale === 'fr' ? 'JJ/MM/AAAA' : 'YYYY-MM-DD'"
                          :rules="[val => val && val.length === 10 || $t('LiquidationPF.pieceMaintienDroit.messages.endDateRequired')]"
                        >
                          <template #append>
                            <q-icon name="event" class="cursor-pointer" color="primary" size="sm">
                              <q-popup-proxy transition-show="scale" transition-hide="scale">
                                <q-date
                                  v-model="form.dateFin"
                                  :mask="locale === 'fr' ? 'DD/MM/YYYY' : 'YYYY-MM-DD'"
                                  :locale="locale"
                                  color="primary"
                                />
                              </q-popup-proxy>
                            </q-icon>
                          </template>
                        </q-input>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- Action Buttons -->
                <div class="row q-gutter-md justify-center q-mt-lg">
                  <q-btn
                    :label="$t('LiquidationPF.pieceMaintienDroit.actions.save')"
                    type="submit"
                    color="positive"
                    icon="check"
                    style="border-radius: 20px; padding: 10px 25px;"
                    size="md"
                  />
                  <q-btn
                    :label="$t('LiquidationPF.pieceMaintienDroit.actions.delete')"
                    color="negative"
                    icon="delete"
                    style="border-radius: 20px; padding: 10px 25px;"
                    size="md"
                    @click="submitFunction(2)"
                  />
                  <q-btn
                    :label="$t('LiquidationPF.pieceMaintienDroit.actions.cancel')"
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
        <q-btn color="primary" :label="$t('LiquidationPF.pieceMaintienDroit.actions.previous')" icon="chevron_left" @click="previousPage" />
        <q-btn color="primary" label="1" />
        <q-btn color="primary" :label="$t('LiquidationPF.pieceMaintienDroit.actions.next')" icon-right="chevron_right" @click="nextPage" />
      </q-btn-group>
    </div>

    <!-- Data Table -->
    <q-card style="border-radius: 15px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); background: rgba(255,255,255,0.95); backdrop-filter: blur(10px);">
      <q-card-section class="bg-primary text-white" style="border-radius: 15px 15px 0 0;">
        <div class="text-h6">
          <q-icon name="table_view" class="q-mr-sm" />
          {{ $t('LiquidationPF.pieceMaintienDroit.table.title') }}
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
const searchCriteria = ref(t('LiquidationPF.pieceMaintienDroit.searchOptions.insuredNumber'));
const searchValueStart = ref('');
const searchValueEnd = ref('');

// Form Data
const dialog = ref(false);
const form = ref({
  numAssure: '',
  nomAssure: '',
  prenomAssure: '',
  numBeneficiaire: '',
  nomBeneficiaire: '',
  prenomBeneficiaire: '',
  position: '',
  motif: '',
  scolarise: '',
  enApprentissage: '',
  dateNaissance: '',
  dateDebut: '',
  dateFin: ''
});

// Table Data
const columns = [
  { name: 'numAssure', label: t('LiquidationPF.pieceMaintienDroit.table.columns.insuredNumber'), field: 'numAssure', align: 'left', sortable: true },
  { name: 'nomAssure', label: t('LiquidationPF.pieceMaintienDroit.table.columns.insuredNames'), field: 'nomAssure', align: 'left', sortable: true },
  { name: 'numBeneficiaire', label: t('LiquidationPF.pieceMaintienDroit.table.columns.beneficiaryNumber'), field: 'numBeneficiaire', align: 'left', sortable: true },
  { name: 'nomBeneficiaire', label: t('LiquidationPF.pieceMaintienDroit.table.columns.beneficiaryNames'), field: 'nomBeneficiaire', align: 'left', sortable: true },
  { name: 'dateNaissance', label: t('LiquidationPF.pieceMaintienDroit.table.columns.birthDate'), field: 'dateNaissance', align: 'left', sortable: true },
  { name: 'dateDebut', label: t('LiquidationPF.pieceMaintienDroit.table.columns.startDate'), field: 'dateDebut', align: 'left', sortable: true },
  { name: 'dateFin', label: t('LiquidationPF.pieceMaintienDroit.table.columns.endDate'), field: 'dateFin', align: 'left', sortable: true }
];

const rows = [
  { id: 1, numAssure: '000-0163708-1', nomAssure: 'ESSOMBA APPOLINAIRE', numBeneficiaire: '40104', nomBeneficiaire: 'TABI ESSOMBA J', dateNaissance: '24/02/2004', dateDebut: null, dateFin: null },
  { id: 2, numAssure: '000-0875972-2', nomAssure: 'BANAKEN MARIE MICHELE', numBeneficiaire: '40002', nomBeneficiaire: 'BANAKEN VINCENT MARC C', dateNaissance: '11/04/2007', dateDebut: '01/03/2023', dateFin: '31/03/2023' },
  { id: 3, numAssure: '321-1000821-7', nomAssure: 'MBALLA ESSAMA YVETTE MAGGI', numBeneficiaire: '40103', nomBeneficiaire: 'ABOUI NKOULOU MARIE EMMANUELLE', dateNaissance: '11/02/2004', dateDebut: null, dateFin: null },
  { id: 4, numAssure: '000-0329798-3', nomAssure: 'TSONDO ABENA JEAN PAUL', numBeneficiaire: '40001', nomBeneficiaire: 'TSONDO TSONDO JEAN DE DIEU', dateNaissance: '14/04/2005', dateDebut: null, dateFin: null },
  { id: 5, numAssure: '000-0329798-3', nomAssure: 'TSONDO ABENA JEAN PAUL', numBeneficiaire: '40101', nomBeneficiaire: 'BELLA TSONDO REMI', dateNaissance: '06/03/2007', dateDebut: '01/09/2023', dateFin: '30/07/2024' },
  { id: 6, numAssure: '000-0329798-3', nomAssure: 'TSONDO ABENA JEAN PAUL', numBeneficiaire: '40004', nomBeneficiaire: 'BIDONNG TSONDO JEAN M', dateNaissance: '13/11/2008', dateDebut: null, dateFin: null },
  { id: 7, numAssure: '321-1004736-3', nomAssure: 'BODO IMOSSI ROLAND', numBeneficiaire: '40105', nomBeneficiaire: 'IMOSSI YANNICK', dateNaissance: '10/03/2006', dateDebut: null, dateFin: null },
  { id: 8, numAssure: '321-1004753-8', nomAssure: 'AKECHING NUNJO ANDREW', numBeneficiaire: '40103', nomBeneficiaire: 'NUNJO L.L. NGWEME.', dateNaissance: '04/09/2006', dateDebut: null, dateFin: null },
  { id: 9, numAssure: '321-1019646-7', nomAssure: 'NYATOUBOU AKAME ARTIDE NADEGE', numBeneficiaire: '40102', nomBeneficiaire: 'NFOUMOU DAVY KENERYK', dateNaissance: '20/08/2003', dateDebut: null, dateFin: null },
  { id: 10, numAssure: '321-1029630-9', nomAssure: 'MBIANDA-TCHOUA MATHURIN', numBeneficiaire: '40101', nomBeneficiaire: 'NYADAM-MBIANDA GLOIRE DIDIER', dateNaissance: '30/09/2005', dateDebut: '01/03/2010', dateFin: '31/03/2010' }
];

// Functions
const openDialog = () => {
  dialog.value = true;
  $q.notify({
    type: 'info',
    message: t('LiquidationPF.pieceMaintienDroit.messages.formOpened'),
    position: 'top',
    timeout: 2000
  });
};

const closeDialog = () => {
  dialog.value = false;
  $q.notify({
    type: 'info',
    message: t('LiquidationPF.pieceMaintienDroit.messages.formClosed'),
    position: 'top',
    timeout: 2000
  });
};

const validateForm = () => {
  if (!form.value.numAssure) {
    $q.notify({
      type: 'negative',
      message: t('LiquidationPF.pieceMaintienDroit.messages.enterInsuredNumber'),
      position: 'top',
      timeout: 3000
    });
    return;
  }
  if (!form.value.numBeneficiaire) {
    $q.notify({
      type: 'negative',
      message: t('LiquidationPF.pieceMaintienDroit.messages.enterBeneficiaryNumber'),
      position: 'top',
      timeout: 3000
    });
    return;
  }
  if (!form.value.dateDebut || form.value.dateDebut.length !== 10) {
    $q.notify({
      type: 'negative',
      message: t('LiquidationPF.pieceMaintienDroit.messages.enterValidStartDate'),
      position: 'top',
      timeout: 3000
    });
    return;
  }
  if (!form.value.dateFin || form.value.dateFin.length !== 10) {
    $q.notify({
      type: 'negative',
      message: t('LiquidationPF.pieceMaintienDroit.messages.enterValidEndDate'),
      position: 'top',
      timeout: 3000
    });
    return;
  }

  dialog.value = false;
  $q.notify({
    type: 'positive',
    message: t('LiquidationPF.pieceMaintienDroit.messages.formValidated'),
    position: 'top',
    timeout: 3000,
    actions: [{ label: t('LiquidationPF.pieceMaintienDroit.closeButton'), color: 'white' }]
  });
};

const submitFunction = (action) => {
  if (action === 2) {
    $q.dialog({
      title: t('LiquidationPF.pieceMaintienDroit.messages.confirmationTitle'),
      message: t('LiquidationPF.pieceMaintienDroit.messages.confirmDelete'),
      cancel: true,
      persistent: true
    }).onOk(() => {
      $q.notify({
        type: 'positive',
        message: t('LiquidationPF.pieceMaintienDroit.messages.elementDeleted'),
        position: 'top',
        timeout: 3000
      });
    });
  }
};

const searchRecords = () => {
  $q.notify({
    type: 'info',
    message: t('LiquidationPF.pieceMaintienDroit.messages.searchInProgress'),
    position: 'top',
    timeout: 2000
  });
};

const clearSearch = () => {
  searchValueStart.value = '';
  searchValueEnd.value = '';
  $q.notify({
    type: 'info',
    message: t('LiquidationPF.pieceMaintienDroit.messages.searchCancelled'),
    position: 'top',
    timeout: 2000
  });
};

const previousPage = () => {
  $q.notify({
    type: 'info',
    message: t('LiquidationPF.pieceMaintienDroit.messages.previousPage'),
    position: 'bottom',
    timeout: 1000
  });
};

const nextPage = () => {
  $q.notify({
    type: 'info',
    message: t('LiquidationPF.pieceMaintienDroit.messages.nextPage'),
    position: 'bottom',
    timeout: 1000
  });
};

const toUpperCase = (field) => {
  if (this[field]) this[field].value = this[field].value.toUpperCase();
};

const loadForm = (row) => {
  form.value = {
    numAssure: row.numAssure,
    nomAssure: row.nomAssure,
    prenomAssure: '',
    numBeneficiaire: row.numBeneficiaire,
    nomBeneficiaire: row.nomBeneficiaire,
    prenomBeneficiaire: '',
    position: 'A',
    motif: '',
    scolarise: '',
    enApprentissage: '',
    dateNaissance: row.dateNaissance,
    dateDebut: row.dateDebut,
    dateFin: row.dateFin
  };
  dialog.value = true;
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

/* Animation pour l'ouverture du dialogue */
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .text-h4 {
    font-size: 1.5rem !important;
  }

  .text-h6 {
    font-size: 1.1rem !important;
  }
}
</style>
